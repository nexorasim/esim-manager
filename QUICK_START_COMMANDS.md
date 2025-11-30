# Quick Start Commands - eSIM Manager

## 🚀 Build & Run (When Network Available)

```powershell
# 1. Clear cache and restore packages
dotnet nuget locals all --clear
dotnet restore esim-manager.sln

# 2. Build the solution
dotnet build --configuration Release

# 3. Run tests
dotnet test

# 4. Launch the application
dotnet run --project ESimManager/ESimManager.csproj
```

## 📦 Alternative: Use PowerShell Script

```powershell
# Automated build and install
.\scripts\setup-and-build.ps1 -Release

# Build without installing
.\scripts\setup-and-build.ps1 -Release -SkipInstall
```

## 🌐 GitHub Setup

```powershell
# Initialize and commit
git init
git add .
git commit -m "Initial commit: eSIM Manager v1.0.0"

# Create repository on GitHub first, then:
git remote add origin https://github.com/nexorasim/esim-manager.git
git branch -M main
git push -u origin main

# Create release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 🔧 Visual Studio Alternative

1. Open `esim-manager.sln` in Visual Studio 2022
2. Wait for package restore
3. Press **F5** to build and run

## ✅ Verification Checklist

After successful build:
- [ ] Application launches
- [ ] Dark theme displays
- [ ] All 6 views accessible
- [ ] Initial message shows
- [ ] WLAN discovery works
- [ ] Logs display correctly

## 📊 Project Status

**Files Created**: 68
**Code Complete**: 100%
**Documentation**: 100%
**CI/CD**: 100%
**Build Status**: Awaiting NuGet packages

## 🎯 Current Blocker

**NuGet Package Restoration** - Requires internet connectivity

**Required Packages**:
- CommunityToolkit.Mvvm 8.2.2
- Microsoft.Extensions.DependencyInjection 8.0.0
- Serilog.Sinks.File 5.0.0
- xUnit 2.5.3

## 📞 Documentation

- **Full Guide**: `NEXT_STEPS.md`
- **Current Status**: `CURRENT_STATUS.md`
- **Completion Report**: `COMPLETION_REPORT.md`
- **Troubleshooting**: `docs/troubleshooting.md`
