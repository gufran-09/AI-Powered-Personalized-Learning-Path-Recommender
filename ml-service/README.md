# ML Service — Adaptive Quiz Intelligence

Real-time ML inference service for the adaptive quiz engine. Predicts user skill levels, recommends optimal difficulty, and adapts quiz generation using XGBoost + LightGBM models.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │     │   Backend    │     │              │
│  React+Vite │     │  Express API │     │   Supabase   │
│  (UI only)  │     │ + Quiz Engine│────▶│  (Postgres)  │
└──────┬──────┘     └──────┬───────┘     └──────────────┘
       │                   │                     ▲
       └───────┬───────────┘                     │
               ▼                                 │
        ┌──────────────┐                         │
        │  ML Service   │─────────────────────────┘
        │  (FastAPI)    │
        └──────┬───────┘
          ┌────┴────┐
          │ Models  │
          │ XGBoost │
          │LightGBM │
          └─────────┘
```

## Models

| Model                  | Algorithm | Task                                   | Accuracy |
| ---------------------- | --------- | -------------------------------------- | -------- |
| Level Classifier       | XGBoost   | Predict beginner/intermediate/advanced | 99.95%   |
| Difficulty Recommender | LightGBM  | Recommend easy/medium/hard             | 97.45%   |

Both models use a **14-dimensional feature vector** computed from user answer history.

---

## Quick Start (Local Development)

### 1. Create virtual environment

```bash
cd ml-service

# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API_KEY=your_secret_api_key
DEBUG=true
LOG_LEVEL=debug
```

> **Note:** The ML service works without Supabase credentials — it falls back to rules-based predictions using default features. Supabase is only needed for live feature extraction from user history.

### 4. Train models

```bash
# Full pipeline: generate data + train both models
python -m training.train_all --rows 10000

# Or train individually:
python -m training.generate_data --rows 10000
python -m training.train_level_classifier
python -m training.train_difficulty_recommender
```

This creates two files in `models/`:
- `level_classifier.joblib` — XGBoost level classifier
- `difficulty_recommender.joblib` — LightGBM difficulty recommender

### 5. Start the server

```bash
# Development (auto-reload)
uvicorn app.main:app --reload --port 8000

# Or use the built-in runner
python -m app.main
```

The server starts at **http://localhost:8000**. Visit http://localhost:8000/docs for interactive Swagger UI.

### 6. Verify it works

```bash
# Health check (no auth needed)
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","models_loaded":{"level_classifier":true,"difficulty_recommender":true},"version":"1.0.0"}
```

---

## Using the API

All endpoints except `/health` require the `X-API-Key` header.

### Predict a user's level

```bash
curl -X POST http://localhost:8000/predict/level \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "topic_id": "topic-uuid-here"
  }'
```

Response:
```json
{
  "predicted_level": "intermediate",
  "confidence": 0.85,
  "probabilities": {"beginner": 0.1, "intermediate": 0.75, "advanced": 0.15},
  "model_used": "xgboost_v1",
  "features_used": null
}
```

### Get recommended difficulty

```bash
curl -X POST http://localhost:8000/predict/difficulty \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "topic_id": "topic-uuid-here"
  }'
```

### Get next question probabilities

```bash
curl -X POST http://localhost:8000/predict/next-question \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "topic_id": "topic-uuid-here",
    "candidate_difficulties": ["easy", "medium", "hard"]
  }'
```

Response:
```json
{
  "success_probabilities": {"easy": 0.92, "medium": 0.71, "hard": 0.35},
  "optimal_difficulty": "medium",
  "confidence": 0.75,
  "model_used": "rules_baseline"
}
```

The `optimal_difficulty` targets ~70% success probability (zone of proximal development).

### Batch predictions (multiple topics at once)

```bash
curl -X POST http://localhost:8000/predict/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "topic_ids": ["topic-1-uuid", "topic-2-uuid", "topic-3-uuid"]
  }'
```

### Pass pre-computed features (skip DB lookup)

If you already have the feature vector, pass it directly to skip the Supabase round-trip:

```bash
curl -X POST http://localhost:8000/predict/level \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key" \
  -d '{
    "user_id": "any",
    "topic_id": "any",
    "features": {
      "total_attempts": 50,
      "correct_attempts": 35,
      "accuracy": 0.7,
      "weighted_score": 28.5,
      "recent_accuracy": 0.8,
      "accuracy_trend": 0.1,
      "streak_length": 3,
      "avg_time_per_q": 18.0,
      "days_since_last": 1.5,
      "easy_accuracy": 0.95,
      "medium_accuracy": 0.7,
      "hard_accuracy": 0.35,
      "global_accuracy": 0.68,
      "topics_attempted": 8
    }
  }'
