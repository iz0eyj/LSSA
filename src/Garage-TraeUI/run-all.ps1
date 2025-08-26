# Esegue install, build e avvio di frontend (preview) e backend in parallelo
# Si posiziona automaticamente nella cartella di questo script
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

Write-Host "==> Installo tutte le dipendenze (root + workspaces)..." -ForegroundColor Cyan
npm run install:all

Write-Host "==> Build frontend + backend..." -ForegroundColor Cyan
npm run build

Write-Host "==> Avvio backend + preview frontend in parallelo..." -ForegroundColor Green
npm run start:all