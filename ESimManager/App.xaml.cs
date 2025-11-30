using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using ESimManager.Services;
using ESimManager.ViewModels;
using ESimManager.Views;

namespace ESimManager;

public partial class App : Application
{
    private ServiceProvider? _serviceProvider;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var services = new ServiceCollection();
        ConfigureServices(services);
        _serviceProvider = services.BuildServiceProvider();

        var mainWindow = _serviceProvider.GetRequiredService<MainWindow>();
        mainWindow.Show();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        // Services
        services.AddSingleton<ILoggingService, LoggingService>();
        services.AddSingleton<IDeviceConnectionService, DeviceConnectionService>();
        services.AddSingleton<IESimService, ESimService>();

        // ViewModels
        services.AddSingleton<MainViewModel>();
        services.AddTransient<DeviceConnectionViewModel>();
        services.AddTransient<ESimProfilesViewModel>();
        services.AddTransient<LogsViewModel>();

        // Views
        services.AddSingleton<MainWindow>();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _serviceProvider?.Dispose();
        base.OnExit(e);
    }
}

