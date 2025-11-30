# eSIM Manager

Production-ready Windows Desktop Application for NexoraSIM, built with .NET 8 WPF, supporting WLAN & Bluetooth connectivity, enterprise eSIM lifecycle management, CI/CD automation, and GitHub Pages documentation.

![Build Status](https://github.com/nexorasim/esim-manager/workflows/Build%20and%20Release/badge.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)

## Features

- **Device Discovery**: Automatic discovery of eSIM-capable devices via WLAN and Bluetooth
- **Connection Management**: Seamless device pairing and connection handling
- **eSIM Profile Management**: 
  - List installed profiles
  - Provision new profiles
  - Activate/deactivate profiles
  - Remove profiles
- **System Logging**: Comprehensive event logging and diagnostics
- **Offline Recovery Mode**: Continue operations with limited connectivity
- **Enterprise Configuration**: Secure enterprise configuration management
- **Modern UI**: Professional dark theme with intuitive navigation

## Quick Start

### Installation

1. Download the latest release from [Releases](https://github.com/nexorasim/esim-manager/releases)
2. Extract the archive
3. Run `scripts/setup-and-build.ps1` with PowerShell
4. Launch eSIM Manager from your desktop

### Manual Build

```powershell
# Clone the repository
git clone https://github.com/nexorasim/esim-manager.git
cd esim-manager

# Restore and build
dotnet restore
dotnet build --configuration Release

# Run
dotnet run --project ESimManager/ESimManager.csproj
```

## System Requirements

- Windows 10 Pro (1809+) or Windows 11 Pro
- .NET 8 Runtime
- WLAN adapter (for WLAN connectivity)
- Bluetooth 4.0+ (for Bluetooth connectivity)

## Documentation

Full documentation is available at [https://nexorasim.github.io/esim-manager](https://nexorasim.github.io/esim-manager)

- [Installation Guide](docs/installation.md)
- [System Requirements](docs/system-requirements.md)
- [Quick Start Guide](docs/quick-start.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Developer Guide](docs/developer-guide.md)

## Architecture

Built with modern .NET 8 WPF using:

- **MVVM Pattern**: Clean separation of concerns
- **Dependency Injection**: Microsoft.Extensions.DependencyInjection
- **MVVM Toolkit**: CommunityToolkit.Mvvm for reactive ViewModels
- **Logging**: Serilog for structured logging
- **Connectivity**: Native Windows APIs for WLAN (netsh) and Bluetooth (BLE APIs)

## Project Structure

```
esim-manager/
├── ESimManager/              # Main WPF application
│   ├── Models/              # Data models
│   ├── ViewModels/          # MVVM view models
│   ├── Views/               # XAML views
│   ├── Services/            # Business logic
│   └── Resources/           # Styles and themes
├── ESimManager.Tests/       # Unit tests
├── docs/                    # Documentation
├── scripts/                 # Build automation
└── .github/workflows/       # CI/CD pipelines
```

## Development

### Prerequisites

- Visual Studio 2022
- .NET 8 SDK
- Windows 10/11 Pro

### Building

```powershell
dotnet build
```

### Testing

```powershell
dotnet test
```

### Running

```powershell
dotnet run --project ESimManager/ESimManager.csproj
```

## CI/CD

Automated workflows using GitHub Actions:

- **Build**: Compiles, tests, and packages on every push
- **Release**: Creates signed installer on version tags
- **Documentation**: Deploys docs to GitHub Pages

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://nexorasim.github.io/esim-manager)
- [Issue Tracker](https://github.com/nexorasim/esim-manager/issues)
- [Discussions](https://github.com/nexorasim/esim-manager/discussions)

## Roadmap

- [ ] Signed Windows installer (.exe)
- [ ] Multi-device support
- [ ] Profile templates
- [ ] Advanced diagnostics
- [ ] Remote management API
- [ ] MDM/EMM/UEM integration

---

**NexoraSIM** - Enterprise eSIM Management Solutions