```

### Invalidate cache after quiz completion

```bash
# Specific topic
curl -X POST "http://localhost:8000/cache/invalidate?user_id=USER_UUID&topic_id=TOPIC_UUID" \
  -H "X-API-Key: your_secret_api_key"

# All topics for a user
curl -X POST "http://localhost:8000/cache/invalidate?user_id=USER_UUID" \
  -H "X-API-Key: your_secret_api_key"
```

### Check metrics

```bash
curl http://localhost:8000/metrics \
  -H "X-API-Key: your_secret_api_key"
```

---

## Using from JavaScript

Both the backend and frontend include an ML service client:

- **Backend** (full client): `backend/src/lib/mlService.js` — used by the quiz engine for difficulty predictions
- **Frontend** (simplified client): `frontend/src/lib/mlService.js` — used by UI components for health checks and level display

The backend client handles timeouts, auth, and graceful fallback automatically.

### Setup

Add to `ml-service/.env`:

```dotenv
API_KEY=your_secret_api_key
```

### Usage in components

```javascript
import { predictLevel, predictDifficulty, predictNextQuestion, predictBatch, checkHealth } from '../lib/mlService.js';

// Check if ML service is running
const health = await checkHealth();
console.log(health); // { status: "healthy", models_loaded: {...}, version: "1.0.0" }

// Predict user level
const level = await predictLevel(userId, topicId);
// { predicted_level: "intermediate", confidence: 0.85, probabilities: {...} }

// Get difficulty recommendation
const diff = await predictDifficulty(userId, topicId);
// { recommended_difficulty: "medium", predicted_success_prob: 0.72, confidence: 0.88 }

// Get success probabilities per difficulty
const next = await predictNextQuestion(userId, topicId);
// { success_probabilities: {easy: 0.92, medium: 0.71, hard: 0.35}, optimal_difficulty: "medium" }

// Batch predictions for quiz setup
const batch = await predictBatch(userId, [topicId1, topicId2, topicId3]);
// { predictions: [{ topic_id, predicted_level, recommended_difficulty, ... }, ...] }
```

**Every method returns `null` on failure** — the quiz engine never crashes if the ML service is down.

### How the quiz engine uses ML

The quiz generator (`backend/src/services/quizEngine/generateQuiz.js`) automatically integrates ML predictions:

1. **Quiz generation** — Calls `predictNextQuestion()` / `predictBatch()` to get optimal difficulty
2. **Difficulty blending** — ML recommendations are blended 60/40 with static blueprint distributions
3. **Graceful fallback** — If ML service is offline, uses static difficulty profiles unchanged
4. **Cache invalidation** — After quiz completion, `backend/src/services/quizEngine/finishAssessment.js` invalidates the ML feature cache

---

## Environment Variables

| Variable                    | Required | Default            | Description                                           |
| --------------------------- | -------- | ------------------ | ----------------------------------------------------- |
| `SUPABASE_URL`              | No*      | `""`               | Supabase project URL                                  |
| `SUPABASE_SERVICE_KEY`      | No*      | `""`               | Supabase service_role JWT                              |
| `API_KEY`                   | Yes      | `default_test_key` | API key for authenticating requests                   |
| `MODEL_DIR`                 | No       | `models`           | Directory containing trained model files              |
| `FEATURE_CACHE_TTL_SECONDS` | No       | `300`              | Feature cache TTL in seconds                          |
| `MIN_ANSWERS_FOR_ML`        | No       | `15`               | Minimum answers before using ML (falls back to rules) |
| `ALLOWED_ORIGINS`           | No       | `localhost:5173,3000` | CORS allowed origins (comma-separated)             |
| `DEBUG`                     | No       | `false`            | Enable debug logging and auto-reload                  |
| `LOG_LEVEL`                 | No       | `info`             | Log level: debug, info, warning, error                |

> \* Without Supabase credentials, the service returns rules-based predictions using default features. All endpoints still work.

---

## Docker

### Build and run

```bash
# Using docker-compose (recommended)
docker-compose up --build

