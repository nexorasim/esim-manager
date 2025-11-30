using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ESimManager.Models;
using ESimManager.Services;
using System.Collections.ObjectModel;

namespace ESimManager.ViewModels;

public partial class DeviceConnectionViewModel : ObservableObject
{
    private readonly IDeviceConnectionService _deviceService;
    private readonly ILoggingService _logger;

    [ObservableProperty]
    private ConnectionType _selectedConnectionType = ConnectionType.None;

    [ObservableProperty]
    private ObservableCollection<DeviceInfo> _availableDevices = new();

    [ObservableProperty]
    private DeviceInfo? _selectedDevice;

    [ObservableProperty]
    private bool _isConnected;

    [ObservableProperty]
    private string _statusMessage = "No devices connected yet. Please select supported connection type: WLAN, Bluetooth";

    public DeviceConnectionViewModel(IDeviceConnectionService deviceService, ILoggingService logger)
    {
        _deviceService = deviceService;
        _logger = logger;

        _deviceService.DeviceConnected += OnDeviceConnected;
        _deviceService.DeviceDisconnected += OnDeviceDisconnected;
    }

    [RelayCommand]
    private async Task DiscoverDevices()
    {
        if (SelectedConnectionType == ConnectionType.None)
        {
            StatusMessage = "Please select a connection type first";
            return;
        }

        StatusMessage = $"Discovering {SelectedConnectionType} devices...";
        var devices = await _deviceService.DiscoverDevicesAsync(SelectedConnectionType);
        
        AvailableDevices.Clear();
        foreach (var device in devices)
        {
            AvailableDevices.Add(device);
        }

        StatusMessage = devices.Count > 0 
            ? $"Found {devices.Count} device(s)" 
            : "No devices found";
    }

    [RelayCommand]
    private async Task ConnectDevice()
    {
        if (SelectedDevice == null)
        {
            StatusMessage = "Please select a device";
            return;
        }

        StatusMessage = $"Connecting to {SelectedDevice.Name}...";
        var success = await _deviceService.ConnectAsync(SelectedDevice);
        
        if (!success)
        {
            StatusMessage = "Connection failed";
        }
    }

    [RelayCommand]
    private async Task DisconnectDevice()
    {
        StatusMessage = "Disconnecting...";
        await _deviceService.DisconnectAsync();
    }

    private void OnDeviceConnected(object? sender, DeviceInfo device)
    {
        IsConnected = true;
        StatusMessage = $"Connected to {device.Name}";
    }

    private void OnDeviceDisconnected(object? sender, EventArgs e)
    {
        IsConnected = false;
        StatusMessage = "Device disconnected";
    }
}
