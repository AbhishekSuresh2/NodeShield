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

log.printBanner();
log.info("NodeShield Is Now Ready To Manage Your App!");

if (cluster.isMaster) {
  log.info(processName, `Master process started with ${numCPUs} CPUs`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    log.error(processName, `Worker ${worker.process.pid} died. Forking a new worker.`);
    cluster.fork();
  });
} else {
  switch (command) {
    case 'start':
      const script = args[1];
      log.info(processName, `Starting process in ${env} mode...`);
      const clusterOption = args.includes('--cluster');
      processManager.start(script, processName, env, clusterOption);
      break;

    case 'stop':
      const stopName = args[1];
      log.info(processName, `Stopping process ${stopName}...`);
      processManager.stop(stopName);
      break;

    case 'restart':
      const restartName = args[1];
      log.info(processName, `Restarting process ${restartName}...`);
      processManager.restart(restartName);
      break;

    case 'info':
      const infoName = args[1];
      log.info(processName, `Fetching information for process ${infoName}...`);
      processManager.info(infoName);
      break;

    case 'list':
      log.info(processName, 'Listing all running processes...');
      processManager.list();
      break;

    default:
      log.error(processName, 'Command not found! Use start, stop, restart, info, or list.');
  }
}
