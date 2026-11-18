@echo off
rem Wrapper for update-eruda.js (route 2: inject F:\eruda\dist\eruda.js into whistle.inspect).
rem Double-click to run with defaults; args are forwarded to update-eruda.js.
setlocal
chcp 65001 >nul
node "%~dp0update-eruda.js" %*
set "EXITCODE=%errorlevel%"
echo.
if not "%EXITCODE%"=="0" (
  echo FAILED ^(exit code %EXITCODE%^)
) else (
  echo Done.
)
rem Keep the window open for double-click runs (no args); stay silent in scripted use.
if "%~1"=="" pause
exit /b %EXITCODE%
