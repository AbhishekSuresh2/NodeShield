const { spawn } = require('child_process');
const os = require('os');
const log = require('./logger');

class ProcessManager {
  constructor() {
    this.processes = new Map();
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
      script,
      status: 'Running',
      startedAt: new Date(),
      restartCount: 0,
    });

    child.stdout.on('data', (data) => {
      log.info(name, data.toString().trim());
    });

    child.stderr.on('data', (data) => {
      const errorMessage = data.toString().trim();
      log.error(name, errorMessage);

      if (errorMessage.includes('Cannot find module')) {
        const missingModule = errorMessage.split("'")[1];
        log.error(
          name,
          `Missing module detected: "${missingModule}". Please install it manually using:\n` +
          `\tnpm install ${missingModule} --save\n` +
          `Make sure to add it to your source code's package.json file if required.`
        );
        this.stop(name);
      } else if (errorMessage.includes('EADDRINUSE')) {
        log.error(
          name,
          'Port already in use. Please check your configuration or release the occupied port.'
        );
        this.stop(name);
      } else if (errorMessage.includes('SyntaxError')) {
        log.error(
          name,
          'Syntax error detected in your script. Please fix the code and try again.'
        );
        this.stop(name);
      }
    });

    child.on('exit', (code, signal) => {
      log.warn(name, `Process exited with code ${code} and signal ${signal}`);
      const processInfo = this.processes.get(name);
      if (processInfo) {
        processInfo.status = 'Stopped';
        processInfo.exitCode = code;
        processInfo.signal = signal;

        if (code !== 0 && signal !== 'SIGTERM') {
          log.warn(name, 'Unexpected exit. Attempting to restart...');
          this.restart(name);
        } else {
          log.info(name, 'Process stopped gracefully.');
        }
      }
    });

    log.success(name, `Process started (PID: ${child.pid})`);
  }

  stop(name) {
    const processInfo = this.processes.get(name);
    if (processInfo && processInfo.process) {
      processInfo.process.kill('SIGTERM');
      processInfo.status = 'Stopped';
      this.processes.delete(name);
      log.success(name, 'Process stopped.');
    } else {
      log.error(name, 'Process not found.');
    }
  }

  restart(name, env) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, script, status } = processInfo;
      env = env || 'development';

      if (status !== 'Stopped') this.stop(name);

      setTimeout(() => {
        this.startProcess(script, name, env);
        processInfo.restartCount++;
        log.success(name, 'Process restarted.');
      }, 1000);
    } else {
      log.error(name, 'Process not found to restart.');
    }
  }

  list() {
    if (this.processes.size === 0) {
      log.warn('No running processes.');
    } else {
      this.processes.forEach((processInfo, name) => {
        log.info(
          name,
          `PID: ${processInfo.process.pid}, Status: ${processInfo.status}`
        );
      });
    }
  }

  info(name, env) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, status, startedAt, restartCount, exitCode, signal } = processInfo;
      env = env || 'development';

      log.info(
        name,
        `Status: ${status}, PID: ${process.pid || 'N/A'}, Started: ${startedAt || 'N/A'}, ` +
        `Restarts: ${restartCount}, Exit Code: ${exitCode || 'N/A'}, Signal: ${signal || 'N/A'}, ` +
        `Environment: ${env}`
      );
    } else {
      log.error(name, 'Process not found.');
    }
  }

  gracefulShutdown() {
    log.info('Initiating graceful shutdown...');
    const stopPromises = Array.from(this.processes.entries()).map(([name, processInfo]) => {
      return new Promise((resolve) => {
        if (processInfo && processInfo.process) {
          processInfo.process.on('exit', () => resolve());
          processInfo.process.kill('SIGTERM');
          log.success(name, 'Process stopped gracefully.');
        } else {
          resolve();
        }
      });
    });

    Promise.all(stopPromises).then(() => {
      this.processes.clear();
      log.info('All processes stopped. Shutdown complete.');
    });
  }
}

module.exports = new ProcessManager();
