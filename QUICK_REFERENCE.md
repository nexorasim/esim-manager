# NexoraSIM eSIM Manager - Quick Reference

## Essential Commands

### Build & Run
```bash
# Clean build
dotnet clean && dotnet restore && dotnet build --configuration Release

# Run application
dotnet run --project ESimManager/ESimManager.csproj

# Run with hot reload
dotnet watch run --project ESimManager/ESimManager.csproj

# Run tests
dotnet test --configuration Release
```

### Publish & Deploy
```bash
# Publish (framework-dependent)
dotnet publish ESimManager/ESimManager.csproj --configuration Release --runtime win-x64 --self-contained false --output ./publish

# Create distribution package
Compress-Archive -Path ./publish/* -DestinationPath ESimManager-win-x64.zip -Force

# Run published app
cd publish
.\ESimManager.exe
```

### Development
```bash
# Restore dependencies
dotnet restore

# Build debug
dotnet build

# Build release
dotnet build --configuration Release

# Run specific test
dotnet test --filter "FullyQualifiedName~LoggingServiceTests"

# Check diagnostics
dotnet build /warnaserror
```

## Project Structure
```
esim-manager/
├── ESimManager/              # Main application
│   ├── Models/Entities/     # Domain models
│   ├── Services/Interfaces/ # Service contracts
│   ├── ViewModels/          # MVVM view models
│   ├── Views/               # XAML UI
│   ├── Validators/          # Validation logic
│   └── Exceptions/          # Custom exceptions
├── ESimManager.Tests/        # Tests
├── publish/                  # Build output
└── .kiro/specs/             # Enterprise spec
```

## Key Files
- `ESimManager.csproj` - Main project file
- `App.xaml.cs` - Application entry point
- `MainWindow.xaml` - Main UI window
- `PROJECT_STATUS_UPDATED.md` - Current status
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `.kiro/specs/enterprise-esim-manager/tasks.md` - Implementation tasks

## Dependencies
**Core:**
- .NET 8 WPF
- Entity Framework Core + SQLite
- CommunityToolkit.Mvvm
- Serilog

**Testing:**
- xUnit
- FsCheck (property-based testing)
- FluentAssertions
- Moq

## Status
- Build: ✓ SUCCESS (0 errors, 0 warnings)
- Tests: ✓ PASSING (4/4)
- Diagnostics: ✓ CLEAN (0 issues)
- Dependencies: ✓ RESOLVED

## Next Steps
1. Review enterprise spec: `.kiro/specs/enterprise-esim-manager/`
2. Implement Task 2: Domain models and database
3. Follow incremental implementation plan

## Support
- Docs: https://nexorasim.github.io/esim-manager
- Issues: https://github.com/nexorasim/esim-manager/issues
- Spec: `.kiro/specs/enterprise-esim-manager/`
