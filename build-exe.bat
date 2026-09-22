@echo off
chcp 65001 >nul
title កំពុងខ្ចប់កម្មវិធីគ្រប់គ្រងពិន្ទុមត្តេយ្យជា File Setup .exe...
cls
echo =========================================================================
echo   ប្រព័ន្ធគ្រប់គ្រងពិន្ទុសិស្សថ្នាក់មត្តេយ្យភាសាចិន (培华学校)
echo   ដំណើរការខ្ចប់កម្មវិធីជា Setup Installer (.exe) និង Portable (.exe)
echo =========================================================================
echo.

echo [1/3] ត្រួតពិនិត្យ Node.js & Dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] មិនទាន់រកឃើញ Node.js លើកុំព្យូទ័រនេះឡើយ!
    pause
    exit /b
)

if not exist "node_modules" (
    echo [INFO] កំពុងដំឡើង dependencies តាមរយៈ npm install...
    call npm install
)

echo.
echo [2/3] កំពុងដំណើរការ electron-builder ខ្ចប់ជា File Setup .exe...
call npx electron-builder --win

echo.
if %errorlevel% equ 0 (
    echo =========================================================================
    echo   [ជោគជ័យ] កម្មវិធីត្រូវបានខ្ចប់រួចរាល់ ១០០%%!
    echo   ទីតាំងឯកសារ៖ ថត "dist\" ក្នុង Folder គម្រោងនេះ
    echo =========================================================================
    if exist "dist" (
        explorer dist
    )
) else (
    echo [បរាជ័យ] មានបញ្ហាក្នុងដំណើរការ Build! សូមពិនិត្យ Error Message ខាងលើ។
)

echo.
pause
