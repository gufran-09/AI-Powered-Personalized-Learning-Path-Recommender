# AdaptIQ – Adaptive Learning Platform

[![Vercel Deploy](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel)](https://adapt--iq.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Live Demo
[Live URL](https://adapt--iq.vercel.app/)

---

## 📖 Overview
AdaptIQ is an **AI‑powered adaptive quiz platform** that personalises question difficulty in real‑time using machine‑learning models trained on user performance data. It consists of three tightly integrated services:

- **Frontend** – React + Vite, Tailwind CSS, dark/light theme, animated UI.
- **Backend** – Express API with Supabase for persistence, authentication and quiz logic.
- **ML Service** – FastAPI serving XGBoost / LightGBM models for difficulty prediction and level classification.

All services communicate through a **Supabase PostgreSQL** database which stores users, questions, quiz sessions and model‑derived features.

---

## 🏗️ Architecture
```mermaid
flowchart TD
    subgraph Client[Client (Browser)]
        FE[React Frontend (Vite)]
    end
    subgraph Backend[Backend Service]
        API[Express API] -->|REST| SupabaseDB[(Supabase Postgres)]
    end
    subgraph ML[ML Service]
        MLAPI[FastAPI] -->|RPC| SupabaseDB
    end
    FE -->|HTTPS| API
    FE -->|HTTPS| MLAPI
    API -->|Calls| MLAPI
    style Client fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Backend fill:#e0f7fa,stroke:#333,stroke-width:2px
    style ML fill:#fff3e0,stroke:#333,stroke-width:2px
```

---

## 🛠️ Tech Stack
| Service   | Technologies                              |
|----------|-------------------------------------------|
| Frontend | React 18, Vite 5, Tailwind CSS, Framer Motion |
| Backend  | Node.js, Express 4, Supabase JS, Jest   |
| ML       | Python 3.11, FastAPI, XGBoost, LightGBM  |
| Database | Supabase (PostgreSQL)                     |

---

## ✨ Key Features
- **Adaptive Quiz Engine** – three assessment types (Diagnostic, Practice, Retest) with non‑repeating questions.
- **Personalised Difficulty** – ML models predict optimal difficulty; fallback to rule‑based logic.
- **User‑Level Classification** – Laplace‑smoothed accuracy determines Beginner / Intermediate / Advanced.
- **Real‑time Recommendations** – dynamic study paths based on weak topics.
- **Dark / Light Theme** – system‑preferred theming.
- **Responsive UI** – Tailwind utilities and Shadcn components ensure a mobile‑first experience.
- **Analytics Dashboard** – visualise performance with Recharts.
- **Supabase Auth** – secure email/password login.

---

## 📦 Project Structure
```
App/
├─ backend/          # Express API + quiz engine (port 3000)
│   ├─ src/
│   │   ├─ api/          # API endpoints (bookings, categories, …)
│   │   ├─ lib/          # Business logic utilities
│   │   └─ services/     # Service layer
│   └─ tests/           # Backend unit tests (38 tests)
├─ frontend/         # React UI (port 5173)
│   ├─ src/
│   └─ public/
├─ ml-service/       # FastAPI ML inference (port 8000)
│   ├─ app/
│   ├─ training/        # Model training scripts
│   └─ tests/           # ML unit tests (40 tests)
├─ sql/               # Supabase migrations
├─ docs/              # Technical documentation
│   ├─ DEV_QUICKSTART.md
│   ├─ DEPLOY_VERCEL.md
│   └─ QUIZ_ENGINE.md
└─ README.md          # <-- this file
```

---

## ⚙️ Getting Started
### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Supabase** account (free tier works)
- **Git**

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd App
```
### 2️⃣ Set up Supabase
1. Create a new Supabase project.
2. Copy the API URL and anon/service keys.
3. Run the SQL migrations in the order listed in `sql/migrations/` (see **Database Setup** below).

### 3️⃣ Environment variables
```bash
# Root .env (used by backend)
cp .env.example .env
# Frontend .env (symlink or copy from root)
cp .env frontend/.env
# ML Service .env
cp ml-service/.env.example ml-service/.env
```
Edit the files with your Supabase credentials.

### 4️⃣ Install dependencies
```bash
# Frontend
cd frontend && npm install && cd ..
# Backend
cd backend && npm install && cd ..
# ML Service
cd ml-service && python -m venv venv && .\\venv\\Scripts\\activate && pip install -r requirements.txt && cd ..
```
### 5️⃣ Train ML models (first run only)
```bash
cd ml-service
.\\venv\\Scripts\\activate   # Windows
# macOS/Linux: source venv/bin/activate
python -m training.train_all --rows 10000
cd ..
```
### 6️⃣ Run the services (three terminals)
```bash
# Terminal 1 – ML Service
cd ml-service && .\\venv\\Scripts\\activate && uvicorn app.main:app --reload --port 8000

# Terminal 2 – Backend API
cd backend && npm run dev   # serves on http://localhost:3000

# Terminal 3 – Frontend UI
cd frontend && npm run dev  # serves on http://localhost:5173
```
---

## 🧪 Running Tests
```bash
# Backend
cd backend && npm test

# ML Service
cd ml-service && .\\venv\\Scripts\\activate && pytest tests/ -v
```
Or run all from the project root (scripts defined in `package.json`).
---

## 📚 Documentation
- **[DEV_QUICKSTART.md](file:///d:/Mass-Mutual/App/docs/DEV_QUICKSTART.md)** – quick local setup guide.
- **[DEPLOY_VERCEL.md](file:///d:/Mass-Mutual/App/docs/DEPLOY_VERCEL.md)** – deploying all services to Vercel.
- **[QUIZ_ENGINE.md](file:///d:/Mass-Mutual/App/docs/QUIZ_ENGINE.md)** – deep dive into the quiz engine, DB schema and API.
- **[ml-service/API_DOCUMENTATION.md](file:///d:/Mass-Mutual/App/ml-service/API_DOCUMENTATION.md)** – full ML service API reference.
---

## 🚢 Deployment
The project is ready for **Vercel** – each service has its own Vercel project with environment variables configured. Follow the steps in `docs/DEPLOY_VERCEL.md`.
---

## 🛡️ Troubleshooting
| Problem | Solution |
|---------|----------|
| `SUPABASE_URL not set` | Create a `.env` with your Supabase keys (see **Environment variables**). |
| ML service returns `null` predictions | Ensure the ML service is running; the backend will fallback to rule‑based difficulty. |
| `ECONNREFUSED :3000` | Start the backend (`cd backend && npm run dev`). |
| Docker build fails | Verify Docker Desktop is running (`docker info`). |
| No questions available | Run `sql/migrations/004_seed_data.sql` in Supabase. |
| Frontend auth errors | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`. |
---

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Follow the coding standards in `.eslintrc` and run `npm run lint`.
4. Write tests for new code.
5. Open a Pull Request – CI will run lint, tests and preview deployment.
---

## 📄 License
This project is licensed under the **MIT License** – see the `LICENSE` file.

---

*Generated by Antigravity – your AI coding assistant, delivering premium documentation.*
