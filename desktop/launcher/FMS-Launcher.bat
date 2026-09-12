@echo off
chcp 65001 >nul
title Faculty Management System (FMS)
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0"
set "NODE_EXE=%ROOT_DIR%bin\node\node.exe"
set "PG_DIR=%ROOT_DIR%bin\pgsql"
set "PG_DATA=%ROOT_DIR%data\db"
set "APP_DIR=%ROOT_DIR%app"
set "PORT=3010"
set "PG_PORT=54332"
set "PG_USER=postgres"
set "DB_NAME=fms_offline_db"
set "DATABASE_URL=postgresql://%PG_USER%@127.0.0.1:%PG_PORT%/%DB_NAME%"

echo ========================================================
echo   ระบบบริหารจัดการคณะ (Faculty Management System - FMS)
echo   กำลังเริ่มต้นระบบบนเครื่องคอมพิวเตอร์ของคุณ...
echo ========================================================

:: 1. ตรวจสอบ Node.js
if not exist "%NODE_EXE%" (
    where node >nul 2>nul
    if !errorlevel! equ 0 (
        set "NODE_EXE=node"
    ) else (
        echo [ข้อผิดพลาด] ไม่พบ Node.js ในระบบ กรุณาตรวจสอบโฟลเดอร์ bin\node
        pause
        exit /b 1
    )
)

:: 2. ตรวจสอบและเริ่มต้น Portable PostgreSQL
if exist "%PG_DIR%\bin\pg_ctl.exe" (
    echo [1/3] กำลังเตรียมฐานข้อมูล PostgreSQL...
    if not exist "%PG_DATA%\PG_VERSION" (
        echo [ติดตั้งครั้งแรก] กำลังสร้างคลังข้อมูลเริ่มต้น (initdb)...
        "%PG_DIR%\bin\initdb.exe" -D "%PG_DATA%" -U %PG_USER% -A trust -E UTF8 >nul 2>&1
    )

    :: ตรวจสอบว่า PostgreSQL รันอยู่หรือไม่
    "%PG_DIR%\bin\pg_ctl.exe" -D "%PG_DATA%" status >nul 2>&1
    if !errorlevel! neq 0 (
        echo กำลังสตาร์ทฐานข้อมูล PostgreSQL ที่พอร์ต %PG_PORT%...
        "%PG_DIR%\bin\pg_ctl.exe" -D "%PG_DATA%" -o "-p %PG_PORT%" -l "%ROOT_DIR%data\postgres.log" start >nul 2>&1
        timeout /t 2 /nobreak >nul
    )

    :: ตรวจสอบว่ามีฐานข้อมูล fms_offline_db หรือยัง ถ้ายังให้สร้าง
    "%PG_DIR%\bin\psql.exe" -U %PG_USER% -p %PG_PORT% -lqt | findstr /C:"%DB_NAME%" >nul 2>&1
    if !errorlevel! neq 0 (
        echo กำลังสร้างฐานข้อมูล %DB_NAME%...
        "%PG_DIR%\bin\createdb.exe" -U %PG_USER% -p %PG_PORT% %DB_NAME% >nul 2>&1
        echo กำลังสร้างตารางและนำเข้าข้อมูลตั้งต้น...
        if exist "%ROOT_DIR%desktop\runtime\init-db.js" (
            set "DATABASE_URL=%DATABASE_URL%"
            "%NODE_EXE%" "%ROOT_DIR%desktop\runtime\init-db.js" >nul 2>&1
        )
    )
)

:: 3. สตาร์ท Next.js Standalone Server
echo [2/3] กำลังเปิดเซิร์ฟเวอร์ระบบ FMS...
set "PORT=%PORT%"
set "HOSTNAME=127.0.0.1"
set "NODE_ENV=production"
set "DATABASE_URL=%DATABASE_URL%"

:: เช็คว่ารันอยู่แล้วหรือไม่
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul 2>&1
if !errorlevel! neq 0 (
    start "FMS-Server" /b "%NODE_EXE%" "%APP_DIR%\server.js"
)

:: 4. รอจนกว่าเซิร์ฟเวอร์จะพร้อม
echo [3/3] กำลังเปิดหน้าต่างโปรแกรม...
set /a retries=0
:wait_server
timeout /t 1 /nobreak >nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:%PORT%' -UseBasicParsing -TimeoutSec 1; exit 0 } catch { exit 1 }" >nul 2>&1
if !errorlevel! neq 0 (
    set /a retries+=1
    if !retries! leq 20 goto wait_server
)

:: 5. เปิดหน้าต่างแอปพลิเคชัน (Edge App Mode)
set "APP_URL=http://127.0.0.1:%PORT%"

:: ลองเปิดผ่าน Microsoft Edge ใน App Mode (หน้าต่างเดี่ยว ไร้แถบ URL เสมือนโปรแกรม Desktop จริง)
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="%APP_URL%" --window-size=1366,840
    exit /b 0
)

:: หากไม่มี Edge ลอง Google Chrome App Mode
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --app="%APP_URL%" --window-size=1366,840
    exit /b 0
)

:: กรณีสุดท้าย เปิดใน Browser ค่าเริ่มต้น
start "" "%APP_URL%"
exit /b 0
