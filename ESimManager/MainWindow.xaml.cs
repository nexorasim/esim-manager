using System.Windows;
using System.Windows.Controls;
using ESimManager.ViewModels;
using ESimManager.Views;
using Microsoft.Extensions.DependencyInjection;

namespace ESimManager;

public partial class MainWindow : Window
{
    private readonly IServiceProvider _serviceProvider;
    private readonly MainViewModel _viewModel;

    public MainWindow(IServiceProvider serviceProvider, MainViewModel viewModel)
    {
        InitializeComponent();
        _serviceProvider = serviceProvider;
        _viewModel = viewModel;
        DataContext = _viewModel;
        
        NavigateToDashboard(null, null);
    }

    private void NavigateToDashboard(object? sender, RoutedEventArgs? e)
    {
        var view = new DashboardView();
        ContentArea.Content = view;
        StatusText.Text = "Dashboard";
    }

    private void NavigateToDeviceConnection(object? sender, RoutedEventArgs? e)
    {
        var viewModel = _serviceProvider.GetRequiredService<DeviceConnectionViewModel>();
        var view = new DeviceConnectionView { DataContext = viewModel };
        ContentArea.Content = view;
        StatusText.Text = "Device Connection";
    }

    private void NavigateToESimProfiles(object? sender, RoutedEventArgs? e)
    {
        var viewModel = _serviceProvider.GetRequiredService<ESimProfilesViewModel>();
        var view = new ESimProfilesView { DataContext = viewModel };
        ContentArea.Content = view;
        StatusText.Text = "eSIM Profiles";
    }

    private void NavigateToLogs(object? sender, RoutedEventArgs? e)
    {
        var viewModel = _serviceProvider.GetRequiredService<LogsViewModel>();
        var view = new LogsView { DataContext = viewModel };
        ContentArea.Content = view;
        StatusText.Text = "System Logs";
    }

    private void NavigateToSettings(object? sender, RoutedEventArgs? e)
    {
        var view = new SettingsView();
        ContentArea.Content = view;
        StatusText.Text = "Settings";
    }

    private void NavigateToAbout(object? sender, RoutedEventArgs? e)
    {
        var view = new AboutView();
        ContentArea.Content = view;
        StatusText.Text = "About";
    }
}