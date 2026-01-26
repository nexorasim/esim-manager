# Design Document: Enterprise eSIM Manager

## Overview

The Enterprise eSIM Manager is a comprehensive Windows Desktop Application built with .NET 8 WPF that transforms the existing basic eSIM profile manager into a production-ready enterprise solution. The system implements GSMA SGP.22 compliant eSIM lifecycle management with enterprise-grade security, modern UI/UX, robust device connectivity, and complete DevOps automation.

### Key Design Principles

1. **Standards Compliance**: Full adherence to GSMA SGP.22 specification for eSIM provisioning
2. **Security First**: Defense-in-depth approach with encryption, authentication, and audit logging
3. **Clean Architecture**: Clear separation of concerns across UI, business logic, data access, and infrastructure layers
4. **Testability**: Comprehensive unit, integration, and property-based testing support
5. **Maintainability**: SOLID principles, dependency injection, and extensive documentation
6. **User Experience**: Modern, accessible, responsive interface following Windows 11 design language

### Technology Stack

- **Framework**: .NET 8 with C# 12
- **UI Framework**: WPF (Windows Presentation Foundation)
- **Architecture Pattern**: MVVM (Model-View-ViewModel)
- **Dependency Injection**: Microsoft.Extensions.DependencyInjection
- **MVVM Toolkit**: CommunityToolkit.Mvvm
- **Logging**: Serilog with file and console sinks
- **Database**: SQLite with Entity Framework Core
- **Security**: Windows DPAPI (System.Security.Cryptography.ProtectedData)
- **Testing**: xUnit, FluentAssertions, Moq, FsCheck (property-based testing)
- **CI/CD**: GitHub Actions
- **Installer**: WiX Toolset for MSI creation

## Architecture

### Layered Architecture

The system follows a clean layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Views, ViewModels, Converters, Value Converters)      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│        (Services, Commands, Event Handlers)              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│     (Models, Entities, Domain Logic, Validators)        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│  (Data Access, External APIs, File System, Encryption)  │
└─────────────────────────────────────────────────────────┘
```

### MVVM Pattern Implementation


The application uses the MVVM pattern to separate UI concerns from business logic:

- **Models**: Domain entities representing eSIM profiles, devices, users, audit logs
- **Views**: XAML-based UI components with data binding
- **ViewModels**: Presentation logic, command handling, property change notifications using CommunityToolkit.Mvvm

**Key ViewModels**:
- `MainViewModel`: Application shell, navigation, global state
- `LoginViewModel`: Authentication and session management
- `DeviceDiscoveryViewModel`: Device scanning and connection
- `ProfileManagementViewModel`: Profile listing, filtering, sorting
- `ProfileProvisioningViewModel`: New profile provisioning workflow
- `SettingsViewModel`: Application configuration and preferences
- `AuditLogViewModel`: Security audit log viewing

### Service-Oriented Architecture

Business logic is encapsulated in services registered via dependency injection:

**Core Services**:
- `IAuthenticationService`: User authentication and session management
- `IAuthorizationService`: Role-based access control (RBAC)
- `IESimService`: eSIM profile lifecycle operations (GSMA SGP.22 compliant)
- `IDeviceConnectionService`: WLAN and Bluetooth device discovery and connection
- `IProfileValidationService`: ICCID, EID, and activation code validation
- `IEncryptionService`: Data encryption/decryption using DPAPI
- `IAuditLogService`: Security event logging
- `IDataService`: Database operations via Entity Framework Core
- `IConfigurationService`: Application configuration management
- `ILoggingService`: Structured logging via Serilog

## Components and Interfaces

### Authentication and Authorization

**IAuthenticationService**
```csharp
public interface IAuthenticationService
{
    Task<AuthenticationResult> AuthenticateAsync(string username, string password);
    Task<bool> LogoutAsync();
    Task<bool> ChangePasswordAsync(string oldPassword, string newPassword);
    User? CurrentUser { get; }
    bool IsAuthenticated { get; }
    event EventHandler<User>? UserAuthenticated;
    event EventHandler? UserLoggedOut;
}
```

**IAuthorizationService**
```csharp
public interface IAuthorizationService
{
    bool HasPermission(Permission permission);
    bool IsInRole(UserRole role);
    IReadOnlyList<Permission> GetUserPermissions();
}

public enum UserRole
{
    Administrator,
    Operator,
    Viewer
}

public enum Permission
{
    ViewProfiles,
    ManageProfiles,
    ProvisionProfiles,
    DeleteProfiles,
    ViewAuditLogs,
    ManageConfiguration,
    ManageUsers
}
```


### eSIM Profile Management (GSMA SGP.22 Compliant)

**IESimService**
```csharp
public interface IESimService
{
    Task<List<ESimProfile>> GetProfilesAsync();
    Task<ProvisioningResult> ProvisionProfileAsync(string activationCode);
    Task<ProvisioningResult> ProvisionProfileFromQRCodeAsync(string qrCodeData);
    Task<OperationResult> ActivateProfileAsync(string iccid);
    Task<OperationResult> DeactivateProfileAsync(string iccid);
    Task<OperationResult> DeleteProfileAsync(string iccid);
    Task<OperationResult> UpdateProfileMetadataAsync(string iccid, ProfileMetadata metadata);
    Task<ExportResult> ExportProfileAsync(string iccid, string filePath);
    Task<ImportResult> ImportProfileAsync(string filePath);
    Task<HealthCheckResult> CheckProfileHealthAsync(string iccid);
    Task<List<OperationResult>> BulkOperationAsync(List<string> iccids, ProfileOperation operation);
}

public enum ProfileOperation
{
    Activate,
    Deactivate,
    Delete
}
```

**IProfileValidationService**
```csharp
public interface IProfileValidationService
{
    ValidationResult ValidateIccid(string iccid);
    ValidationResult ValidateEid(string eid);
    ValidationResult ValidateActivationCode(string activationCode);
    ActivationCodeComponents ParseActivationCode(string activationCode);
}

