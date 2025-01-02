#!/usr/bin/env node

const cluster = require('cluster');
const os = require('os');
const processManager = require('./lib/pm');
const log = require('./lib/logger');

const numCPUs = os.cpus().length;
const args = process.argv.slice(2);
const command = args[0];
const processName = args[3] || 'NodeShield';

let env = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'development';

log.printBanner(env);
log.info("NodeShield is ready to manage your application.");

if (cluster.isMaster) {
  log.info(processName, `Master process started. CPU cores: ${numCPUs}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    log.warn(processName, `Worker ${worker.process.pid} exited. Starting a new worker.`);
    cluster.fork();
  });

  process.on('SIGTERM', () => {
    log.info(processName, 'Master process received SIGTERM, shutting down workers gracefully.');
    for (const id in cluster.workers) {
      cluster.workers[id].send('shutdown');
    }
  });

} else {
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      log.info(processName, `Worker ${process.pid} shutting down gracefully.`);
      process.exit(0);
    }
  });

  switch (command) {
    case 'start':
      const script = args[1];
      log.info(processName, `Starting process in ${env} mode.`);
      const clusterOption = args.includes('--cluster');
      processManager.start(script, processName, env, clusterOption);
      break;

    case 'stop':
      const stopName = args[1];
      log.info(processName, `Stopping process ${stopName}.`);
      processManager.stop(stopName);
      break;

    case 'restart':
      const restartName = args[1];
      log.info(processName, `Restarting process ${restartName}.`);
      processManager.restart(restartName);
      break;

    case 'info':
      const infoName = args[1];
      log.info(processName, `Fetching details for process ${infoName}.`);
      processManager.info(infoName);
      break;

    case 'list':
      log.info(processName, 'Listing all active processes.');
      processManager.list();
      break;

    default:
      log.error(processName, 'Unknown command. Available commands are: start, stop, restart, info, list.');
  }
}
