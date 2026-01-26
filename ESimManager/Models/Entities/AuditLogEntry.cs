namespace ESimManager.Models.Entities;

/// <summary>
/// Represents a tamper-evident audit log entry for security-sensitive operations
/// </summary>
public class AuditLogEntry
{
    public int Id { get; set; }
    
    public DateTime Timestamp { get; set; }
    
    public string Username { get; set; } = string.Empty;
    
    public int? UserId { get; set; }
    
    public AuditAction Action { get; set; }
    
    public string ResourceType { get; set; } = string.Empty;
    
    public string ResourceId { get; set; } = string.Empty;
    
    public OperationResult Result { get; set; }
    
    public string Details { get; set; } = string.Empty;
    
    public string IpAddress { get; set; } = string.Empty;
}

/// <summary>
/// Types of auditable actions in the system
/// </summary>
public enum AuditAction
{
    Login,
    Logout,
    LoginFailed,
    ProfileProvisioned,
    ProfileActivated,
    ProfileDeactivated,
    ProfileDeleted,
    ProfileModified,
    ConfigurationChanged,
    UserCreated,
    UserModified,
    UserDeleted,
    PermissionChanged,
    DeviceConnected,
    DeviceDisconnected,
    BackupCreated,
    BackupRestored
}

/// <summary>
/// Result of an audited operation
/// </summary>
public enum OperationResult
{
    Success,
    Failure,
    PartialSuccess
}
