# Implementation Plan: Enterprise eSIM Manager

## Overview

This implementation plan transforms the existing basic eSIM Profile Manager into a production-ready enterprise application with GSMA SGP.22 compliance, enterprise security, modern UI/UX, robust device connectivity, and comprehensive testing. The plan follows an incremental approach where each task builds on previous work, with regular checkpoints to ensure quality.

## Tasks

- [x] 1. Set up enhanced project structure and dependencies
  - Add NuGet packages: Entity Framework Core, SQLite, FsCheck, FluentAssertions, Moq, Windows.Devices.Bluetooth
  - Create folder structure: Models/Entities, Services/Interfaces, ViewModels, Views, Validators, Exceptions
  - Update .csproj with Windows SDK references for Bluetooth APIs
  - Configure dependency injection container in App.xaml.cs
  - _Requirements: 6.1, 6.8_

- [-] 2. Implement domain models and database infrastructure
  - [x] 2.1 Create enhanced domain entities
    - Update ESimProfile with all required fields (ProfileState, ProfileClass, encrypted activation code, timestamps)
    - Create User entity with password hash/salt, role, and audit fields
    - Create DeviceInfo entity with EID, firmware version, manufacturer, model
    - Create AuditLogEntry entity with all required audit fields
    - Create ApplicationConfiguration entity
    - Create QueuedOperation entity for offline support
    - _Requirements: 1.5, 2.2, 7.1_

  - [ ] 2.2 Write property test for profile metadata completeness
    - **Property 6: Profile Metadata Completeness**
    - **Validates: Requirements 1.5**

  - [ ] 2.3 Create Entity Framework Core DbContext
    - Define DbContext with DbSets for all entities
    - Configure entity relationships and indexes
    - Implement database initialization with schema creation
    - Add connection string configuration for SQLite in AppData folder
    - _Requirements: 7.1, 7.7_

  - [ ] 2.4 Write unit tests for DbContext configuration
    - Test database creation and schema
    - Test entity relationships and constraints
    - _Requirements: 7.1_

- [ ] 3. Implement validation services with GSMA compliance
  - [ ] 3.1 Create IProfileValidationService and implementation
    - Implement ICCID validation (19-20 digits, Luhn checksum)
    - Implement EID validation (32-character hex string)
    - Implement activation code validation (LPA:1$address$id format)
    - Implement activation code parsing to extract components
    - _Requirements: 1.1, 1.2, 1.7_

  - [ ] 3.2 Write property tests for validation services
    - **Property 1: Activation Code Format Validation**
    - **Property 2: ICCID Length and Format Validation**
    - **Property 3: EID Format Validation**
    - **Validates: Requirements 1.1, 1.2, 1.7**

  - [ ] 3.3 Write unit tests for edge cases
    - Test Luhn checksum calculation
    - Test boundary conditions (18, 19, 20, 21 digit ICCIDs)
    - Test various invalid activation code formats
    - _Requirements: 1.1, 1.2, 1.7_

- [ ] 4. Implement security infrastructure
  - [ ] 4.1 Create IEncryptionService using Windows DPAPI
    - Implement Encrypt/Decrypt methods using ProtectedData class
    - Support both CurrentUser and LocalMachine scopes
    - Add string encryption/decryption convenience methods
    - _Requirements: 2.6, 2.7_

  - [ ] 4.2 Write property test for encryption
    - **Property 11: Credential Encryption at Rest**
    - **Property 33: Configuration Encryption**
    - **Validates: Requirements 2.6, 2.7, 7.2**

  - [ ] 4.3 Create IAuthenticationService and implementation
    - Implement password hashing with PBKDF2 (100,000 iterations, SHA-256)
    - Implement AuthenticateAsync with username/password validation
    - Implement session management with timeout tracking
    - Implement account lockout after 5 failed attempts
    - Implement ChangePasswordAsync with validation
    - _Requirements: 2.1, 2.9_

  - [ ] 4.4 Write unit tests for authentication
    - Test successful authentication
    - Test failed authentication with invalid credentials
    - Test account lockout mechanism
    - Test password hashing and verification
    - _Requirements: 2.1_

  - [ ] 4.5 Create IAuthorizationService with RBAC
    - Implement role-permission matrix (Administrator, Operator, Viewer)
    - Implement HasPermission method checking user role
    - Implement IsInRole method
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 4.6 Write property test for RBAC
    - **Property 10: Role-Based Access Control**
    - **Validates: Requirements 2.3, 2.4, 2.5**

