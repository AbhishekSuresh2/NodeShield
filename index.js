const processManager = require('./ib/processManager');
const log = require('./ib/logger');

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'start':
    const script = args[1];
    const name = args[3] || 'NodeShield';
    const env = args[5] || 'development';
    const cluster = args.includes('--cluster');
    processManager.start(script, name, env, cluster);
    break;

  case 'stop':
    const stopName = args[1];
    processManager.stop(stopName);
    break;

  case 'restart':
    const restartName = args[1];
    processManager.restart(restartName);
    break;

  case 'info':
    const infoName = args[1];
    processManager.info(infoName);
    break;

  case 'list':
    processManager.list();
    break;

  default:
    log.error('Command not found! Use start, stop, restart, info, or list.');
}
