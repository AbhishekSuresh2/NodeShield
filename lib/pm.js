const { spawn } = require('child_process');
const os = require('os');
const net = require('net');
const log = require('./logger');

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.errorCounts = new Map();
  }

  start(script, name = 'NodeShield', env = 'development', port = 3000, cluster = false) {
    this.checkPort(port).then((availablePort) => {
      if (cluster) {
        const cpus = os.cpus();
        cpus.forEach((_, index) => {
          this.startProcess(script, `${name}-worker-${index}`, env || 'development', availablePort);
        });
      } else {
        this.startProcess(script, name, env || 'development', availablePort);
      }
    });
  }

  startProcess(script, name, env, port) {
    const child = spawn('node', [script], {
      env: { ...process.env, NODE_ENV: env, PORT: port },
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    this.processes.set(name, {
      process: child,
      status: 'Running',
      startedAt: new Date(),
      restartCount: 0,
      port: port,
    });

    this.errorCounts.set(name, 0);

    child.stdout.on('data', (data) => {
      log.info(name, data.toString().trim());
    });

    child.stderr.on('data', (data) => {
      log.error(name, data.toString().trim());
      this.trackError(name);
    });

    child.on('exit', (code, signal) => {
      log.warn(name, `Process exited with code ${code} and signal ${signal}`);
      const processInfo = this.processes.get(name);
      if (processInfo) {
        processInfo.status = 'Stopped';
        processInfo.exitCode = code;
        processInfo.signal = signal;
      }
    });

    log.success(name, `Process started in ${env} mode (PID: ${child.pid}) on port ${port}`);
  }

  checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log.warn('ProcessManager', `Port ${port} is already in use. Trying next port...`);
          resolve(port + 1); // Increment port and try again
        } else {
          log.error('ProcessManager', `Unexpected error: ${err.message}`);
          resolve(null);
        }
      });

      server.once('listening', () => {
        server.close(() => resolve(port));
      });

      server.listen(port);
    });
  }

  stop(name) {
    const processInfo = this.processes.get(name);
    if (processInfo && processInfo.process) {
      processInfo.process.kill();
      processInfo.status = 'Stopped';
      this.processes.delete(name);
      log.success(name, 'Process stopped.');
    } else {
      log.error(name, 'No process found with this name.');
    }
  }

  restart(name) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, status } = processInfo;
      const script = process.spawnargs[1];
      const env = process.env.NODE_ENV || 'development';
      const port = process.env.PORT || 3000;

      if (status !== 'Stopped') this.stop(name);

      setTimeout(() => {
        this.startProcess(script, name, env, port);
        processInfo.restartCount++;
        log.success(name, 'Process restarted.');
      }, 1000);
    } else {
      log.error(name, 'No process found with this name to restart.');
    }
  }

  list() {
    if (this.processes.size === 0) {
      log.warn('ProcessManager', 'No running processes.');
    } else {
      this.processes.forEach((processInfo, name) => {
        log.info(
          'ProcessManager',
          `Process ${name}: PID ${processInfo.process.pid}, Status: ${processInfo.status}, Port: ${processInfo.port}`
        );
      });
    }
  }

  info(name) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, status, startedAt, restartCount, exitCode, signal, port } = processInfo;
      const memoryUsage = process.memoryUsage();

      log.info(
        name,
        `
        Worker Name: ${name}
        Status: ${status}
        PID: ${process.pid || 'N/A'}
        Port: ${port}
        Started At: ${startedAt || 'N/A'}
        Restart Count: ${restartCount}
        Exit Code: ${exitCode || 'N/A'}
        Signal: ${signal || 'N/A'}
        Memory Usage: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
        Environment: ${process.env.NODE_ENV || 'development'}
        `
      );
    } else {
      log.error(name, 'No process found with this name.');
    }
  }

  trackError(name) {
    const errorCount = this.errorCounts.get(name) || 0;
    this.errorCounts.set(name, errorCount + 1);

    if (errorCount + 1 >= 5) {
      log.warn(name, 'Error threshold reached. Restarting process...');
      this.restart(name);
      this.errorCounts.set(name, 0);
    }
  }

  gracefulShutdown() {
    log.info('ProcessManager', 'Initiating graceful shutdown...');
    this.processes.forEach((processInfo, name) => {
      if (processInfo && processInfo.process) {
        processInfo.process.kill('SIGTERM');
        log.success(name, 'Process stopped gracefully.');
      }
    });
    this.processes.clear();
  }
}

module.exports = new ProcessManager();
