const minimist = require('minimist');
const { startProcess, stopProcess, restartProcess, showProcessInfo, listProcesses } = require('./bin/nodeshield');

const args = minimist(process.argv.slice(2));
const command = args._[0];
const scriptName = args._[1] || 'NodeShield';

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
  console.error('Invalid command. Available commands are: start, stop, restart, info, or list.');
}
