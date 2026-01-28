using ESimManager.Models;
using System.Text.Json;
using System.Net.Http;
using System.Text;

namespace ESimManager.Services;

public class ESimService : IESimService
{
    private readonly ILoggingService _logger;
    private readonly List<ESimProfile> _profiles = new();
    private readonly HttpClient _httpClient;
    private const string API_BASE_URL = "https://api.nexorasim.com";

    public ESimService(ILoggingService logger)
    {
        _logger = logger;
        _httpClient = new HttpClient();
        InitializeSampleProfiles();
    }

    private void InitializeSampleProfiles()
    {
        _profiles.AddRange(new[]
        {
            new ESimProfile
            {
                Iccid = "8901234567890123456",
                Name = "Business Plan",
                ProviderName = "NexoraSIM",
                State = ProfileState.Enabled,
                ProfileClass = ProfileClass.Operational,
                ActivatedDate = DateTime.Now.AddDays(-30),
                CreatedDate = DateTime.Now.AddDays(-30),
                ModifiedDate = DateTime.Now.AddDays(-30)
            },
            new ESimProfile
            {
                Iccid = "8901234567890123457",
                Name = "Travel Plan",
                ProviderName = "NexoraSIM",
                State = ProfileState.Disabled,
                ProfileClass = ProfileClass.Operational,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            }
        });
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
                profile.State = ProfileState.Enabled;
                profile.ActivatedDate = DateTime.Now;
                profile.ModifiedDate = DateTime.Now;
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
                profile.State = ProfileState.Disabled;
                profile.DeactivatedDate = DateTime.Now;
                profile.ModifiedDate = DateTime.Now;
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
            // Validate LPA activation code format
            if (!activationCode.StartsWith("LPA:"))
            {
                throw new ArgumentException("Invalid activation code format");
            }

            await Task.Delay(1000);
            var newProfile = new ESimProfile
            {
                Iccid = GenerateICCID(),
                Name = $"Profile {_profiles.Count + 1}",
                ProviderName = "NexoraSIM",
                State = ProfileState.Disabled,
                ProfileClass = ProfileClass.Operational,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            };
            
            _profiles.Add(newProfile);
            
            // Simulate provisioning process
            _ = Task.Run(async () =>
            {
                await Task.Delay(3000);
                newProfile.State = ProfileState.Disabled;
                newProfile.ModifiedDate = DateTime.Now;
                _logger.Log(LogLevel.Info, $"Profile {newProfile.Iccid} provisioned successfully");
            });
            
            _logger.Log(LogLevel.Info, $"Profile {newProfile.Iccid} provisioning started");
            return true;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Provisioning failed", ex.Message);
            return false;
        }
    }

    public async Task<string> GenerateUniversalLinkAsync(string iccid)
    {
        _logger.Log(LogLevel.Info, $"Generating Universal Link for {iccid}");
        
        try
        {
            await Task.CompletedTask; // Ensure async behavior
            var activationCode = $"LPA:1$sm-dp.nexorasim.com${iccid}";
            var universalLink = $"https://nexorasim.com/esim/activate?code={Uri.EscapeDataString(activationCode)}";
            
            _logger.Log(LogLevel.Info, "Universal Link generated successfully");
            return universalLink;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "Universal Link generation failed", ex.Message);
            throw;
        }
    }

    public async Task<string> GenerateQRCodeDataAsync(string iccid)
    {
        _logger.Log(LogLevel.Info, $"Generating QR code data for {iccid}");
        
        try
        {
            await Task.CompletedTask; // Ensure async behavior
            var activationCode = $"LPA:1$sm-dp.nexorasim.com${iccid}";
            _logger.Log(LogLevel.Info, "QR code data generated successfully");
            return activationCode;
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, "QR code generation failed", ex.Message);
            throw;
        }
    }

    private string GenerateICCID()
    {
        // Generate a valid ICCID (19-20 digits)
        var prefix = "8901"; // Industry identifier
        var countryCode = "234"; // Example country code
        var issuerCode = "567"; // Example issuer code
        var accountId = new Random().Next(100000000, 999999999).ToString();
        var baseNumber = prefix + countryCode + issuerCode + accountId;
        var checkDigit = CalculateLuhnCheckDigit(baseNumber);
        
        return baseNumber + checkDigit;
    }

    private string CalculateLuhnCheckDigit(string number)
    {
        int sum = 0;
        bool alternate = false;
        
        for (int i = number.Length - 1; i >= 0; i--)
        {
            int n = int.Parse(number[i].ToString());
            
            if (alternate)
            {
                n *= 2;
                if (n > 9)
                {
                    n = (n % 10) + 1;
                }
            }
            
            sum += n;
            alternate = !alternate;
        }
        
        return ((10 - (sum % 10)) % 10).ToString();
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}
