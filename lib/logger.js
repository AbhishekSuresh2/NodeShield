const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const logFilePath = path.join(__dirname, 'nodeshield.log');

const formatLog = (level, message) => `[${new Date().toISOString()}] [${level.toUpperCase()}]: ${message}`;

const writeLogToFile = (message) => {
  fs.appendFile(logFilePath, `${message}\n`, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

const log = {
  info: (message) => {
    const msg = formatLog('info', message);
    console.log(chalk.blue(msg));
    writeLogToFile(msg);
  },
  warn: (message) => {
    const msg = formatLog('warn', message);
    console.warn(chalk.yellow(msg));
    writeLogToFile(msg);
  },
  error: (message) => {
    const msg = formatLog('error', message);
    console.error(chalk.red(msg));
    writeLogToFile(msg);
  },
  debug: (message) => {
    const msg = formatLog('debug', message);
    console.log(chalk.green(msg));
    writeLogToFile(msg);
  },
};

module.exports = log;