- [ ] 5. Checkpoint - Security foundation complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement audit logging service
  - [ ] 6.1 Create IAuditLogService and implementation
    - Implement LogAsync to write audit entries to database
    - Implement GetLogsAsync with filtering support
    - Implement ExportLogsAsync to CSV format
    - Ensure all security-sensitive operations are logged
    - _Requirements: 2.8_

  - [ ] 6.2 Write property test for audit logging
    - **Property 12: Audit Log Completeness**
    - **Validates: Requirements 2.8**

  - [ ] 6.3 Write unit tests for audit log filtering and export
    - Test date range filtering
    - Test user filtering
    - Test action type filtering
    - Test CSV export format
    - _Requirements: 2.8_

- [ ] 7. Implement data access layer
  - [ ] 7.1 Create IDataService with generic repository pattern
    - Implement GetByIdAsync, GetAllAsync, AddAsync, UpdateAsync, DeleteAsync
    - Implement QueryAsync with LINQ expression support
    - Implement transaction support (BeginTransaction, Commit, Rollback)
    - Add proper error handling and logging
    - _Requirements: 7.1, 7.8_

  - [ ] 7.2 Write unit tests for data service
    - Test CRUD operations with in-memory database
    - Test transaction rollback on error
    - Test query with complex predicates
    - _Requirements: 7.1_

  - [ ] 7.3 Implement database migration service
    - Create migration strategy for schema upgrades
    - Implement data preservation during migrations
    - Add version tracking in database
    - _Requirements: 7.6_

  - [ ] 7.4 Write property test for migration data preservation
    - **Property 36: Database Migration Data Preservation**
    - **Validates: Requirements 7.6**

- [ ] 8. Implement GSMA-compliant eSIM service
  - [ ] 8.1 Enhance IESimService with GSMA SGP.22 compliance
    - Implement GetProfilesAsync with full metadata retrieval
    - Implement ProvisionProfileAsync with activation code validation and SM-DP+ communication
    - Implement ProvisionProfileFromQRCodeAsync with QR decoding
    - Implement state machine for ActivateProfileAsync (Disabled→Enabled only)
    - Implement state machine for DeactivateProfileAsync (Enabled→Disabled only)
    - Implement state machine for DeleteProfileAsync (any→Deleted with confirmation)
    - Implement UpdateProfileMetadataAsync for name and notes
    - Implement ExportProfileAsync to JSON
    - Implement ImportProfileAsync from JSON with validation
    - Implement BulkOperationAsync for multiple profiles
    - Map all errors to GSMA error codes
    - _Requirements: 1.1, 1.3, 1.4, 1.6, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.11_

  - [ ] 8.2 Write property tests for eSIM service
    - **Property 5: Profile State Transition Validity**
    - **Property 7: Error Code Mapping**
    - **Property 21: QR Code Activation Code Extraction**
    - **Property 23: Profile Export/Import Round Trip**
    - **Validates: Requirements 1.4, 1.6, 4.3, 4.7, 4.8**

  - [ ] 8.3 Write unit tests for profile operations
    - Test provisioning with valid activation code
    - Test provisioning with invalid activation code
    - Test activation of disabled profile
    - Test activation of already enabled profile (should fail)
    - Test deactivation of enabled profile
    - Test deletion with confirmation
    - Test bulk operations
    - _Requirements: 1.4, 4.2, 4.4, 4.5, 4.6, 4.9_

- [ ] 9. Checkpoint - Core eSIM functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement device connectivity services
  - [ ] 10.1 Enhance IDeviceConnectionService for WLAN
    - Implement DiscoverDevicesAsync using netsh wlan commands
    - Parse netsh output to extract SSID, signal strength, security type
    - Implement connection health monitoring with 30-second intervals
    - Implement reconnection logic with exponential backoff (3 attempts)
    - _Requirements: 5.1, 5.3, 5.4, 5.6_

  - [ ] 10.2 Implement Bluetooth LE device discovery
    - Add Windows.Devices.Bluetooth API integration
    - Implement BluetoothLEAdvertisementWatcher for device scanning
    - Implement device pairing with DeviceInformation.Pairing API
    - Query GATT services to detect eSIM support
    - _Requirements: 5.2, 5.5_

  - [ ] 10.3 Implement device capability detection
    - Create QueryDeviceCapabilitiesAsync method
    - Detect eSIM support via GATT service UUIDs
    - Retrieve EID from device
    - Retrieve firmware version and device info
    - _Requirements: 5.5_

  - [ ] 10.4 Write property tests for device connectivity
    - **Property 28: Connection Timeout Enforcement**
    - **Property 29: Device Capability Query**
    - **Property 30: Device Display Completeness**
    - **Property 31: Connection Timestamp Recording**
    - **Validates: Requirements 5.3, 5.5, 5.7, 5.10**

  - [ ] 10.5 Write unit tests for connection scenarios
    - Test successful WLAN discovery
    - Test successful Bluetooth discovery
    - Test connection timeout
    - Test reconnection with backoff
    - Test device capability detection
    - _Requirements: 5.3, 5.4, 5.5_

