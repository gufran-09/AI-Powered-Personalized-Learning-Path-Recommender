# ML Service API Documentation

Base URL: `http://localhost:8000`

All endpoints (except `/health`) require the `X-API-Key` header.

---

## Authentication

All authenticated endpoints require:

```
X-API-Key: <your-api-key>
```

Responses:

- `401 Unauthorized` — Missing API key
- `403 Forbidden` — Invalid API key

---

## Endpoints

### `GET /health`

Health check (no auth required).

**Response 200:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_loaded": {
    "level_classifier": true,
    "difficulty_recommender": true
  },
  "uptime_seconds": 123.4
}
```

---

### `POST /predict`

Generic prediction (backward-compatible with original mlService.js client).

**Request:**

```json
{
  "user_id": "uuid",
  "topic_id": "uuid",
  "prediction_type": "level",
  "features": {}
}
```

`prediction_type`: `"level"` | `"difficulty"` | `"next_question"`

**Response 200:**

```json
{
  "predicted_level": "intermediate",
  "recommended_difficulty": "medium",
  "confidence": 0.85,
  "model_used": "xgboost_v1",
  "probabilities": {
    "beginner": 0.1,
    "intermediate": 0.75,
    "advanced": 0.15
  }
}
```

---

### `POST /predict/level`

Predict user skill level for a topic.

**Request:**

```json
{
  "user_id": "uuid",
  "topic_id": "uuid",
  "features": {}
}
```

`features` is optional — if omitted, the service computes them from Supabase.

**Response 200:**

```json
{
  "predicted_level": "intermediate",
  "confidence": 0.85,
  "probabilities": {
    "beginner": 0.1,
    "intermediate": 0.75,
    "advanced": 0.15
  },
  "model_used": "xgboost_v1"
}
```

---

### `POST /predict/difficulty`

Get recommended difficulty for the next question.

**Request:**

```json
{
  "user_id": "uuid",
  "topic_id": "uuid",
  "features": {}
}
```

**Response 200:**

```json
{
  "recommended_difficulty": "medium",
  "predicted_success_prob": 0.72,
  "confidence": 0.88,
  "model_used": "lightgbm_v1"
}
```

---

### `POST /predict/next-question`

Get success probabilities per difficulty level (for question selection).

**Request:**

```json
{
  "user_id": "uuid",
  "topic_id": "uuid",
  "candidate_difficulties": ["easy", "medium", "hard"],
  "features": {}
}
```

**Response 200:**

```json
{
  "success_probabilities": {
    "easy": 0.92,
    "medium": 0.71,
    "hard": 0.35
  },
  "optimal_difficulty": "medium",
  "model_used": "rules_baseline"
}
```

The `optimal_difficulty` targets ~70% success probability (zone of proximal development).

---

### `POST /predict/batch`

Batch predictions for multiple topics.

**Request:**

```json
{
  "user_id": "uuid",
  "topic_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response 200:**

```json
{
  "predictions": [
    {
      "topic_id": "uuid1",
      "predicted_level": "intermediate",
      "optimal_difficulty": "medium",
      "confidence": 0.85
    },
    {
      "topic_id": "uuid2",
      "predicted_level": "beginner",
      "optimal_difficulty": "easy",
      "confidence": 0.92
    }
  ]
}
```

---

### `GET /features/{user_id}/{topic_id}`

Get computed feature vector for a user-topic pair.

**Response 200:**

```json
{
  "total_attempts": 45,
  "correct_attempts": 32,
  "accuracy": 0.711,
  "weighted_score": 28.5,
  "recent_accuracy": 0.8,
  "accuracy_trend": 0.089,
  "streak_length": 3,
  "avg_time_per_q": 18.2,
  "days_since_last": 2.5,
  "easy_accuracy": 0.95,
  "medium_accuracy": 0.7,
  "hard_accuracy": 0.35,
  "global_accuracy": 0.68,
  "topics_attempted": 8
}
```

---

### `POST /cache/invalidate`

Invalidate ML feature cache after new answers.

**Query params:** `user_id` (required), `topic_id` (optional)

**Response 200:**

```json
{
  "invalidated": true,
  "user_id": "uuid",
  "topic_id": "uuid"
}
```

---

### `GET /metrics`

Get service metrics (prediction counts, latencies, model performance).

**Response 200:**

```json
{
  "total_predictions": 1234,
  "predictions_by_model": {
    "level_classifier": 600,
    "difficulty_recommender": 634
  },
  "avg_latency_ms": {
    "level_classifier": 12.3,
    "difficulty_recommender": 8.7
  },
  "uptime_seconds": 3600
}
```

---

### `POST /retrain/trigger`

Trigger model retraining (async, returns immediately).

**Response 200:**

```json
{
  "status": "triggered",
  "message": "Retraining started in background"
}
```

---

## Feature Vector (14 dimensions)

| #   | Feature            | Type  | Description                             |
| --- | ------------------ | ----- | --------------------------------------- |
| 1   | `total_attempts`   | int   | Total questions attempted on this topic |
| 2   | `correct_attempts` | int   | Total correct answers on this topic     |
| 3   | `accuracy`         | float | Overall accuracy (0–1)                  |
| 4   | `weighted_score`   | float | Difficulty-weighted cumulative score    |
| 5   | `recent_accuracy`  | float | Accuracy over last 10 answers           |
| 6   | `accuracy_trend`   | float | Recent – overall (positive = improving) |
| 7   | `streak_length`    | int   | Consecutive correct/incorrect count     |
| 8   | `avg_time_per_q`   | float | Average seconds per question            |
| 9   | `days_since_last`  | float | Days since last attempt on this topic   |
| 10  | `easy_accuracy`    | float | Accuracy on easy questions              |
| 11  | `medium_accuracy`  | float | Accuracy on medium questions            |
| 12  | `hard_accuracy`    | float | Accuracy on hard questions              |
| 13  | `global_accuracy`  | float | User's accuracy across all topics       |
| 14  | `topics_attempted` | int   | Number of distinct topics attempted     |

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error description"
}
```

| Status | Meaning                                    |
| ------ | ------------------------------------------ |
| 400    | Bad request (missing fields, invalid type) |
| 401    | Missing API key                            |
| 403    | Invalid API key                            |
| 422    | Validation error (Pydantic)                |
| 500    | Internal server error                      |
