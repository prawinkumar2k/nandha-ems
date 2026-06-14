<#
.SYNOPSIS
NEClms Silent Installer & Deployment Script for Labs.
#>

param (
    [string]$InstallerPath = "\\SERVER\Deploy\NEClms Secure Client Setup.exe",
    [string]$LabIPRange = "192.168.100.0/24"
)

Write-Host "Starting Mass Deployment for Lab $LabIPRange"

# 1. Kill any existing instances
Stop-Process -Name "NEClms-Exam" -Force -ErrorAction SilentlyContinue

# 2. Execute Silent Install
# The /S flag is standard for NSIS installers to run without GUI
Write-Host "Installing NEClms Client..."
Start-Process -FilePath $InstallerPath -ArgumentList "/S" -Wait -NoNewWindow

# 3. Apply Registry Lockdown Policies
Write-Host "Applying Exam Policies..."
& ".\Lockdown-LabPC.ps1"

Write-Host "Deployment Completed Successfully on $env:COMPUTERNAME."