- [ ] 11. Implement offline operation support
  - [ ] 11.1 Create network connectivity monitoring
    - Implement NetworkChange.NetworkAvailabilityChanged event handler
    - Detect online/offline state transitions
    - Update UI with connectivity status indicator
    - _Requirements: 11.1, 11.4_

  - [ ] 11.2 Implement operation queueing service
    - Create QueuedOperation entity and repository
    - Queue operations when offline (provision, activate, deactivate, delete)
    - Implement synchronization when connectivity restored
    - Implement retry logic with max 3 attempts
    - _Requirements: 11.2, 11.3_

  - [ ] 11.3 Write property test for operation queueing
    - **Property 39: Offline Operation Queueing**
    - **Validates: Requirements 11.2**

  - [ ] 11.4 Write unit tests for offline scenarios
    - Test operation queueing when offline
    - Test synchronization when online
    - Test retry logic for failed operations
    - _Requirements: 11.2, 11.3_

- [ ] 12. Implement configuration management
  - [ ] 12.1 Create IConfigurationService
    - Implement LoadConfigurationAsync from JSON file
    - Implement SaveConfigurationAsync with encryption for sensitive values
    - Implement ExportConfigurationAsync excluding credentials
    - Implement ImportConfigurationAsync with merge behavior
    - Implement ValidateConfigurationAsync for all settings
    - Support proxy configuration for network requests
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ] 12.2 Write property tests for configuration
    - **Property 40: Proxy Configuration Application**
    - **Property 41: Configuration Validation**
    - **Property 42: Configuration Export Security**
    - **Property 43: Configuration Import Merge Behavior**
    - **Validates: Requirements 12.2, 12.3, 12.4, 12.5**

- [ ] 13. Checkpoint - Backend services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement ViewModels with MVVM pattern
  - [ ] 14.1 Create LoginViewModel
    - Implement Username and Password properties with validation
    - Implement LoginCommand using IAuthenticationService
    - Implement error message display for failed login
    - Implement navigation to MainView on successful login
    - _Requirements: 2.1, 3.7_

  - [ ] 14.2 Create MainViewModel (application shell)
    - Implement navigation between views
    - Implement CurrentUser property display
    - Implement LogoutCommand with session cleanup
    - Implement connection status indicator
    - Implement theme switching (Light/Dark)
    - _Requirements: 2.11, 3.8, 3.9_

  - [ ] 14.3 Create DeviceDiscoveryViewModel
    - Implement ConnectionType selection (WLAN/Bluetooth)
    - Implement ScanCommand using IDeviceConnectionService
    - Implement DiscoveredDevices observable collection
    - Implement ConnectCommand and DisconnectCommand
    - Implement device details display
    - _Requirements: 5.1, 5.2, 5.7_

  - [ ] 14.4 Create ProfileManagementViewModel
    - Implement Profiles observable collection with filtering and sorting
    - Implement search functionality
    - Implement filter by provider and state
    - Implement sort by ICCID, name, provider, activation date
    - Implement ActivateCommand, DeactivateCommand, DeleteCommand
    - Implement bulk selection and bulk operations
    - Implement SelectedProfile property for details panel
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.9, 4.12, 4.13_

  - [ ] 14.5 Create ProfileProvisioningViewModel
    - Implement ActivationCode property with validation
    - Implement ScanQRCodeCommand
    - Implement ProvisionCommand using IESimService
    - Implement progress indicator during provisioning
    - Implement success/error message display
    - _Requirements: 4.2, 4.3, 3.6, 3.7_

  - [ ] 14.6 Create SettingsViewModel
    - Implement configuration properties (log level, session timeout, retry attempts)
    - Implement theme selection
    - Implement proxy configuration
    - Implement SaveCommand with validation
    - Implement ResetToDefaultsCommand
    - _Requirements: 12.3, 12.6_

  - [ ] 14.7 Create AuditLogViewModel
    - Implement AuditLogs observable collection
    - Implement date range filter
    - Implement user filter
    - Implement action type filter
    - Implement ExportToCsvCommand
    - _Requirements: 2.8_

  - [ ] 14.8 Write unit tests for ViewModels
    - Test command execution and property changes
    - Test validation logic
    - Test navigation flows
    - _Requirements: 2.1, 4.1, 4.2_

