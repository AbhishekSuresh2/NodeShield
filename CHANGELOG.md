# Changelog  

All notable changes to this project will be documented in this file.  

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).  

## [0.1.2] - 2025-01-01 

### Added  
- Support for advanced clustering with built-in load balancing.  
- Zero-downtime reloading for seamless application updates.  
- Threshold-based error handling: processes now restart only after repeated errors (default: 5 retries).  
- Detailed process information command (`info`), displaying CPU usage, memory usage, and status.  
- Graceful shutdown mechanism to prevent data loss during process termination.  

### Changed  
- Improved logging format with enhanced timestamps and process-specific prefixes.  
- Redesigned `list` command output for better readability and usability.  
- Optimized environment management to handle complex configurations.  

### Fixed  
- Resolved multiple bugs related to process restarts in clustered mode.  
- Fixed an issue with improper logging during child process execution.  
- Addressed edge cases in `restart` command behavior.  

### Removed  
- Immediate process restarts upon single errors (replaced with threshold-based restarts).  

## [0.0.5] - 2024-12-31

### Added  
- Initial release with basic process management functionality.  
- Commands: `start`, `stop`, `restart`, `list`, and `info`.  
- Cluster mode for scaling applications across CPU cores.  

### Changed  
- Basic logging implemented using `chalk` for colored output.  

---

## Contribution  

Feel free to contribute by submitting issues or pull requests! For more information, check the [Contributing Guide](CONTRIBUTING.md).  

## License  

This project is licensed under the [MIT License](LICENSE).  
