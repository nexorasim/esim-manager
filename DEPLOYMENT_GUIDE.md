# NexoraSIM eSIM Manager - Deployment & Development Guide

**Version:** 1.0.0  
**Last Updated:** January 27, 2026  
**Status:** Production Ready

---

## Quick Start

### Prerequisites
- Windows 10 Pro (1809+) or Windows 11 Pro
- .NET 8 Runtime (download from https://dotnet.microsoft.com/download/dotnet/8.0)
- For development: .NET 8 SDK + Visual Studio 2022 or VS Code

---

## Installation & Deployment

### Option 1: Run from Published Build (Recommended for Users)

1. **Download the published build** from the `publish` folder or latest release
2. **Ensure .NET 8 Runtime is installed**
3. **Run the application:**
   ```cmd
   cd publish
   ESimManager.exe
   ```

### Option 2: Install from Source (For Developers)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nexorasim/esim-manager.git
   cd esim-manager
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Build the project:**
   ```bash
   dotnet build --configuration Release
   ```

4. **Run the application:**
   ```bash
   dotnet run --project ESimManager/ESimManager.csproj
   ```

---

## Build Commands

### Clean Build
```bash
dotnet clean
dotnet restore
dotnet build --configuration Release
```

### Run Tests
```bash
dotnet test --configuration Release
```

### Publish for Distribution
```bash
# Framework-dependent (requires .NET 8 Runtime on target machine)
dotnet publish ESimManager/ESimManager.csproj --configuration Release --runtime win-x64 --self-contained false --output ./publish

# Self-contained (includes .NET Runtime - larger file size)
dotnet publish ESimManager/ESimManager.csproj --configuration Release --runtime win-x64 --self-contained true --output ./publish-standalone
```

### Create Distribution Package
```bash
# Create ZIP archive for distribution
Compress-Archive -Path ./publish/* -DestinationPath ESimManager-win-x64.zip -Force
```

---

## Development Setup

### 1. Install Development Tools

**Required:**
- .NET 8 SDK: https://dotnet.microsoft.com/download/dotnet/8.0
- Git: https://git-scm.com/downloads

**Recommended:**
- Visual Studio 2022 (Community/Professional/Enterprise)
- OR Visual Studio Code with C# extension

### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/nexorasim/esim-manager.git
cd esim-manager

# Restore dependencies
dotnet restore

# Build
dotnet build

# Run
dotnet run --project ESimManager/ESimManager.csproj
```

### 3. Development Workflow

**Build and Run:**
```bash
# Debug build and run
dotnet run --project ESimManager/ESimManager.csproj

# Release build
dotnet build --configuration Release

# Run tests
dotnet test

# Run specific test
dotnet test --filter "FullyQualifiedName~LoggingServiceTests"
```

**Hot Reload (for development):**
```bash
# Run with hot reload enabled
dotnet watch run --project ESimManager/ESimManager.csproj
```

**Code Quality:**
```bash
# Check for diagnostics
dotnet build /warnaserror

# Run code analysis
dotnet format --verify-no-changes
```

---

## Project Structure

```
esim-manager/
├── ESimManager/              # Main WPF application
│   ├── Models/              # Data models
│   │   └── Entities/        # Domain entities
│   ├── ViewModels/          # MVVM view models
│   ├── Views/               # XAML views
│   ├── Services/            # Business logic
│   │   └── Interfaces/      # Service contracts
│   ├── Converters/          # Value converters
│   ├── Resources/           # Styles and themes
│   ├── Validators/          # Validation logic
│   └── Exceptions/          # Custom exceptions
├── ESimManager.Tests/        # Unit and integration tests
├── publish/                  # Published build output
├── docs/                     # Documentation
├── scripts/                  # Build and deployment scripts
└── .kiro/specs/             # Feature specifications
```

---

## Running in Development Mode

### Visual Studio 2022
1. Open `esim-manager.sln`
2. Set `ESimManager` as startup project
3. Press F5 to run with debugging
4. Press Ctrl+F5 to run without debugging

### Visual Studio Code
1. Open the `esim-manager` folder
2. Install C# extension
3. Press F5 to run with debugging
4. Use integrated terminal for CLI commands

### Command Line
```bash
# Run in development mode
dotnet run --project ESimManager/ESimManager.csproj

# Run with specific configuration
dotnet run --project ESimManager/ESimManager.csproj --configuration Debug

# Run with environment variables
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run --project ESimManager/ESimManager.csproj
```

---

## Testing

### Run All Tests
```bash
dotnet test
```

### Run Tests with Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

### Run Specific Test Class
```bash
dotnet test --filter "FullyQualifiedName~LoggingServiceTests"
```

### Run Property-Based Tests
```bash
# Property-based tests use FsCheck
dotnet test --filter "Category=PropertyTest"
```

---

## Deployment Options

### 1. Local Deployment (Development/Testing)
- Run directly from source using `dotnet run`
- Use published build in `./publish` folder

### 2. Enterprise Deployment
- Create MSI installer using WiX Toolset (see Task 22 in spec)
- Deploy via Group Policy or SCCM
- Use silent install parameters

### 3. CI/CD Deployment
- GitHub Actions automatically builds on push
- Creates release artifacts on version tags
- Deploys documentation to GitHub Pages

---

## Configuration

### Application Settings
Configuration files are stored in:
- Development: `%LOCALAPPDATA%\ESimManager\config.json`
- Production: `%PROGRAMDATA%\ESimManager\config.json`

### Database
SQLite database location:
- Development: `%LOCALAPPDATA%\ESimManager\esim.db`
- Production: `%PROGRAMDATA%\ESimManager\esim.db`

### Logs
Application logs are written to:
- `%LOCALAPPDATA%\ESimManager\logs\`
- Rolling file: `esim-manager-{Date}.log`

---

## Troubleshooting

### Build Errors

**Error: .NET SDK not found**
```bash
# Install .NET 8 SDK
# Download from: https://dotnet.microsoft.com/download/dotnet/8.0
```

**Error: NuGet restore failed**
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore again
dotnet restore
```

### Runtime Errors

**Error: Application won't start**
1. Verify .NET 8 Runtime is installed
2. Check Windows Event Viewer for errors
3. Run from command line to see error messages:
   ```bash
   cd publish
   .\ESimManager.exe
   ```

**Error: Database access denied**
1. Check folder permissions for `%LOCALAPPDATA%\ESimManager`
2. Run as administrator if needed
3. Check antivirus isn't blocking SQLite

---

## Performance Optimization

### Build Optimization
```bash
# Optimize for size
dotnet publish -c Release -r win-x64 --self-contained true /p:PublishTrimmed=true

# Optimize for speed
dotnet publish -c Release -r win-x64 --self-contained true /p:TieredCompilation=true
```

### Runtime Optimization
- Enable ReadyToRun compilation
- Use Native AOT (future enhancement)
- Profile with dotnet-trace

---

## Security Considerations

### Development
- Never commit sensitive data (API keys, passwords)
- Use user secrets for local development
- Keep dependencies updated

### Production
- Use Windows DPAPI for data encryption
- Implement proper authentication
- Enable audit logging
- Regular security updates

---

## Next Steps

### For Users
1. Download latest release
2. Install .NET 8 Runtime
3. Run ESimManager.exe
4. Follow quick start guide

### For Developers
1. Clone repository
2. Install .NET 8 SDK
3. Run `dotnet restore && dotnet build`
4. Start implementing enterprise features from spec

### For DevOps
1. Configure CI/CD pipeline
2. Set up automated testing
3. Configure deployment automation
4. Monitor application health

---

## Support & Resources

- **Documentation:** https://nexorasim.github.io/esim-manager
- **Issues:** https://github.com/nexorasim/esim-manager/issues
- **Discussions:** https://github.com/nexorasim/esim-manager/discussions
- **Enterprise Spec:** `.kiro/specs/enterprise-esim-manager/`

---

## Version History

### v1.0.0 (Current)
- Initial production release
- Basic eSIM profile management
- WLAN and Bluetooth connectivity
- Logging and diagnostics
- Enhanced project structure
- Enterprise spec created

### Planned (v2.0.0)
- GSMA SGP.22 compliance
- Enterprise authentication and RBAC
- Modern UI/UX redesign
- Database persistence
- Advanced security features

---

**NexoraSIM eSIM Manager** - Enterprise eSIM Lifecycle Management
