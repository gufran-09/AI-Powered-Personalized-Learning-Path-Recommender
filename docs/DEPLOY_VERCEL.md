# Deploying AdaptIQ to Vercel

This guide covers deploying all three AdaptIQ services using Vercel.

---

## Architecture Overview

| Service        | Tech           | Vercel Project Type           |
| -------------- | -------------- | ----------------------------- |
| **Frontend**   | React + Vite   | Static Site (Vite framework)  |
| **Backend**    | Express.js     | Serverless Functions          |
| **ML Service** | Python FastAPI | Serverless Functions (Python) |

Each service is deployed as a **separate Vercel project** from the same monorepo.

---

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
- A [Supabase](https://supabase.com) project with tables already migrated (see `sql/migrations/`)
- Your repo pushed to GitHub/GitLab/Bitbucket

---

## 1. Frontend (React + Vite)

### 1a. Add `vercel.json` to `frontend/`

Create `frontend/vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The `rewrites` rule ensures client-side routing (React Router) works on all paths.

### 1b. Set Environment Variables

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

| Variable                 | Value                         | Example                                    |
| ------------------------ | ----------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL     | `your_supabase_project_url` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key      | `eyJhbGci...`                              |
| `VITE_API_URL`           | Deployed backend URL + `/api` | `https://adaptiq-backend.vercel.app/api`   |
| `VITE_ML_API_URL`        | Deployed ML service URL       | `https://adaptiq-ml.vercel.app`            |
| `VITE_ML_API_KEY`        | ML service API key            | `your_ml_api_key`                          |

### 1c. Deploy

```bash
cd frontend
vercel --prod
```

Or connect the repo on Vercel Dashboard:

- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 2. Backend (Express.js → Serverless)

Vercel runs Express apps as serverless functions. You need a small adapter file.

### 2a. Create `backend/api/index.js`

```js
// Vercel serverless adapter — re-exports the Express app
import app from "../src/api/server.js";
export default app;
```

### 2b. Add `vercel.json` to `backend/`

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2c. Update `server.js` for Serverless Compatibility

The existing `app.listen()` call is harmless on Vercel (it's ignored), but make sure the
`export default app` at the bottom of `server.js` is present — it already is.

### 2d. Set Environment Variables

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

| Variable                 | Value                                         |
| ------------------------ | --------------------------------------------- |
| `SUPABASE_URL`           | `your_supabase_project_url`    |
| `SUPABASE_SERVICE_KEY`   | Your Supabase `service_role` key (secret!)    |
| `VITE_SUPABASE_URL`      | Same as `SUPABASE_URL` (the code checks both) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key                             |
| `VITE_ML_API_URL`        | Deployed ML service URL                       |
| `VITE_ML_API_KEY`        | ML API key                                    |

> **Security**: Never expose `SUPABASE_SERVICE_KEY` to the frontend. Only set it on the backend project.

### 2e. Deploy

```bash
cd backend
vercel --prod
```

Or via Dashboard:

- **Root Directory**: `backend`
- **Framework Preset**: Other
- **Build Command**: _(leave empty)_
- **Output Directory**: _(leave empty)_

### 2f. CORS Configuration

After deploying the frontend and backend, update `server.js` CORS to allow your frontend domain:

```js
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://adaptiq-frontend.vercel.app", // your frontend domain
    ],
    credentials: true,
  }),
);
```

Or set a `CORS_ORIGIN` env var and read it dynamically.

---

## 3. ML Service (Python FastAPI → Serverless)

### 3a. Create `ml-service/api/index.py`

```python
# Vercel serverless adapter for FastAPI
from app.main import app as handler
```

### 3b. Add `vercel.json` to `ml-service/`

Create `ml-service/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.py"
    }
  ]
}
```

> **Note**: The `maxLambdaSize` is set to 50 MB because ML model files (`models/*.joblib`)
> and dependencies (scikit-learn, xgboost, lightgbm) are large. If you exceed the limit,
> consider deploying the ML service on **Railway**, **Render**, or **Fly.io** instead (see
> [Alternative: ML on Railway](#alternative-ml-service-on-railway) below).

### 3c. Add `requirements.txt` to `ml-service/`

Already exists. Vercel's Python runtime reads it automatically.

### 3d. Set Environment Variables

| Variable          | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| `API_KEY`         | Your ML service API key                                                  |
| `ALLOWED_ORIGINS` | `https://adaptiq-frontend.vercel.app,https://adaptiq-backend.vercel.app` |
| `ENVIRONMENT`     | `production`                                                             |

### 3e. Deploy

```bash
cd ml-service
vercel --prod
```

---

## Alternative: ML Service on Railway

If the ML service exceeds Vercel's 50 MB Lambda size limit (likely with xgboost + lightgbm):

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your repo, set root directory to `ml-service/`
3. Railway auto-detects the `Dockerfile` and builds it
4. Set environment variables: `API_KEY`, `ALLOWED_ORIGINS`
5. Railway provides a public URL like `https://adaptiq-ml.up.railway.app`
6. Use that URL as `VITE_ML_API_URL` in the frontend and backend env vars

---

## Post-Deployment Checklist

### Update Frontend Env Vars

Once you have all three deployed URLs, update the **frontend** project env vars:

```
VITE_API_URL=https://adaptiq-backend.vercel.app/api
VITE_ML_API_URL=https://adaptiq-ml.vercel.app
```

Then redeploy the frontend: `vercel --prod` in `frontend/`.

### Verify Everything Works

```bash
# 1. Backend health
curl https://adaptiq-backend.vercel.app/api/health

# 2. ML health
curl https://adaptiq-ml.vercel.app/health

# 3. Frontend loads
open https://adaptiq-frontend.vercel.app
```

### Supabase Configuration

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://adaptiq-frontend.vercel.app`
- **Redirect URLs**: Add `https://adaptiq-frontend.vercel.app/**`

This ensures password reset emails and OAuth redirects go to your deployed frontend.

---

## Environment Variables Reference

### Frontend (`frontend/`)

| Variable                 | Required | Description                                                           |
| ------------------------ | -------- | --------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Yes      | Supabase project URL                                                  |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anon (public) key                                            |
| `VITE_API_URL`           | Yes      | Backend API base URL (e.g., `https://adaptiq-backend.vercel.app/api`) |
| `VITE_ML_API_URL`        | No       | ML service URL (defaults to `http://localhost:8000`)                  |
| `VITE_ML_API_KEY`        | No       | ML API key (defaults to `default_test_key`)                           |

### Backend (`backend/`)

| Variable                 | Required | Description                               |
| ------------------------ | -------- | ----------------------------------------- |
| `SUPABASE_URL`           | Yes      | Supabase project URL                      |
| `SUPABASE_SERVICE_KEY`   | Yes      | Supabase service_role key (**secret**)    |
| `VITE_SUPABASE_URL`      | Yes      | Same as `SUPABASE_URL` (code checks both) |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anon key                         |
| `VITE_ML_API_URL`        | No       | ML service URL                            |
| `VITE_ML_API_KEY`        | No       | ML API key                                |
| `PORT`                   | No       | Server port (Vercel ignores this)         |

### ML Service (`ml-service/`)

| Variable          | Required | Description                  |
| ----------------- | -------- | ---------------------------- |
| `API_KEY`         | Yes      | API authentication key       |
| `ALLOWED_ORIGINS` | No       | Comma-separated CORS origins |
| `ENVIRONMENT`     | No       | `production` / `development` |

---

## Monorepo Tip: Multiple Projects from One Repo

Since all three services live in one repo, create **three separate Vercel projects** pointing to the same repo, each with a different **Root Directory**:

| Vercel Project     | Root Directory |
| ------------------ | -------------- |
| `adaptiq-frontend` | `frontend`     |
| `adaptiq-backend`  | `backend`      |
| `adaptiq-ml`       | `ml-service`   |

Vercel only rebuilds a project when files under its root directory change.

---

## Troubleshooting

| Issue                    | Fix                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **404 on page refresh**  | Ensure `rewrites` rule is in `frontend/vercel.json`                                                                            |
| **CORS errors**          | Add your Vercel frontend domain to backend CORS config                                                                         |
| **502 on backend**       | Check Vercel function logs; likely a missing env var                                                                           |
| **ML service too large** | Deploy ML on Railway/Render instead of Vercel                                                                                  |
| **Auth redirects fail**  | Update Supabase "Redirect URLs" to include your Vercel domain                                                                  |
| **"Cannot find module"** | Ensure `package.json` has all deps in `dependencies` (not just `devDependencies`) — move `dotenv` to `dependencies` in backend |
