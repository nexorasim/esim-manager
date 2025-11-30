using ESimManager.Models;
using ESimManager.Services;
using Xunit;

namespace ESimManager.Tests.Services;

public class LoggingServiceTests
{
    [Fact]
    public void Log_AddsEntryToLogs()
    {
        // Arrange
        var service = new LoggingService();
        
        // Act
        service.Log(LogLevel.Info, "Test message");
        var logs = service.GetLogs();
        
        // Assert
        Assert.Single(logs);
        Assert.Equal("Test message", logs[0].Message);
        Assert.Equal(LogLevel.Info, logs[0].Level);
    }

    [Fact]
    public void ClearLogs_RemovesAllEntries()
    {
        // Arrange
        var service = new LoggingService();
        service.Log(LogLevel.Info, "Test 1");
        service.Log(LogLevel.Info, "Test 2");
        
        // Act
        service.ClearLogs();
        var logs = service.GetLogs();
        
        // Assert
        Assert.Empty(logs);
    }

    [Fact]
    public void LogAdded_EventFires_WhenLogIsAdded()
    {
        // Arrange
        var service = new LoggingService();
        LogEntry? capturedEntry = null;
        service.LogAdded += (sender, entry) => capturedEntry = entry;
        
        // Act
        service.Log(LogLevel.Warning, "Warning message");
        
        // Assert
        Assert.NotNull(capturedEntry);
        Assert.Equal("Warning message", capturedEntry.Message);
        Assert.Equal(LogLevel.Warning, capturedEntry.Level);
    }
}
