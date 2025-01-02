#!/usr/bin/env node

const cluster = require('cluster');
const os = require('os');
const http = require('http');
const processManager = require('./lib/pm');
const log = require('./lib/logger');
const net = require('net');

const numCPUs = os.cpus().length;
const args = process.argv.slice(2);
const command = args[0];
const processName = args[3] || 'NodeShield';

let env = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'development';

log.printBanner(env);
log.info("NodeShield is ready to manage your application.");

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

  function findAvailablePort(startPort, callback) {
    let port = startPort;

    function tryPort(port) {
      const server = net.createServer();
      server.unref();
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1);  
        }
      });
      server.listen(port, () => {
        callback(port);
        server.close();
      });
    }

    tryPort(port);
  }

  findAvailablePort(5000, (availablePort) => {
    const loadBalancer = http.createServer((req, res) => {
      const workerIndex = req.socket.remoteAddress.hashCode() % numCPUs;
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

    loadBalancer.listen(availablePort, () => {
      log.info(processName, `Load balancer started on port ${availablePort}`);
    });
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
      log.info(processName, `Starting process in ${env} mode.`);
      const clusterOption = args.includes('--cluster');
      processManager.start(script, processName, env, clusterOption);
      break;

    case 'stop':
      const stopName = args[1];
      log.info(processName, `Stopping process ${stopName}.`);
      processManager.stop(stopName);
      break;

    case 'restart':
      const restartName = args[1];
      log.info(processName, `Restarting process ${restartName}.`);
      processManager.restart(restartName);
      break;

    case 'info':
      const infoName = args[1];
      log.info(processName, `Fetching details for process ${infoName}.`);
      processManager.info(infoName);
      break;

    case 'list':
      log.info(processName, 'Listing all active processes.');
      processManager.list();
      break;

    default:
      log.error(processName, 'Unknown command. Available commands are: start, stop, restart, info, list.');
  }
}
