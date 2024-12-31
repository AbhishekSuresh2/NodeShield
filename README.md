Here's a sample `README.md` for your `NodeGuard` application, styled similarly to the example from PM2:

```markdown
# NodeGuard

NodeGuard is a simple process manager for Node.js applications. It helps to monitor, manage, and keep your Node.js applications running indefinitely. NodeGuard supports clustering for load balancing and zero downtime reloading, offering you a robust solution for production environments.

## Features

- **Process Management**: Start, stop, restart, and manage multiple processes.
- **Cluster Mode**: Load balancing and scaling your application across multiple CPU cores.
- **Zero Downtime Reloading**: Seamless reloading of applications without any downtime.
- **Automatic Process Restart**: Automatically restarts crashed or stopped processes.
- **Graceful Shutdown**: Handles graceful shutdown of processes to avoid data loss.
- **Environment Management**: Easily configure the environment for each process.
- **Logging**: Logs process output, errors, and status to keep you informed.
- **Process Information**: Retrieve detailed information about running processes.

## Installation

You can install `NodeGuard` globally or locally using `npm`.

```bash
npm install -g nodeguard
```

## Usage

### Start a Process

Start a Node.js application with NodeGuard by specifying the script name and the environment:

```bash
nodeguard start <script.js> --name <process_name> --env <environment>
```

- `script.js` is the Node.js script you want to run.
- `process_name` is an optional name for the process (defaults to `NodeGuard`).
- `environment` specifies the environment to run the process in (default is `development`).

### Stop a Process

Stop a running process:

```bash
nodeguard stop <process_name>
```

### Restart a Process

Restart a process:

```bash
nodeguard restart <process_name>
```

### Get Process Information

Display detailed information about a running process:

```bash
nodeguard info <process_name>
```

### List Running Processes

List all currently running processes:

```bash
nodeguard list
```

### Start Clustered Processes

Run your application in cluster mode, utilizing all available CPU cores:

```bash
nodeguard start <script.js> --name <process_name> --env <environment> --cluster
```

### Logs

View logs for a specific process:

```bash
nodeguard logs <process_name>
```

### Monitoring

Monitor all processes using the built-in monitoring tool:

```bash
nodeguard monit
```

## Example

```bash
$ nodeguard start app.js --name MyApp --env production
NodeGuard is now running and ready to monitor your application.
MyApp Process started in production mode (PID: 12345).
```

### Cluster Mode Example

Start an application in cluster mode with multiple workers:

```bash
$ nodeguard start app.js --name MyApp --env production --cluster
```

## Commands

- **start**: Start a process.
- **stop**: Stop a process.
- **restart**: Restart a process.
- **info**: Show detailed information about a process.
- **list**: List all running processes.

## Process Management

NodeGuard automatically manages the lifecycle of your applications. If a process crashes, it will be restarted after 5 seconds. You can also monitor the health of your processes and cluster workers.

### Clustering

NodeGuard supports running your Node.js applications in cluster mode, which allows you to utilize multiple CPU cores and scale your application efficiently. This increases overall performance and reliability.

To start your application in cluster mode, use the `--cluster` flag:

```bash
nodeguard start <script.js> --cluster
```

This will spawn multiple worker processes, balancing the load between them.

## License

NodeGuard is licensed under the MIT License.
