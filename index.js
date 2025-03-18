#!/usr/bin/env node

const cluster = require('cluster');
const os = require('os');
const http = require('http');
const processManager = require('./lib/pm'); 
const log = require('./lib/logger');
const portfinder = require('portfinder');

const numCPUs = os.cpus().length;
const args = process.argv.slice(2);
const command = args[0];
const processName = args[3] || 'NodeShield';

let env = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'development';

log.printBanner(env);
log.info("NodeShield is ready to manage your application.");

String.prototype.hashCode = function () {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return hash;
};

if (cluster.isMaster) {
  log.info(processName, `Master process started. CPU cores: ${numCPUs}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    log.warn(processName, `Worker ${worker.process.pid} exited. Starting a new worker.`);
    cluster.fork();
  });

  process.on('SIGTERM', () => {
    log.info(processName, 'Master process received SIGTERM, shutting down workers gracefully.');
    for (const id in cluster.workers) {
      cluster.workers[id].send('shutdown');
    }
  });

  portfinder.getPortPromise()
    .then((port) => {
        const loadBalancer = http.createServer((req, res) => {         
      const remoteAddress = req.socket.remoteAddress || '';
      const workerIndex = Math.abs(remoteAddress.hashCode()) % numCPUs;
      const worker = cluster.workers[Object.keys(cluster.workers)[workerIndex]];

      if (worker) {
        worker.send({ req });
        worker.once('message', (response) => {
          res.writeHead(response.statusCode, response.headers);
          res.end(response.body);
        });
      } else {
        res.writeHead(500);
        res.end("No workers available.");
      }
    });

    loadBalancer.listen(port, () => {
            log.info(processName, `Load balancer started on port ${port}`);
        });
    })
    .catch((err) => {
        log.error(processName, 'Error finding an available port:', err);
        process.exit(1);
    });

} else {

  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      log.info(processName, `Worker ${process.pid} shutting down gracefully.`);
      process.exit(0);
    } else if (msg.req) {
      const { req } = msg;
      const res = {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: `Handled by worker ${process.pid}`,
      };
      process.send(res);
    }
  });

  switch (command) {
    case 'start':
      const script = args[1];
      if (!script) {
        log.error(processName, 'No script provided for the "start" command.');
        process.exit(1);
      }
      log.info(processName, `Starting process in ${env} mode.`);
      const clusterOption = args.includes('--cluster');
      processManager.start(script, processName, env, clusterOption)
        .catch((err) => {
          log.error(processName, `Failed to start process: ${err.message}`);
          process.exit(1);
        });
      break;

    case 'stop':
      const stopName = args[1];
      if (!stopName) {
        log.error(processName, 'No process name provided for the "stop" command.');
        process.exit(1);
      }
      log.info(processName, `Stopping process ${stopName}.`);
      processManager.stop(stopName)
        .catch((err) => {
          log.error(processName, `Failed to stop process: ${err.message}`);
          process.exit(1);
        });
      break;

    case 'restart':
      const restartName = args[1];
      if (!restartName) {
        log.error(processName, 'No process name provided for the "restart" command.');
        process.exit(1);
      }
      log.info(processName, `Restarting process ${restartName}.`);
      processManager.restart(restartName)
        .catch((err) => {
          log.error(processName, `Failed to restart process: ${err.message}`);
          process.exit(1);
        });
      break;

    case 'info':
      const infoName = args[1];
      if (!infoName) {
        log.error(processName, 'No process name provided for the "info" command.');
        process.exit(1);
      }
      log.info(processName, `Fetching details for process ${infoName}.`);
      processManager.info(infoName)
        .catch((err) => {
          log.error(processName, `Failed to fetch process info: ${err.message}`);
          process.exit(1);
        });
      break;

    case 'list':
      log.info(processName, 'Listing all active processes.');
      processManager.list();
      break;

    default:
      log.error(processName, 'Command not found! Available commands are: start, stop, restart, info, list.');
      process.exit(1);
  }
}
