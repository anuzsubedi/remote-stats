# Remote Stats - Real-Time System Monitoring Dashboard

A modern, responsive system monitoring dashboard built with React, TypeScript, and Python. Monitor your system's CPU, memory, storage, network, GPU, and processes in real-time with a beautiful, intuitive interface.

**Note**: This frontend requires the Python Flask API from [anuzsubedi/remote-stats-server](https://github.com/anuzsubedi/remote-stats-server) to be running for full functionality.

![Overview Dashboard](https://i.imgur.com/DnHlIoD.png)

## Features

### Comprehensive System Monitoring
- **CPU Monitoring**: Real-time CPU usage, per-core statistics, temperature, and frequency
- **Memory Monitoring**: RAM usage, swap memory, and detailed memory statistics
- **Storage Monitoring**: Disk usage, I/O statistics, and partition information
- **Network Monitoring**: Network interfaces, connections, and I/O statistics
- **GPU Monitoring**: Support for NVIDIA, AMD, integrated, and Raspberry Pi GPUs
- **Process Monitoring**: Top processes by CPU and memory usage with detailed information

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data updates with smooth animations
- **Dark/Light Theme**: Built-in theme support with automatic system preference detection
- **Intuitive Navigation**: Clean sidebar navigation with collapsible menu
- **Professional Design**: Modern card-based layout with consistent styling

### Technical Features
- **Real-time Data**: WebSocket-like polling for live system statistics
- **Cross-platform**: Works on Linux, Windows, and macOS
- **Lightweight**: Minimal resource usage while providing comprehensive monitoring
- **Extensible**: Modular architecture for easy feature additions
- **Production Ready**: Error handling, health checks, and robust API design

## Screenshots

### Overview Dashboard
The main dashboard provides a comprehensive overview of all system metrics at a glance.

![Overview Dashboard](https://i.imgur.com/DnHlIoD.png)

### CPU Monitoring
Detailed CPU information including usage, temperature, frequency, and per-core statistics.

![CPU Page](https://i.imgur.com/UXP5O9O.png)

### GPU Monitoring
Comprehensive GPU monitoring with support for multiple GPU types and vendors.

![GPU Page](https://i.imgur.com/z42TO82.png)

### Process Monitoring
Real-time process monitoring with top CPU and memory usage processes.

![Processes Page](https://i.imgur.com/4HKlnNA.png)

## Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** or **yarn**
- **Linux/Unix system** (for full system monitoring capabilities)

### System Compatibility

This application has been thoroughly tested on:
- **Raspberry Pi 5** running Raspberry Pi OS - Full functionality with all features working correctly
- **VMware Fusion VM** on MacBook Pro 2017 - Limited functionality:
  - GPU monitoring not available (virtualized environment)
  - CPU temperature monitoring not available (virtualized environment)
  - Other system metrics work normally

For optimal experience, we recommend running on native Linux systems or Raspberry Pi hardware.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anuzsubedi/remote-stats
   cd remote-stats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to access the dashboard.

**Note**: This frontend requires the Python Flask API from [anuzsubedi/remote-stats-server](https://github.com/anuzsubedi/remote-stats-server) to be running for full functionality.

## Environment Variables & .env Usage

This frontend uses a `.env` file for configuration. You can set the following variable:

```
VITE_API_BASE_URL=http://localhost:5000
```

- `VITE_API_BASE_URL`: The base URL for the backend API (default: `http://localhost:5000`)

**How to use:**
1. Copy the sample above into a file named `.env` in the frontend root directory.
2. The frontend will automatically use this value for API requests.

## Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Beautiful & consistent icon toolkit
- **Framer Motion** - Production-ready motion library

## Key Features Explained

### Real-time Monitoring
The dashboard provides real-time updates of system metrics through efficient polling mechanisms, ensuring you always have the latest information about your system's performance.

### Cross-platform Support
The monitoring system works seamlessly across different operating systems while providing consistent data formats.

### Responsive Design
The interface adapts beautifully to different screen sizes, making it perfect for monitoring systems from any device - desktop, tablet, or mobile.

### Performance Optimized
Both frontend and backend are optimized for performance, with efficient data structures and minimal resource usage while providing comprehensive monitoring capabilities.

## Configuration

### Customization
- **Update intervals**: Modify polling intervals in the frontend store
- **API endpoints**: Configure API base URLs for different environments
- **Theme customization**: Customize colors and styling in Tailwind config

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **CPU Icon**: [SVG Repo](https://www.svgrepo.com/svg/380893/cpu-computer-processor-technology-hardware) - CC0 License
- **Shadcn/ui**: Beautiful and accessible UI components
- **Tailwind CSS**: Utility-first CSS framework

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include system information and error logs

