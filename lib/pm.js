const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const log = require('./logger');

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.restartAttempts = new Map();
    this.MAX_RESTART_ATTEMPTS = 5;
    this.RESTART_BACKOFF_MS = 2000;
  }

  async start(script, name = 'NodeShield', env = 'development', cluster = false) {
    try {
      await this.validateScript(script);
      env = env || 'development';

      if (cluster) {
        this.startCluster(script, name, env);
      } else {
        this.startProcess(script, name, env);
      }
    } catch (error) {
      log.error('PROC-MGR', `Failed to start process: ${error.message}`);
      throw error;
    }
  }

  async validateScript(script) {
    const fs = require('fs/promises');
    try {
      await fs.access(script, fs.constants.F_OK | fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Script file ${script} is inaccessible: ${error.message}`);
    }
  }

  startCluster(script, name, env) {
    const cluster = require('cluster');
    if (cluster.isPrimary) {
      const cpus = os.cpus().length;
      for (let i = 0; i < cpus; i++) {
        const workerName = `${name}-worker-${i}`;
        cluster.fork({ 
          WORKER_NAME: workerName,
          NODE_ENV: env,
          CLUSTER_MODE: 'true'
        });
      }
      
      cluster.on('exit', (worker, code, signal) => {
        const workerName = worker.env.WORKER_NAME;
        log.warn(workerName, `Worker exited with code ${code}`);
        this.handleProcessExit(workerName, code, signal);
      });
    } else {
      require(script);
    }
  }

  startProcess(script, name, env) {
    const child = spawn('node', [script], {
      env: { 
        ...process.env,
        NODE_ENV: env,
        PROCESS_NAME: name
      },
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    const processInfo = {
      process: child,
      script,
      env,
      status: 'initializing',
      pid: child.pid,
      startedAt: new Date(),
      restartCount: 0,
      stdout: '',
      stderr: ''
    };

    this.processes.set(name, processInfo);
    this.setupProcessHandlers(name, child);
    this.monitorResources(name);

    log.success(name, `Process started (PID: ${child.pid})`);
    processInfo.status = 'running';
  }

  setupProcessHandlers(name, child) {
    const handleExit = (code, signal) => {
      const processInfo = this.processes.get(name);
      if (!processInfo) return;

      processInfo.status = 'stopped';
      processInfo.exitCode = code;
      processInfo.signal = signal;
      processInfo.endedAt = new Date();

      log.warn(name, `Process exited with code ${code} (${signal})`);
      this.handleProcessExit(name, code, signal);
    };

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (data) => {
      this.processes.get(name).stdout += data;
      log.info(name, data.trim());
    });

    child.stderr.on('data', (data) => {
      const processInfo = this.processes.get(name);
      processInfo.stderr += data;
      this.handleProcessError(name, data.trim());
    });

    child.on('error', (error) => {
      log.error(name, `Process error: ${error.message}`);
      handleExit(1, 'SIGERROR');
    });

    child.on('exit', handleExit);
  }

  handleProcessError(name, errorMessage) {
    const criticalErrors = {
      'Cannot find module': (match, name, errorMessage) => {
        const missingModule = match[1];
        if (missingModule.startsWith('.') || missingModule.startsWith('/')) {
          log.error(name, `Missing file: "${missingModule}".\nPlease ensure the file exists at the specified path.\n\nFull error:\n${errorMessage}`);
        } else {
          log.error(name, `Missing module: "${missingModule}". Install with:\n\tnpm install ${missingModule}\n\nFull error:\n${errorMessage}`);
        }
        this.stop(name);
      },
      'EADDRINUSE': (match, name, errorMessage) => {
        log.error(name, `Port conflict detected. Check port configuration.\n\nFull error:\n${errorMessage}`);
        this.stop(name);
      },
      'SyntaxError': (match, name, errorMessage) => {
        log.error(
          name,
          `Syntax error detected. Fix the code and restart the process.\n\nFull error:\n${errorMessage}`
        );
        this.stop(name);
      }
    };

    for (const [pattern, handler] of Object.entries(criticalErrors)) {
      const match = errorMessage.match(new RegExp(pattern));
      if (match) {
        handler(match, name, errorMessage); 
        return;
      }
    }
    log.error(name, `Unhandled error:\n${errorMessage}`);
  }

  handleProcessExit(name, code, signal) {
    const processInfo = this.processes.get(name);
    if (!processInfo) return;

    if (code !== 0 && signal !== 'SIGTERM') {
      const attempts = this.restartAttempts.get(name) || 0;
      if (attempts < this.MAX_RESTART_ATTEMPTS) {
        const delay = this.RESTART_BACKOFF_MS * (attempts + 1);
        log.warn(name, `Restarting in ${delay}ms (attempt ${attempts + 1})`);
        
        setTimeout(() => {
          this.restart(name, processInfo.env);
          this.restartAttempts.set(name, attempts + 1);
        }, delay);
      } else {
        log.error(name, 'Max restart attempts reached. Process terminated.');
        this.processes.delete(name);
        this.restartAttempts.delete(name);
      }
    } else {
      this.processes.delete(name);
      this.restartAttempts.delete(name);
    }
  }

  monitorResources(name) {
    const processInfo = this.processes.get(name);
    if (!processInfo) return;

    processInfo.resourceInterval = setInterval(() => {
      require('process').cpuUsage((err, usage) => {
        if (err) return;
        processInfo.cpuUsage = usage;
      });

      processInfo.memoryUsage = process.memoryUsage();
    }, 5000);

    processInfo.process.on('exit', () => {
      clearInterval(processInfo.resourceInterval);
    });
  }

  async stop(name) {
    const processInfo = this.processes.get(name);
    if (!processInfo) {
      log.error(name, 'Process not found');
      return false;
    }

    return new Promise((resolve) => {
      processInfo.status = 'stopping';
      const timeout = setTimeout(() => {
        processInfo.process.kill('SIGKILL');
        log.warn(name, 'Force killed process');
        resolve(false);
      }, 10000);

      processInfo.process.once('exit', () => {
        clearTimeout(timeout);
        log.success(name, 'Stopped gracefully');
        resolve(true);
      });

      processInfo.process.kill('SIGTERM');
    });
  }

  async restart(name, env) {
    const processInfo = this.processes.get(name);
    if (!processInfo) {
      log.error(name, 'Process not found');
      return;
    }

    await this.stop(name);
    this.startProcess(processInfo.script, name, env || processInfo.env);
    processInfo.restartCount++;
    this.restartAttempts.delete(name);
  }

  list() {
    if (this.processes.size === 0) {
      log.info('PROC-MGR', 'No running processes');
      return;
    }

    this.processes.forEach((processInfo, name) => {
      const uptime = processInfo.endedAt 
        ? `${(processInfo.endedAt - processInfo.startedAt)}ms`
        : `${Date.now() - processInfo.startedAt}ms`;
      
      log.info(
        name,
        `PID: ${processInfo.pid} | Status: ${processInfo.status}\n` +
        `Uptime: ${uptime} | Restarts: ${processInfo.restartCount}\n` +
        `CPU: ${processInfo.cpuUsage?.user || 0}μs | Memory: ${Math.round(processInfo.memoryUsage?.rss / 1024 / 1024)}MB`
      );
    });
  }

  async gracefulShutdown() {
    log.info('PROC-MGR', 'Starting graceful shutdown...');
    const shutdownPromises = Array.from(this.processes.keys())
      .map(name => this.stop(name));

    try {
      await Promise.allSettled(shutdownPromises);
      log.success('PROC-MGR', 'All processes stopped');
    } catch (error) {
      log.error('PROC-MGR', `Shutdown error: ${error.message}`);
    }
  }
}

module.exports = new ProcessManager();
