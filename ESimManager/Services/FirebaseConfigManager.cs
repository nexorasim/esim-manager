using System.Text.Json;

namespace ESimManager.Services
{
    public class FirebaseConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string AuthDomain { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public string StorageBucket { get; set; } = string.Empty;
        public string MessagingSenderId { get; set; } = string.Empty;
        public string AppId { get; set; } = string.Empty;
        public string DatabaseUrl { get; set; } = string.Empty;
    }

    public static class FirebaseConfigManager
    {
        private static FirebaseConfig? _config;
        
        public static FirebaseConfig GetConfig()
        {
            if (_config == null)
            {
                // Load from environment variables or config file
                _config = new FirebaseConfig
                {
                    ApiKey = Environment.GetEnvironmentVariable("FIREBASE_API_KEY") ?? "",
                    AuthDomain = Environment.GetEnvironmentVariable("FIREBASE_AUTH_DOMAIN") ?? "nexora-sim.firebaseapp.com",
                    ProjectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID") ?? "nexora-sim",
                    StorageBucket = Environment.GetEnvironmentVariable("FIREBASE_STORAGE_BUCKET") ?? "nexora-sim.appspot.com",
                    MessagingSenderId = Environment.GetEnvironmentVariable("FIREBASE_MESSAGING_SENDER_ID") ?? "",
                    AppId = Environment.GetEnvironmentVariable("FIREBASE_APP_ID") ?? "",
                    DatabaseUrl = Environment.GetEnvironmentVariable("FIREBASE_DATABASE_URL") ?? ""
                };
            }
            return _config;
        }
    }
}