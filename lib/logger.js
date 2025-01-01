const chalk = require('chalk');
const figlet = require('figlet');

function logMessage(processName, level, message) {
  const timestamp = new Date().toISOString();
  const logPrefix = `[${processName}]`;
  const timestampPrefix = `[${timestamp}]`;

  switch(level) {
    case 'info':
      console.log(chalk.blue(`${logPrefix}`));
      console.log(chalk.blue(`${timestampPrefix}`));
      console.log(chalk.green(message)); 
      break;
    case 'error':
      console.log(chalk.red(`${logPrefix}`));
      console.log(chalk.red(`${timestampPrefix}`));
      console.error(chalk.red(message)); 
      break;
    case 'warn':
      console.log(chalk.yellow(`${logPrefix}`));
      console.log(chalk.yellow(`${timestampPrefix}`));
      console.warn(chalk.yellow(message)); 
      break;
    default:
      console.log(`${logPrefix}`);
      console.log(`${timestampPrefix}`);
      console.log(message); 
  }
}

function printBanner() {
  figlet('NodeShield', {
    width: 100,
    font: 'slant'
  }, (err, data) => {
    if (err) {
      console.log('Error generating banner');
      return;
    }
    console.log(chalk.cyan(data)); 
  });
}

module.exports = {
  info: (processName, message) => logMessage(processName, 'info', message),
  error: (processName, message) => logMessage(processName, 'error', message),
  warn: (processName, message) => logMessage(processName, 'warn', message),
  printBanner
};
