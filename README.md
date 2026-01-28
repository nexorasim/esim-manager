# eSIM Manager

Production-ready Windows Desktop Application for NexoraSIM, built with .NET 8 WPF, supporting WLAN & Bluetooth connectivity, enterprise eSIM lifecycle management, CI/CD automation, and GitHub Pages documentation.

![Build Status](https://github.com/nexorasim/esim-manager/workflows/Build%20and%20Release/badge.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![Platform](https://img.shields.io/badge/platform-Windows-0078D6)

## Features

- **Device Discovery**: Automatic discovery of eSIM-capable devices via WLAN and Bluetooth
- **Connection Management**: Seamless device pairing and connection handling
- **eSIM Profile Management**: 
  - List installed profiles with GSMA SGP.22 compliance
  - Provision new profiles with activation codes
  - Activate/deactivate profiles with state validation
  - Remove profiles with confirmation
  - Export/import profile metadata
- **Enterprise Security**: 
  - Role-based access control (RBAC)
  - Encrypted data storage (DPAPI)
  - Comprehensive audit logging
  - Session management
- **System Logging**: Structured logging with Serilog
- **Offline Support**: Operation queueing for offline scenarios
- **Modern UI**: Professional light theme with clean navigation
- **Property-Based Testing**: Comprehensive test coverage with FsCheck

## Quick Start

### Installation

1. Download the latest release from [Releases](https://github.com/nexorasim/esim-manager/releases)
2. Extract `ESimManager-win-x64.zip`
3. Run `ESimManager.exe`

### Build from Source

```powershell
# Clone the repository
git clone https://github.com/nexorasim/esim-manager.git
cd esim-manager

# Restore and build
dotnet restore
dotnet build --configuration Release

# Run tests
dotnet test

# Publish
dotnet publish ESimManager/ESimManager.csproj --configuration Release --runtime win-x64 --output ./publish

# Run
.\publish\ESimManager.exe
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
- **Database**: Entity Framework Core 8.0 + SQLite
- **Logging**: Serilog for structured logging
- **Testing**: xUnit + FsCheck (property-based testing)
- **Connectivity**: Native Windows APIs for WLAN and Bluetooth

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | .NET | 8.0 |
| UI | WPF | - |
| Database | SQLite + EF Core | 8.0.0 |
| Testing | xUnit + FsCheck | 2.5.3 / 2.16.6 |
| Logging | Serilog | 8.0.0 |
| MVVM | CommunityToolkit.Mvvm | 8.2.2 |

## Project Structure

```
esim-manager/
├── ESimManager/              # Main WPF application
│   ├── Data/                # EF Core DbContext
│   ├── Models/              # Domain models and entities
│   ├── ViewModels/          # MVVM view models
│   ├── Views/               # XAML views
│   ├── Services/            # Business logic services
│   ├── Resources/           # Styles and themes
│   └── Converters/          # Value converters
├── ESimManager.Tests/       # Test project
│   ├── PropertyTests/       # Property-based tests
│   └── Services/            # Unit tests
├── api/                     # Backend API (Node.js)
├── web/                     # Web interface (Next.js)
├── docs/                    # Documentation
├── scripts/                 # Build automation
└── .github/workflows/       # CI/CD pipelines
```

## CI/CD

Automated workflows using GitHub Actions:

- **Build and Release**: Multi-component build pipeline
  - Desktop Application (Windows)
  - API (Node.js/TypeScript)
  - Web Application (Next.js/React)
- **Testing**: Automated test execution on every push
- **Release**: Creates installer package on version tags (v*)
- **Documentation**: Auto-deploys to GitHub Pages on docs changes

### Build Status

| Component | Status |
|-----------|--------|
| Desktop App | 0 errors, 0 warnings, 9/9 tests passing |
| API | Configured |
| Web | Configured |
| Documentation | Deployed to GitHub Pages |

## Development

### Prerequisites

- Visual Studio 2022 (recommended) or VS Code
- .NET 8 SDK
- Windows 10/11 Pro
- Node.js 20.x (for API/Web development)

### Building

```powershell
# Desktop Application
dotnet build

# API
npm install --prefix api
npm run build --prefix api

# Web
npm install --prefix web
npm run build --prefix web
```

### Testing

```powershell
# Desktop Application
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Running

```powershell
# Desktop Application
dotnet run --project ESimManager/ESimManager.csproj

# API
npm start --prefix api

# Web
npm run dev --prefix web
```

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
