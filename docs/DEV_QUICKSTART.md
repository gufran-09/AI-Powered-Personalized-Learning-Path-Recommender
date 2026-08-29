# Dev Quickstart — Run AdaptIQ Locally

Get the full stack running on your machine in ~10 minutes.

---

## Prerequisites

| Tool       | Version | Check              | Install                                         |
| ---------- | ------- | ------------------ | ----------------------------------------------- |
| Node.js    | 18+     | `node -v`          | [nodejs.org](https://nodejs.org/)               |
| npm        | 9+      | `npm -v`           | Ships with Node.js                              |
| Python     | 3.11+   | `python --version` | [python.org](https://www.python.org/downloads/) |
| Git        | any     | `git --version`    | [git-scm.com](https://git-scm.com/)            |

You also need a **Supabase** project — [create one for free](https://supabase.com/dashboard).

---

## 1. Clone the Repo

```bash
git clone <your-repo-url>
cd App
```

---

## 2. Database Setup

Open **Supabase Dashboard → SQL Editor → New Query** and execute each migration file **in order**:

| Order | File                            | What it does                         |
| ----- | ------------------------------- | ------------------------------------ |
| 1     | `sql/migrations/001_tables.sql` | Creates all tables (assessments, questions, topics, etc.) |
| 2     | `sql/migrations/002_rpc_functions.sql` | Atomic RPC functions used by the quiz engine |
| 3     | `sql/migrations/003_indexes.sql` | Performance indexes                  |
| 4     | `sql/migrations/004_seed_data.sql` | Seeds 10 subjects, 66 topics, 240 questions |
| 5     | `sql/migrations/005_ml_data_logging.sql` | ML feature-logging tables *(optional)* |

**Tip:** Copy-paste each file's contents into the SQL Editor and click **Run**. Wait for each to complete before running the next.

---

## 3. Environment Variables

Grab your keys from **Supabase Dashboard → Settings → API**.

### 3a. Root `.env` (used by backend)

Create `App/.env`:

```dotenv
# Supabase — browser-safe anon key
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Supabase — server-only service-role key (bypasses RLS)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key

# ML service connection (backend → ML)
VITE_ML_API_URL=http://localhost:8000
VITE_ML_API_KEY=pick_a_secret_key
```

### 3b. Frontend `.env`

Create `frontend/.env`:

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
VITE_API_URL=http://localhost:3000/api
VITE_ML_API_URL=http://localhost:8000
VITE_ML_API_KEY=pick_a_secret_key
```

### 3c. ML Service `.env`

Create `ml-service/.env`:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key
API_KEY=pick_a_secret_key
```

> **Important:** The `API_KEY` in `ml-service/.env` must match `VITE_ML_API_KEY` in the other `.env` files — both services use this shared secret.

---

## 4. Install Dependencies

### Frontend

```bash
cd frontend
npm install
cd ..
```

### Backend

```bash
cd backend
npm install
cd ..
```

### ML Service

```bash
cd ml-service
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
.\.venv\Scripts\activate.bat

# macOS / Linux
source .venv/bin/activate
```

Then install packages:

```bash
pip install -r requirements.txt
```

---

## 5. Train ML Models (First Time Only)

With the venv activated, from inside `ml-service/`:

```bash
python -m training.train_all --rows 10000
```

This takes ~30 seconds and produces:

```
models/
├── level_classifier.joblib           # XGBoost — classifies beginner/intermediate/advanced
└── difficulty_recommender.joblib     # LightGBM — recommends next-question difficulty
```

You only need to re-run this if you change the training pipeline.

---

## 6. Start All Services

Open **three terminals** and start each service. Order matters — ML first, then backend, then frontend.

### Terminal 1 — ML Service (port 8000)

```bash
cd ml-service
.\.venv\Scripts\Activate.ps1    # Windows
# source .venv/bin/activate     # macOS/Linux
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 — Backend API (port 3000)

```bash
cd backend
npm run dev
```

### Terminal 3 — Frontend (port 5173)

```bash
cd frontend
npm run dev
```

---

## 7. Verify Everything Is Running

### Health Checks

```bash
# ML Service
curl http://localhost:8000/health
# → {"status":"healthy","models_loaded":{"level_classifier":true,"difficulty_recommender":true}}

# Backend
curl http://localhost:3000/api/health
# → {"status":"healthy","service":"quiz-engine"}
```

Or in PowerShell:

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:3000/api/health
```

### Frontend

Open **http://localhost:5173** in your browser, sign up, and start a quiz.

---

## 8. Running Tests

### Backend Tests (Jest — 38 tests)

```bash
cd backend
npm test
```

> Uses `--experimental-vm-modules` flag (already configured in `package.json`). Always use `npm test`, not `npx jest` directly.

### ML Service Tests (Pytest — 40 tests)

```bash
cd ml-service
.\.venv\Scripts\Activate.ps1    # activate venv first
pytest tests/ -v
```

### With Coverage

```bash
# Backend
cd backend
npm run test:coverage

# ML Service
cd ml-service
pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## Common Workflows

### Creating a Test User

1. Open **http://localhost:5173/signup**
2. Enter any email, full name, and password (min 8 chars)
3. Supabase will create the auth user and a `profiles` row automatically

### Taking a Quiz

1. Log in → click **Start Quiz** on Dashboard
2. Pick a subject and assessment type:
   - **Diagnostic** — 10 questions across all topics in that subject
   - **Practice** — 5 questions in one specific topic
   - **Retest** — Focuses on your weakest topics
3. Answer questions → view results with ML insights

### Re-seeding Questions

If you need to reset or add more questions:

```bash
cd backend
node scripts/seed_questions.js
```

---

## Environment Variable Reference

| Variable                 | Used By    | Description                          |
| ------------------------ | ---------- | ------------------------------------ |
| `VITE_SUPABASE_URL`     | FE, BE     | Supabase project URL                 |
| `VITE_SUPABASE_ANON_KEY`| FE, BE     | Supabase anon/public key             |
| `SUPABASE_URL`          | BE, ML     | Supabase project URL (server-side)   |
| `SUPABASE_SERVICE_KEY`  | BE, ML     | Supabase service_role key            |
| `VITE_API_URL`          | FE         | Backend API base URL                 |
| `VITE_ML_API_URL`       | FE, BE     | ML service base URL                  |
| `VITE_ML_API_KEY`       | FE, BE     | Shared API key for ML service        |
| `API_KEY`               | ML         | ML service inbound API key           |
| `PORT`                  | BE         | Backend listen port (default `3000`) |

---

## Project Ports

| Service     | Default Port | URL                      |
| ----------- | ------------ | ------------------------ |
| Frontend    | 5173         | http://localhost:5173    |
| Backend     | 3000         | http://localhost:3000    |
| ML Service  | 8000         | http://localhost:8000    |

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `SUPABASE_URL not set` | Create the `.env` files from Step 3 |
| `ECONNREFUSED :3000` | Start the backend: `cd backend && npm run dev` |
| `ECONNREFUSED :8000` | Start the ML service (see Terminal 1 above) |
| ML predictions are `null` | Normal — quiz engine falls back to rules when ML is offline or the user has < 15 answers |
| `No questions available` | Run migration `004_seed_data.sql` in Supabase SQL Editor |
| Frontend shows blank page | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env` |
| `column ... does not exist` | Run all 5 migration files in order |
| Backend port already in use | Kill the process: `npx kill-port 3000` or find/kill via Task Manager |
| Python venv not found | Re-create it: `python -m venv .venv` inside `ml-service/` |
| `ModuleNotFoundError` in ML | Activate the venv first, then `pip install -r requirements.txt` |
| Jest `ERR_VM_MODULE` | Use `npm test` (not `npx jest`) — the flag is in package.json scripts |
| Signup works but login fails | Supabase may require email confirmation — disable it in Dashboard → Auth → Settings |

---

## Folder Structure at a Glance

```
App/
├── frontend/              React + Vite + Tailwind (port 5173)
│   ├── src/
│   │   ├── pages/         Page components (Dashboard, Quiz, Results, etc.)
│   │   ├── components/    Shared UI components
│   │   ├── context/       Auth & Theme providers
│   │   ├── hooks/         Custom React hooks
│   │   └── lib/           API clients (Supabase, backend, ML)
│   └── .env               Frontend env vars
│
├── backend/               Express API + Quiz Engine (port 3000)
│   ├── src/
│   │   ├── api/           Express routes (server.js, assessmentRoutes.js)
│   │   ├── services/      Business logic (achievements, dashboard, quiz engine)
│   │   └── lib/           Backend ML client
│   ├── tests/             Jest test suites
│   └── .env               → reads from root .env
│
├── ml-service/            Python FastAPI + ML models (port 8000)
│   ├── app/               FastAPI application (inference, features, security)
│   ├── training/          Model training scripts
│   ├── models/            Trained .joblib model files
│   ├── tests/             Pytest test suites
│   └── .env               ML service env vars
│
├── sql/migrations/        Supabase database migrations (run in order)
├── docs/                  Documentation
└── .env                   Root env vars (used by backend)
```

---

## Next Steps

- **Deploy to production** → see [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
- **Quiz engine internals** → see [QUIZ_ENGINE.md](QUIZ_ENGINE.md)
- **ML API reference** → see [../ml-service/API_DOCUMENTATION.md](../ml-service/API_DOCUMENTATION.md)
