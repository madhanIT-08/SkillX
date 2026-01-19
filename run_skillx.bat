@echo off
echo Starting SkillX Website...

:: Start Backend
start cmd /k "cd server && npm run server"

:: Start Frontend
start cmd /k "cd client && npm run dev"

echo SkillX is launching!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
