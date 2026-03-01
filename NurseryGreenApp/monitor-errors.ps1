# ============================================================
# NurseryGreen App - Live Error Monitor
# ============================================================
# Usage:  .\monitor-errors.ps1
#         .\monitor-errors.ps1 -Interval 10     (check every 10s)
#         .\monitor-errors.ps1 -ShowWarnings     (include warnings)
#         .\monitor-errors.ps1 -ShowInfoLogs     (include ReactNativeJS info logs)
# Press Ctrl+C to stop.
# ============================================================

param(
    [int]$Interval = 5,
    [switch]$ShowWarnings,
    [switch]$ShowInfoLogs
)

$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"

$appPackage = "com.nurserygreen.app"
$divider = "=" * 60
$thinDivider = "-" * 60

function Write-Error-Line($msg)   { Write-Host $msg -ForegroundColor Red }
function Write-Warning-Line($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Info-Line($msg)    { Write-Host $msg -ForegroundColor Cyan }
function Write-Success-Line($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Dim-Line($msg)     { Write-Host $msg -ForegroundColor DarkGray }

function Get-AppPid {
    $pidText = (& adb shell pidof $appPackage 2>$null)
    if (-not $pidText) {
        return ""
    }
    return $pidText.ToString().Trim()
}

Clear-Host
Write-Host ""
Write-Host $divider -ForegroundColor Green
Write-Host "  NURSERY GREEN  -  Live Error Monitor" -ForegroundColor Green
Write-Host $divider -ForegroundColor Green
Write-Host ""

try {
    $devices = (& adb devices 2>&1) | Select-String "emulator|device$"
    if (-not $devices) {
        Write-Error-Line "  No Android device/emulator connected."
        Write-Error-Line "  Start the emulator first, then rerun this script."
        exit 1
    }
    Write-Success-Line ("  Device: {0}" -f $devices[0].ToString().Trim())
}
catch {
    Write-Error-Line "  adb not found. Set ANDROID_HOME or install Android SDK."
    exit 1
}

$appPid = Get-AppPid
if ($appPid) {
    Write-Success-Line ("  App PID: {0}" -f $appPid)
}
else {
    Write-Warning-Line "  App not running yet - will detect when it starts."
}

$warningMode = "Errors only"
if ($ShowWarnings) {
    $warningMode = "Warnings ON"
}
Write-Info-Line ("  Checking every {0}s | {1} | Ctrl+C to stop" -f $Interval, $warningMode)
Write-Host $divider -ForegroundColor Green
Write-Host ""

$errorCount = 0
$warningCount = 0
$checkCount = 0
$startTime = Get-Date
$lastAppPid = $appPid

& adb logcat -c 2>$null

try {
    while ($true) {
        $checkCount++
        $now = Get-Date -Format "HH:mm:ss"

        $currentPid = Get-AppPid
        if ($currentPid -ne $lastAppPid) {
            if ($currentPid) {
                Write-Info-Line ("[{0}] App (re)started - PID: {1}" -f $now, $currentPid)
                & adb logcat -c 2>$null
            }
            elseif ($lastAppPid) {
                Write-Warning-Line ("[{0}] App stopped (PID {1} gone)" -f $now, $lastAppPid)
            }
            $lastAppPid = $currentPid
        }

        if (-not $currentPid) {
            Write-Dim-Line ("[{0}] Waiting for app to start..." -f $now)
            Start-Sleep -Seconds $Interval
            continue
        }

        $rawLogs = & adb logcat -d -v time 2>&1

        $jsErrors = $rawLogs | Select-String "ReactNativeJS.*E " |
            Where-Object { $_.ToString() -notmatch "ViewManagerPropertyUpdater" }

        $nativeCrashes = $rawLogs | Select-String "AndroidRuntime.*E " |
            Where-Object { $_.ToString() -match "$appPackage|$currentPid" }

        $rnErrors = $rawLogs | Select-String "${currentPid}.*E unknown:ReactNative:" |
            Where-Object { $_.ToString() -notmatch "ViewManagerPropertyUpdater|ImeTracker" }

        $expoErrors = $rawLogs | Select-String "${currentPid}.*E.*ExpoModulesCore"
        $formDataErrors = $rawLogs | Select-String "FormData.*doesn't exist"
        $windowErrors = $rawLogs | Select-String "Property 'window' doesn't exist|ReferenceError: Property 'window'"
        $redBoxErrors = $rawLogs | Select-String "${currentPid}.*RedBox|${currentPid}.*LogBox"

        $allErrors = @()
        if ($jsErrors) { $allErrors += $jsErrors }
        if ($nativeCrashes) { $allErrors += $nativeCrashes }
        if ($rnErrors) { $allErrors += $rnErrors }
        if ($expoErrors) { $allErrors += $expoErrors }
        if ($formDataErrors) { $allErrors += $formDataErrors }
        if ($windowErrors) { $allErrors += $windowErrors }
        if ($redBoxErrors) { $allErrors += $redBoxErrors }

        $uniqueErrors = @($allErrors | Sort-Object -Unique)

        $allWarnings = @()
        if ($ShowWarnings) {
            $jsWarnings = $rawLogs | Select-String "ReactNativeJS.*W " |
                Where-Object { $_.ToString() -notmatch "ViewManagerPropertyUpdater|Require cycle" }
            if ($jsWarnings) {
                $allWarnings += $jsWarnings
            }
        }

        if ($ShowInfoLogs) {
            $jsLogs = $rawLogs | Select-String "ReactNativeJS.*I "
            if ($jsLogs) {
                foreach ($log in $jsLogs) {
                    Write-Dim-Line ("  [LOG] {0}" -f $log.ToString().Trim())
                }
            }
        }

        if ($uniqueErrors.Count -gt 0) {
            $errorCount += $uniqueErrors.Count
            Write-Host ""
            Write-Error-Line ("[{0}] === {1} ERROR(S) DETECTED ===" -f $now, $uniqueErrors.Count)
            Write-Host $thinDivider -ForegroundColor Red
            foreach ($err in $uniqueErrors) {
                $line = $err.ToString().Trim()
                if ($line -match "ReactNativeJS") {
                    Write-Error-Line ("  [JS] {0}" -f $line)
                }
                elseif ($line -match "AndroidRuntime") {
                    Write-Error-Line ("  [CRASH] {0}" -f $line)
                }
                elseif ($line -match "FormData|window") {
                    Write-Error-Line ("  [POLYFILL] {0}" -f $line)
                }
                else {
                    Write-Error-Line ("  [NATIVE] {0}" -f $line)
                }
            }
            Write-Host $thinDivider -ForegroundColor Red
            Write-Host ""
            & adb logcat -c 2>$null
        }

        if ($allWarnings.Count -gt 0) {
            $warningCount += $allWarnings.Count
            foreach ($warn in $allWarnings) {
                Write-Warning-Line ("  [WARN] {0}" -f $warn.ToString().Trim())
            }
            & adb logcat -c 2>$null
        }

        if (($checkCount % 12) -eq 0) {
            $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
            if ($errorCount -eq 0) {
                Write-Success-Line ("[{0}] OK - {1}m elapsed, 0 errors (check #{2})" -f $now, $elapsed, $checkCount)
            }
            else {
                Write-Warning-Line ("[{0}] {1}m elapsed, {2} total errors (check #{3})" -f $now, $elapsed, $errorCount, $checkCount)
            }
        }

        if (($checkCount % 6) -eq 0) {
            try {
                $null = Invoke-WebRequest -Uri "http://localhost:8081/status" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            }
            catch {
                Write-Warning-Line ("[{0}] Metro bundler not responding on :8081" -f $now)
            }
        }

        if (($uniqueErrors.Count -eq 0) -and ($allWarnings.Count -eq 0)) {
            & adb logcat -c 2>$null
        }

        Start-Sleep -Seconds $Interval
    }
}
finally {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    Write-Host ""
    Write-Host $divider -ForegroundColor Cyan
    Write-Info-Line ("  Monitor stopped after {0} minutes" -f $elapsed)
    Write-Info-Line ("  Checks: {0} | Errors: {1} | Warnings: {2}" -f $checkCount, $errorCount, $warningCount)
    Write-Host $divider -ForegroundColor Cyan
    Write-Host ""
}
