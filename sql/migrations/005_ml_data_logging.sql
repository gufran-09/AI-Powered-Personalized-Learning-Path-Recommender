-- ============================================================================
-- Migration 005: ML Data Logging Foundation
-- Phase 1 of ML Pipeline — Ensure every answer captures full context
-- ============================================================================

-- 1. Add ML-critical columns to user_answers
--    These fields are REQUIRED for feature engineering (Phase 4)
ALTER TABLE user_answers
  ADD COLUMN IF NOT EXISTS difficulty      TEXT,
  ADD COLUMN IF NOT EXISTS subject_id      UUID REFERENCES subjects(id),
  ADD COLUMN IF NOT EXISTS topic_id        UUID REFERENCES topics(id),
  ADD COLUMN IF NOT EXISTS time_taken      INTEGER DEFAULT 0,        -- seconds
  ADD COLUMN IF NOT EXISTS prior_attempts  INTEGER DEFAULT 0,        -- attempts on this topic before this answer
  ADD COLUMN IF NOT EXISTS prior_correct   INTEGER DEFAULT 0,        -- correct on this topic before this answer
  ADD COLUMN IF NOT EXISTS days_since_last REAL DEFAULT NULL;         -- days since user last attempted this topic

-- 2. Add last_updated to user_topic_stats (ML memory layer)
ALTER TABLE user_topic_stats
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

-- 3. Create ML feature cache table
--    Stores pre-computed features per (user, topic) for fast inference
CREATE TABLE IF NOT EXISTS ml_feature_cache (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id          UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

  -- Core stats
  total_attempts    INTEGER DEFAULT 0,
  correct_attempts  INTEGER DEFAULT 0,
  accuracy          REAL DEFAULT 0,
  weighted_score    REAL DEFAULT 0,

  -- Trend features
  recent_accuracy   REAL DEFAULT 0,         -- accuracy over last 10 answers
  accuracy_trend    REAL DEFAULT 0,         -- slope: positive = improving
  streak_length     INTEGER DEFAULT 0,       -- consecutive correct/incorrect

  -- Time features
  avg_time_per_q    REAL DEFAULT 0,         -- average seconds per question
  days_since_last   REAL DEFAULT NULL,      -- days since last attempt

  -- Difficulty breakdown
  easy_accuracy     REAL DEFAULT 0,
  medium_accuracy   REAL DEFAULT 0,
  hard_accuracy     REAL DEFAULT 0,

  -- Global context
  global_accuracy   REAL DEFAULT 0,         -- user's overall accuracy
  topics_attempted  INTEGER DEFAULT 0,       -- how many topics user has tried

  -- Metadata
  computed_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, topic_id)
);

-- 4. Create ML predictions log table
--    Track every prediction for monitoring (Phase 11)
CREATE TABLE IF NOT EXISTS ml_predictions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id          UUID REFERENCES topics(id),
  
  model_name        TEXT NOT NULL,           -- 'level_classifier' | 'next_question'
  model_version     TEXT NOT NULL,           -- '1.0.0'
  
  -- Prediction
  predicted_level   TEXT,                    -- beginner/intermediate/advanced
  predicted_prob    REAL,                    -- P(correct next question)
  confidence        REAL,                    -- model confidence
  
  -- What actually happened (filled in later for evaluation)
  actual_outcome    BOOLEAN DEFAULT NULL,    -- did user get it right?
  actual_level      TEXT DEFAULT NULL,       -- what level did they reach?
  
  -- Context
  feature_snapshot  JSONB DEFAULT NULL,      -- input features at prediction time
  
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create model registry table
--    Track trained models (Phase 11)
CREATE TABLE IF NOT EXISTS ml_models (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name        TEXT NOT NULL,
  model_version     TEXT NOT NULL,
  
  -- Training info
  trained_at        TIMESTAMPTZ DEFAULT NOW(),
  training_rows     INTEGER DEFAULT 0,
  
  -- Metrics
  accuracy_score    REAL,
  f1_score          REAL,
  auc_score         REAL,
  
  -- Comparison
  baseline_accuracy REAL,                    -- rule-based accuracy
  improvement       REAL,                    -- ML accuracy - baseline
  
  -- Storage
  model_path        TEXT,                    -- file path or S3 key
  is_active         BOOLEAN DEFAULT FALSE,   -- currently deployed?
  
  metadata          JSONB DEFAULT '{}',
  
  UNIQUE(model_name, model_version)
);

-- 6. Create A/B test assignments table (Phase 12)
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  experiment_name   TEXT NOT NULL,            -- 'ml_vs_rules_v1'
  variant           TEXT NOT NULL,            -- 'control' (rules) | 'treatment' (ML)
  assigned_at       TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, experiment_name)
);

