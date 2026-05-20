$desktopPath = [Environment]::GetFolderPath("Desktop")
$lnkName = [char]0x4E2D + [char]0x56FD + [char]0x8282 + [char]0x5047 + [char]0x65E5 + [char]0x65E5 + [char]0x5386 + ".lnk"
$lnkPath = Join-Path $desktopPath $lnkName

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($lnkPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = """e:\TRAE SOLO CN\launch.vbs"""
$Shortcut.WorkingDirectory = "e:\TRAE SOLO CN"
$Shortcut.IconLocation = "e:\TRAE SOLO CN\public\app-icon.ico,0"
$Shortcut.Save()
Write-Host "Shortcut updated with icon: $($Shortcut.IconLocation)"

$localAppData = [Environment]::GetFolderPath("LocalApplicationData")
$iconCachePath = Join-Path $localAppData "IconCache.db"
if (Test-Path $iconCachePath) {
    Remove-Item $iconCachePath -Force -ErrorAction SilentlyContinue
    Write-Host "IconCache.db cleared"
}

$explorerDir = Join-Path $localAppData "Microsoft\Windows\Explorer"
if (Test-Path $explorerDir) {
    Get-ChildItem $explorerDir -Filter "iconcache_*" | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Explorer icon cache cleared"
}

Add-Type -Namespace Win32 -Name API -MemberDefinition '[DllImport("user32.dll")] public static extern bool SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);'
$result = [UIntPtr]::Zero
[Win32.API]::SendMessageTimeout([IntPtr]0xffff, 0x001a, [UIntPtr]::Zero, $null, 0x0002, 5000, [ref]$result)
Write-Host "Desktop refreshed"
