namespace ESimManager.Models;

public class DeviceInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ConnectionType ConnectionType { get; set; }
    public bool IsConnected { get; set; }
    public DateTime? LastConnected { get; set; }
}
