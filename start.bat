@echo off
setlocal enabledelayedexpansion
title MatchMind 🏟️
color 0A

echo ╔══════════════════════════════════════════════╗
echo ║        🏟️  MatchMind — Launch Pad           ║
echo ║     Starting Frontend + Backend Servers      ║
echo ╚══════════════════════════════════════════════╝
echo.

:: ─── Root directory (where this batch file lives) ───
set "ROOT_DIR=%~dp0"

:: ─── Check for Node.js ───
where node > nul 2>&1
if errorlevel 1 (
    echo [!] Node.js is not installed or not in PATH.
    echo     Download it from: https://nodejs.org/
    pause
    exit /b 1
)

:: ─── Check for Docker (needed for PostgreSQL + Redis) ───
where docker > nul 2>&1
if errorlevel 1 (
    echo [!] Docker is not installed or not in PATH.
    echo     Download from: https://www.docker.com/products/docker-desktop/
    echo.
    echo     Alternatively, you can start PostgreSQL and Redis manually.
    pause
    exit /b 1
)

:: ─── Check Docker daemon is running ───
docker info > nul 2>&1
if errorlevel 1 (
    echo [!] Docker Desktop is not running.
    echo     Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo     Waiting for Docker to be ready...
    :wait_docker
    timeout /t 5 /nobreak > nul
    docker info > nul 2>&1
    if errorlevel 1 goto wait_docker
    echo     Docker is ready ✓
)

:: ─── Check if backend/.env.example exists ───
if not exist "%ROOT_DIR%backend\.env.example" (
    echo [!] backend/.env.example not found.
    echo     The project may be incomplete. Check that the file exists.
    pause
    exit /b 1
)

:: ─── Check/create backend/.env ───
if not exist "%ROOT_DIR%backend\.env" (
    echo [1/7] Creating backend/.env from template...
    copy "%ROOT_DIR%backend\.env.example" "%ROOT_DIR%backend\.env" > nul
    if errorlevel 1 (
        echo [!] Could not create .env file. Create backend/.env manually.
        pause
        exit /b 1
    )
    echo [1/7] backend/.env created ✓
) else (
    echo [1/7] backend/.env found ✓
)

:: ─── Start Docker containers (PostgreSQL on port 5433 + Redis) ───
echo [2/7] Starting Docker containers (PostgreSQL + Redis)...
cd /d "%ROOT_DIR%"
docker compose up -d 2>&1
if errorlevel 1 (
    echo [!] Failed to start Docker containers.
    echo     Make sure Docker Desktop is running and try again.
    pause
    exit /b 1
)

:: ─── Wait for PostgreSQL to be healthy (up to 60 seconds) ───
echo [2/7] Waiting for PostgreSQL to be ready...
set db_retries=0
:wait_for_db
docker exec matchmind-db pg_isready -U matchmind > nul 2>&1
if errorlevel 1 (
    set /a db_retries+=1
    if !db_retries! gtr 20 (
        echo [!] PostgreSQL failed to start after 60 seconds.
        echo     Check Docker logs: docker logs matchmind-db
        pause
        exit /b 1
    )
    timeout /t 3 /nobreak > nul
    goto wait_for_db
)
echo [2/7] Docker containers ready ✓

:: ─── Install dependencies ───
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [3/7] Installing frontend dependencies...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    if errorlevel 1 (
        echo [!] Frontend npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [3/7] Frontend dependencies found ✓
)

if not exist "%ROOT_DIR%backend\node_modules" (
    echo [4/7] Installing backend dependencies...
    cd /d "%ROOT_DIR%backend"
    call npm install
    if errorlevel 1 (
        echo [!] Backend npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [4/7] Backend dependencies found ✓
)

:: ─── Generate Prisma client ───
echo [5/7] Generating Prisma client...
cd /d "%ROOT_DIR%backend"
call npx prisma generate 2>&1
if errorlevel 1 (
    echo [!] Prisma generate failed — see error above.
    pause
    exit /b 1
)
echo [5/7] Prisma client generated ✓

:: ─── Push database schema ───
echo [6/7] Pushing database schema...
cd /d "%ROOT_DIR%backend"
call node scripts/push-schema.js 2>&1
if errorlevel 1 (
    echo [!] Schema push failed.
    echo     Check that PostgreSQL container is running: docker ps
    pause
    exit /b 1
)
echo [6/7] Schema pushed ✓

:: ─── Seed database (skip if already seeded) ───
echo [7/7] Checking database state...
docker exec matchmind-db psql -U matchmind -d matchmind -t -A -c "SELECT count(*) FROM \"User\"" > "%TEMP%\matchmind_user_count.txt" 2>&1
set /p user_count=<"%TEMP%\matchmind_user_count.txt"
del "%TEMP%\matchmind_user_count.txt" 2>nul

if "%user_count%"=="0" (
    echo [7/7] Seeding database with demo data...
    cd /d "%ROOT_DIR%backend"
    call node scripts/seed-db.js 2>&1
    if errorlevel 1 (
        echo [!] Seeding failed. You may need to seed manually.
    ) else (
        echo [7/7] Database seeded ✓
    )
) else (
    echo [7/7] Database already has data — skipping seed ✓
)

:: ─── Launch both servers in separate windows ───
echo.
echo ─── Launching servers... ──────────────────────────

:: Start backend (API server on port 4000)
start "MatchMind Backend" cmd /k "cd /d "%ROOT_DIR%backend" && echo [Backend] MatchMind API server starting... && echo [Backend] Port: 4000 && echo. && npm run dev"

:: Small delay so backend starts first
timeout /t 3 /nobreak > nul

:: Start frontend (Vite dev server on port 3000)
start "MatchMind Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && echo [Frontend] MatchMind UI starting... && echo [Frontend] Port: 3000 && echo. && npm run dev"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║     ✅  Servers are starting up!            ║
echo ║                                            ║
echo ║     Frontend:  http://localhost:3000        ║
echo ║     Backend:   http://localhost:4000        ║
echo ║     Health:    http://localhost:4000/api/health ║
echo ║                                            ║
echo ║     Docker PostgreSQL on port 5433          ║
echo ║     Docker Redis on port 6379               ║
echo ║                                            ║
echo ║     Demo login: demo@matchmind.gg           ║
echo ║     Password:   password123                 ║
echo ║                                            ║
║     Close this window to keep servers       ║
echo ║     running in their own windows.           ║
echo ╚══════════════════════════════════════════════╝
echo.

:: Open frontend in browser
start http://localhost:3000

echo Press any key to close this launcher (servers will keep running)...
pause > nul
