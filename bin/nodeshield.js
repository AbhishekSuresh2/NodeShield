#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');
const cluster = require('cluster');
const figlet = require('figlet');
const log = require('../lib/logger');
const numCPUs = os.cpus().length;

let processes = {};

const showWelcomeMessage = (name) => {
  figlet('Node Shield', { font: 'Slant', width: 100 }, (err, result) => {
    if (err) {
      log.error('Error generating welcome message: ', err);
      return;
    }
    console.log(result);
    log.info(`${name || 'NodeShield'} is now running and ready to monitor your application.`);
  });
};

const formatProcessName = (name) => `[${name}]`;

const startProcess = (script, env, name) => {
  if (processes[name]) {
    log.warn(`${formatProcessName(name)} Process is already running.`);
    return;
  }

  showWelcomeMessage(name);

  if (cluster.isMaster) {
    log.info('Starting master process with load balancing...');
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      log.warn(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    const processEnv = { NODE_ENV: env };
    const process = spawn('node', [script], { env: { ...process.env, ...processEnv } });

    process.stdout.on('data', (data) => {
      log.debug(`${formatProcessName(name)} Output: ${data}`);
    });

    process.stderr.on('data', (data) => {
      log.error(`${formatProcessName(name)} Error: ${data}`);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        log.error(`${formatProcessName(name)} Process terminated with exit code ${code}. Restarting...`);
        restartOnError(script, env, name);
      } else {
        log.info(`${formatProcessName(name)} Process exited successfully.`);
      }
      delete processes[name];
    });

    process.on('SIGTERM', () => {
      log.info(`${formatProcessName(name)} Gracefully shutting down...`);
    });

    processes[name] = process;
    log.info(`${formatProcessName(name)} Process started in ${env} mode (PID: ${process.pid}).`);
  }
};

const restartOnError = (script, env, name) => {
  log.warn(`${formatProcessName(name)} Process crashed. Restarting in 5 seconds...`);
  setTimeout(() => {
    startProcess(script, env, name);
  }, 5000);
};

const stopProcess = (name) => {
  if (!processes[name]) {
    log.error(`${formatProcessName(name)} Process not found.`);
    return;
  }
  processes[name].kill('SIGTERM');
  delete processes[name];
  log.info(`${formatProcessName(name)} Process stopped successfully.`);
};

const restartProcess = (name) => {
  log.info(`${formatProcessName(name)} Restarting process...`);
  stopProcess(name);
  startProcess(name);
};

const showProcessInfo = (name) => {
  if (!processes[name]) {
    log.error(`${formatProcessName(name)} Process not found.`);
    return;
  }

  const processDetails = processes[name];
  const env = processDetails.env.NODE_ENV || 'unknown'; 
  const pid = processDetails.pid; 
  const port = processDetails.port || 'Not specified'; 
  const script = processDetails.spawnargs[0]; 
  const status = processDetails.killed ? 'Stopped' : 'Running';
  
  log.info(`${formatProcessName(name)} Process Info:`);
  log.info(`- PID: ${pid}`);
  log.info(`- Port: ${port}`);
  log.info(`- Script: ${script}`);
  log.info(`- Environment Mode: ${env}`);
  log.info(`- Status: ${status}`);
};

const listProcesses = () => {
  const processNames = Object.keys(processes);
  if (processNames.length === 0) {
    log.info('No processes are currently running.');
    return;
  }
  log.info('Currently running processes:');
  processNames.forEach((name) => {
    log.info(`${formatProcessName(name)} Process with PID: ${processes[name].pid}`);
  });
};

module.exports = {
  startProcess,
  stopProcess,
  restartProcess,
  showProcessInfo,
  listProcesses
};
