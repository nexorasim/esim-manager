using ESimManager.Models;

namespace ESimManager.Services;

public class ESimService : IESimService
{
    private readonly ILoggingService _logger;
    private readonly List<ESimProfile> _profiles = new();

    public ESimService(ILoggingService logger)
    {
        _logger = logger;
    }

    public async Task<List<ESimProfile>> GetProfilesAsync()
    {
        _logger.Log(LogLevel.Info, "Retrieving eSIM profiles");
        await Task.Delay(100);
        return _profiles.ToList();
    }

    public async Task<bool> ActivateProfileAsync(string iccid)
    {
        _logger.Log(LogLevel.Info, $"Activating profile {iccid}");
        
        try
        {
            await Task.Delay(500);
            var profile = _profiles.FirstOrDefault(p => p.Iccid == iccid);
            if (profile != null)
            {
                profile.Status = ESimStatus.Active;
                profile.ActivatedDate = DateTime.Now;
                _logger.Log(LogLevel.Info, $"Profile {iccid} activated");
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Activation failed", ex.Message);
            return false;
        }
    }

    public async Task<bool> DeactivateProfileAsync(string iccid)
    {
        _logger.Log(LogLevel.Info, $"Deactivating profile {iccid}");
        
        try
        {
            await Task.Delay(500);
            var profile = _profiles.FirstOrDefault(p => p.Iccid == iccid);
            if (profile != null)
            {
                profile.Status = ESimStatus.Inactive;
                _logger.Log(LogLevel.Info, $"Profile {iccid} deactivated");
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Deactivation failed", ex.Message);
            return false;
        }
    }

    public async Task<bool> RemoveProfileAsync(string iccid)
    {
        _logger.Log(LogLevel.Info, $"Removing profile {iccid}");
        
        try
        {
            await Task.Delay(500);
            var profile = _profiles.FirstOrDefault(p => p.Iccid == iccid);
            if (profile != null)
            {
                _profiles.Remove(profile);
                _logger.Log(LogLevel.Info, $"Profile {iccid} removed");
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Removal failed", ex.Message);
            return false;
        }
    }

    public async Task<bool> ProvisionProfileAsync(string activationCode)
    {
        _logger.Log(LogLevel.Info, "Provisioning new eSIM profile");
        
        try
        {
            await Task.Delay(1000);
            var newProfile = new ESimProfile
            {
                Iccid = Guid.NewGuid().ToString("N").Substring(0, 19),
                Name = $"Profile {_profiles.Count + 1}",
                Provider = "NexoraSIM",
                Status = ESimStatus.Inactive
            };
            
            _profiles.Add(newProfile);
            _logger.Log(LogLevel.Info, $"Profile {newProfile.Iccid} provisioned");
            return true;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Provisioning failed", ex.Message);
            return false;
        }
    }
}
