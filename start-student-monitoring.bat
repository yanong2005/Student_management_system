@echo off
setlocal
set "ROOT=%~dp0"
set "URL=http://127.0.0.1:8000/"
set "PHP="

where php >nul 2>&1
if not errorlevel 1 set "PHP=php"
if not defined PHP if exist "C:\xampp\php\php.exe" set "PHP=C:\xampp\php\php.exe"
if not defined PHP (
    echo PHP was not found.
    echo Install PHP or start XAMPP so C:\xampp\php\php.exe exists.
    pause
    exit /b 1
)

if /i not "%~1"=="--debug" (
    wscript.exe "%ROOT%run-student-monitoring.vbs"
    exit /b 0
)

powershell -NoProfile -Command "$listener = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if ($listener) { exit 0 } else { exit 1 }"
if errorlevel 1 (
    echo Starting Student Monitoring at %URL%
    start "Student Monitoring PHP Server" /min /d "%ROOT%" "%PHP%" -S 0.0.0.0:8000 -t "%ROOT%"
    set "READY="
    for /l %%N in (1,1,20) do (
        if not defined READY (
            powershell -NoProfile -Command "try { $response = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
            if not errorlevel 1 set "READY=1"
        )
        if not defined READY ping 127.0.0.1 -n 2 >nul
    )
    if not defined READY (
        echo The server did not become ready at %URL%
        echo Check that port 8000 is available and PHP can run.
        pause
        exit /b 1
    )
) else (
    echo Student Monitoring is already running at %URL%
)

start "" "%URL%"
endlocal
