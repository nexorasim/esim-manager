namespace ESimManager.Models;

/// <summary>
/// Represents an eSIM profile with GSMA SGP.22 compliant metadata
/// </summary>
public class ESimProfile
{
    public int Id { get; set; }
    
    /// <summary>
    /// Integrated Circuit Card Identifier - unique 19-20 digit identifier
    /// </summary>
    public string Iccid { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    
    public string ProviderName { get; set; } = string.Empty;
    
    /// <summary>
    /// Current state of the profile (Disabled, Enabled, Deleted)
    /// </summary>
    public ProfileState State { get; set; }
    
    /// <summary>
    /// Profile classification (Operational, Test, Provisioning)
    /// </summary>
    public ProfileClass ProfileClass { get; set; }
    
    public DateTime? ActivatedDate { get; set; }
    
    public DateTime? DeactivatedDate { get; set; }
    
    public DateTime CreatedDate { get; set; }
    
    public DateTime ModifiedDate { get; set; }
    
    public string CustomNotes { get; set; } = string.Empty;
    
    /// <summary>
    /// Encrypted activation code stored at rest using DPAPI
    /// </summary>
    public byte[]? EncryptedActivationCode { get; set; }
    
    /// <summary>
    /// Foreign key to associated device
    /// </summary>
    public int? DeviceId { get; set; }
}

/// <summary>
/// GSMA SGP.22 compliant profile states
/// </summary>
public enum ProfileState
{
    Disabled,
    Enabled,
    Deleted
}

/// <summary>
/// Profile classification per GSMA standards
/// </summary>
public enum ProfileClass
{
    Operational,
    Test,
    Provisioning
}

/// <summary>
/// Legacy status enum for backward compatibility
/// </summary>
public enum ESimStatus
{
    Inactive,
    Active,
    Disabled,
    Error
}