-- 7. Indexes for ML queries
CREATE INDEX IF NOT EXISTS idx_user_answers_ml
  ON user_answers(user_id, topic_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_answers_difficulty
  ON user_answers(user_id, topic_id, difficulty);

CREATE INDEX IF NOT EXISTS idx_ml_feature_cache_lookup
  ON ml_feature_cache(user_id, topic_id);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_eval
  ON ml_predictions(user_id, model_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_updated
  ON user_topic_stats(user_id, last_updated DESC);

-- 8. RPC: Compute features for a user-topic pair (called from JS or Python)
CREATE OR REPLACE FUNCTION compute_ml_features(p_user_id UUID, p_topic_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v_total INT;
  v_correct INT;
  v_accuracy REAL;
  v_weighted REAL;
  v_recent_acc REAL;
  v_streak INT;
  v_avg_time REAL;
  v_days_since REAL;
  v_easy_acc REAL;
  v_med_acc REAL;
  v_hard_acc REAL;
  v_global_acc REAL;
  v_topics_attempted INT;
BEGIN
  -- Total attempts and correct
  SELECT COUNT(*), COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0)
  INTO v_total, v_correct
  FROM user_answers
  WHERE user_id = p_user_id AND topic_id = p_topic_id;
  
  v_accuracy := CASE WHEN v_total > 0 THEN v_correct::REAL / v_total ELSE 0 END;
  
  -- Weighted score from stats
  SELECT COALESCE(weighted_score, 0) INTO v_weighted
  FROM user_topic_stats
  WHERE user_id = p_user_id AND topic_id = p_topic_id;
  
  -- Recent accuracy (last 10)
  SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
  INTO v_recent_acc
  FROM (
    SELECT is_correct FROM user_answers
    WHERE user_id = p_user_id AND topic_id = p_topic_id
    ORDER BY answered_at DESC LIMIT 10
  ) recent;
  
  -- Streak: count consecutive same result from most recent answer
  WITH ordered AS (
    SELECT is_correct,
           ROW_NUMBER() OVER (ORDER BY answered_at DESC) as rn
    FROM user_answers
    WHERE user_id = p_user_id AND topic_id = p_topic_id
  ),
  first_val AS (
    SELECT is_correct FROM ordered WHERE rn = 1
  )
  SELECT COUNT(*) INTO v_streak
  FROM ordered o, first_val f
  WHERE o.is_correct = f.is_correct
    AND o.rn <= (
      SELECT COALESCE(MIN(rn) - 1, (SELECT COUNT(*) FROM ordered))
      FROM ordered o2
      WHERE o2.is_correct != f.is_correct
    );
  v_streak := COALESCE(v_streak, 0);
  
  -- Average time
  SELECT COALESCE(AVG(time_taken), 0) INTO v_avg_time
  FROM user_answers
  WHERE user_id = p_user_id AND topic_id = p_topic_id AND time_taken > 0;
  
  -- Days since last attempt
  SELECT EXTRACT(EPOCH FROM (NOW() - MAX(answered_at))) / 86400.0
  INTO v_days_since
  FROM user_answers
  WHERE user_id = p_user_id AND topic_id = p_topic_id;
  
  -- Difficulty breakdown
  SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
  INTO v_easy_acc
  FROM user_answers
  WHERE user_id = p_user_id AND topic_id = p_topic_id AND difficulty = 'easy';
  
  SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
  INTO v_med_acc
  FROM user_answers
  WHERE user_id = p_user_id AND topic_id = p_topic_id AND difficulty = 'medium';
  
  SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
  INTO v_hard_acc
  FROM user_answers
  WHERE user_id = p_user_id AND topic_id = p_topic_id AND difficulty = 'hard';
  
  -- Global accuracy
  SELECT COALESCE(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END), 0)
  INTO v_global_acc
  FROM user_answers WHERE user_id = p_user_id;
  
  -- Topics attempted
  SELECT COUNT(DISTINCT topic_id) INTO v_topics_attempted
  FROM user_answers WHERE user_id = p_user_id;
  
  result := jsonb_build_object(
    'total_attempts', v_total,
    'correct_attempts', v_correct,
    'accuracy', ROUND(v_accuracy::NUMERIC, 4),
    'weighted_score', ROUND(v_weighted::NUMERIC, 4),
    'recent_accuracy', ROUND(v_recent_acc::NUMERIC, 4),
    'accuracy_trend', ROUND((v_recent_acc - v_accuracy)::NUMERIC, 4),
    'streak_length', v_streak,
    'avg_time_per_q', ROUND(v_avg_time::NUMERIC, 2),
    'days_since_last', ROUND(COALESCE(v_days_since, -1)::NUMERIC, 2),
    'easy_accuracy', ROUND(v_easy_acc::NUMERIC, 4),
    'medium_accuracy', ROUND(v_med_acc::NUMERIC, 4),
    'hard_accuracy', ROUND(v_hard_acc::NUMERIC, 4),
    'global_accuracy', ROUND(v_global_acc::NUMERIC, 4),
    'topics_attempted', v_topics_attempted
  );
  
  -- Upsert into cache
  INSERT INTO ml_feature_cache (user_id, topic_id, total_attempts, correct_attempts,
    accuracy, weighted_score, recent_accuracy, accuracy_trend, streak_length,
    avg_time_per_q, days_since_last, easy_accuracy, medium_accuracy, hard_accuracy,
    global_accuracy, topics_attempted, computed_at)
  VALUES (p_user_id, p_topic_id, v_total, v_correct, v_accuracy, v_weighted,
    v_recent_acc, v_recent_acc - v_accuracy, v_streak, v_avg_time, v_days_since,
    v_easy_acc, v_med_acc, v_hard_acc, v_global_acc, v_topics_attempted, NOW())
  ON CONFLICT (user_id, topic_id) DO UPDATE SET
    total_attempts = EXCLUDED.total_attempts,
    correct_attempts = EXCLUDED.correct_attempts,
    accuracy = EXCLUDED.accuracy,
    weighted_score = EXCLUDED.weighted_score,
    recent_accuracy = EXCLUDED.recent_accuracy,
    accuracy_trend = EXCLUDED.accuracy_trend,
    streak_length = EXCLUDED.streak_length,
    avg_time_per_q = EXCLUDED.avg_time_per_q,
    days_since_last = EXCLUDED.days_since_last,
    easy_accuracy = EXCLUDED.easy_accuracy,
    medium_accuracy = EXCLUDED.medium_accuracy,
    hard_accuracy = EXCLUDED.hard_accuracy,
    global_accuracy = EXCLUDED.global_accuracy,
    topics_attempted = EXCLUDED.topics_attempted,
    computed_at = NOW();
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
