## Project Organization

This is a .NET 8 WPF Windows Desktop Application. The project follows standard .NET solution structure conventions.

### Expected Structure

Typical .NET WPF projects organize code as follows:

- Solution file (.sln) at root
- Project file (.csproj) defining build configuration
- Source code typically in root or `src/` directory
- Views (XAML files) for UI components
- ViewModels for MVVM pattern implementation
- Models for data structures
- Services for business logic and connectivity (WLAN/Bluetooth)
- Resources for images, styles, and localization
- Tests in separate test project(s)

### Build Artifacts

Build outputs are ignored via .gitignore:
- `bin/` - compiled binaries
- `obj/` - intermediate build files
- `Debug/` and `Release/` - configuration-specific outputs

### Documentation

GitHub Pages documentation is maintained for the project.
