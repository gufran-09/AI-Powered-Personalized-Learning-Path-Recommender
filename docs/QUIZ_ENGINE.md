# Quiz Engine & ML Logic - Technical Documentation

> **Version**: 2.0.0  
> **Location**: `backend/src/services/quizEngine/`  
> **Last Updated**: June 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [API Reference](#api-reference)
6. [Architecture](#architecture)
7. [Testing](#testing)
8. [Acceptance Checklist](#acceptance-checklist)

---

## Overview

The Quiz Engine is a dynamic, adaptive assessment system that:

- **Generates non-repeating quizzes** with configurable difficulty distribution
- **Records answers atomically** using PostgreSQL RPC functions
- **Classifies user proficiency** using Laplace-smoothed accuracy metrics
- **Returns personalized recommendations** based on weak topics
- **Supports three assessment types**: diagnostic, practice, and retest

### Key Features

| Feature                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| Repeat Avoidance         | Questions seen in last 30 days are deprioritized     |
| Atomic Updates           | FOR UPDATE locking prevents race conditions          |
| Level Smoothing          | Laplace smoothing prevents level oscillation         |
| Multi-level Subjects     | Topics have beginner/intermediate/advanced resources |
| Single-playlist Subjects | Some subjects have only subject-level resources      |

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the **project root** (backend reads from `../.env`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

### 3. Run Database Migrations

Execute in order via **Supabase Dashboard → SQL Editor**:

```
sql/migrations/001_tables.sql
sql/migrations/002_rpc_functions.sql
sql/migrations/003_indexes.sql
sql/migrations/004_seed_data.sql
```

### 4. Start the Server

```bash
cd backend
npm run dev
# Server running on http://localhost:3000
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/api/health

# Start assessment
curl -X POST http://localhost:3000/api/start-assessment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{"type": "diagnostic"}'
```

---

## Environment Variables

| Variable                | Required | Description                     | Example                   |
| ----------------------- | -------- | ------------------------------- | ------------------------- |
| `SUPABASE_URL`          | Yes      | Supabase project URL            | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY`  | Yes      | Service role key (bypasses RLS) | `eyJhbGciOi...`           |
| `NODE_ENV`              | No       | Environment mode                | `development`             |
| `PORT`                  | No       | Server port (default: 3000)     | `3000`                    |
| `RUN_INTEGRATION_TESTS` | No       | Enable integration tests        | `true`                    |
| `TEST_USER_ID`          | No       | UUID for test user              | `00000000-...`            |

> ⚠️ **Security**: Never expose `SUPABASE_SERVICE_KEY` to clients. Use it only server-side.

---

## Database Setup

### Migration Files

| File                    | Purpose                             |
| ----------------------- | ----------------------------------- |
| `001_tables.sql`        | 13 core tables + RLS policies       |
| `002_rpc_functions.sql` | 7 atomic RPC functions              |
| `003_indexes.sql`       | Performance indexes                 |
| `004_seed_data.sql`     | Initial subjects, topics, questions |

### Core Tables

```
profiles          → User profiles (auto-created on auth signup)
subjects          → Subject hierarchy (Math, Physics, etc.)
topics            → Topics within subjects
questions         → Question bank with difficulty
assessments       → User assessment sessions
assessment_questions → Questions assigned to assessments
user_answers      → Individual answer records
user_topic_stats  → Aggregated per-topic performance
user_subject_stats → Aggregated per-subject performance
learning_resources → Playlists/videos for recommendations
recommendations   → Generated recommendations for users
assessment_blueprints → Configuration for assessment types
analytics_events  → Behavioral event tracking
```

### Critical RPC Functions

```sql
-- Atomic stats update with locking
rpc_upsert_user_topic_stats(
  p_user_id UUID,
  p_topic_id UUID,
  p_subject_id UUID,
  p_attempts INT,
  p_correct INT,
  p_weighted_score NUMERIC
)

-- Get questions avoiding recent ones
rpc_get_quiz_candidates(
  p_subject_ids UUID[],
  p_topic_ids UUID[],
  p_exclude_question_ids UUID[],
  p_limit INT
)

-- Get weak topics for recommendations
rpc_get_weak_topics(
  p_user_id UUID,
  p_min_attempts INT,
  p_max_accuracy NUMERIC,
  p_limit INT
)
```

---

## API Reference

### POST /api/start-assessment

Generates a new quiz based on assessment type.

**Request:**

```json
{
  "type": "diagnostic",
  "subjectId": "uuid-optional",
  "topicId": "uuid-optional",
  "numQuestions": 30
}
```

**Response (200):**

```json
{
  "success": true,
  "assessmentId": "uuid",
  "assessmentType": "diagnostic",
  "totalQuestions": 30,
  "questions": [
    {
      "assessmentQuestionId": "uuid",
      "questionId": "uuid",
      "text": "What is 2+2?",
      "options": ["A) 3", "B) 4", "C) 5", "D) 6"],
      "order": 1,
      "topicId": "uuid",
      "difficulty": "easy"
    }
  ]
}
```

**Assessment Types:**

| Type         | Questions    | Focus                             |
| ------------ | ------------ | --------------------------------- |
| `diagnostic` | 30 (default) | All subjects, balanced difficulty |
| `practice`   | 20 (default) | Single topic, user-selected       |
| `retest`     | 25 (default) | Weak topics prioritized           |

---

### POST /api/finish-assessment

Completes an assessment and updates user stats.

**Request:**

```json
{
  "assessmentId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "assessmentQuestionId": "uuid",
      "selectedOption": "B",
      "timeTakenSeconds": 45
    }
  ],
  "timeSpentSeconds": 1800
}
```

**Response (200):**

```json
{
  "success": true,
  "assessmentId": "uuid",
  "score": 22,
  "totalQuestions": 30,
  "weightedScore": 48,
  "maxWeightedScore": 90,
  "accuracy": 0.73,
  "perTopicStats": [
    {
      "topicId": "uuid",
      "topicName": "Algebra",
      "correct": 5,
      "total": 6,
      "accuracy": 0.83,
      "level": "intermediate",
      "previousLevel": "beginner",
      "levelChanged": true
    }
  ],
  "recommendations": [
    {
      "topicId": "uuid",
      "topicName": "Geometry",
      "level": "beginner",
      "resource": {
        "title": "Geometry Basics",
        "url": "https://..."
      }
    }
  ]
}
```

---

### POST /api/resume-assessment

Resumes an in-progress assessment.

**Request:**

```json
{
  "assessmentId": "uuid"
}
```

---

### POST /api/abandon-assessment

Marks an assessment as abandoned.

**Request:**

```json
{
  "assessmentId": "uuid"
}
```

---

### GET /api/recommendations

Gets all recommendations for the authenticated user.

**Response:**

```json
{
  "success": true,
  "recommendations": [
    {
      "id": "uuid",
      "topicId": "uuid",
      "topicName": "Calculus",
      "level": "intermediate",
      "resource": {...},
      "status": "pending",
      "reason": "Accuracy is 45%, below 50% threshold"
    }
  ]
}
```

---

### GET /api/user/profile

Gets the user's aggregated profile and stats.

**Response:**

```json
{
  "success": true,
  "profile": {
    "totalTopicsAttempted": 12,
    "totalAttempts": 145,
    "totalCorrect": 98,
    "overallAccuracy": 0.68,
    "overallLevel": "intermediate",
    "topicBreakdown": [
      {
        "topicId": "uuid",
        "topicName": "Algebra",
        "attempts": 25,
        "accuracy": 0.84,
        "level": "advanced"
      }
    ],
    "recentAssessments": [...]
  }
}
```

---

### POST /api/user/topic-levels

Gets level classifications for multiple topics.

**Request:**

```json
{
  "topicIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Architecture

### Service Layer Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── server.js              # Express entry point (port 3000)
│   │   └── assessmentRoutes.js    # All quiz API routes
│   ├── lib/
│   │   └── mlService.js           # ML service client (calls ml-service:8000)
│   └── services/quizEngine/
│       ├── index.js               # Main entry point (exports all functions)
│       ├── constants.js           # Configuration & utilities
│       ├── supabaseAdmin.js       # Server-side Supabase client
│       ├── generateQuiz.js        # Quiz generation engine
│       ├── finishAssessment.js    # Assessment completion
│       ├── recommendationEngine.js # Playlist recommendations
│       └── levelClassifier.js     # Proficiency classification
├── tests/quizEngine/
│   ├── quizEngine.test.js         # 38 unit tests
│   └── integration.test.js        # Integration tests (needs live DB)
├── jest.config.js
└── package.json
```

### Level Classification Algorithm

```javascript
// Laplace smoothing formula
smoothedAccuracy = (correct + α) / (attempts + 2α)
// where α = 2.0 (SMOOTHING_ALPHA)

// Level thresholds
if (attempts < 5) level = "not_enough_data"
else if (smoothedAccuracy >= 0.75) level = "advanced"
else if (smoothedAccuracy >= 0.50) level = "intermediate"
else level = "beginner"

// Confidence calculation
confidence = Math.min(attempts / 20, 1.0)
```

### Difficulty Weighting

```javascript
DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

weightedScore = sum(isCorrect * weight[difficulty]);
maxWeightedScore = sum(weight[difficulty]);
```

### Question Selection Flow

```
1. Get user's recent question IDs (last 30 days)
2. Query candidate questions excluding recent IDs
3. Apply difficulty distribution from blueprint
4. Shuffle and limit to requested count
5. Create assessment_questions with snapshots
6. Return questions with options (no correct_answer)
```

---

## Testing

### Run Unit Tests

```bash
cd backend
npm test
```

Or from the project root:
```bash
npm run test:backend
```

### Run Integration Tests

```bash
cd backend
RUN_INTEGRATION_TESTS=true npm test
```

### Test Coverage

```bash
cd backend
npm test -- --coverage
```

### Sample Test Commands

```bash
cd backend

# Run specific test file
npm test -- --testPathPattern=quizEngine.test.js

# Run with verbose output
npm test -- --verbose

# Watch mode during development
npm test -- --watch
```

> **Note**: Tests use `--experimental-vm-modules` for ESM support. Always use `npm test`, not `npx jest` directly.

---

## Acceptance Checklist

### Day 1 Deliverables ✓

- [x] POST /start-assessment generates N-question quiz
- [x] POST /finish-assessment records answers + updates stats
- [x] No repeated questions from last 30 days
- [x] Weighted score calculated correctly
- [x] Level classification works (beginner/intermediate/advanced)
- [x] Recommendations returned for weak topics
- [x] All atomic updates use RPC functions
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Documentation complete

### Sample curl Commands

```bash
# Start diagnostic assessment
curl -X POST http://localhost:3000/api/start-assessment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "diagnostic"}'

# Finish assessment
curl -X POST http://localhost:3000/api/finish-assessment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "assessmentId": "ASSESSMENT_UUID",
    "answers": [
      {"questionId": "Q1_UUID", "assessmentQuestionId": "AQ1_UUID", "selectedOption": "B", "timeTakenSeconds": 30}
    ],
    "timeSpentSeconds": 300
  }'

# Get user profile
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Get recommendations
curl http://localhost:3000/api/recommendations \
  -H "Authorization: Bearer $TOKEN"

# Health check
curl http://localhost:3000/api/health
```

---

## Troubleshooting

### Common Issues

| Issue                          | Solution                                  |
| ------------------------------ | ----------------------------------------- |
| "Service key not found"        | Set `SUPABASE_SERVICE_KEY` env var        |
| "RPC function not found"       | Run `002_rpc_functions.sql` migration     |
| "No questions available"       | Run `004_seed_data.sql` or add questions  |
| "Assessment already completed" | Each assessment can only be finished once |
| "User not found"               | Ensure user exists in `auth.users`        |

### Debug Mode

Enable verbose logging:

```bash
cd backend
DEBUG=quizEngine:* npm run dev
```

---

## Performance Considerations

1. **Indexes**: Critical queries have dedicated indexes
2. **RPC Locking**: FOR UPDATE prevents concurrent update issues
3. **Batch Operations**: Use `rpc_batch_upsert_user_topic_stats` for multiple topics
4. **Connection Pooling**: Supabase handles pooling automatically
5. **Query Limits**: Always limit candidate queries to prevent large scans

---

## Future Enhancements

- [ ] Spaced repetition scheduling
- [ ] Real-time progress webhooks
- [ ] Question generation via LLM
- [ ] A/B testing framework for ML models
- [ ] Live model retraining from production data

---

## ML Service Integration

The quiz engine integrates with a Python ML service for adaptive difficulty and level classification. See [ml-service/README.md](../ml-service/README.md) for full setup instructions.

### How it works

1. **Quiz generation** (`backend/src/services/quizEngine/generateQuiz.js`) calls the ML service to predict optimal difficulty per topic
2. The ML prediction is **blended 60/40** with the static blueprint distribution
3. If the ML service is offline, the quiz engine uses static distributions unchanged
4. **After quiz completion** (`backend/src/services/quizEngine/finishAssessment.js`) invalidates the ML feature cache so the next quiz uses updated data

### Quick start with ML

```bash
# Terminal 1: Start ML service
cd ml-service
.\venv\Scripts\activate        # Windows
python -m training.train_all   # Train models (first time only)
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

The backend connects to the ML service via `backend/src/lib/mlService.js`. The frontend has its own simplified ML client at `frontend/src/lib/mlService.js`.

Configure ML connection in `ml-service/.env`:

```dotenv
API_KEY=your_api_key
```

### ML endpoints used by quiz engine

| JS Function              | ML Endpoint              | Used In            |
| ------------------------ | ------------------------ | ------------------ |
| `predictNextQuestion()`  | `POST /predict/next-question` | `generateQuiz.js`  |
| `predictBatch()`         | `POST /predict/batch`    | `generateQuiz.js`  |
| `invalidateCache()`      | `POST /cache/invalidate` | `finishAssessment.js` |

### API documentation

Full API documentation with request/response examples: [ml-service/API_DOCUMENTATION.md](../ml-service/API_DOCUMENTATION.md)
