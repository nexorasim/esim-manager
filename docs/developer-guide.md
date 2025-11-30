# Developer Guide

Guide for developers working on or extending eSIM Manager.

## Development Environment Setup

### Prerequisites

- Visual Studio 2022 (Community, Professional, or Enterprise)
- .NET 8 SDK
- Git
- Windows 10/11 Pro

### Getting Started

1. Clone the repository:
   ```powershell
   git clone https://github.com/nexorasim/esim-manager.git
   cd esim-manager
   ```

2. Open the solution:
   ```powershell
   start esim-manager.sln
   ```

3. Restore NuGet packages:
   ```powershell
   dotnet restore
   ```

4. Build the solution:
   ```powershell
   dotnet build
   ```

5. Run the application:
   ```powershell
   dotnet run --project ESimManager/ESimManager.csproj
   ```

## Project Structure

```
esim-manager/
├── ESimManager/              # Main WPF application
│   ├── Models/              # Data models
│   ├── ViewModels/          # MVVM view models
│   ├── Views/               # XAML views
│   ├── Services/            # Business logic services
│   └── Resources/           # Styles and resources
├── ESimManager.Tests/       # Unit tests
├── docs/                    # Documentation
├── scripts/                 # Build and automation scripts
└── esim-manager.sln        # Solution file
```

## Architecture

### MVVM Pattern

The application follows the Model-View-ViewModel (MVVM) pattern:

- **Models**: Data structures (DeviceInfo, ESimProfile, LogEntry)
- **Views**: XAML UI components
- **ViewModels**: Presentation logic and data binding

### Dependency Injection

Services are registered in `App.xaml.cs`:

```csharp
services.AddSingleton<ILoggingService, LoggingService>();
services.AddSingleton<IDeviceConnectionService, DeviceConnectionService>();
services.AddSingleton<IESimService, ESimService>();
```

### Services

#### ILoggingService
Handles application logging and event tracking.

#### IDeviceConnectionService
Manages device discovery and connection for WLAN and Bluetooth.

#### IESimService
Handles eSIM profile operations (provision, activate, deactivate, remove).

## Key Technologies

### .NET 8 WPF
- Modern Windows desktop framework
- XAML for UI definition
- Data binding for reactive UI

### CommunityToolkit.Mvvm
- Source generators for ViewModels
- RelayCommand for command binding
- ObservableProperty for property change notification

### Serilog
- Structured logging
- File-based log storage
- Configurable log levels

## Building and Testing

### Build Commands

```powershell
# Debug build
dotnet build

# Release build
dotnet build --configuration Release

# Clean build
dotnet clean
dotnet build
```

### Running Tests

```powershell
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "FullyQualifiedName~TestName"
```

### Publishing

```powershell
# Publish for Windows x64
dotnet publish ESimManager/ESimManager.csproj `
    --configuration Release `
    --runtime win-x64 `
    --self-contained false `
    --output ./publish
```

## Adding New Features

### Adding a New Service

1. Create interface in `Services/`:
   ```csharp
   public interface IMyService
   {
       Task<bool> DoSomethingAsync();
   }
   ```

2. Implement the service:
   ```csharp
   public class MyService : IMyService
   {
       public async Task<bool> DoSomethingAsync()
       {
           // Implementation
       }
   }
   ```

3. Register in `App.xaml.cs`:
   ```csharp
   services.AddSingleton<IMyService, MyService>();
   ```

### Adding a New View

1. Create ViewModel in `ViewModels/`:
   ```csharp
   public partial class MyViewModel : ObservableObject
   {
       [ObservableProperty]
       private string _myProperty;
       
       [RelayCommand]
       private void MyCommand()
       {
           // Command logic
       }
   }
   ```

2. Create View in `Views/`:
   ```xaml
   <UserControl x:Class="ESimManager.Views.MyView"
                Background="{StaticResource PrimaryBackground}">
       <TextBlock Text="{Binding MyProperty}"/>
   </UserControl>
   ```

3. Add navigation in `MainWindow.xaml.cs`

### Adding Tests

```csharp
public class MyServiceTests
{
    [Fact]
    public async Task DoSomething_ReturnsTrue()
    {
        // Arrange
        var service = new MyService();
        
        // Act
        var result = await service.DoSomethingAsync();
        
        // Assert
        Assert.True(result);
    }
}
```

## WLAN Integration

### Using netsh for WLAN

```csharp
var process = new Process
{
    StartInfo = new ProcessStartInfo
    {
        FileName = "netsh",
        Arguments = "wlan show networks mode=bssid",
        RedirectStandardOutput = true,
        UseShellExecute = false,
        CreateNoWindow = true
    }
};
process.Start();
string output = await process.StandardOutput.ReadToEndAsync();
```

## Bluetooth Integration

### Using Windows BLE APIs

```csharp
// Add reference to Windows.Devices.Bluetooth
using Windows.Devices.Bluetooth;
using Windows.Devices.Enumeration;

var devices = await DeviceInformation.FindAllAsync(
    BluetoothDevice.GetDeviceSelector());
```

## Styling and Theming

### Color Palette

Defined in `Resources/Styles.xaml`:

- PrimaryBackground: #1E1E1E
- SecondaryBackground: #252526
- TertiaryBackground: #2D2D30
- PrimaryText: #FFFFFF
- AccentColor: #2e70e5

### Creating Custom Styles

```xaml
<Style x:Key="MyButtonStyle" TargetType="Button" 
       BasedOn="{StaticResource ModernButton}">
    <Setter Property="Background" Value="Red"/>
</Style>
```

## Debugging

### Debug Configuration

Set breakpoints in Visual Studio and press F5 to debug.

### Logging

Use ILoggingService for debugging:

```csharp
_logger.Log(LogLevel.Debug, "Debug message", "Additional details");
```

### Common Issues

- **XAML binding errors**: Check Output window for binding failures
- **DI errors**: Ensure services are registered in App.xaml.cs
- **UI thread errors**: Use Dispatcher for UI updates from background threads

## CI/CD Pipeline

### GitHub Actions Workflow

Located in `.github/workflows/build.yml`:

- Builds on push to main
- Runs tests
- Creates release artifacts
- Publishes to GitHub Releases

### Creating a Release

1. Update version in project file
2. Commit changes
3. Create and push tag:
   ```powershell
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions automatically builds and publishes

## Code Style

### Naming Conventions

- Classes: PascalCase
- Methods: PascalCase
- Properties: PascalCase
- Private fields: _camelCase
- Parameters: camelCase

### Best Practices

- Use async/await for I/O operations
- Implement IDisposable for resource cleanup
- Use dependency injection
- Write unit tests for business logic
- Document public APIs with XML comments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### Pull Request Guidelines

- Clear description of changes
- All tests passing
- Code follows style guidelines
- Documentation updated if needed

## Resources

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [WPF Documentation](https://docs.microsoft.com/dotnet/desktop/wpf/)
- [MVVM Toolkit](https://learn.microsoft.com/windows/communitytoolkit/mvvm/introduction)
- [Windows Bluetooth APIs](https://docs.microsoft.com/windows/uwp/devices-sensors/bluetooth)

## Support

For development questions:
- GitHub Discussions
- GitHub Issues
- Developer documentation at https://nexorasim.github.io/esim-manager