- [ ] 15. Implement XAML views with modern UI
  - [ ] 15.1 Create LoginView
    - Design centered login form with username/password fields
    - Add "Remember me" checkbox
    - Add login button with loading state
    - Add error message display area
    - Implement keyboard navigation (Tab order, Enter to submit)
    - _Requirements: 3.3, 3.7_

  - [ ] 15.2 Create MainWindow (application shell)
    - Design navigation sidebar with collapsible menu
    - Add top bar with user info and logout button
    - Add content area for child views
    - Add status bar with connection status and offline indicator
    - Implement theme switching UI
    - _Requirements: 3.8, 3.9, 11.4_

  - [ ] 15.3 Create DeviceDiscoveryView
    - Design connection type selector (RadioButtons for WLAN/Bluetooth)
    - Add scan button with progress indicator
    - Add device list (DataGrid or ListBox)
    - Add connect/disconnect buttons
    - Add device details panel
    - _Requirements: 5.7_

  - [ ] 15.4 Create ProfileManagementView
    - Design profile list with DataGrid
    - Add search TextBox and filter ComboBoxes
    - Add column headers with sort indicators
    - Add bulk selection checkboxes
    - Add action buttons (Activate, Deactivate, Delete) with icons
    - Add profile details panel
    - _Requirements: 4.1, 4.12, 4.13_

  - [ ] 15.5 Create ProfileProvisioningView
    - Design activation code input field with validation feedback
    - Add QR code scanner button
    - Add provision button with progress bar
    - Add success/error message display with icons
    - _Requirements: 3.6, 3.7, 4.2, 4.3_

  - [ ] 15.6 Create SettingsView
    - Design tabbed interface for settings categories
    - Add configuration controls with validation
    - Add theme selector (Light/Dark/System)
    - Add save/cancel buttons
    - Add reset to defaults button with confirmation
    - _Requirements: 3.8, 3.9, 12.6_

  - [ ] 15.7 Create AuditLogView
    - Design audit log DataGrid with columns for timestamp, user, action, result
    - Add filter controls (date range, user, action type)
    - Add export to CSV button
    - _Requirements: 2.8_

- [ ] 16. Implement theme system and resources
  - [ ] 16.1 Create ResourceDictionaries for Light and Dark themes
    - Define color palettes for both themes
    - Create brush resources for backgrounds, surfaces, text, borders
    - Define typography styles (font families, sizes, weights)
    - _Requirements: 3.8, 3.9, 3.10_

  - [ ] 16.2 Implement theme switching logic
    - Create ThemeService to manage theme changes
    - Implement dynamic ResourceDictionary switching
    - Persist theme preference in configuration
    - Support system theme detection for "Auto" mode
    - _Requirements: 3.8, 3.9_

  - [ ] 16.3 Write property test for theme consistency
    - **Property 18: Theme Consistency**
    - **Validates: Requirements 3.8, 3.9**

- [ ] 17. Implement accessibility features
  - [ ] 17.1 Add keyboard navigation support
    - Set TabIndex on all interactive controls
    - Implement keyboard shortcuts (Ctrl+N, Ctrl+F, Ctrl+S, Escape)
    - Test tab order through all views
    - _Requirements: 3.3_

  - [ ] 17.2 Add screen reader support
    - Set AutomationProperties.Name on all interactive elements
    - Set AutomationProperties.HelpText for complex controls
    - Implement live regions for dynamic content
    - _Requirements: 3.4_

  - [ ] 17.3 Write property tests for accessibility
    - **Property 14: Keyboard Navigation Completeness**
    - **Property 15: Accessibility Label Presence**
    - **Validates: Requirements 3.3, 3.4**

  - [ ] 17.4 Implement high-DPI support
    - Set DPI awareness in app manifest
    - Use vector graphics (XAML paths) for all icons
    - Test on 4K displays
    - _Requirements: 3.1, 3.2_

