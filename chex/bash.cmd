@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0package-site-shim.ps1" %*
