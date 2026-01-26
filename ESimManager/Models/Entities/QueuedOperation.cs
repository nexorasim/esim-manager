namespace ESimManager.Models.Entities;

/// <summary>
/// Represents a queued operation for offline support
/// </summary>
public class QueuedOperation
{
    public int Id { get; set; }
    
    public ProfileOperation Operation { get; set; }
    
    public int? ProfileId { get; set; }
    
    public string ProfileIccid { get; set; } = string.Empty;
    
    public string OperationData { get; set; } = string.Empty;
    
    public DateTime QueuedDate { get; set; }
    
    public DateTime? ExecutedDate { get; set; }
    
    public QueuedOperationStatus Status { get; set; }
    
    public int RetryCount { get; set; }
    
    public int MaxRetries { get; set; } = 3;
    
    public string ErrorMessage { get; set; } = string.Empty;
}

/// <summary>
/// Types of profile operations that can be queued
/// </summary>
public enum ProfileOperation
{
    Provision,
    Activate,
    Deactivate,
    Delete,
    UpdateMetadata
}

/// <summary>
/// Status of a queued operation
/// </summary>
public enum QueuedOperationStatus
{
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled
}