- [ ] 18. Checkpoint - UI implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Implement error handling and logging
  - [ ] 19.1 Create custom exception hierarchy
    - Create ESimManagerException base class with ErrorCode property
    - Create ValidationException, AuthenticationException, AuthorizationException
    - Create ProfileOperationException, DeviceConnectionException, DataAccessException
    - _Requirements: 6.3_

  - [ ] 19.2 Write property test for custom exceptions
    - **Property 32: Custom Exception Types**
    - **Validates: Requirements 6.3**

  - [ ] 19.3 Implement error message mapping
    - Create ErrorMessages class mapping ErrorCode to user-friendly messages
    - Implement GetMessage method
    - _Requirements: 3.7_

  - [ ] 19.4 Write property test for error messages
    - **Property 17: Error Message User-Friendliness**
    - **Validates: Requirements 3.7**

  - [ ] 19.5 Configure Serilog logging
    - Set up file logging with rolling intervals
    - Set up console logging for debugging
    - Configure log levels (Information, Warning, Error)
    - Add structured logging throughout services
    - _Requirements: 6.4_

- [ ] 20. Implement integration tests
  - [ ] 20.1 Write end-to-end profile provisioning test
    - Test complete flow: login → connect device → provision profile → activate
    - _Requirements: 1.3, 4.2, 4.4_

  - [ ] 20.2 Write authentication and authorization integration test
    - Test login flow with different roles
    - Test permission enforcement for each role
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 20.3 Write offline operation integration test
    - Test operation queueing when offline
    - Test synchronization when connectivity restored
    - _Requirements: 11.2, 11.3_

  - [ ] 20.4 Write backup and restore integration test
    - Test backup creation
    - Test restore from backup with data preservation
    - _Requirements: 7.4, 7.5_

- [ ] 21. Implement CI/CD pipeline
  - [ ] 21.1 Create GitHub Actions workflow
    - Add build job with .NET 8 setup
    - Add restore, build, and test steps
    - Add publish step for Release configuration
    - Configure artifact upload
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 21.2 Add release workflow
    - Trigger on version tags
    - Build MSI installer using WiX Toolset
    - Sign installer with code signing certificate
    - Create GitHub Release with artifacts
    - _Requirements: 8.4, 8.5, 8.6_

  - [ ] 21.3 Add documentation deployment
    - Deploy docs to GitHub Pages on documentation changes
    - _Requirements: 8.7, 10.7_

- [ ] 22. Create MSI installer with WiX
  - [ ] 22.1 Create WiX project
    - Define Product.wxs with installation directories
    - Set install location to Program Files
    - Set user data location to AppData
    - Create desktop shortcut and Start Menu entry
    - _Requirements: 13.1, 13.2_

  - [ ] 22.2 Add .NET 8 Runtime prerequisite check
    - Check for .NET 8 Runtime installation
    - Prompt user to install if missing
    - _Requirements: 13.3_

  - [ ] 22.3 Add database initialization
    - Create SQLite database with initial schema on first run
    - Create default admin user
    - _Requirements: 13.4_

  - [ ] 22.4 Configure uninstaller
    - Remove application files
    - Preserve user data in AppData
    - _Requirements: 13.5_

- [ ] 23. Write comprehensive documentation
  - [ ] 23.1 Create user guide
    - Document installation process
    - Document login and authentication
    - Document device discovery and connection
    - Document profile management workflows
    - Add screenshots for all major features
    - _Requirements: 10.1_

  - [ ] 23.2 Create administrator guide
    - Document installation and configuration
    - Document user management and RBAC
    - Document security setup and best practices
    - Document backup and restore procedures
    - _Requirements: 10.2_

  - [ ] 23.3 Create developer documentation
    - Document architecture and design patterns
    - Document service interfaces and extension points
    - Document build and test procedures
    - _Requirements: 10.3_

  - [ ] 23.4 Create API documentation
    - Generate XML documentation for all public APIs
    - Create API reference documentation
    - _Requirements: 10.4_

  - [ ] 23.5 Create troubleshooting guide
    - Document common issues and solutions
    - Document error codes and meanings
    - Document diagnostic procedures
    - _Requirements: 10.5_

  - [ ] 23.6 Create GSMA compliance documentation
    - Map requirements to SGP.22 sections
    - Document compliance testing procedures
    - _Requirements: 10.6_

- [ ] 24. Final checkpoint - Complete system verification
  - Run all tests (unit, property, integration)
  - Verify zero build errors and warnings
  - Test complete user workflows manually
  - Verify accessibility features
  - Test on Windows 10 and Windows 11
  - Verify CI/CD pipeline execution
  - Review all documentation for completeness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive enterprise-ready implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and quality
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate end-to-end workflows
- The implementation follows clean architecture principles with clear separation of concerns
