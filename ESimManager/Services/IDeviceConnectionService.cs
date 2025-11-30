using ESimManager.Models;

namespace ESimManager.Services;

public interface IDeviceConnectionService
{
    Task<List<DeviceInfo>> DiscoverDevicesAsync(ConnectionType connectionType);
    Task<bool> ConnectAsync(DeviceInfo device);
    Task<bool> DisconnectAsync();
    DeviceInfo? CurrentDevice { get; }
    event EventHandler<DeviceInfo>? DeviceConnected;
    event EventHandler? DeviceDisconnected;
}
