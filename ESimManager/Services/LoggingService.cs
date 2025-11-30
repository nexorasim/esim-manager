using ESimManager.Models;
using System.Collections.ObjectModel;

namespace ESimManager.Services;

public class LoggingService : ILoggingService
{
    private readonly ObservableCollection<LogEntry> _logs = new();
    public event EventHandler<LogEntry>? LogAdded;

    public void Log(LogLevel level, string message, string? details = null)
    {
        var entry = new LogEntry
        {
            Timestamp = DateTime.Now,
            Level = level,
            Message = message,
            Details = details
        };
        
        _logs.Add(entry);
        LogAdded?.Invoke(this, entry);
    }

    public List<LogEntry> GetLogs() => _logs.ToList();

    public void ClearLogs() => _logs.Clear();
}
