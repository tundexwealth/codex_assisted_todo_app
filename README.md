# Daymark

A small personal productivity app with todos, notes, and a Pomodoro focus timer.

## Run locally

1. In `backend/`, create a virtual environment, install `requirements.txt`, and start the API:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   .\.venv\Scripts\python.exe -m uvicorn main:app --reload
   ```

2. In `frontend/`, install packages and start Vite:

   ```powershell
   npm install
   npm run dev
   ```

3. Open <http://localhost:5173>. FastAPI serves the API at <http://localhost:8000> and its interactive docs at <http://localhost:8000/docs>.

Locally, todos and notes are stored in `backend/todo_app.db` (created on first run). The Pomodoro timer runs in the browser and offers 15, 25, and 45 minute sessions.

## Build the frontend

From `frontend/`, run `npm run build`.

## Deploy to Vercel

The root `vercel.json` configures the `frontend/` and `backend/` folders as Vercel Services and routes `/api/*` requests to FastAPI. In the Vercel project settings, choose **Services** as the Framework Preset. Keep the project root at the repository root.

Vercel Functions cannot persist a SQLite database file. Before deploying, create a managed PostgreSQL database and add its connection URL as the `DATABASE_URL` environment variable in Vercel (for Production and Preview as needed). The backend uses PostgreSQL when `DATABASE_URL` is set and SQLite for local development. The deployed database starts empty; the SQLite file on your computer is not uploaded or migrated.
