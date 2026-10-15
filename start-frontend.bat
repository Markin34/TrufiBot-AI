@echo off
echo.
echo  ========================================
echo   WAYRA ^| Frontend (Next.js)
echo  ========================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [1/2] Instalando dependencias npm...
    npm install
)

echo.
echo  Iniciando Next.js en http://localhost:3000
echo.
npm run dev