public class ActivationCodeComponents
{
    public string Protocol { get; set; } // "LPA:1"
    public string SmDpPlusAddress { get; set; }
    public string MatchingId { get; set; }
}
```

### Device Connectivity

**IDeviceConnectionService**
```csharp
public interface IDeviceConnectionService
{
    Task<List<DeviceInfo>> DiscoverDevicesAsync(ConnectionType connectionType);
    Task<ConnectionResult> ConnectAsync(DeviceInfo device);
    Task<bool> DisconnectAsync();
    Task<DeviceCapabilities> QueryDeviceCapabilitiesAsync(DeviceInfo device);
    Task<ConnectionHealth> CheckConnectionHealthAsync();
    DeviceInfo? CurrentDevice { get; }
    bool IsConnected { get; }
    event EventHandler<DeviceInfo>? DeviceConnected;
    event EventHandler? DeviceDisconnected;
    event EventHandler<ConnectionHealth>? ConnectionHealthChanged;
}

public enum ConnectionType
{
    WLAN,
    Bluetooth
}

public class DeviceCapabilities
{
    public bool SupportsESim { get; set; }
    public string EidSupported { get; set; }
    public List<string> SupportedProfiles { get; set; }
    public string FirmwareVersion { get; set; }
}
```


### Security Services

**IEncryptionService**
```csharp
public interface IEncryptionService
{
    byte[] Encrypt(byte[] plaintext, DataProtectionScope scope = DataProtectionScope.CurrentUser);
    byte[] Decrypt(byte[] ciphertext, DataProtectionScope scope = DataProtectionScope.CurrentUser);
    string EncryptString(string plaintext, DataProtectionScope scope = DataProtectionScope.CurrentUser);
    string DecryptString(string ciphertext, DataProtectionScope scope = DataProtectionScope.CurrentUser);
}
```

**IAuditLogService**
```csharp
public interface IAuditLogService
{
    Task LogAsync(AuditLogEntry entry);
    Task<List<AuditLogEntry>> GetLogsAsync(AuditLogFilter filter);
    Task<bool> ExportLogsAsync(string filePath, AuditLogFilter filter);
}

public class AuditLogEntry
{
    public DateTime Timestamp { get; set; }
    public string Username { get; set; }
    public AuditAction Action { get; set; }
    public string ResourceType { get; set; }
    public string ResourceId { get; set; }
    public OperationResult Result { get; set; }
    public string Details { get; set; }
    public string IpAddress { get; set; }
}

public enum AuditAction
{
    Login,
    Logout,
    ProfileProvisioned,
    ProfileActivated,
    ProfileDeactivated,
    ProfileDeleted,
    ConfigurationChanged,
    UserCreated,
    UserModified,
    PermissionChanged
}
```

### Data Access

**IDataService**
```csharp
public interface IDataService
{
    Task<T> GetByIdAsync<T>(int id) where T : class;
    Task<List<T>> GetAllAsync<T>() where T : class;
    Task<T> AddAsync<T>(T entity) where T : class;
    Task<T> UpdateAsync<T>(T entity) where T : class;
    Task<bool> DeleteAsync<T>(int id) where T : class;
    Task<List<T>> QueryAsync<T>(Expression<Func<T, bool>> predicate) where T : class;
    Task<bool> SaveChangesAsync();
    Task<bool> BeginTransactionAsync();
    Task<bool> CommitTransactionAsync();
    Task<bool> RollbackTransactionAsync();
}
```

## Data Models

### Domain Entities

**ESimProfile**
```csharp
public class ESimProfile
{
    public int Id { get; set; }
    public string Iccid { get; set; } // 19-20 digits
    public string Name { get; set; }
    public string ProviderName { get; set; }
    public ProfileState State { get; set; }
    public ProfileClass ProfileClass { get; set; }
    public DateTime? ActivatedDate { get; set; }
    public DateTime? DeactivatedDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime ModifiedDate { get; set; }
    public string CustomNotes { get; set; }
    public byte[] EncryptedActivationCode { get; set; } // Encrypted at rest
}

public enum ProfileState
{
    Disabled,
    Enabled,
    Deleted
}

