# Troubleshooting Guide

Common issues and solutions for eSIM Manager.

## Installation Issues

### .NET SDK Not Found

**Problem**: Installation script reports .NET SDK is missing.

**Solution**:
1. Download .NET 8 SDK from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
2. Install the SDK
3. Restart your terminal/PowerShell
4. Run the installation script again

### PowerShell Execution Policy Error

**Problem**: Script execution is blocked by PowerShell policy.

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Build Failures

**Problem**: Build fails with package restore errors.

**Solution**:
1. Clear NuGet cache:
   ```powershell
   dotnet nuget locals all --clear
   ```
2. Restore packages:
   ```powershell
   dotnet restore
   ```
3. Build again

## Connection Issues

### No Devices Found (WLAN)

**Problem**: Device discovery finds no WLAN devices.

**Solution**:
1. Verify WLAN adapter is enabled:
   ```powershell
   netsh wlan show interfaces
   ```
2. Check if devices are on the same network
3. Disable firewall temporarily to test
4. Restart WLAN adapter

### No Devices Found (Bluetooth)

**Problem**: Device discovery finds no Bluetooth devices.

**Solution**:
1. Verify Bluetooth is enabled in Windows Settings
2. Check Bluetooth services are running:
   ```powershell
   Get-Service | Where-Object {$_.Name -like "*Bluetooth*"}
   ```
3. Ensure device is in pairing mode
4. Try removing and re-pairing the device

### Connection Timeout

**Problem**: Device connection times out.

**Solution**:
1. Move closer to the device
2. Check device battery level
3. Restart the device
4. Try a different connection type (WLAN vs Bluetooth)
5. Check system logs for specific error messages

### Connection Drops Frequently

**Problem**: Device disconnects unexpectedly.

**Solution**:
1. Check signal strength
2. Reduce interference (move away from other wireless devices)
3. Update network/Bluetooth drivers
4. Enable offline recovery mode in Settings

## eSIM Profile Issues

### Profile Provisioning Fails

**Problem**: New profile provisioning fails.

**Solution**:
1. Verify activation code is correct
2. Check device has available eSIM slots
3. Ensure device is connected
4. Check internet connectivity
5. Review logs for specific error codes

### Cannot Activate Profile

**Problem**: Profile activation fails.

**Solution**:
1. Ensure only one profile is active at a time
2. Check profile status is "Inactive"
3. Verify device supports the profile
4. Try deactivating other profiles first

### Profile Not Appearing

**Problem**: Provisioned profile doesn't appear in list.

**Solution**:
1. Click **Refresh** button
2. Disconnect and reconnect device
3. Restart the application
4. Check if profile was actually provisioned (check logs)

## Application Issues

### Application Won't Start

**Problem**: eSIM Manager fails to launch.

**Solution**:
1. Check .NET Runtime is installed:
   ```powershell
   dotnet --list-runtimes
   ```
2. Run as Administrator
3. Check Windows Event Viewer for errors
4. Reinstall the application

### UI Not Responding

**Problem**: Application interface freezes.

**Solution**:
1. Wait 30 seconds (operation may be in progress)
2. Check Task Manager for high CPU usage
3. Close and restart the application
4. Check available system memory

### Logs Not Displaying

**Problem**: Logs view is empty or not updating.

**Solution**:
1. Click **Refresh** or navigate away and back
2. Check log file permissions
3. Verify logging service is running
4. Restart the application

## Performance Issues

### Slow Device Discovery

**Problem**: Device discovery takes too long.

**Solution**:
1. This is normal for Bluetooth (can take 30+ seconds)
2. Reduce number of nearby devices
3. Use WLAN instead of Bluetooth
4. Update network drivers

### High Memory Usage

**Problem**: Application uses excessive memory.

**Solution**:
1. Clear logs regularly
2. Disconnect devices when not in use
3. Restart application periodically
4. Check for memory leaks (report to developers)

## Error Messages

### "No devices connected yet"

This is the initial state. Select a connection type and discover devices.

### "Connection failed"

Check device is powered on, in range, and connection type is correct.

### "Profile activation failed"

Verify profile is valid, device is connected, and no other profile is active.

### "Access denied"

Run application as Administrator or check Windows permissions.

## Diagnostic Commands

### Check System Status

```powershell
# Check .NET
dotnet --info

# Check WLAN
netsh wlan show interfaces

# Check Bluetooth
Get-PnpDevice -Class Bluetooth

# Check running services
Get-Service | Where-Object {$_.Status -eq "Running"}
```

### Collect Diagnostic Information

1. Navigate to Logs view
2. Copy all log entries
3. Check Windows Event Viewer:
   - Application logs
   - System logs
4. Include this information when reporting issues

## Getting Additional Help

If your issue isn't resolved:

1. Check [GitHub Issues](https://github.com/nexorasim/esim-manager/issues) for similar problems
2. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - System information
   - Log entries
   - Screenshots if applicable

## Offline Recovery Mode

If you're experiencing persistent connectivity issues:

1. Go to Settings
2. Enable "Offline recovery mode"
3. This allows limited operations without active connection
4. Useful for diagnostics and configuration

## Reset Application

To reset eSIM Manager to defaults:

1. Close the application
2. Delete configuration:
   ```powershell
   Remove-Item -Path "$env:APPDATA\ESimManager" -Recurse -Force
   ```
3. Restart the application
4. Reconfigure settings

## Contact Support

For enterprise support:
- Email: support@nexorasim.com
- Documentation: https://nexorasim.github.io/esim-manager
- GitHub: https://github.com/nexorasim/esim-manager
