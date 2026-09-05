@echo off
setlocal
set "PORT=8000"
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R /C:"IPv4 Address" /C:"IPv4-Adresse"') do (
    set "IP=%%A"
    goto :found
)
:found
set "IP=%IP: =%"
if not defined IP (
    echo Could not find the computer's local IPv4 address.
    echo Run ipconfig and use the Wi-Fi IPv4 Address.
    pause
    exit /b 1
)
echo.
echo Open this address on your phone:
echo http://%IP%:%PORT%/
echo.
echo The phone and computer must use the same Wi-Fi network.
echo Keep the Student Monitoring server running.
echo.
echo If the phone still cannot connect, allow PHP through Windows Firewall on Private networks.
echo.
echo Press any key to copy the address to the clipboard.
pause >nul
echo http://%IP%:%PORT%/ | clip
endlocal
