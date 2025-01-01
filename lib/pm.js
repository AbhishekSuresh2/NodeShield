const { spawn } = require('child_process');
const os = require('os');
const log = require('./logger');

class ProcessManager {
  constructor() {
    this.processes = new Map();
  }

  start(script, name = 'NodeShield', env = 'development', cluster = false) {
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
    });

    child.stdout.on('data', (data) => {
      log.info(name, data.toString().trim());
    });

    child.stderr.on('data', (data) => {
      log.error(name, data.toString().trim());
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

  restart(name) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { script, env } = processInfo;
      this.stop(name);
      setTimeout(() => {
        this.startProcess(script, name, env);
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

  info(name) {
    const processInfo = this.processes.get(name);
    if (processInfo) {
      const { process, status, startedAt, exitCode, signal } = processInfo;
      const cpuUsage = process.cpuUsage ? process.cpuUsage() : {};
      const memoryUsage = process.memoryUsage();

      log.info(
        name,
        `
        Worker Name: ${name}
        Status: ${status}
        PID: ${process.pid || 'N/A'}
        Started At: ${startedAt || 'N/A'}
        Exit Code: ${exitCode || 'N/A'}
        Signal: ${signal || 'N/A'}
        CPU Usage: ${cpuUsage.user || 0}μs (User), ${cpuUsage.system || 0}μs (System)
        Memory Usage: ${memoryUsage.rss / 1024 / 1024} MB (RSS)
        Environment: ${process.env.NODE_ENV || 'N/A'}
        `
      );
    } else {
      log.error(name, 'No process found with this name.');
    }
  }
}

module.exports = new ProcessManager();
