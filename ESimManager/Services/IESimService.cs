using ESimManager.Models;

namespace ESimManager.Services;

public interface IESimService
{
    Task<List<ESimProfile>> GetProfilesAsync();
    Task<bool> ActivateProfileAsync(string iccid);
    Task<bool> DeactivateProfileAsync(string iccid);
    Task<bool> RemoveProfileAsync(string iccid);
    Task<bool> ProvisionProfileAsync(string activationCode);
}
