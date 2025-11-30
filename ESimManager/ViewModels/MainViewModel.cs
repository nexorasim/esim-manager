using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ESimManager.Services;

namespace ESimManager.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly ILoggingService _logger;

    [ObservableProperty]
    private string _currentView = "Dashboard";

    [ObservableProperty]
    private string _statusMessage = "Ready";

    public MainViewModel(ILoggingService logger)
    {
        _logger = logger;
        _logger.Log(Models.LogLevel.Info, "Application started");
    }

    [RelayCommand]
    private void NavigateTo(string view)
    {
        CurrentView = view;
        _logger.Log(Models.LogLevel.Debug, $"Navigated to {view}");
    }
}
