@echo off
title Build BedrockServerManager-Setup.exe
echo ===================================================
echo  Building Native Windows Installer Executable
echo ===================================================
echo.
set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo Error: C# compiler not found at %CSC%
    exit /b 1
)

echo Compiling installer\Installer.cs ...
"%CSC%" /target:winexe /out:..\BedrockServerManager-Setup.exe /win32icon:..\tray\app.ico /r:System.dll,System.Drawing.dll,System.Windows.Forms.dll,System.Core.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll Installer.cs

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo  SUCCESS: BedrockServerManager-Setup.exe built!
    echo ===================================================
) else (
    echo.
    echo Error during compilation.
    exit /b 1
)
