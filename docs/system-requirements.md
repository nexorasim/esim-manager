# System Requirements

## Minimum Requirements

### Operating System
- Windows 10 Pro (version 1809 or later)
- Windows 11 Pro

### Hardware
- **Processor**: 1 GHz or faster, 64-bit processor
- **RAM**: 2 GB minimum (4 GB recommended)
- **Storage**: 200 MB available disk space
- **Display**: 1280x720 minimum resolution
- **Network**: WLAN adapter for wireless device connectivity
- **Bluetooth**: Bluetooth 4.0 or later for Bluetooth device connectivity

### Software
- .NET 8 Runtime or SDK
- Windows PowerShell 5.1 or later (for automation scripts)

## Recommended Requirements

### Hardware
- **Processor**: Multi-core 2 GHz or faster
- **RAM**: 8 GB or more
- **Storage**: 500 MB available disk space (for logs and profiles)
- **Display**: 1920x1080 or higher resolution
- **Network**: Dual-band WLAN adapter (2.4 GHz and 5 GHz)
- **Bluetooth**: Bluetooth 5.0 or later

### Software
- .NET 8 SDK (for development)
- Visual Studio 2022 (for development)
- Windows Terminal (for better PowerShell experience)

## Network Requirements

### WLAN Connectivity
- Active WLAN adapter
- Network access for device discovery
- Firewall rules allowing local network communication

### Bluetooth Connectivity
- Bluetooth adapter enabled
- Bluetooth services running
- Device pairing permissions

## Enterprise Requirements

For enterprise deployments:

- **Group Policy**: Support for enterprise configuration management
- **Certificate Store**: Access to Windows certificate store for secure connections
- **Network**: Access to enterprise configuration server
- **Logging**: Sufficient disk space for audit logs

## Compatibility

### Supported Devices
- eSIM-capable devices with WLAN or Bluetooth connectivity
- Devices supporting standard eSIM provisioning protocols

### Not Supported
- Windows 10 Home edition (limited enterprise features)
- Windows 8.1 or earlier
- 32-bit Windows installations
- ARM-based Windows devices (not tested)

## Performance Considerations

- **Device Discovery**: May take 5-30 seconds depending on network conditions
- **Profile Provisioning**: Typically 10-60 seconds per profile
- **Concurrent Operations**: Supports one active device connection at a time
- **Log Storage**: Logs are rotated automatically; older logs are archived

## Verification

To verify your system meets the requirements:

1. Check Windows version:
   ```powershell
   winver
   ```

2. Check .NET version:
   ```powershell
   dotnet --version
   ```

3. Check PowerShell version:
   ```powershell
   $PSVersionTable.PSVersion
   ```

4. Check WLAN adapter:
   ```powershell
   netsh wlan show interfaces
   ```

5. Check Bluetooth:
   ```powershell
   Get-PnpDevice | Where-Object {$_.Class -eq "Bluetooth"}
   ```
