const { spawn } = require('child_process');
const os = require('os');
const log = require('./logger');

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.errorCounts = new Map();
  }

  start(script, name = 'NodeShield', env = 'development', cluster = false) {
    env = env || 'development';

    if (cluster) {
      const cpus = os.cpus();
      cpus.forEach((_, index) => {
        this.startProcess(script, `${name}-worker-${index}`, env);
      });
    } else {
      this.startProcess(script, name, env);
    }
  }

  startProcess(script, name, env) {
    const child = spawn('node', [script], {
      env: { ...process.env, NODE_ENV: env },
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    this.processes.set(name, {
      process: child,
      status: 'Running',
      startedAt: new Date(),
      restartCount: 0,
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

    log.success(name, `Process started in ${env} mode (PID: ${child.pid})`);
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

  restart(name, env) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, status } = processInfo;
      const script = process.spawnargs[1];
      env = env || 'development';

      if (status !== 'Stopped') this.stop(name);

      setTimeout(() => {
        this.startProcess(script, name, env);
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
          `Process ${name}: PID ${processInfo.process.pid}, Status: ${processInfo.status}`
        );
      });
    }
  }

  info(name, env) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, status, startedAt, restartCount, exitCode, signal } = processInfo;
      const memoryUsage = process.memoryUsage();
      env = env || 'development';

      log.info(
        name,
        `
        Worker Name: ${name}
        Status: ${status}
        PID: ${process.pid || 'N/A'}
        Started At: ${startedAt || 'N/A'}
        Restart Count: ${restartCount}
        Exit Code: ${exitCode || 'N/A'}
        Signal: ${signal || 'N/A'}
        Memory Usage: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
        Environment: ${env || 'N/A'}
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
