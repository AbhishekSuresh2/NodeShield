const { spawn, exec } = require('child_process');
const os = require('os');
const cluster = require('cluster');
const figlet = require('figlet');
const log = require('./logger');
const minimist = require('minimist');
let processes = {};

const args = minimist(process.argv.slice(2)); // Parse arguments
const processName = args.name || 'NodeGuard'; // Default name if --name is not provided

const showWelcomeMessage = () => {
  figlet('Node Guard', { font: 'Slant', width: 100 }, (err, result) => {
    if (err) {
      log.error('Error generating welcome message: ', err);
      return;
    }
    console.log(result);
    log.info('NodeGuard is now running and ready to monitor your application.');
  });
};

const formatProcessName = (name) => `[${name}]`;

const startProcess = (script, env) => {
  if (processes[script]) {
    log.warn(`${formatProcessName(processName)} Process is already running.`);
    return;
  }

  showWelcomeMessage();

  const processEnv = { NODE_ENV: env };
  const process = spawn('node', [script], { env: { ...process.env, ...processEnv } });

  process.stdout.on('data', (data) => {
    log.debug(`${formatProcessName(processName)} Output: ${data}`);
  });

  process.stderr.on('data', (data) => {
    log.error(`${formatProcessName(processName)} Error: ${data}`);
  });

  process.on('close', (code) => {
    if (code !== 0) {
      log.error(`${formatProcessName(processName)} Process terminated with exit code ${code}. Restarting...`);
      restartOnError(script, env); // Restart the process
    } else {
      log.info(`${formatProcessName(processName)} Process exited successfully.`);
    }
    delete processes[script];
  });

  process.on('SIGTERM', () => {
    log.info(`${formatProcessName(processName)} Gracefully shutting down...`);
  });

  processes[script] = process;
  log.info(`${formatProcessName(processName)} Process started in ${env} mode (PID: ${process.pid}).`);
};

const restartOnError = (script, env) => {
  log.warn(`${formatProcessName(processName)} Process crashed. Restarting in 5 seconds...`);
  setTimeout(() => {
    startProcess(script, env);
  }, 5000);
};

const startClusteredProcess = (script, env) => {
  if (cluster.isMaster) {
    const numWorkers = os.cpus().length;

    log.info(`${formatProcessName(processName)} Spawning ${numWorkers} worker(s) for load balancing.`);

    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0) {
        log.error(`${formatProcessName(processName)} Worker ${worker.process.pid} died unexpectedly. Restarting...`);
        cluster.fork();
      }
    });
  } else {
    startProcess(script, env); // Start the process on each worker
  }
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
  log.info(`${formatProcessName(name)} Process is running with PID: ${processes[name].pid}`);
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

// Command handling based on arguments
const handleCommand = () => {
  const command = args._[0]; // First command argument (e.g. start, stop, restart)
  const scriptName = args._[1] || processName; // Default to processName if not specified

  if (command === 'start') {
    startProcess(scriptName, args.env || 'development');
  } else if (command === 'stop') {
    stopProcess(scriptName);
  } else if (command === 'restart') {
    restartProcess(scriptName);
  } else if (command === 'info') {
    showProcessInfo(scriptName);
  } else if (command === 'list') {
    listProcesses();
  } else {
    log.error('Invalid command. Available commands are: start, stop, restart, info, or list.');
  }
};

handleCommand(); // Execute the command
