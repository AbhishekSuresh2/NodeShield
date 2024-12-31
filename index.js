const { startProcess, stopProcess, restartProcess, showProcessInfo, listProcesses } = require('./bin/nodeshield');
const log = require('./lib/logger');
const yargs = require('yargs');

const args = yargs
  .command('start [script]', 'Start a process', {
    script: {
      description: 'The script to run',
      type: 'string',
      default: '.',
    },
    name: {
      description: 'The name of the process',
      type: 'string',
      default: 'NodeShield',
    },
    env: {
      description: 'The environment to run the process in',
      type: 'string',
      choices: ['development', 'production'],
      default: 'development',
    },
  })
  .command('stop [name]', 'Stop a running process', {
    name: {
      description: 'The name of the process to stop',
      type: 'string',
    },
  })
  .command('restart [name]', 'Restart a running process', {
    name: {
      description: 'The name of the process to restart',
      type: 'string',
    },
  })
  .command('info [name]', 'Get information about a running process', {
    name: {
      description: 'The name of the process to get information on',
      type: 'string',
    },
  })
  .command('list', 'List all running processes')
  .help()
  .alias('h', 'help')
  .argv;

const { _ } = args;

if (_[0] === 'start') {
  startProcess(args.script, args.env, args.name);
} else if (_[0] === 'stop') {
  stopProcess(args.name);
} else if (_[0] === 'restart') {
  restartProcess(args.name);
} else if (_[0] === 'info') {
  showProcessInfo(args.name);
} else if (_[0] === 'list') {
  listProcesses();
} else {
  log.error('Command not found!');
}
