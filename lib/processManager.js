const { fork } = require('child_process');
const log = require('./logger');

class ProcessManager {
  constructor() {
    this.processes = new Map();
  }

  start(script, name = 'NodeShield', env = 'development', cluster = false) {
    if (cluster) {
      const cpus = require('os').cpus();
      cpus.forEach((cpu, index) => {
        this.startProcess(script, `${name}-worker-${index}`, env);
      });
    } else {
      this.startProcess(script, name, env);
    }
  }

  startProcess(script, name, env) {
    const process = fork(script, [], {
      env: { NODE_ENV: env },
    });

    this.processes.set(name, process);
    log.success(`${name} process started in ${env} mode (PID: ${process.pid})`);
  }

  stop(name) {
    const process = this.processes.get(name);
    if (process) {
      process.kill();
      this.processes.delete(name);
      log.success(`${name} process stopped.`);
    } else {
      log.error(`No process found with name ${name}`);
    }
  }

  restart(name) {
    this.stop(name);
    setTimeout(() => {
      this.startProcess(name);
      log.success(`${name} process restarted.`);
    }, 1000);
  }

  list() {
    if (this.processes.size === 0) {
      log.warning('No running processes.');
    } else {
      this.processes.forEach((process, name) => {
        log.info(`Process ${name}: PID ${process.pid}`);
      });
    }
  }

  info(name) {
    const process = this.processes.get(name);
    if (process) {
      log.info(`Process ${name} - PID: ${process.pid}, Environment: ${process.env.NODE_ENV}`);
    } else {
      log.error(`No process found with name ${name}`);
    }
  }
}

module.exports = new ProcessManager();
