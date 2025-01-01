# NodeShield

NodeShield is a powerful process manager for Node.js applications. It helps monitor, manage, and keep your applications running indefinitely. With features like clustering, zero-downtime reloading, and error threshold-based restarts, NodeShield ensures robust and seamless operation in production environments.

## Features

- **Process Management**: Start, stop, restart, and manage multiple processes.
- **Cluster Mode**: Load balancing and scaling across multiple CPU cores.
- **Zero Downtime Reloading**: Seamless reloading of applications without downtime.
- **Error Threshold Restarts**: Automatically restarts processes after multiple errors.
- **Automatic Process Restart**: Restarts crashed or stopped processes automatically.
- **Graceful Shutdown**: Ensures processes are stopped safely to avoid data loss.
- **Environment Management**: Easily configure environments for each process.
- **Logging**: Logs output, errors, and process statuses.
- **Process Information**: Retrieve detailed insights about running processes.

## Installation

Install NodeShield globally or locally using npm:

```bash
npm install -g @abhisheksuresh2/nodeshield
```

## Usage

### Start a Process
```bash
nodeshield start <script.js> --name <process_name> --env <environment>
```

### Stop a Process
```bash
nodeshield stop <process_name>
```

### Restart a Process
```bash
nodeshield restart <process_name>
```

### Get Process Information
```bash
nodeshield info <process_name>
```

### List Running Processes
```bash
nodeshield list
```

### Start Clustered Processes
```bash
nodeshield start <script.js> --name <process_name> --env <environment> --cluster
```

## Example

```bash
$ nodeshield start app.js --name MyApp --env production --cluster
NodeShield is running and ready to monitor your application.
```

## Contributing

We welcome contributions to NodeShield!  
Feel free to submit issues, create pull requests, or suggest improvements to make NodeShield even better.  

## License

NodeShield is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for more information.

## [CHANGELOG](https://github.com/AbhishekSuresh2/NodeShield/tree/main/CHANGELOG.md)
