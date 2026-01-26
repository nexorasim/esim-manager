namespace ESimManager.Models.Entities;

/// <summary>
/// Represents application configuration settings
/// </summary>
public class ApplicationConfiguration
{
    public int Id { get; set; }
    
    public LogLevel LogLevel { get; set; }
    
    public int SessionTimeoutMinutes { get; set; } = 30;
    
    public int ConnectionRetryAttempts { get; set; } = 3;
    
    public int ConnectionTimeoutSeconds { get; set; } = 10;
    
    public string DatabasePath { get; set; } = string.Empty;
    
    public bool EnableAuditLogging { get; set; } = true;
    
    public ThemeMode ThemeMode { get; set; } = ThemeMode.Light;
    
    public string ProxyAddress { get; set; } = string.Empty;
    
    public int ProxyPort { get; set; }
    
    public DateTime CreatedDate { get; set; }
    
    public DateTime ModifiedDate { get; set; }
}

/// <summary>
/// Logging levels for application diagnostics
/// </summary>
public enum LogLevel
{
    Trace,
    Debug,
    Information,
    Warning,
    Error,
    Critical
}

/// <summary>
/// Theme modes for UI appearance
/// </summary>
public enum ThemeMode
{
    Light,
    Dark,
    System
}
