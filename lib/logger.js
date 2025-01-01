const chalk = require('chalk');

const log = {
  info: (message) => {
    console.log(chalk.blue(message));
  },
  error: (message) => {
    console.error(chalk.red(message));
  },
  success: (message) => {
    console.log(chalk.green(message));
  },
  warning: (message) => {
    console.warn(chalk.yellow(message));
  },
};

module.exports = log;
