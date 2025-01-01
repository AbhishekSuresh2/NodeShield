#!/usr/bin/env node

const processManager = require('./lib/pm');
const log = require('./lib/logger');

const args = process.argv.slice(2);
const command = args[0];
const script = args[1];
const env = args[2] || 'development';
const port = parseInt(args[3], 10) || 3000;
const clusterOption = args.includes('--cluster');
const processName = args[4] || 'NodeShield';

log.printBanner();
log.info("NodeShield Is Now Ready To Manage Your App!");

switch (command) {
  case 'start':
    log.info(processName, `Starting process in ${env} mode on port ${port}...`);
    processManager.start(script, processName, env, port, clusterOption);
    break;

  case 'stop':
    log.info(processName, `Stopping process ${processName}...`);
    processManager.stop(processName);
    break;

  case 'restart':
    log.info(processName, `Restarting process ${processName}...`);
    processManager.restart(processName);
    break;

  case 'info':
    log.info(processName, `Fetching information for process ${processName}...`);
    processManager.info(processName);
    break;

  case 'list':
    log.info(processName, 'Listing all running processes...');
    processManager.list();
    break;

  default:
    log.error(processName, 'Command not found! Use start, stop, restart, info, or list.');
}
