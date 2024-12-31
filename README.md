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

# NodeShield

NodeShield is a simple process manager for Node.js applications. It helps to monitor, manage, and keep your Node.js applications running indefinitely. NodeShield supports clustering for load balancing and zero downtime reloading, offering you a robust solution for production environments.

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

You can install `NodeShield` globally or locally using `npm`.

```bash
npm install -g nodeshield
```

## Usage

### Start a Process

Start a Node.js application with NodeShield by specifying the script name and the environment:

```bash
nodeshield start <script.js> --name <process_name> --env <environment>
```

- `script.js` is the Node.js script you want to run.
- `process_name` is an optional name for the process (defaults to `NodeShield`).
- `environment` specifies the environment to run the process in (default is `development`).

### Stop a Process

Stop a running process:

```bash
nodeshield stop <process_name>
```

### Restart a Process

Restart a process:

```bash
nodeshield restart <process_name>
```

### Get Process Information

Display detailed information about a running process:

```bash
nodeshield info <process_name>
```

### List Running Processes

List all currently running processes:

```bash
nodeshield list
```

### Start Clustered Processes

Run your application in cluster mode, utilizing all available CPU cores:

```bash
nodeshield start <script.js> --name <process_name> --env <environment> --cluster
```

### Example 1: Simple Version
For beginners or those who don't need to specify the environment:

```bash
$ nodeshield start app.js --name MyApp
NodeShield is now running and ready to monitor your application.
MyApp Process started in development mode (PID: 12345).
```

### Example 2: Detailed Version (for advanced users or production setup)
For users who want to explicitly specify the environment as **production**:

```bash
$ nodeshield start app.js --name MyApp --env production
NodeShield is now running and ready to monitor your application.
MyApp Process started in production mode (PID: 12345).
```
### Explanation for Users:
- **Simple Version**: This command starts the application with the default environment (development mode).
- **Detailed Version**: This command explicitly sets the environment to **production**, which may be necessary for certain configurations (like in live environments).
 
### Cluster Mode Example

Start an application in cluster mode with multiple workers:

```bash
$ nodeshield start app.js --name MyApp --env production --cluster
```

## Commands

- **start**: Start a process.
- **stop**: Stop a process.
- **restart**: Restart a process.
- **info**: Show detailed information about a process.
- **list**: List all running processes.

## Process Management

NodeShield automatically manages the lifecycle of your applications. If a process crashes, it will be restarted after 5 seconds. You can also monitor the health of your processes and cluster workers.

### Clustering

NodeShield supports running your Node.js applications in cluster mode, which allows you to utilize multiple CPU cores and scale your application efficiently. This increases overall performance and reliability.

To start your application in cluster mode, use the `--cluster` flag:

```bash
nodeshield start <script.js> --cluster
```

This will spawn multiple worker processes, balancing the load between them.

## License

NodeShield is licensed under the MIT License.
