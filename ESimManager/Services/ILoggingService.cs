using ESimManager.Models;

namespace ESimManager.Services;

public interface ILoggingService
{
    void Log(LogLevel level, string message, string? details = null);
    List<LogEntry> GetLogs();
    void ClearLogs();
    event EventHandler<LogEntry>? LogAdded;
}
