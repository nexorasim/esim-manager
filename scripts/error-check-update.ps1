# esim-manager - Error Check & Update Script
# .NET 8 WPF Windows Desktop Application

$ErrorActionPreference = "Continue"
$LogFile = "esim-error-check.log"

# 1. Clear old logs
if (Test-Path $LogFile) {
    Remove-Item $LogFile -Force
}

function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Timestamp - $Message" | Tee-Object -FilePath $LogFile -Append
}

Write-Log "=== eSIM Manager Error Check Started ==="

# 2. Git Status Check
Write-Log "`n=== Git Status Check ==="
try {
    git status 2>&1 | Tee-Object -FilePath $LogFile -Append
    Write-Log "Recent commits:"
    git log -n 5 --oneline 2>&1 | Tee-Object -FilePath $LogFile -Append
} catch {
    Write-Log "Git check failed: $_"
}

# 3. .NET SDK Version Check
Write-Log "`n=== .NET SDK Version Check ==="
try {
    dotnet --version 2>&1 | Tee-Object -FilePath $LogFile -Append
    dotnet --list-sdks 2>&1 | Tee-Object -FilePath $LogFile -Append
} catch {
    Write-Log "ERROR: .NET SDK not found or not in PATH"
}

# 4. NuGet Package Restore
Write-Log "`n=== NuGet Package Restore ==="
try {
    dotnet restore esim-manager.sln 2>&1 | Tee-Object -FilePath $LogFile -Append
    if ($LASTEXITCODE -eq 0) {
        Write-Log "SUCCESS: NuGet restore completed"
    } else {
        Write-Log "ERROR: NuGet restore failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Log "ERROR: NuGet restore exception: $_"
}

# 5. Build Validation
Write-Log "`n=== Build Validation ==="
try {
    dotnet clean 2>&1 | Tee-Object -FilePath $LogFile -Append
    dotnet build esim-manager.sln --configuration Release 2>&1 | Tee-Object -FilePath $LogFile -Append
    if ($LASTEXITCODE -eq 0) {
        Write-Log "SUCCESS: Build completed with no errors"
    } else {
        Write-Log "ERROR: Build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Log "ERROR: Build exception: $_"
}

# 6. Code Diagnostics Check
Write-Log "`n=== Code Diagnostics Check ==="
try {
    $ProjectFiles = @(
        "ESimManager/ESimManager.csproj",
        "ESimManager.Tests/ESimManager.Tests.csproj"
    )
    
    foreach ($Project in $ProjectFiles) {
        if (Test-Path $Project) {
            Write-Log "Checking: $Project"
            dotnet build $Project --no-restore 2>&1 | Select-String -Pattern "error|warning" | Tee-Object -FilePath $LogFile -Append
        }
    }
} catch {
    Write-Log "ERROR: Diagnostics check exception: $_"
}

# 7. Test Execution
Write-Log "`n=== Test Execution ==="
try {
    dotnet test esim-manager.sln --configuration Release --no-build --verbosity normal 2>&1 | Tee-Object -FilePath $LogFile -Append
    if ($LASTEXITCODE -eq 0) {
        Write-Log "SUCCESS: All tests passed"
    } else {
        Write-Log "ERROR: Tests failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Log "ERROR: Test execution exception: $_"
}

# 8. NuGet Package Vulnerability Check
Write-Log "`n=== NuGet Package Vulnerability Check ==="
try {
    dotnet list package --vulnerable 2>&1 | Tee-Object -FilePath $LogFile -Append
    dotnet list package --outdated 2>&1 | Tee-Object -FilePath $LogFile -Append
} catch {
    Write-Log "ERROR: Package vulnerability check exception: $_"
}

# 9. Project File Validation
Write-Log "`n=== Project File Validation ==="
try {
    $CsprojFiles = Get-ChildItem -Recurse -Filter "*.csproj" -Exclude "obj","bin"
    foreach ($File in $CsprojFiles) {
        Write-Log "Validating: $($File.FullName)"
        [xml]$Content = Get-Content $File.FullName
        if ($Content.Project.Sdk) {
            Write-Log "  SDK: $($Content.Project.Sdk)"
        }
        if ($Content.Project.PropertyGroup.TargetFramework) {
            Write-Log "  Target Framework: $($Content.Project.PropertyGroup.TargetFramework)"
        }
    }
} catch {
    Write-Log "ERROR: Project file validation exception: $_"
}

# 10. Publish Test
Write-Log "`n=== Publish Test ==="
try {
    $PublishPath = "./publish-test"
    if (Test-Path $PublishPath) {
        Remove-Item $PublishPath -Recurse -Force
    }
    
    dotnet publish ESimManager/ESimManager.csproj --configuration Release --runtime win-x64 --self-contained false --output $PublishPath 2>&1 | Tee-Object -FilePath $LogFile -Append
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "SUCCESS: Publish completed"
        $PublishedFiles = Get-ChildItem $PublishPath -Recurse | Measure-Object
        Write-Log "Published files count: $($PublishedFiles.Count)"
    } else {
        Write-Log "ERROR: Publish failed with exit code $LASTEXITCODE"
    }
    
    # Cleanup
    if (Test-Path $PublishPath) {
        Remove-Item $PublishPath -Recurse -Force
    }
} catch {
    Write-Log "ERROR: Publish test exception: $_"
}

# 11. System Error Logs Check
Write-Log "`n=== Windows Event Log Check (Application Errors) ==="
try {
    $RecentErrors = Get-EventLog -LogName Application -EntryType Error -Newest 5 -ErrorAction SilentlyContinue | 
        Where-Object { $_.Source -like "*dotnet*" -or $_.Source -like "*.NET*" }
    
    if ($RecentErrors) {
        foreach ($Error in $RecentErrors) {
            Write-Log "  [$($Error.TimeGenerated)] $($Error.Source): $($Error.Message.Substring(0, [Math]::Min(200, $Error.Message.Length)))"
        }
    } else {
        Write-Log "No recent .NET-related errors in Application log"
    }
} catch {
    Write-Log "Could not access Event Log: $_"
}

# 12. Final Summary
Write-Log "`n=== Final Summary ==="
Write-Log "Error check completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Log "Log file: $LogFile"

# Display summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Error Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Check the log file for details: $LogFile" -ForegroundColor Yellow
Write-Host ""

# Open log file
if (Test-Path $LogFile) {
    Write-Host "Opening log file..." -ForegroundColor Green
    Start-Process notepad.exe -ArgumentList $LogFile
}
