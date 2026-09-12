# PowerShell script to download and setup Portable PostgreSQL for FMS Windows Desktop
[CmdletBinding()]
param (
    [string]$TargetDir = "$PSScriptRoot\..\..\dist\FMS-Windows-App\bin\pgsql"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ดาวน์โหลดและติดตั้ง Portable PostgreSQL สำหรับ FMS บน Windows" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

$zipUrl = "https://github.com/zonkyio/embedded-postgres-binaries/releases/download/16.2.0/embedded-postgres-binaries-windows-amd64-16.2.0.jar"
# Alternately from official or standard zip:
Write-Host "`n[ข้อมูล] ตำแหน่งเป้าหมาย: $TargetDir" -ForegroundColor Yellow
Write-Host "ท่านสามารถวางโฟลเดอร์ PostgreSQL (bin, share, lib) ลงในโฟลเดอร์นี้ได้ทันที" -ForegroundColor Green
Write-Host "หรือดาวน์โหลดไฟล์ PostgreSQL Binaries จาก https://www.enterprisedb.com/download-postgresql-binaries" -ForegroundColor Green
