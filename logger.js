const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const logFilePath = path.join(__dirname, 'nodeguard.log');
const now = new Date();
const timestamp = `${now.toISOString()}`;

const formatLog = (level, message) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
};

const writeLogToFile = (message) => {
  fs.appendFile(logFilePath, message + '\n', (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

const log = {
  info: (message) => {
    const formattedMessage = formatLog('info', message);
    console.log(chalk.green(formattedMessage));
    writeLogToFile(formattedMessage);
  },
  warn: (message) => {
    const formattedMessage = formatLog('warn', message);
    console.warn(chalk.yellow(formattedMessage));
    writeLogToFile(formattedMessage);
  },
  error: (message) => {
    const formattedMessage = formatLog('error', message);
    console.error(chalk.red(formattedMessage));
    writeLogToFile(formattedMessage);
  },
  success: (message) => {
    const formattedMessage = formatLog('success', message);
    console.log(chalk.blue(formattedMessage));
    writeLogToFile(formattedMessage);
  },
  log: (message) => {
    const formattedMessage = formatLog('log', message);
    console.log(chalk.white(formattedMessage));
    writeLogToFile(formattedMessage);
  },
  setLogLevel: (level) => {
    if (level === 'info') {
      console.log = log.info;
    } else if (level === 'warn') {
      console.log = log.warn;
    } else if (level === 'error') {
      console.log = log.error;
    } else {
      console.log = log.log;
    }
  },
  clear: () => {
    fs.truncate(logFilePath, 0, (err) => {
      if (err) console.error('Error clearing log file:', err);
    });
  }
};

module.exports = { log };