public enum ProfileClass
{
    Operational,
    Test,
    Provisioning
}
```


**DeviceInfo**
```csharp
public class DeviceInfo
{
    public int Id { get; set; }
    public string DeviceId { get; set; }
    public string Name { get; set; }
    public ConnectionType ConnectionType { get; set; }
    public bool IsConnected { get; set; }
    public DateTime? LastConnected { get; set; }
    public string Eid { get; set; } // 32-character hex string
    public string FirmwareVersion { get; set; }
    public string Manufacturer { get; set; }
    public string Model { get; set; }
}
```

**User**
```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime? LastPasswordChangeDate { get; set; }
}
```

**ApplicationConfiguration**
```csharp
public class ApplicationConfiguration
{
    public int Id { get; set; }
    public LogLevel LogLevel { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int ConnectionRetryAttempts { get; set; }
    public int ConnectionTimeoutSeconds { get; set; }
    public string DatabasePath { get; set; }
    public bool EnableAuditLogging { get; set; }
    public ThemeMode ThemeMode { get; set; }
    public string ProxyAddress { get; set; }
    public int ProxyPort { get; set; }
}

public enum ThemeMode
{
    Light,
    Dark,
    System
}
```

### Database Schema

The SQLite database uses Entity Framework Core with the following schema:

**Tables**:
- `Users`: User accounts and authentication data
- `ESimProfiles`: eSIM profile records
- `Devices`: Connected device information
- `AuditLogs`: Security audit trail
- `Configuration`: Application settings
- `QueuedOperations`: Offline operation queue

**Relationships**:
- `AuditLogs.UserId` → `Users.Id` (many-to-one)
- `ESimProfiles.DeviceId` → `Devices.Id` (many-to-one)
- `QueuedOperations.ProfileId` → `ESimProfiles.Id` (many-to-one)

**Indexes**:
- `ESimProfiles.Iccid` (unique)
- `Devices.Eid` (unique)
- `Users.Username` (unique)
- `AuditLogs.Timestamp` (for efficient querying)
- `AuditLogs.UserId` (for user-specific queries)


## GSMA SGP.22 Compliance Implementation

### Profile Provisioning Flow

The system implements the GSMA SGP.22 LPA provisioning flow as follows:

**Step 1: Activation Code Validation**
- Parse activation code format: `LPA:1$SM-DP+_ADDRESS$MATCHING_ID`
- Validate protocol version (LPA:1)
- Extract SM-DP+ server address
- Extract matching ID for profile identification

**Step 2: SM-DP+ Communication**
- Establish secure TLS connection to SM-DP+ server
- Authenticate using device EID and matching ID
- Request profile download authorization

**Step 3: Profile Download**
- Receive encrypted profile package from SM-DP+
- Validate profile package signature
- Decrypt profile data using device-specific keys

**Step 4: Profile Installation**
- Write profile to eUICC secure element
- Assign ICCID to profile
- Set initial state to Disabled
- Store profile metadata in local database

**Step 5: Profile Activation**
- Transition profile state from Disabled to Enabled
- Configure network connectivity
- Verify profile activation with carrier

### ICCID Validation (ITU-T E.118)

ICCID format: `89 CC II SSSSSSSSSS C`
- Length: 19 or 20 digits
- First 2 digits: `89` (telecom industry identifier)
- Next 2-3 digits: Country code
- Next 1-4 digits: Issuer identifier
- Next 12 digits: Account identification
- Last digit: Luhn checksum

**Validation Algorithm**:
```
1. Check length is 19 or 20 digits
2. Verify first two digits are "89"
3. Validate all characters are numeric
4. Compute Luhn checksum
5. Verify checksum matches last digit
```

### EID Validation

EID format: 32-character hexadecimal string
- Uniquely identifies the eUICC hardware
- Used for authentication with SM-DP+ servers
- Must be validated before profile operations

**Validation Algorithm**:
```
1. Check length is exactly 32 characters
2. Verify all characters are hexadecimal (0-9, A-F)
3. Convert to uppercase for consistency
```

### Profile State Machine

Valid state transitions per GSMA SGP.22:

```
Disabled ──activate──> Enabled
Enabled ──deactivate──> Disabled
Disabled ──delete──> Deleted
Enabled ──delete──> Deleted
```

Invalid transitions are rejected with appropriate error codes.

### GSMA Error Code Mapping

The system maps internal errors to GSMA-defined error codes:

| Internal Error | GSMA Code | Description |
|----------------|-----------|-------------|
| InvalidActivationCode | 1 | Activation code format invalid |
| SmDpPlusUnreachable | 2 | Cannot connect to SM-DP+ server |
| ProfileNotFound | 3 | Profile does not exist |
| InvalidState | 4 | Operation not valid in current state |
| AuthenticationFailed | 5 | Device authentication failed |
| InsufficientStorage | 6 | eUICC storage full |
| NetworkError | 7 | Network connectivity issue |


## Security Architecture

### Authentication Flow

```
1. User enters username and password
2. System validates input format
3. System retrieves user record from database
4. System computes password hash using PBKDF2 with stored salt
5. System compares computed hash with stored hash
6. If match: Create session, assign role, log audit event
7. If no match: Increment failed attempt counter, log audit event
8. After 5 failed attempts: Lock account for 15 minutes
```

### Password Security

- **Hashing Algorithm**: PBKDF2 with SHA-256
- **Salt**: 32-byte cryptographically random salt per user
- **Iterations**: 100,000 iterations (OWASP recommendation)
- **Storage**: Hash and salt stored separately in database
- **Password Requirements**: Minimum 12 characters, mixed case, numbers, special characters

### Data Encryption at Rest

**Using Windows DPAPI (Data Protection API)**:
- Activation codes encrypted with `DataProtectionScope.CurrentUser`
- Configuration secrets encrypted with `DataProtectionScope.LocalMachine`
- Encryption keys managed by Windows, tied to user/machine credentials
- No key management required by application

**Implementation**:
```csharp
// Encrypt sensitive data
var plaintext = Encoding.UTF8.GetBytes(activationCode);
var ciphertext = ProtectedData.Protect(plaintext, null, DataProtectionScope.CurrentUser);

// Decrypt sensitive data
var decrypted = ProtectedData.Unprotect(ciphertext, null, DataProtectionScope.CurrentUser);
var activationCode = Encoding.UTF8.GetString(decrypted);
```

### Role-Based Access Control (RBAC)

**Permission Matrix**:

| Permission | Administrator | Operator | Viewer |
|------------|--------------|----------|--------|
| View Profiles | ✓ | ✓ | ✓ |
| Provision Profiles | ✓ | ✓ | ✗ |
| Activate/Deactivate | ✓ | ✓ | ✗ |
| Delete Profiles | ✓ | ✓ | ✗ |
| View Audit Logs | ✓ | ✓ | ✓ |
| Manage Configuration | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |

### Session Management

- **Session Timeout**: 30 minutes of inactivity
- **Session Storage**: In-memory only (not persisted)
- **Session Validation**: Checked on every operation
- **Logout**: Clears session data and returns to login screen

### Input Validation and Sanitization

All user input is validated at multiple layers:

1. **UI Layer**: Format validation, length limits, character restrictions
2. **ViewModel Layer**: Business rule validation
3. **Service Layer**: Domain validation, security checks
4. **Data Layer**: Database constraints, type validation

**Validation Rules**:
- ICCID: 19-20 digits, numeric only
- EID: 32 characters, hexadecimal only
- Activation Code: LPA:1$[address]$[id] format
- Username: 3-50 characters, alphanumeric and underscore
- Password: 12-128 characters, complexity requirements


## Device Connectivity Implementation

### WLAN Device Discovery

**Using Windows Native APIs**:
```csharp
// Execute netsh command to discover WLAN networks
var process = new Process
{
    StartInfo = new ProcessStartInfo
    {
        FileName = "netsh",
        Arguments = "wlan show networks mode=bssid",
        RedirectStandardOutput = true,
        UseShellExecute = false,
        CreateNoWindow = true
    }
};

process.Start();
string output = await process.StandardOutput.ReadToEndAsync();
await process.WaitForExitAsync();

// Parse output to extract SSID, signal strength, security type
```

**Alternative: Windows.Devices.WiFi API** (for UWP compatibility):
```csharp
var access = await WiFiAdapter.RequestAccessAsync();
if (access == WiFiAccessStatus.Allowed)
{
    var adapters = await WiFiAdapter.FindAllAdaptersAsync();
    foreach (var adapter in adapters)
    {
        await adapter.ScanAsync();
        var networks = adapter.NetworkReport.AvailableNetworks;
    }
}
```

### Bluetooth LE Device Discovery

**Using Windows.Devices.Bluetooth APIs**:
```csharp
// Create BLE advertisement watcher
var watcher = new BluetoothLEAdvertisementWatcher
{
    ScanningMode = BluetoothLEScanningMode.Active
};

watcher.Received += async (sender, args) =>
{
    var device = await BluetoothLEDevice.FromBluetoothAddressAsync(args.BluetoothAddress);
    if (device != null)
    {
        // Check for eSIM service UUID
        var services = await device.GetGattServicesAsync();
        // Process discovered device
    }
};

watcher.Start();
```

**Device Pairing**:
```csharp
var device = await BluetoothLEDevice.FromIdAsync(deviceId);
var pairingResult = await device.DeviceInformation.Pairing.PairAsync();

if (pairingResult.Status == DevicePairingResultStatus.Paired)
{
    // Device successfully paired
}
```

### Connection Health Monitoring

**Health Check Algorithm**:
```
Every 30 seconds:
1. Ping connected device
2. Measure response time
3. Check signal strength (WLAN) or RSSI (Bluetooth)
4. If response time > 5 seconds: Mark as degraded
5. If no response after 3 attempts: Mark as disconnected
6. Trigger reconnection logic if disconnected
```

**Reconnection Strategy**:
- Attempt 1: Immediate retry
- Attempt 2: Wait 2 seconds, retry
- Attempt 3: Wait 4 seconds, retry
- After 3 failures: Notify user, mark device as unavailable


## User Interface Design

### Modern Windows 11 Design Language

**Design Principles**:
- **Fluent Design**: Acrylic materials, reveal effects, depth
- **Responsive Layouts**: Grid-based layouts that adapt to window size
- **Consistent Spacing**: 8px grid system throughout
- **Typography**: Segoe UI Variable font family
- **Color System**: Semantic colors for states (success, warning, error, info)

### Theme Support

**Light Theme**:
- Background: #FFFFFF
- Surface: #F3F3F3
- Primary: #0078D4
- Text: #000000
- Border: #E1E1E1

**Dark Theme**:
- Background: #1E1E1E
- Surface: #2D2D2D
- Primary: #60CDFF
- Text: #FFFFFF
- Border: #3F3F3F

**Theme Switching**:
- User preference stored in configuration
- Applied at application startup
- Can be changed in settings without restart
- System theme detection for "Auto" mode

### Accessibility Features

**Keyboard Navigation**:
- All controls accessible via Tab key
- Logical tab order throughout application
- Keyboard shortcuts for common actions (Ctrl+N for new profile, Ctrl+F for search)
- Escape key to cancel dialogs

**Screen Reader Support**:
- AutomationProperties.Name on all interactive elements
- AutomationProperties.HelpText for complex controls
- Live regions for dynamic content updates
- Proper ARIA roles and labels

**High Contrast Mode**:
- Automatic detection of Windows high contrast settings
- Override theme colors with system high contrast colors
- Maintain 4.5:1 contrast ratio minimum (WCAG AA)

**DPI Scaling**:
- Vector graphics (XAML) for all icons
- Proper DPI awareness manifest
- Layout uses relative sizing (Grid, StackPanel with Star sizing)
- Text scales with system DPI settings

### Key Views

**LoginView**:
- Centered login form
- Username and password fields
- Remember me checkbox
- Login button with loading state
- Error message display area

**MainView** (Shell):
- Navigation sidebar (collapsible)
- Top bar with user info and logout
- Content area for child views
- Status bar with connection status

**DeviceDiscoveryView**:
- Connection type selector (WLAN/Bluetooth)
- Scan button with progress indicator
- Device list with connection status
- Connect/Disconnect buttons
- Device details panel

**ProfileManagementView**:
- Profile list with DataGrid
- Search and filter controls
- Sort by column headers
- Bulk selection checkboxes
- Action buttons (Activate, Deactivate, Delete)
- Profile details panel

**ProfileProvisioningView**:
- Activation code input field
- QR code scanner button
- Validation feedback
- Provision button with progress
- Success/error message display

**SettingsView**:
- Tabbed interface for categories
- Configuration options with validation
- Save/Cancel buttons
- Reset to defaults option

**AuditLogView**:
- Log entries in DataGrid
- Date range filter
- User filter
- Action type filter
- Export to CSV button


## Offline Operation and Recovery

### Offline Detection

**Network Connectivity Monitoring**:
```csharp
NetworkChange.NetworkAvailabilityChanged += (sender, args) =>
{
    if (args.IsAvailable)
    {
        // Network available - sync queued operations
        await SyncQueuedOperationsAsync();
    }
    else
    {
        // Network unavailable - enter offline mode
        EnterOfflineMode();
    }
};
```

### Operation Queueing

When offline, operations are queued in the database:

**QueuedOperation Entity**:
```csharp
public class QueuedOperation
{
    public int Id { get; set; }
    public DateTime QueuedDate { get; set; }
    public OperationType Type { get; set; }
    public string ProfileIccid { get; set; }
    public string Parameters { get; set; } // JSON serialized
    public int RetryCount { get; set; }
    public OperationStatus Status { get; set; }
}

public enum OperationType
{
    Provision,
    Activate,
    Deactivate,
    Delete,
    UpdateMetadata
}

public enum OperationStatus
{
    Queued,
    InProgress,
    Completed,
    Failed
}
```

### Synchronization Strategy

When connectivity is restored:
```
1. Retrieve all queued operations ordered by QueuedDate
2. For each operation:
   a. Check if still valid (profile exists, state allows operation)
   b. Execute operation
   c. If success: Mark as Completed, remove from queue
   d. If failure: Increment RetryCount
   e. If RetryCount > 3: Mark as Failed, notify user
3. Update UI with sync results
4. Log sync completion to audit log
```

### Cached Data Access

While offline:
- Display profiles from local SQLite database
- Show last known device information
- Allow viewing audit logs
- Disable operations requiring network connectivity
- Display offline indicator in UI


## Error Handling

### Exception Hierarchy

Custom exception types for domain-specific errors:

```csharp
public class ESimManagerException : Exception
{
    public ErrorCode ErrorCode { get; set; }
    public ESimManagerException(string message, ErrorCode errorCode) 
        : base(message) 
    {
        ErrorCode = errorCode;
    }
}

public class ValidationException : ESimManagerException
{
    public Dictionary<string, string> ValidationErrors { get; set; }
}

public class AuthenticationException : ESimManagerException { }
public class AuthorizationException : ESimManagerException { }
public class ProfileOperationException : ESimManagerException { }
public class DeviceConnectionException : ESimManagerException { }
public class DataAccessException : ESimManagerException { }
```

### Error Codes

```csharp
public enum ErrorCode
{
    // Validation Errors (1000-1999)
    InvalidIccid = 1001,
    InvalidEid = 1002,
    InvalidActivationCode = 1003,
    InvalidInput = 1004,
    
