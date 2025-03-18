---

# Changelog  

All notable changes to this project will be documented in this file.  

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).  

---

## [Unreleased]  
*Work in progress for future updates. Stay tuned!*  

---

## [0.2.0] - 2025-01-02  

### 🚀 Added  
- **Zero-downtime restart mechanism**: Ensures seamless application updates with no service interruptions.  
- **Enhanced clustering**: Integrated load balancing for optimal resource utilization and scalability.  
- **Improved error handling**: More robust and intuitive error management for smoother operations.  

### ❌ Removed  
- **Threshold-based error handling**: Processes no longer restart after repeated errors, simplifying error management.  

---

## [0.1.8] - 2025-01-01  

### 🚀 Added  
- **Advanced clustering support**: Built-in load balancing for distributed workloads.  
- **Threshold-based error handling**: Processes restart only after repeated errors (default: 5 retries).  
- **Detailed process information**: New `info` command displays CPU usage, memory usage, and process status.  
- **Graceful shutdown mechanism**: Prevents data loss during process termination.  

### 🔄 Changed  
- **Improved logging format**: Enhanced timestamps and process-specific prefixes for better debugging.  
- **Redesigned `list` command**: More readable and user-friendly output.  
- **Optimized environment management**: Better handling of complex configurations.  

### 🐛 Fixed  
- **Process restarts in clustered mode**: Resolved multiple bugs for smoother operation.  
- **Logging during child process execution**: Fixed improper logging issues.  
- **`restart` command behavior**: Addressed edge cases for more reliable performance.  

### ❌ Removed  
- **Immediate process restarts**: Replaced with threshold-based restarts for better stability.  

---

## [0.0.5] - 2024-12-31  

### 🚀 Added  
- **Initial release**: Basic process management functionality.  
- **Core commands**: `start`, `stop`, `restart`, `list`, and `info`.  
- **Cluster mode**: Scaling applications across CPU cores for improved performance.  

### 🔄 Changed  
- **Basic logging**: Implemented using `chalk` for colored output.  

---

## ✨ Contribution  

We welcome contributions! Feel free to submit issues or pull requests. For more details, check out our [Contributing Guide](CONTRIBUTING.md).  

---

## 📜 License  

This project is licensed under the [MIT License](LICENSE).  

---
