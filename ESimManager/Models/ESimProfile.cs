namespace ESimManager.Models;

public class ESimProfile
{
    public string Iccid { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public ESimStatus Status { get; set; }
    public DateTime? ActivatedDate { get; set; }
}

public enum ESimStatus
{
    Inactive,
    Active,
    Disabled,
    Error
}
