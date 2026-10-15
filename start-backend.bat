@echo off
echo.
echo  ========================================
echo   WAYRA ^| Backend (FastAPI)
echo  ========================================
echo.

cd /d "%~dp0backend"

if not exist "venv\Scripts\activate.bat" (
    echo [1/3] Creando entorno virtual...
    python -m venv venv
)

echo [2/3] Activando entorno virtual...
call venv\Scripts\activate.bat

echo [3/3] Instalando dependencias...
pip install -r requirements.txt --quiet

echo.
echo  Iniciando FastAPI en http://localhost:8000
echo  Swagger UI: http://localhost:8000/docs
echo.
uvicorn main:socket_app --reload --port 8000 --host 0.0.0.0
