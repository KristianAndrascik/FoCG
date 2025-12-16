@echo off
echo ==========================================
echo      1. Cleaning & Creating Build Folder
echo ==========================================

REM Optional: Remove old build to ensure a fresh start (Uncomment if needed)
REM if exist build rd /s /q build

if not exist build mkdir build
cd build

echo.
echo ==========================================
echo      2. Configuring (CMake)
echo ==========================================
REM This tells CMake to generate the project files
cmake ..
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake Configuration failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo      3. Compiling (Build)
echo ==========================================
REM This compiles the actual .exe
cmake --build . --config Debug
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo      4. Running Ray Tracer
echo ==========================================
REM Navigate to where Visual Studio puts the executable
cd Debug

REM Run and save to image.ppm in the main folder
raytracer.exe > ..\..\image.ppm

echo [SUCCESS] Image generated at image.ppm
pause