using ESimManager.Models;
using System.Diagnostics;

namespace ESimManager.Services;

public class DeviceConnectionService : IDeviceConnectionService
{
    private readonly ILoggingService _logger;
    public DeviceInfo? CurrentDevice { get; private set; }
    public event EventHandler<DeviceInfo>? DeviceConnected;
    public event EventHandler? DeviceDisconnected;

    public DeviceConnectionService(ILoggingService logger)
    {
        _logger = logger;
    }

    public async Task<List<DeviceInfo>> DiscoverDevicesAsync(ConnectionType connectionType)
    {
        _logger.Log(LogLevel.Info, $"Starting device discovery for {connectionType}");
        var devices = new List<DeviceInfo>();

        try
        {
            if (connectionType == ConnectionType.WLAN)
            {
                devices = await DiscoverWLANDevicesAsync();
            }
            else if (connectionType == ConnectionType.Bluetooth)
            {
                devices = await DiscoverBluetoothDevicesAsync();
            }

            _logger.Log(LogLevel.Info, $"Found {devices.Count} device(s)");
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Device discovery failed", ex.Message);
        }

        return devices;
    }

    private async Task<List<DeviceInfo>> DiscoverWLANDevicesAsync()
    {
        await Task.Delay(100);
        var devices = new List<DeviceInfo>();

        try
        {
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
            await process.WaitForExitAsync();

            // Parse WLAN networks (simplified)
            var lines = output.Split('\n');
            foreach (var line in lines)
            {
                if (line.Contains("SSID") && !line.Contains("BSSID"))
                {
                    var ssid = line.Split(':')[1].Trim();
                    if (!string.IsNullOrEmpty(ssid))
                    {
                        devices.Add(new DeviceInfo
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = ssid,
                            ConnectionType = ConnectionType.WLAN,
                            IsConnected = false
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "WLAN discovery error", ex.Message);
        }

        return devices;
    }

    private async Task<List<DeviceInfo>> DiscoverBluetoothDevicesAsync()
    {
        await Task.Delay(100);
        var devices = new List<DeviceInfo>();

        try
        {
            // Placeholder for Bluetooth device discovery using Windows BLE APIs
            // In production, use Windows.Devices.Bluetooth APIs
            _logger.Log(LogLevel.Info, "Bluetooth discovery initiated");
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Bluetooth discovery error", ex.Message);
        }

        return devices;
    }

    public async Task<bool> ConnectAsync(DeviceInfo device)
    {
        _logger.Log(LogLevel.Info, $"Connecting to {device.Name}");
        
        try
        {
            await Task.Delay(500); // Simulate connection
            
            CurrentDevice = device;
            CurrentDevice.IsConnected = true;
            CurrentDevice.LastConnected = DateTime.Now;
            
            DeviceConnected?.Invoke(this, device);
            _logger.Log(LogLevel.Info, $"Connected to {device.Name}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Connection failed", ex.Message);
            return false;
        }
    }

    public async Task<bool> DisconnectAsync()
    {
        if (CurrentDevice == null) return false;

        _logger.Log(LogLevel.Info, $"Disconnecting from {CurrentDevice.Name}");
        
        try
        {
            await Task.Delay(200);
            CurrentDevice.IsConnected = false;
            CurrentDevice = null;
            
            DeviceDisconnected?.Invoke(this, EventArgs.Empty);
            _logger.Log(LogLevel.Info, "Device disconnected");
            return true;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Disconnection failed", ex.Message);
            return false;
        }
    }
}
