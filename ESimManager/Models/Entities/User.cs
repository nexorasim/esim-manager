namespace ESimManager.Models.Entities;

/// <summary>
/// Represents a system user with authentication and authorization data
/// </summary>
public class User
{
    public int Id { get; set; }
    
    public string Username { get; set; } = string.Empty;
    
    /// <summary>
    /// PBKDF2 password hash (100,000 iterations, SHA-256)
    /// </summary>
    public byte[] PasswordHash { get; set; } = Array.Empty<byte>();
    
    /// <summary>
    /// Random salt for password hashing
    /// </summary>
    public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
    
    public UserRole Role { get; set; }
    
    public bool IsActive { get; set; }
    
    public DateTime CreatedDate { get; set; }
    
    public DateTime? LastLoginDate { get; set; }
    
    public DateTime? LastPasswordChangeDate { get; set; }
    
    /// <summary>
    /// Number of consecutive failed login attempts
    /// </summary>
    public int FailedLoginAttempts { get; set; }
    
    /// <summary>
    /// Timestamp when account was locked due to failed attempts
    /// </summary>
    public DateTime? LockedUntil { get; set; }
}

/// <summary>
/// User roles for role-based access control (RBAC)
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Full system access and configuration privileges
    /// </summary>
    Administrator,
    
    /// <summary>
    /// Profile management privileges but limited configuration access
    /// </summary>
    Operator,
    
    /// <summary>
    /// Read-only access to profiles and system status
    /// </summary>
    Viewer
}