    // Authentication/Authorization Errors (2000-2999)
    InvalidCredentials = 2001,
    AccountLocked = 2002,
    SessionExpired = 2003,
    InsufficientPermissions = 2004,
    
    // Profile Operation Errors (3000-3999)
    ProfileNotFound = 3001,
    InvalidProfileState = 3002,
    ProvisioningFailed = 3003,
    ActivationFailed = 3004,
    DeactivationFailed = 3005,
    DeletionFailed = 3006,
    
    // Device Connection Errors (4000-4999)
    DeviceNotFound = 4001,
    ConnectionFailed = 4002,
    ConnectionTimeout = 4003,
    DeviceNotSupported = 4004,
    
    // Data Access Errors (5000-5999)
    DatabaseError = 5001,
    DataNotFound = 5002,
    DuplicateEntry = 5003,
    
    // Network Errors (6000-6999)
    NetworkUnavailable = 6001,
    SmDpPlusUnreachable = 6002,
    RequestTimeout = 6003
}
```

### Error Handling Strategy

**Service Layer**:
```csharp
public async Task<OperationResult> ActivateProfileAsync(string iccid)
{
    try
    {
        // Validate input
        var validation = _validationService.ValidateIccid(iccid);
        if (!validation.IsValid)
        {
            return OperationResult.Failure(ErrorCode.InvalidIccid, validation.ErrorMessage);
        }
        
        // Check authorization
        if (!_authorizationService.HasPermission(Permission.ManageProfiles))
        {
            return OperationResult.Failure(ErrorCode.InsufficientPermissions, 
                "User does not have permission to activate profiles");
        }
        
        // Perform operation
        var profile = await _dataService.GetProfileByIccidAsync(iccid);
        if (profile == null)
        {
            return OperationResult.Failure(ErrorCode.ProfileNotFound, 
                $"Profile with ICCID {iccid} not found");
        }
        
        if (profile.State != ProfileState.Disabled)
        {
            return OperationResult.Failure(ErrorCode.InvalidProfileState, 
                "Profile must be in Disabled state to activate");
        }
        
        // Execute activation
        await ExecuteActivationAsync(profile);
        
        // Log success
        await _auditLogService.LogAsync(new AuditLogEntry
        {
            Action = AuditAction.ProfileActivated,
            ResourceId = iccid,
            Result = OperationResult.Success()
        });
        
        return OperationResult.Success();
    }
    catch (DeviceConnectionException ex)
    {
        _logger.LogError(ex, "Device connection error during activation");
        return OperationResult.Failure(ErrorCode.ConnectionFailed, ex.Message);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error during activation");
        return OperationResult.Failure(ErrorCode.DatabaseError, 
            "An unexpected error occurred");
    }
}
```

### User-Friendly Error Messages

Error codes are mapped to user-friendly messages:

```csharp
public static class ErrorMessages
{
    private static readonly Dictionary<ErrorCode, string> Messages = new()
    {
        [ErrorCode.InvalidIccid] = "The ICCID format is invalid. It must be 19 or 20 digits.",
        [ErrorCode.InvalidCredentials] = "The username or password is incorrect.",
        [ErrorCode.SessionExpired] = "Your session has expired. Please log in again.",
        [ErrorCode.ProfileNotFound] = "The requested profile could not be found.",
        [ErrorCode.ConnectionFailed] = "Failed to connect to the device. Please check the connection and try again.",
        [ErrorCode.NetworkUnavailable] = "Network connection is unavailable. The operation will be queued for later."
    };
    
