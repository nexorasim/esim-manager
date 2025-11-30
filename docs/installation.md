# Installation Guide

This guide will walk you through installing eSIM Manager on your Windows system.

## Prerequisites

Before installing eSIM Manager, ensure your system meets the following requirements:

- Windows 10 Pro (version 1809 or later) or Windows 11 Pro
- .NET 8 Runtime (will be installed automatically if not present)
- Administrator privileges for initial installation
- 200 MB of available disk space

## Installation Methods

### Method 1: Automated Installation (Recommended)

1. Download the latest release from [GitHub Releases](https://github.com/nexorasim/esim-manager/releases)
2. Extract the downloaded archive
3. Right-click on `setup-and-build.ps1` in the `scripts` folder
4. Select "Run with PowerShell"
5. Follow the on-screen instructions

The script will:
- Verify .NET SDK installation
- Download and restore dependencies
- Build the application
- Install to your local application directory
- Create a desktop shortcut

### Method 2: Manual Installation

1. Ensure .NET 8 SDK is installed:
   ```powershell
   dotnet --version
   ```

2. Clone or download the repository:
   ```powershell
   git clone https://github.com/nexorasim/esim-manager.git
   cd esim-manager
   ```

3. Restore dependencies:
   ```powershell
   dotnet restore
   ```

4. Build the application:
   ```powershell
   dotnet build --configuration Release
   ```

5. Run the application:
   ```powershell
   dotnet run --project ESimManager/ESimManager.csproj
   ```

### Method 3: Installer Package (Coming Soon)

A signed Windows installer (.exe) will be available for download from the releases page.

## Post-Installation

After installation:

1. Launch eSIM Manager from the desktop shortcut or Start Menu
2. The application will perform initial setup
3. Configure your connection preferences in Settings
4. You're ready to start managing eSIM profiles!

## Updating

To update to a newer version:

1. Download the latest release
2. Run the installation script again
3. The old version will be automatically replaced

## Uninstallation

To uninstall eSIM Manager:

1. Delete the application folder from `%LOCALAPPDATA%\Programs\ESimManager`
2. Remove the desktop shortcut
3. (Optional) Clear application data from `%APPDATA%\ESimManager`

## Troubleshooting Installation

If you encounter issues during installation:

- **Missing .NET SDK**: Download from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- **Permission Errors**: Run PowerShell as Administrator
- **Build Failures**: Ensure all dependencies are restored with `dotnet restore`

For more help, see the [Troubleshooting Guide](troubleshooting.md).
