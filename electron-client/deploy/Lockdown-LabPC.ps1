# Requires Run as Administrator
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as an Administrator!"
    Exit
}

Write-Host "Initiating NEClms Lab PC Lockdown Sequence..." -ForegroundColor Cyan

# 1. Disable Task Manager
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Name "DisableTaskMgr" -Value 1 -Force -ErrorAction SilentlyContinue

# 2. Disable Command Prompt
Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\System" -Name "DisableCMD" -Value 1 -Force -ErrorAction SilentlyContinue

# 3. Disable Registry Editor
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System" -Name "DisableRegistryTools" -Value 1 -Force -ErrorAction SilentlyContinue

# 4. Disable USB Storage Devices (Read Only)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies" -Name "WriteProtect" -Value 1 -Force -ErrorAction SilentlyContinue

# 5. Disable Action Center and Notifications
Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\Explorer" -Name "DisableNotificationCenter" -Value 1 -Force -ErrorAction SilentlyContinue

# 6. Auto-Start NEClms Electron Client on Boot
$exePath = "C:\Program Files\NEClms Secure Client\NEClms-Exam.exe"
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "NEClmsSecureExam" -Value "`"$exePath`" --kiosk" -Force

# 7. Disable Windows Key Shortcuts (Win+R, Win+X, etc.)
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "NoWinKeys" -Value 1 -Force -ErrorAction SilentlyContinue

Write-Host "Lockdown Sequence Complete. Reboot Required." -ForegroundColor Green
