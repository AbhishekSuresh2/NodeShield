const { spawn, exec } = require('child_process');
const os = require('os');
const cluster = require('cluster');
const figlet = require('figlet');
const log = require('./logger');
let processes = {};

const showWelcomeMessage = () => {
  figlet('Node Guard', { font: 'Slant', width: 100 }, (err, result) => {
    if (err) {
      log.error('Error generating welcome message');
      console.dir(err);
      return;
    }
    console.log(result);
    log.success('NodeGuard is ready to protect your app!');
  });
};

const startProcess = (script, env, name = 'NodeGuard') => {
  if (processes[script]) {
    log.warn(`Process ${name} is already running.`);
    return;
  }

  showWelcomeMessage(); // Show the welcome message when starting the process

  const processEnv = { NODE_ENV: env };
  const process = spawn('node', [script], { env: { ...process.env, ...processEnv } });

  process.stdout.on('data', (data) => {
    log.info(`[${name}] ${data}`);
  });

  process.stderr.on('data', (data) => {
    log.error(`[${name}] Error: ${data}`);
  });

  process.on('close', (code) => {
    if (code !== 0) {
      log.error(`[${name}] Process crashed with exit code ${code}. Restarting...`);
      restartOnError(script, env, name); // Restart the process
    } else {
      log.success(`[${name}] Process exited successfully.`);
    }
    delete processes[script];
  });

  process.on('SIGTERM', () => {
    log.success(`[${name}] Gracefully stopping.`);
  });

  processes[script] = process;
  log.success(`[${name}] Process started in ${env} mode (PID: ${process.pid}).`);
};

const restartOnError = (script, env, name) => {
  log.info(`[${name}] Restarting after crash...`);
  setTimeout(() => {
    startProcess(script, env, name);
  }, 5000); // Restart after 5 seconds
};

const startClusteredProcess = (script, env, name) => {
  if (cluster.isMaster) {
    const numWorkers = os.cpus().length;

    log.info(`[${name}] Spawning ${numWorkers} worker(s) for load balancing.`);

    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0) {
        log.error(`[${name}] Worker ${worker.process.pid} died unexpectedly. Restarting...`);
        cluster.fork();
      }
    });
  } else {
    startProcess(script, env, name); // Start the process on each worker
  }
};

const stopProcess = (script, name) => {
  if (!processes[script]) {
    log.error(`[${name}] Process not found.`);
    return;
  }
  processes[script].kill('SIGTERM');
  delete processes[script];
  log.success(`[${name}] Stopped process.`);
};

const shutdownAllProcesses = () => {
  log.info('Shutting down all processes...');
  Object.keys(processes).forEach((script) => {
    processes[script].kill('SIGTERM');
  });
};

process.on('SIGINT', () => {
  log.success('Received SIGINT. Shutting down...');
  shutdownAllProcesses();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.success('Received SIGTERM. Shutting down...');
  shutdownAllProcesses();
  process.exit(0);
});

module.exports = { startProcess, startClusteredProcess, stopProcess, shutdownAllProcesses };
