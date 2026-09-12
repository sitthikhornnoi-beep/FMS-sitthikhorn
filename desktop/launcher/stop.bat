@echo off
chcp 65001 >nul
title Stop Faculty Management System (FMS)
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0"
set "PG_DIR=%ROOT_DIR%bin\pgsql"
set "PG_DATA=%ROOT_DIR%data\db"
set "PORT=3010"

echo ========================================================
echo   กำลังปิดการทำงานของระบบ FMS และฐานข้อมูล...
echo ========================================================

:: 1. หยุด Next.js Standalone
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. หยุด PostgreSQL
if exist "%PG_DIR%\bin\pg_ctl.exe" (
    "%PG_DIR%\bin\pg_ctl.exe" -D "%PG_DATA%" stop -m fast >nul 2>&1
)

echo ปิดระบบ FMS เรียบร้อยแล้ว.
timeout /t 2 /nobreak >nul
