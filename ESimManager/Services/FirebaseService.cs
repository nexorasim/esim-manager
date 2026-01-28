using System.Net.Http;
using System.Text;
using System.Text.Json;
using ESimManager.Models;

namespace ESimManager.Services
{
    public interface IFirebaseService
    {
        Task<string> SignInAsync(string email, string password);
        Task<bool> SignOutAsync();
        Task<List<ESimProfile>> GetProfilesAsync();
        Task<string> CreateProfileAsync(ESimProfile profile);
        Task<bool> UpdateProfileAsync(string profileId, ESimProfile profile);
        Task<bool> DeleteProfileAsync(string profileId);
        Task<List<DeviceInfo>> GetDevicesAsync();
        Task<string> CreateDeviceAsync(DeviceInfo device);
        Task<bool> UpdateDeviceAsync(string deviceId, DeviceInfo device);
        Task<bool> DeleteDeviceAsync(string deviceId);
    }

    public class FirebaseService : IFirebaseService
    {
        private readonly HttpClient _httpClient;
        private readonly FirebaseConfig _config;
        private string? _idToken;
        private string? _userId;

        public FirebaseService()
        {
            _httpClient = new HttpClient();
            _config = FirebaseConfigManager.GetConfig();
        }

        public async Task<string> SignInAsync(string email, string password)
        {
            var requestBody = new
            {
                email,
                password,
                returnSecureToken = true
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={_config.ApiKey}",
                content);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var authResponse = JsonSerializer.Deserialize<JsonElement>(responseJson);
                
                _idToken = authResponse.GetProperty("idToken").GetString();
                _userId = authResponse.GetProperty("localId").GetString();
                
                return _idToken ?? "";
            }

            throw new Exception("Authentication failed");
        }

        public async Task<bool> SignOutAsync()
        {
            _idToken = null;
            _userId = null;
            return true;
        }

        public async Task<List<ESimProfile>> GetProfilesAsync()
        {
            if (string.IsNullOrEmpty(_idToken) || string.IsNullOrEmpty(_userId))
                throw new UnauthorizedAccessException("User not authenticated");

            var response = await _httpClient.GetAsync(
                $"https://firestore.googleapis.com/v1/projects/{_config.ProjectId}/databases/(default)/documents/profiles?pageSize=100&orderBy=createdAt desc");

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var firestoreResponse = JsonSerializer.Deserialize<JsonElement>(json);
                
                var profiles = new List<ESimProfile>();
                
                if (firestoreResponse.TryGetProperty("documents", out var documents))
                {
                    foreach (var doc in documents.EnumerateArray())
                    {
                        var fields = doc.GetProperty("fields");
                        var userId = fields.GetProperty("userId").GetProperty("stringValue").GetString();
                        
                        if (userId == _userId)
                        {
                            profiles.Add(new ESimProfile
                            {
                                ICCID = fields.GetProperty("iccid").GetProperty("stringValue").GetString() ?? "",
                                Name = fields.GetProperty("name").GetProperty("stringValue").GetString() ?? "",
                                Provider = fields.GetProperty("provider").GetProperty("stringValue").GetString() ?? "",
                                Status = Enum.Parse<ProfileStatus>(fields.GetProperty("status").GetProperty("stringValue").GetString() ?? "Pending"),
                                ProfileClass = Enum.Parse<ProfileClass>(fields.GetProperty("profileClass").GetProperty("stringValue").GetString() ?? "Operational"),
                                CustomNotes = fields.TryGetProperty("customNotes", out var notes) ? notes.GetProperty("stringValue").GetString() : null
                            });
                        }
                    }
                }
                
                return profiles;
            }

            throw new Exception("Failed to fetch profiles");
        }

        public async Task<string> CreateProfileAsync(ESimProfile profile)
        {
            if (string.IsNullOrEmpty(_idToken) || string.IsNullOrEmpty(_userId))
                throw new UnauthorizedAccessException("User not authenticated");

            var document = new
            {
                fields = new
                {
                    iccid = new { stringValue = profile.ICCID },
                    name = new { stringValue = profile.Name },
                    provider = new { stringValue = profile.Provider },
                    status = new { stringValue = profile.Status.ToString().ToLower() },
                    profileClass = new { stringValue = profile.ProfileClass.ToString().ToLower() },
                    userId = new { stringValue = _userId },
                    customNotes = new { stringValue = profile.CustomNotes ?? "" },
                    createdAt = new { timestampValue = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") },
                    updatedAt = new { timestampValue = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") }
                }
            };

            var json = JsonSerializer.Serialize(document);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _idToken);

            var response = await _httpClient.PostAsync(
                $"https://firestore.googleapis.com/v1/projects/{_config.ProjectId}/databases/(default)/documents/profiles",
                content);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var docResponse = JsonSerializer.Deserialize<JsonElement>(responseJson);
                var name = docResponse.GetProperty("name").GetString();
                return name?.Split('/').Last() ?? "";
            }

            throw new Exception("Failed to create profile");
        }

        public async Task<bool> UpdateProfileAsync(string profileId, ESimProfile profile)
        {
            if (string.IsNullOrEmpty(_idToken))
                throw new UnauthorizedAccessException("User not authenticated");

            var updateMask = "name,status,customNotes,updatedAt";
            var document = new
            {
                fields = new
                {
                    name = new { stringValue = profile.Name },
                    status = new { stringValue = profile.Status.ToString().ToLower() },
                    customNotes = new { stringValue = profile.CustomNotes ?? "" },
                    updatedAt = new { timestampValue = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") }
                }
            };

            var json = JsonSerializer.Serialize(document);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _idToken);

            var response = await _httpClient.PatchAsync(
                $"https://firestore.googleapis.com/v1/projects/{_config.ProjectId}/databases/(default)/documents/profiles/{profileId}?updateMask={updateMask}",
                content);

            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DeleteProfileAsync(string profileId)
        {
            if (string.IsNullOrEmpty(_idToken))
                throw new UnauthorizedAccessException("User not authenticated");

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _idToken);

            var response = await _httpClient.DeleteAsync(
                $"https://firestore.googleapis.com/v1/projects/{_config.ProjectId}/databases/(default)/documents/profiles/{profileId}");

            return response.IsSuccessStatusCode;
        }

        public async Task<List<DeviceInfo>> GetDevicesAsync()
        {
            // Similar implementation to GetProfilesAsync but for devices
            return new List<DeviceInfo>();
        }

        public async Task<string> CreateDeviceAsync(DeviceInfo device)
        {
            // Similar implementation to CreateProfileAsync but for devices
            return "";
        }

        public async Task<bool> UpdateDeviceAsync(string deviceId, DeviceInfo device)
        {
            // Similar implementation to UpdateProfileAsync but for devices
            return false;
        }

        public async Task<bool> DeleteDeviceAsync(string deviceId)
        {
            // Similar implementation to DeleteProfileAsync but for devices
            return false;
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}