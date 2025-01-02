const chalk = require('chalk');
const figlet = require('figlet');
const pkg = require("../package.json");

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

function printBanner(env) {
  figlet('NodeShield', { width: 100, font: 'Standard' }, (err, data) => {
    if (err) {
      console.error('Error generating banner with "Standard" font.');
      return;
    }

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
   }                 
    
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const uptime = formatUptime(process.uptime()); 

    console.log(chalk.cyan(data));
    console.log(chalk.cyan(`
      NodeShield - Node Application Process Manager
      ---------------------------------------------
      Version: ${pkg.version}
      Environment: ${env || 'development'}
      Node.js Version: ${nodeVersion}
      Platform: ${platform} (${arch} bit)
      Uptime: ${uptime}
      ---------------------------------------------
      NodeShield is ready to manage your application!
    `));
  });
}

module.exports = {
  info: (processName, message) => logMessage(processName, 'info', message),
  error: (processName, message) => logMessage(processName, 'error', message),
  warn: (processName, message) => logMessage(processName, 'warn', message),
  success: (processName, message) => logMessage(processName, 'success', message),
  printBanner,
};