    public static string GetMessage(ErrorCode code) => 
        Messages.TryGetValue(code, out var message) ? message : "An unexpected error occurred.";
}
```

### Logging Strategy

**Using Serilog with structured logging**:

```csharp
// Configuration
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.File("logs/esim-manager-.log", 
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.Console()
    .CreateLogger();

// Usage
_logger.LogInformation("Profile {Iccid} activated by user {Username}", iccid, username);
_logger.LogWarning("Connection attempt {Attempt} failed for device {DeviceId}", attemptCount, deviceId);
_logger.LogError(exception, "Failed to provision profile with activation code {Code}", activationCode);
```

**Log Levels**:
- **Trace**: Detailed diagnostic information
- **Debug**: Internal system state for debugging
- **Information**: General informational messages
- **Warning**: Potentially harmful situations
- **Error**: Error events that might still allow the application to continue
- **Critical**: Critical errors causing application failure


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Input Validation Properties

**Property 1: Activation Code Format Validation**
*For any* string input, the activation code validator should accept it if and only if it matches the format `LPA:1$[SM-DP+ address]$[matching ID]` where the address and ID are non-empty strings.
**Validates: Requirements 1.1**

**Property 2: ICCID Length and Format Validation**
*For any* string input, the ICCID validator should accept it if and only if it contains exactly 19 or 20 numeric digits.
**Validates: Requirements 1.2**

**Property 3: EID Format Validation**
*For any* string input, the EID validator should accept it if and only if it is exactly 32 hexadecimal characters.
**Validates: Requirements 1.7**

**Property 4: Input Sanitization**
*For any* user input string containing special characters or SQL/script injection patterns, the sanitization function should remove or escape dangerous characters before processing.
**Validates: Requirements 2.10**

### State Machine and Lifecycle Properties

**Property 5: Profile State Transition Validity**
*For any* eSIM profile and any requested state transition, the system should allow the transition if and only if it is valid according to the state machine: Disabled→Enabled, Enabled→Disabled, any state→Deleted. All other transitions should be rejected.
**Validates: Requirements 1.4, 4.4, 4.5**

**Property 6: Profile Metadata Completeness**
*For any* profile stored in the database, retrieving it should return an object containing non-null values for ICCID, name, provider name, and profile class.
**Validates: Requirements 1.5**

**Property 7: Error Code Mapping**
*For any* error that occurs during profile operations, the system should map it to a valid GSMA-defined error code from the specified error code enumeration.
**Validates: Requirements 1.6**

### Security and Authentication Properties

**Property 8: Authentication Requirement**
*For any* operation requiring authentication, attempting to execute it without valid credentials should result in an authentication failure.
**Validates: Requirements 2.1**

**Property 9: Role Assignment Uniqueness**
*For any* successfully authenticated user, the system should assign exactly one role from the set {Administrator, Operator, Viewer}.
**Validates: Requirements 2.2**

**Property 10: Role-Based Access Control**
*For any* operation and any user role, the system should permit the operation if and only if the role has the required permission according to the RBAC matrix. Specifically: Administrators can perform all operations, Operators can manage profiles but not configuration, Viewers can only view data.
**Validates: Requirements 2.3, 2.4, 2.5**

**Property 11: Credential Encryption at Rest**
*For any* credential or activation code stored in the database, reading the raw database file should not reveal the plaintext value (it should be encrypted).
**Validates: Requirements 2.6, 2.7**

**Property 12: Audit Log Completeness**
*For any* security-sensitive operation (login, logout, profile provisioning, activation, deactivation, deletion, configuration change), an audit log entry should be created containing timestamp, username, action type, resource ID, and operation result.
**Validates: Requirements 2.8**

**Property 13: Session Cleanup on Logout**
*For any* authenticated session, after logout is executed, attempting to perform authenticated operations should fail until re-authentication occurs.
**Validates: Requirements 2.11**

### User Interface Properties

**Property 14: Keyboard Navigation Completeness**
*For any* interactive UI element, it should be reachable and operable using only keyboard navigation (Tab, Enter, Arrow keys, Escape).
**Validates: Requirements 3.3**

**Property 15: Accessibility Label Presence**
*For any* interactive UI element, it should have a non-empty AutomationProperties.Name or AutomationProperties.HelpText value for screen reader support.
**Validates: Requirements 3.4**

**Property 16: Progress Indicator Display**
*For any* operation that takes longer than 1 second to complete, a progress indicator should be displayed to the user.
**Validates: Requirements 3.6**

**Property 17: Error Message User-Friendliness**
*For any* error that occurs, the displayed error message should be mapped from the error code to a user-friendly message (not a raw exception message or stack trace).
**Validates: Requirements 3.7**

**Property 18: Theme Consistency**
*For any* theme selection (Light or Dark), all views in the application should apply the corresponding color scheme consistently.
**Validates: Requirements 3.8, 3.9**

**Property 19: Minimum Font Size**
*For any* text element designated as body text, the font size should be at least 12 points.
**Validates: Requirements 3.10**

### Profile Management Properties

**Property 20: Profile Display Completeness**
*For any* profile retrieved from a device or database, the displayed information should include ICCID, name, provider, and current state.
**Validates: Requirements 4.1**

**Property 21: QR Code Activation Code Extraction**
*For any* valid QR code containing an activation code, decoding it should extract a string that passes activation code format validation.
**Validates: Requirements 4.3**

**Property 22: Delete Confirmation Requirement**
*For any* profile deletion request, the system should display a confirmation dialog before executing the deletion.
**Validates: Requirements 4.6**

**Property 23: Profile Export/Import Round Trip**
*For any* profile exported to JSON format, importing that JSON file should create a profile with equivalent metadata (ICCID, name, provider, profile class).
**Validates: Requirements 4.7, 4.8**

**Property 24: Bulk Operation Availability**
*For any* non-empty selection of profiles, bulk operation buttons (activate, deactivate, delete) should be enabled.
**Validates: Requirements 4.9**

**Property 25: Profile Metadata Update Persistence**
*For any* profile, after editing its name or custom notes and saving, retrieving the profile should return the updated values.
**Validates: Requirements 4.11**

**Property 26: Profile Filtering Correctness**
*For any* filter criteria (provider or state), the displayed profile list should contain only profiles matching that criteria.
**Validates: Requirements 4.12**

**Property 27: Profile Sorting Correctness**
*For any* sort criteria (ICCID, name, provider, activation date), the displayed profile list should be ordered according to that criteria in ascending or descending order.
**Validates: Requirements 4.13**

### Device Connectivity Properties

**Property 28: Connection Timeout Enforcement**
*For any* device connection attempt, if the connection does not complete within 10 seconds, the system should report a timeout error.
**Validates: Requirements 5.3**

**Property 29: Device Capability Query**
*For any* detected device, after connection, the system should query and store device capabilities including eSIM support status.
**Validates: Requirements 5.5**

**Property 30: Device Display Completeness**
*For any* discovered device, the displayed information should include device name, connection type (WLAN or Bluetooth), and connection status.
**Validates: Requirements 5.7**

**Property 31: Connection Timestamp Recording**
*For any* successful device connection, the system should store a timestamp in the audit log or device record.
**Validates: Requirements 5.10**

### Error Handling Properties

**Property 32: Custom Exception Types**
*For any* error condition in the domain layer, the system should throw a custom exception type (derived from ESimManagerException) rather than a generic Exception.
**Validates: Requirements 6.3**

### Data Management Properties

**Property 33: Configuration Encryption**
*For any* sensitive configuration value (passwords, API keys, activation codes), the stored value in the configuration file should be encrypted.
**Validates: Requirements 7.2**

**Property 34: Data Export Format Validity**
*For any* data export operation, the generated file should be valid JSON or CSV format that can be parsed by standard parsers.
**Validates: Requirements 7.3**

**Property 35: Backup Integrity Validation**
*For any* backup file, before restoring, the system should validate that it contains all required files (database, configuration) and that they are not corrupted.
**Validates: Requirements 7.5**

**Property 36: Database Migration Data Preservation**
*For any* database schema upgrade, all existing profile records, audit logs, and configuration data should be preserved and accessible after migration.
**Validates: Requirements 7.6**

**Property 37: Referential Integrity**
*For any* audit log entry referencing a profile, the profile ICCID should exist in the profiles table (or the audit log should handle deleted profiles gracefully).
**Validates: Requirements 7.7**

### Performance Properties

**Property 38: Profile List Retrieval Performance**
*For any* profile list containing up to 100 profiles, retrieving and displaying the list should complete within 500 milliseconds.
**Validates: Requirements 9.4**

### Offline Operation Properties

**Property 39: Offline Operation Queueing**
*For any* profile operation attempted while offline, the operation should be added to a queue and executed when connectivity is restored.
**Validates: Requirements 11.2**

### Configuration Management Properties

**Property 40: Proxy Configuration Application**
*For any* network request, if enterprise proxy settings are configured, the request should be routed through the specified proxy server.
**Validates: Requirements 12.2**

**Property 41: Configuration Validation**
*For any* configuration change, the system should validate that all values are within acceptable ranges (e.g., session timeout > 0, retry attempts >= 0) before applying.
**Validates: Requirements 12.3**

**Property 42: Configuration Export Security**
*For any* configuration export, the generated JSON file should not contain plaintext passwords, API keys, or other sensitive credentials.
**Validates: Requirements 12.4**

**Property 43: Configuration Import Merge Behavior**
*For any* configuration import, existing settings not present in the import file should be preserved (merge behavior, not replace).
**Validates: Requirements 12.5**


## Testing Strategy

### Dual Testing Approach

The system employs both unit testing and property-based testing as complementary strategies:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property Tests**: Verify universal properties across all inputs through randomized testing

Both approaches are necessary for comprehensive coverage. Unit tests catch concrete bugs and verify specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Framework

**Library**: FsCheck for .NET (F#-based property testing library compatible with xUnit)

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Custom generators for domain types (ICCID, EID, ActivationCode, Profile, User)
- Shrinking enabled to find minimal failing cases

**Example Property Test**:
```csharp
[Property]
public Property ActivationCodeValidation_AcceptsValidFormat()
{
    return Prop.ForAll(
        GenerateValidActivationCode(),
        activationCode =>
        {
            var result = _validationService.ValidateActivationCode(activationCode);
            return result.IsValid;
        })
        .Label("Feature: enterprise-esim-manager, Property 1: Activation Code Format Validation");
}

[Property]
public Property ActivationCodeValidation_RejectsInvalidFormat()
{
    return Prop.ForAll(
        GenerateInvalidActivationCode(),
        activationCode =>
        {
            var result = _validationService.ValidateActivationCode(activationCode);
            return !result.IsValid;
        })
        .Label("Feature: enterprise-esim-manager, Property 1: Activation Code Format Validation");
}
```

### Unit Testing Strategy

**Framework**: xUnit with FluentAssertions and Moq

**Test Organization**:
- One test class per service/component
- Arrange-Act-Assert pattern
- Descriptive test method names: `MethodName_Scenario_ExpectedBehavior`

**Coverage Targets**:
- Service classes: 80%+ code coverage
- ViewModels: 70%+ code coverage
- Validators: 100% code coverage
- Critical paths (authentication, profile operations): 100% coverage

**Example Unit Test**:
```csharp
[Fact]
public async Task ActivateProfileAsync_WithDisabledProfile_TransitionsToEnabled()
{
    // Arrange
    var profile = new ESimProfile
    {
        Iccid = "89012345678901234567",
        State = ProfileState.Disabled
    };
    _dataService.Setup(x => x.GetProfileByIccidAsync(profile.Iccid))
        .ReturnsAsync(profile);
    
    // Act
    var result = await _eSimService.ActivateProfileAsync(profile.Iccid);
    
    // Assert
    result.IsSuccess.Should().BeTrue();
    profile.State.Should().Be(ProfileState.Enabled);
}

[Fact]
public async Task ActivateProfileAsync_WithEnabledProfile_ReturnsInvalidStateError()
{
    // Arrange
    var profile = new ESimProfile
    {
        Iccid = "89012345678901234567",
        State = ProfileState.Enabled
    };
    _dataService.Setup(x => x.GetProfileByIccidAsync(profile.Iccid))
        .ReturnsAsync(profile);
    
    // Act
    var result = await _eSimService.ActivateProfileAsync(profile.Iccid);
    
    // Assert
    result.IsSuccess.Should().BeFalse();
    result.ErrorCode.Should().Be(ErrorCode.InvalidProfileState);
}
```

### Integration Testing

**Scope**: End-to-end flows involving multiple services and database

**Key Scenarios**:
1. Complete profile provisioning flow (activation code → download → install → activate)
2. User authentication and authorization flow
3. Device discovery and connection flow
4. Offline operation queueing and synchronization
5. Backup and restore flow

**Test Database**: In-memory SQLite database for fast, isolated tests

### UI Automation Testing

**Framework**: FlaUI (Windows UI Automation library for .NET)

**Key Scenarios**:
1. Login flow with valid and invalid credentials
2. Device discovery and connection
3. Profile listing, filtering, and sorting
4. Profile provisioning with activation code
5. Theme switching
6. Keyboard navigation through main workflows

### Performance Testing

**Tools**: BenchmarkDotNet for micro-benchmarks

**Benchmarks**:
- Profile list retrieval (target: <500ms for 100 profiles)
- Database query performance
- Encryption/decryption operations
- ICCID validation performance

### Security Testing

**Automated Checks**:
- SQL injection attempts in all input fields
- XSS attempts (though limited in desktop app)
- Path traversal attempts in file operations
- Credential storage verification (encrypted at rest)
- Session timeout enforcement

**Manual Security Review**:
- Code review for security vulnerabilities
- Penetration testing of authentication system
- Audit log completeness verification

### Test Tagging and Organization

All property-based tests MUST be tagged with comments referencing the design document:

```csharp
// Feature: enterprise-esim-manager, Property 5: Profile State Transition Validity
[Property]
public Property ProfileStateTransitions_OnlyAllowsValidTransitions()
{
    // Test implementation
}
```

### Continuous Testing

**CI Pipeline Integration**:
- All tests run on every commit
- Property tests run with 100 iterations in CI
- Code coverage reports generated and tracked
- Failed tests block merge to main branch

**Test Execution Time**:
- Unit tests: <30 seconds total
- Property tests: <2 minutes total
- Integration tests: <1 minute total
- UI automation tests: <5 minutes total

### Test Data Generators

Custom FsCheck generators for domain types:

```csharp
public static class Generators
{
    public static Arbitrary<string> ValidIccid() =>
        Arb.From(Gen.Choose(19, 20)
            .SelectMany(length => Gen.ArrayOf(length, Gen.Choose(0, 9))
            .Select(digits => "89" + string.Join("", digits.Skip(2)))));
    
    public static Arbitrary<string> ValidEid() =>
        Arb.From(Gen.ArrayOf(32, Gen.Elements("0123456789ABCDEF".ToCharArray()))
            .Select(chars => new string(chars)));
    
    public static Arbitrary<string> ValidActivationCode() =>
        Arb.From(Gen.Zip(
            Gen.Elements("smdp.example.com", "sm-dp-plus.carrier.net"),
            Gen.AlphaNumericString)
            .Select(t => $"LPA:1${t.Item1}${t.Item2}"));
}
```

## Deployment Architecture

### Application Packaging

**MSI Installer** (created with WiX Toolset):
- Install location: `C:\Program Files\NexoraSIM\eSIM Manager\`
- User data location: `%APPDATA%\NexoraSIM\eSIM Manager\`
- Database location: `%APPDATA%\NexoraSIM\eSIM Manager\esim-manager.db`
- Logs location: `%APPDATA%\NexoraSIM\eSIM Manager\logs\`

**Prerequisites**:
- .NET 8 Runtime (x64)
- Windows 10 Pro (1809+) or Windows 11 Pro
- 100 MB disk space
- Administrator privileges for installation

### CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
name: Build and Release

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  release:
    types: [ created ]

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    
    - name: Restore dependencies
      run: dotnet restore
    
    - name: Build
      run: dotnet build --configuration Release --no-restore
    
    - name: Run unit tests
      run: dotnet test --no-build --configuration Release --logger "trx"
    
    - name: Run property tests
      run: dotnet test --no-build --configuration Release --filter "Category=Property"
    
    - name: Publish application
      run: dotnet publish --configuration Release --output ./publish
    
    - name: Create MSI installer
      run: |
        # WiX toolset commands to create MSI
        candle Product.wxs
        light -out ESimManager.msi Product.wixobj
    
    - name: Sign installer
      if: github.event_name == 'release'
      run: |
        # Code signing with certificate
        signtool sign /f certificate.pfx /p ${{ secrets.CERT_PASSWORD }} ESimManager.msi
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: ESimManager-Installer
        path: ESimManager.msi
    
    - name: Create GitHub Release
      if: github.event_name == 'release'
      uses: softprops/action-gh-release@v1
      with:
        files: ESimManager.msi
```

### Monitoring and Diagnostics

**Application Insights** (optional for enterprise deployments):
- Telemetry collection for usage patterns
- Exception tracking and alerting
- Performance monitoring

**Local Diagnostics**:
- Structured logging to files (Serilog)
- Windows Event Log integration for critical errors
- Diagnostic mode with verbose logging

## Summary

This design document provides a comprehensive blueprint for transforming the basic eSIM Profile Manager into a production-ready enterprise application. The architecture emphasizes:

1. **Standards Compliance**: Full GSMA SGP.22 implementation for eSIM lifecycle management
2. **Security**: Defense-in-depth with encryption, authentication, authorization, and audit logging
3. **Quality**: Comprehensive testing strategy with both unit and property-based tests
4. **Maintainability**: Clean architecture with clear separation of concerns
5. **User Experience**: Modern, accessible UI following Windows 11 design language
6. **Reliability**: Offline operation support, error handling, and recovery mechanisms
7. **DevOps**: Complete CI/CD automation for consistent, tested releases

The design is ready for implementation following the task list that will be created in the next phase.
