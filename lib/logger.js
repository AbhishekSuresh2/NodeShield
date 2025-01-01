const chalk = require('chalk');
const figlet = require('figlet');

function logMessage(processName, level, message) {
  const timestamp = new Date().toISOString();
  const prefix = `${chalk.gray(`[${timestamp}]`)} ${chalk.cyan(`[${processName}]`)}`;

  switch (level) {
    case 'info':
      console.log(`${prefix} ${chalk.green(message)}`);
      break;
    case 'error':
      console.error(`${prefix} ${chalk.red(message)}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${chalk.yellow(message)}`);
      break;
    case 'success':
      console.log(`${prefix} ${chalk.magenta(message)}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

function printBanner() {
  figlet('NodeShield', { width: 100, font: 'slant' }, (err, data) => {
    if (err) {
      console.error('Error generating banner');
      return;
    }
    console.log(chalk.cyan(data));
  });
}

module.exports = {
  info: (processName, message) => logMessage(processName, 'info', message),
  error: (processName, message) => logMessage(processName, 'error', message),
  warn: (processName, message) => logMessage(processName, 'warn', message),
  success: (processName, message) => logMessage(processName, 'success', message),
  printBanner,
};
