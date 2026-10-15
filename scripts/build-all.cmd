@echo off
echo ========================================================
echo  [1/4] Building Website Production Bundle...
echo ========================================================
call npm run build
if %errorlevel% neq 0 (
    echo Error during npm run build!
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo  [2/4] Syncing Assets to Android Native Project...
echo ========================================================
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error during cap sync android!
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo  [3/4] Compiling Android APK with JDK 21...
echo ========================================================
set "JAVA_HOME=C:\Users\visha\.jdks\jdk-21.0.12.1+1"
set "ANDROID_HOME=C:\Users\visha\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd android
call gradlew.bat assembleDebug
set GRADLE_ERR=%errorlevel%
cd ..

if %GRADLE_ERR% neq 0 (
    echo Error during gradlew assembleDebug!
    exit /b %GRADLE_ERR%
)

echo.
echo ========================================================
echo  [4/4] Updating NutriScan-AI-Latest.apk...
echo ========================================================
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "NutriScan-AI-Latest.apk"

echo.
echo ========================================================
echo  SUCCESS: Both Website and Android APK Updated!
echo  APK Path: NutriScan-AI-Latest.apk
echo ========================================================
