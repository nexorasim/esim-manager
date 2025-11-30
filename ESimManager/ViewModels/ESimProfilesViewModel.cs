using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using ESimManager.Models;
using ESimManager.Services;
using System.Collections.ObjectModel;

namespace ESimManager.ViewModels;

public partial class ESimProfilesViewModel : ObservableObject
{
    private readonly IESimService _eSimService;
    private readonly ILoggingService _logger;

    [ObservableProperty]
    private ObservableCollection<ESimProfile> _profiles = new();

    [ObservableProperty]
    private ESimProfile? _selectedProfile;

    [ObservableProperty]
    private string _activationCode = string.Empty;

    public ESimProfilesViewModel(IESimService eSimService, ILoggingService logger)
    {
        _eSimService = eSimService;
        _logger = logger;
    }

    [RelayCommand]
    private async Task LoadProfiles()
    {
        var profiles = await _eSimService.GetProfilesAsync();
        Profiles.Clear();
        foreach (var profile in profiles)
        {
            Profiles.Add(profile);
        }
    }

    [RelayCommand]
    private async Task ActivateProfile()
    {
        if (SelectedProfile == null) return;
        await _eSimService.ActivateProfileAsync(SelectedProfile.Iccid);
        await LoadProfiles();
    }

    [RelayCommand]
    private async Task DeactivateProfile()
    {
        if (SelectedProfile == null) return;
        await _eSimService.DeactivateProfileAsync(SelectedProfile.Iccid);
        await LoadProfiles();
    }

    [RelayCommand]
    private async Task RemoveProfile()
    {
        if (SelectedProfile == null) return;
        await _eSimService.RemoveProfileAsync(SelectedProfile.Iccid);
        await LoadProfiles();
    }

    [RelayCommand]
    private async Task ProvisionProfile()
    {
        if (string.IsNullOrWhiteSpace(ActivationCode)) return;
        await _eSimService.ProvisionProfileAsync(ActivationCode);
        ActivationCode = string.Empty;
        await LoadProfiles();
    }
}
