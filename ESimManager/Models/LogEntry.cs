namespace ESimManager.Models;

public class LogEntry
{
    public DateTime Timestamp { get; set; }
    public LogLevel Level { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
}

public enum LogLevel
{
    Info,
    Warning,
    Error,
    Debug
}
