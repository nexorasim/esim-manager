using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ESimManager.Models;
using ESimManager.Services;
using System.Collections.ObjectModel;

namespace ESimManager.ViewModels;

public partial class LogsViewModel : ObservableObject
{
    private readonly ILoggingService _logger;

    [ObservableProperty]
    private ObservableCollection<LogEntry> _logs = new();

    public LogsViewModel(ILoggingService logger)
    {
        _logger = logger;
        _logger.LogAdded += OnLogAdded;
        LoadLogs();
    }

    private void OnLogAdded(object? sender, LogEntry entry)
    {
        App.Current.Dispatcher.Invoke(() => Logs.Insert(0, entry));
    }

    [RelayCommand]
    private void LoadLogs()
    {
        var logs = _logger.GetLogs();
        Logs.Clear();
        foreach (var log in logs.OrderByDescending(l => l.Timestamp))
        {
            Logs.Add(log);
        }
    }

    [RelayCommand]
    private void ClearLogs()
    {
        _logger.ClearLogs();
        Logs.Clear();
    }
}
