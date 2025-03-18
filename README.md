# NodeShield

**NodeShield** is a robust and feature-rich process manager and load balancer for Node.js applications. It ensures your applications remain operational, scalable, and efficient in production environments. With powerful features like clustering, load balancing, error handling, and graceful shutdowns, NodeShield simplifies managing complex Node.js deployments.

---

## Key Features

- **Comprehensive Process Management**: Start, stop, restart, and monitor processes effortlessly.
- **Cluster Mode Support**: Leverage multi-core CPU architecture for efficient load balancing and scalability.
- **Zero Downtime Reloading**: Seamlessly reload applications without interrupting active users.
- **Automatic Restarts**: Recover crashed processes automatically to ensure high availability.
- **Advanced Error Handling**:
  - Detect and log **missing modules**, **missing files**, **syntax errors**, and **port conflicts**.
  - Provide actionable error messages (e.g., `npm install <module>` for missing modules).
  - Log **full error details** (including stack traces) for debugging in production environments.
- **Resource Monitoring**: Track CPU and memory usage for each process.
- **Graceful Shutdown**: Safeguard data and connections during process termination.
- **Environment Configuration**: Manage and switch between environments with ease.
- **Detailed Logging**: Track process activity, errors, and performance metrics.
- **Process Insights**: Retrieve real-time details of active processes, including uptime, restart count, and resource usage.
- **Extensible Commands**: Easily extendable to fit custom workflows.

---

## Installation

Install NodeShield globally using npm:

```bash
npm install -g @abhisheksuresh2/nodeshield
```

---

## Usage

NodeShield provides simple commands to manage your applications:

### Commands Overview

#### Start a Process
Start a process with optional clustering and environment configuration:
```bash
nodeshield start <script.js> --name <process_name> --env <environment> [--cluster]
```

#### Stop a Process
Stop a specific process:
```bash
nodeshield stop <process_name>
```

#### Restart a Process
Restart a process to apply changes or recover from errors:
```bash
nodeshield restart <process_name>
```

#### Get Process Information
Retrieve detailed information about a specific process:
```bash
nodeshield info <process_name>
```

#### List All Running Processes
List all active processes along with their statuses:
```bash
nodeshield list
```

---

### Example Usage

#### Start a Clustered Application in Production Mode
```bash
$ nodeshield start app.js --name MyApp --env production --cluster
NodeShield is ready to manage your application!
```

#### Stop a Process
```bash
$ nodeshield stop MyApp
Process "MyApp" stopped successfully.
```

#### Restart a Process
```bash
$ nodeshield restart MyApp
Process "MyApp" restarted successfully.
```

#### Get Process Information
```bash
$ nodeshield info MyApp
Process: MyApp
Status: Running
PID: 12345
Uptime: 5 minutes
Restarts: 0
CPU Usage: 12.5%
Memory Usage: 128MB
```

#### List All Running Processes
```bash
$ nodeshield list
Process Name    Status    PID     Uptime      Restarts
MyApp           Running   12345   5 minutes   0
MyApp-Worker-1  Running   12346   5 minutes   0
```

---

## Advanced Usage

### Cluster Mode
Use the `--cluster` flag to distribute the application across all CPU cores:
```bash
nodeshield start app.js --name MyApp --env production --cluster
```

### Environment Management
Configure `--env` to switch between environments like `development`, `staging`, or `production`:
```bash
nodeshield start app.js --name MyApp --env staging
```

### Error Handling
NodeShield automatically detects and handles common errors:
- **Missing Modules**: Suggests `npm install <module>`.
- **Missing Files**: Logs the missing file path.
- **Syntax Errors**: Logs the full error details, including stack traces.
- **Port Conflicts**: Detects and logs port conflicts.

### Resource Monitoring
NodeShield tracks CPU and memory usage for each process. Use the `info` command to view resource usage:
```bash
$ nodeshield info MyApp
CPU Usage: 12.5%
Memory Usage: 128MB
```

### Graceful Shutdown
NodeShield ensures processes shut down gracefully, preserving data and connections:
```bash
$ nodeshield stop MyApp
Process "MyApp" stopped gracefully.
```

---

## Contributing

We love contributions! Whether you're reporting bugs, suggesting features, or improving documentation, your input is welcome.  

To get started:
- Fork the repository and create a feature branch.
- Submit a pull request with a detailed description of your changes.

Refer to our [Contributing Guide](CONTRIBUTING.md) for detailed guidelines.  
By contributing, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

NodeShield is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Changelog

Stay updated with the latest changes and improvements in NodeShield by visiting our [Changelog](CHANGELOG.md).

---

## Feedback & Support

For support, feature requests, or feedback, please open an issue on our [GitHub repository](https://github.com/AbhishekSuresh2/NodeShield).

---
