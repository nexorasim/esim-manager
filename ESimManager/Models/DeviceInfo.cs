namespace ESimManager.Models;

/// <summary>
/// Represents a connected eSIM-capable device
/// </summary>
public class DeviceInfo
{
    public int Id { get; set; }
    
    public string DeviceId { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    
    public ConnectionType ConnectionType { get; set; }
    
    public bool IsConnected { get; set; }
    
    public DateTime? LastConnected { get; set; }
    
    /// <summary>
    /// eUICC Identifier - unique 32-character hexadecimal string
    /// </summary>
    public string Eid { get; set; } = string.Empty;
    
    public string FirmwareVersion { get; set; } = string.Empty;
    
    public string Manufacturer { get; set; } = string.Empty;
    
    public string Model { get; set; } = string.Empty;
}
