# eSIM Manager - Automated Setup, Build, and Install Script
# This script automates the entire build environment setup, compilation, and installation

param(
    [switch]$SkipInstall,
    [switch]$Release
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "eSIM Manager - Automated Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check .NET SDK
Write-Host "Checking .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    Write-Host "✓ .NET SDK $dotnetVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ .NET SDK not found. Please install .NET 8 SDK from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}

# Navigate to project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host ""
Write-Host "Project Root: $projectRoot" -ForegroundColor Cyan

# Restore dependencies
Write-Host ""
Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore esim-manager.sln
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to restore packages" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Packages restored successfully" -ForegroundColor Green

# Build configuration
$configuration = if ($Release) { "Release" } else { "Debug" }
Write-Host ""
Write-Host "Building project ($configuration)..." -ForegroundColor Yellow
dotnet build esim-manager.sln --configuration $configuration --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green

# Run tests
Write-Host ""
Write-Host "Running tests..." -ForegroundColor Yellow
dotnet test esim-manager.sln --configuration $configuration --no-build --verbosity quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Some tests failed" -ForegroundColor Yellow
} else {
    Write-Host "✓ All tests passed" -ForegroundColor Green
}

# Publish application
if ($Release) {
    Write-Host ""
    Write-Host "Publishing application..." -ForegroundColor Yellow
    $publishPath = "$projectRoot\publish"
    dotnet publish ESimManager\ESimManager.csproj `
        --configuration Release `
        --output $publishPath `
        --self-contained false `
        --runtime win-x64
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Publish failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Application published to: $publishPath" -ForegroundColor Green
}

# Installation
if (-not $SkipInstall -and $Release) {
    Write-Host ""
    Write-Host "Installing application..." -ForegroundColor Yellow
    $installPath = "$env:LOCALAPPDATA\Programs\ESimManager"
    
    if (Test-Path $installPath) {
        Remove-Item -Path $installPath -Recurse -Force
    }
    
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null
    Copy-Item -Path "$publishPath\*" -Destination $installPath -Recurse -Force
    
    Write-Host "✓ Application installed to: $installPath" -ForegroundColor Green
    
    # Create desktop shortcut
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\eSIM Manager.lnk")
    $Shortcut.TargetPath = "$installPath\ESimManager.exe"
    $Shortcut.WorkingDirectory = $installPath
    $Shortcut.Description = "NexoraSIM eSIM Manager"
    $Shortcut.Save()
    
    Write-Host "✓ Desktop shortcut created" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build process completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

if ($Release -and -not $SkipInstall) {
    Write-Host ""
    Write-Host "You can now launch eSIM Manager from your desktop or from:" -ForegroundColor Cyan
    Write-Host "$env:LOCALAPPDATA\Programs\ESimManager\ESimManager.exe" -ForegroundColor White
}