# Or standalone
docker build -t ml-service .
docker run -p 8000:8000 --env-file .env ml-service
```

The Docker build trains models at build time, so the image is self-contained.

### docker-compose.yml

```yaml
version: "3.8"
services:
  ml-service:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - API_KEY=${ML_API_KEY:-default_test_key}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Requirements

- Docker Desktop must be running (`docker info` to verify)
- Port 8000 must be free

---

## Dual-Track Inference

The service uses a **rules baseline + ML model** approach:

| Condition             | Classifier Used | How It Works                              |
| --------------------- | --------------- | ----------------------------------------- |
| < 15 answers (cold)   | Rules baseline  | Laplace-smoothed accuracy with thresholds |
| ≥ 15 answers (warm)   | ML model        | XGBoost/LightGBM with feature vector      |
| Model load failure     | Rules baseline  | Automatic, transparent fallback           |
| Prediction error       | Rules baseline  | Caught and logged, never crashes          |

Rules thresholds (configurable via env):
- **Beginner**: accuracy < 0.50
- **Intermediate**: 0.50 ≤ accuracy < 0.75
- **Advanced**: accuracy ≥ 0.75

---

## Feature Vector (14 dimensions)

| #  | Feature            | Type  | Description                             |
| -- | ------------------ | ----- | --------------------------------------- |
| 1  | `total_attempts`   | int   | Total questions attempted on this topic |
| 2  | `correct_attempts` | int   | Total correct answers on this topic     |
| 3  | `accuracy`         | float | Overall accuracy (0–1)                  |
| 4  | `weighted_score`   | float | Difficulty-weighted cumulative score    |
| 5  | `recent_accuracy`  | float | Accuracy over last 10 answers           |
| 6  | `accuracy_trend`   | float | Recent – overall (positive = improving) |
| 7  | `streak_length`    | int   | Consecutive correct/incorrect count     |
| 8  | `avg_time_per_q`   | float | Average seconds per question            |
| 9  | `days_since_last`  | float | Days since last attempt on this topic   |
| 10 | `easy_accuracy`    | float | Accuracy on easy questions              |
| 11 | `medium_accuracy`  | float | Accuracy on medium questions            |
| 12 | `hard_accuracy`    | float | Accuracy on hard questions              |
| 13 | `global_accuracy`  | float | User's accuracy across all topics       |
| 14 | `topics_attempted` | int   | Number of distinct topics attempted     |

---

## Project Structure

```
ml-service/
├── app/
│   ├── main.py               # FastAPI endpoints (10 routes)
│   ├── config.py              # Pydantic settings from .env
│   ├── schemas.py             # Request/response models
│   ├── security.py            # API key authentication
│   ├── feature_engineering.py # 14-dim feature extraction + caching
│   ├── inference.py           # Dual-track prediction (rules + ML)
│   ├── model_loader.py        # Model registry & loading
│   └── metrics.py             # Prediction tracking & DB logging
├── training/
│   ├── generate_data.py       # Synthetic data generator (3 archetypes)
│   ├── train_level_classifier.py   # XGBoost training
│   ├── train_difficulty_recommender.py  # LightGBM training
│   └── train_all.py           # Full pipeline entry point
├── models/                    # Trained model artifacts (.joblib)
├── data/                      # Training data (CSV)
├── tests/                     # pytest test suite (40 tests)
├── Dockerfile                 # Python 3.13 + train at build time
├── docker-compose.yml         # Single-service compose
├── requirements.txt           # Pinned dependencies
└── .env                       # Local environment config
```

---

## Testing

```bash
# All tests (40)
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Specific module
pytest tests/test_api.py -v         # 15 API endpoint tests
pytest tests/test_inference.py -v   # 13 inference logic tests
pytest tests/test_feature_engineering.py -v  # 8 feature tests
```

The test suite covers: endpoint auth, health checks, level classification rules, difficulty recommendations, feature vector validation, cache invalidation, and model predictions.

---

## Retraining Models

To retrain with more or different data:

```bash
# Regenerate data with more rows
python -m training.generate_data --rows 50000

# Retrain everything
python -m training.train_all --rows 50000 --force-regen

# Or retrain a single model
python -m training.train_level_classifier --data data/training_data.csv
python -m training.train_difficulty_recommender --data data/training_data.csv
```

Models are saved as `.joblib` bundles containing:
- Trained model
- Label encoder
- Feature names list
- Version string
- Training metrics

The service automatically loads new models on restart (or after retrain trigger endpoint).

