-- ============================================================================
-- Quiz Engine & ML Logic - Performance Indexes
-- Version: 1.0.0
-- Author: Person 2 - Quiz Engine Team
-- Date: 2026-03-01
-- ============================================================================

-- ============================================================================
-- USER_ANSWERS Indexes (Critical for repeat-avoidance queries)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_answers_user_answered 
  ON user_answers(user_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_answers_user_question 
  ON user_answers(user_id, question_id);

CREATE INDEX IF NOT EXISTS idx_user_answers_assessment 
  ON user_answers(assessment_id);

CREATE INDEX IF NOT EXISTS idx_user_answers_topic 
  ON user_answers(topic_id);

-- ============================================================================
-- QUESTIONS Indexes (Critical for fast selection)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty 
  ON questions(topic_id, difficulty) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_subject_difficulty 
  ON questions(subject_id, difficulty) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_active 
  ON questions(is_active) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_quality 
  ON questions(quality_score DESC) 
  WHERE is_active = TRUE;

-- ============================================================================
-- USER_TOPIC_STATS Indexes (Fast lookup and level queries)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_topic_stats_user_topic 
  ON user_topic_stats(user_id, topic_id);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user_accuracy 
  ON user_topic_stats(user_id, accuracy);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user_level 
  ON user_topic_stats(user_id, level);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_subject 
  ON user_topic_stats(subject_id);

-- ============================================================================
-- USER_SUBJECT_STATS Indexes
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subject_stats_user_subject 
  ON user_subject_stats(user_id, subject_id);

-- ============================================================================
-- ASSESSMENTS Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assessments_user_created 
  ON assessments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessments_user_status 
  ON assessments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_assessments_type 
  ON assessments(assessment_type);

-- ============================================================================
-- ASSESSMENT_QUESTIONS Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment 
  ON assessment_questions(assessment_id);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_question 
  ON assessment_questions(question_id);

-- ============================================================================
-- LEARNING_RESOURCES Indexes (For recommendation queries)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_learning_resources_topic_level 
  ON learning_resources(topic_id, level) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_learning_resources_subject 
  ON learning_resources(subject_id) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_learning_resources_priority 
  ON learning_resources(priority ASC) 
  WHERE is_active = TRUE;

-- ============================================================================
-- TOPICS Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_topics_subject 
  ON topics(subject_id) 
  WHERE is_active = TRUE;

-- ============================================================================
-- RECOMMENDATIONS Indexes (Analytics)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_recommendations_user_created 
  ON recommendations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_resource 
  ON recommendations(resource_id);

-- ============================================================================
-- ANALYTICS_EVENTS Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type 
  ON analytics_events(user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created 
  ON analytics_events(event_type, created_at DESC);

-- ============================================================================
-- PARTIAL INDEXES for common queries
-- ============================================================================

-- Active questions only (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_questions_active_topic_diff 
  ON questions(topic_id, difficulty, quality_score DESC) 
  WHERE is_active = TRUE;

-- Pending/in-progress assessments
CREATE INDEX IF NOT EXISTS idx_assessments_pending 
  ON assessments(user_id, created_at DESC) 
  WHERE status IN ('pending', 'in_progress');

-- Weak topics (accuracy < 0.5)
CREATE INDEX IF NOT EXISTS idx_user_topic_stats_weak 
  ON user_topic_stats(user_id, accuracy ASC) 
  WHERE level = 'beginner' AND attempts >= 5;
