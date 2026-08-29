-- ============================================================================
-- Quiz Engine & ML Logic - RPC Functions
-- Version: 1.0.0
-- Author: Person 2 - Quiz Engine Team
-- Date: 2026-03-01
-- ============================================================================

-- ============================================================================
-- RPC: Upsert User Topic Stats (Atomic Incremental Update)
-- ============================================================================
-- This is the CORE function for updating user stats atomically.
-- Called after assessment completion for each topic.
-- Uses SELECT FOR UPDATE to prevent race conditions.
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_upsert_user_topic_stats(
  p_user_id UUID,
  p_topic_id UUID,
  p_subject_id UUID,
  p_attempts INT,
  p_correct INT,
  p_skipped INT DEFAULT 0,
  p_weighted_score NUMERIC DEFAULT 0,
  p_max_possible_weighted NUMERIC DEFAULT 0,
  p_total_time_seconds NUMERIC DEFAULT 0
) RETURNS TABLE (
  user_id UUID,
  topic_id UUID,
  attempts INT,
  correct INT,
  weighted_score NUMERIC,
  accuracy NUMERIC,
  weighted_accuracy NUMERIC,
  smoothed_accuracy NUMERIC,
  level TEXT,
  level_confidence NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_prior_attempts INT;
  v_prior_correct INT;
  v_prior_weighted NUMERIC;
  v_prior_max_weighted NUMERIC;
  v_prior_total_time NUMERIC;
  v_prior_skipped INT;
  
  v_new_attempts INT;
  v_new_correct INT;
  v_new_skipped INT;
  v_new_weighted NUMERIC;
  v_new_max_weighted NUMERIC;
  v_new_total_time NUMERIC;
  v_new_accuracy NUMERIC;
  v_new_weighted_accuracy NUMERIC;
  v_new_smoothed_accuracy NUMERIC;
  v_new_level TEXT;
  v_new_level_confidence NUMERIC;
  v_avg_time NUMERIC;
  
  -- Configuration constants
  c_min_attempts CONSTANT INT := 5;
  c_smoothing_alpha CONSTANT NUMERIC := 2.0;
  c_intermediate_threshold CONSTANT NUMERIC := 0.5;
  c_advanced_threshold CONSTANT NUMERIC := 0.75;
BEGIN
  -- Lock the row for update (prevents race conditions)
  SELECT 
    COALESCE(uts.attempts, 0),
    COALESCE(uts.correct, 0),
    COALESCE(uts.skipped, 0),
    COALESCE(uts.weighted_score, 0),
    COALESCE(uts.max_possible_weighted, 0),
    COALESCE(uts.avg_time_per_question * uts.attempts, 0)
  INTO 
    v_prior_attempts, v_prior_correct, v_prior_skipped, 
    v_prior_weighted, v_prior_max_weighted, v_prior_total_time
  FROM user_topic_stats uts
  WHERE uts.user_id = p_user_id AND uts.topic_id = p_topic_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- First time: INSERT new row
    v_new_attempts := p_attempts;
    v_new_correct := p_correct;
    v_new_skipped := p_skipped;
    v_new_weighted := p_weighted_score;
    v_new_max_weighted := p_max_possible_weighted;
    v_new_total_time := p_total_time_seconds;
    
    INSERT INTO user_topic_stats (
      user_id, topic_id, subject_id, 
      attempts, correct, skipped, 
      weighted_score, max_possible_weighted,
      first_attempt_at, last_attempt_at, last_updated
    ) VALUES (
      p_user_id, p_topic_id, p_subject_id,
      v_new_attempts, v_new_correct, v_new_skipped,
      v_new_weighted, v_new_max_weighted,
      NOW(), NOW(), NOW()
    );
  ELSE
    -- Existing row: UPDATE with deltas
    v_new_attempts := v_prior_attempts + p_attempts;
    v_new_correct := v_prior_correct + p_correct;
    v_new_skipped := v_prior_skipped + p_skipped;
    v_new_weighted := v_prior_weighted + p_weighted_score;
    v_new_max_weighted := v_prior_max_weighted + p_max_possible_weighted;
    v_new_total_time := v_prior_total_time + p_total_time_seconds;
  END IF;

  -- Compute accuracy (raw)
  v_new_accuracy := CASE 
    WHEN v_new_attempts > 0 THEN (v_new_correct::NUMERIC / v_new_attempts::NUMERIC)
    ELSE 0 
  END;

  -- Compute weighted accuracy (normalized)
  v_new_weighted_accuracy := CASE 
    WHEN v_new_max_weighted > 0 THEN (v_new_weighted / v_new_max_weighted)
    ELSE 0 
  END;

  -- Compute smoothed accuracy (Laplace smoothing for stability)
  -- Formula: (correct + alpha) / (attempts + 2*alpha)
  v_new_smoothed_accuracy := (v_new_correct + c_smoothing_alpha) / (v_new_attempts + 2 * c_smoothing_alpha);

  -- Compute average time per question
  v_avg_time := CASE 
    WHEN v_new_attempts > 0 THEN (v_new_total_time / v_new_attempts)
    ELSE 0 
  END;

  -- Level classification logic
  IF v_new_attempts < c_min_attempts THEN
    v_new_level := 'beginner';
    v_new_level_confidence := v_new_attempts::NUMERIC / c_min_attempts::NUMERIC;
  ELSIF v_new_accuracy < c_intermediate_threshold THEN
    v_new_level := 'beginner';
    v_new_level_confidence := LEAST(1.0, v_new_attempts::NUMERIC / (c_min_attempts * 2)::NUMERIC);
  ELSIF v_new_accuracy < c_advanced_threshold THEN
    v_new_level := 'intermediate';
    v_new_level_confidence := LEAST(1.0, v_new_attempts::NUMERIC / (c_min_attempts * 2)::NUMERIC);
  ELSE
    v_new_level := 'advanced';
    v_new_level_confidence := LEAST(1.0, v_new_attempts::NUMERIC / (c_min_attempts * 2)::NUMERIC);
  END IF;

  -- Update the row with computed values
  UPDATE user_topic_stats SET
    attempts = v_new_attempts,
    correct = v_new_correct,
    skipped = v_new_skipped,
    weighted_score = v_new_weighted,
    max_possible_weighted = v_new_max_weighted,
    accuracy = v_new_accuracy,
    weighted_accuracy = v_new_weighted_accuracy,
    smoothed_accuracy = v_new_smoothed_accuracy,
    level = v_new_level,
    level_confidence = v_new_level_confidence,
    avg_time_per_question = v_avg_time,
    last_attempt_at = NOW(),
    last_updated = NOW()
  WHERE user_topic_stats.user_id = p_user_id AND user_topic_stats.topic_id = p_topic_id;

  -- Return the updated row
  RETURN QUERY SELECT 
    p_user_id,
    p_topic_id,
    v_new_attempts,
    v_new_correct,
    v_new_weighted,
    v_new_accuracy,
    v_new_weighted_accuracy,
    v_new_smoothed_accuracy,
    v_new_level,
    v_new_level_confidence;
END;
$$;


-- ============================================================================
-- RPC: Batch Upsert User Topic Stats (For Multiple Topics in One Call)
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_batch_upsert_user_topic_stats(
  p_user_id UUID,
  p_updates JSONB
  -- Expected format: [{"topic_id": "uuid", "subject_id": "uuid", "attempts": 5, "correct": 3, "weighted_score": 7, "max_possible_weighted": 10, "total_time": 120}]
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_update JSONB;
  v_results JSONB := '[]'::JSONB;
  v_result RECORD;
BEGIN
  FOR v_update IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    SELECT * INTO v_result FROM rpc_upsert_user_topic_stats(
      p_user_id,
      (v_update->>'topic_id')::UUID,
      (v_update->>'subject_id')::UUID,
      COALESCE((v_update->>'attempts')::INT, 0),
      COALESCE((v_update->>'correct')::INT, 0),
      COALESCE((v_update->>'skipped')::INT, 0),
      COALESCE((v_update->>'weighted_score')::NUMERIC, 0),
      COALESCE((v_update->>'max_possible_weighted')::NUMERIC, 0),
      COALESCE((v_update->>'total_time')::NUMERIC, 0)
    );
    
    v_results := v_results || jsonb_build_object(
      'topic_id', v_result.topic_id,
      'attempts', v_result.attempts,
      'correct', v_result.correct,
      'accuracy', v_result.accuracy,
      'level', v_result.level,
      'level_confidence', v_result.level_confidence
    );
  END LOOP;
  
  RETURN v_results;
END;
$$;


-- ============================================================================
-- RPC: Update User Subject Stats (Aggregates from Topic Stats)
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_update_user_subject_stats(
  p_user_id UUID,
  p_subject_id UUID
) RETURNS TABLE (
  subject_id UUID,
  total_attempts INT,
  total_correct INT,
  accuracy NUMERIC,
  level TEXT,
  topics_attempted INT,
  topics_mastered INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_attempts INT;
  v_total_correct INT;
  v_accuracy NUMERIC;
  v_level TEXT;
  v_topics_attempted INT;
  v_topics_mastered INT;
  
  c_min_attempts CONSTANT INT := 5;
  c_intermediate_threshold CONSTANT NUMERIC := 0.5;
  c_advanced_threshold CONSTANT NUMERIC := 0.75;
BEGIN
  -- Aggregate stats from user_topic_stats for this subject
  SELECT 
    COALESCE(SUM(uts.attempts), 0),
    COALESCE(SUM(uts.correct), 0),
    COUNT(DISTINCT uts.topic_id),
    COUNT(DISTINCT CASE WHEN uts.level = 'advanced' THEN uts.topic_id END)
  INTO v_total_attempts, v_total_correct, v_topics_attempted, v_topics_mastered
  FROM user_topic_stats uts
  JOIN topics t ON uts.topic_id = t.id
  WHERE uts.user_id = p_user_id AND t.subject_id = p_subject_id;

  -- Compute accuracy
  v_accuracy := CASE 
    WHEN v_total_attempts > 0 THEN (v_total_correct::NUMERIC / v_total_attempts::NUMERIC)
    ELSE 0 
  END;

  -- Determine level
  IF v_total_attempts < c_min_attempts THEN
    v_level := 'beginner';
  ELSIF v_accuracy < c_intermediate_threshold THEN
    v_level := 'beginner';
  ELSIF v_accuracy < c_advanced_threshold THEN
    v_level := 'intermediate';
  ELSE
    v_level := 'advanced';
  END IF;

  -- Upsert subject stats
  INSERT INTO user_subject_stats (
    user_id, subject_id, total_attempts, total_correct, 
    accuracy, level, topics_attempted, topics_mastered, last_updated
  ) VALUES (
    p_user_id, p_subject_id, v_total_attempts, v_total_correct,
    v_accuracy, v_level, v_topics_attempted, v_topics_mastered, NOW()
  )
  ON CONFLICT (user_id, subject_id) DO UPDATE SET
    total_attempts = EXCLUDED.total_attempts,
    total_correct = EXCLUDED.total_correct,
    accuracy = EXCLUDED.accuracy,
    level = EXCLUDED.level,
    topics_attempted = EXCLUDED.topics_attempted,
    topics_mastered = EXCLUDED.topics_mastered,
    last_updated = NOW();

  RETURN QUERY SELECT 
    p_subject_id,
    v_total_attempts,
    v_total_correct,
    v_accuracy,
    v_level,
    v_topics_attempted,
    v_topics_mastered;
END;
$$;


-- ============================================================================
-- RPC: Get Quiz Candidates (Optimized Question Selection)
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_quiz_candidates(
  p_user_id UUID,
  p_topic_ids UUID[],
  p_difficulties TEXT[],
  p_exclude_days INT DEFAULT 90,
  p_limit INT DEFAULT 200
) RETURNS TABLE (
  id UUID,
  subject_id UUID,
  topic_id UUID,
  difficulty TEXT,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option TEXT,
  explanation TEXT,
  quality_score NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.subject_id,
    q.topic_id,
    q.difficulty,
    q.question_text,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_option,
    q.explanation,
    q.quality_score
  FROM questions q
  WHERE 
    q.is_active = TRUE
    AND q.topic_id = ANY(p_topic_ids)
    AND q.difficulty = ANY(p_difficulties)
    AND q.id NOT IN (
      SELECT ua.question_id 
      FROM user_answers ua 
      WHERE ua.user_id = p_user_id 
        AND ua.answered_at >= NOW() - (p_exclude_days || ' days')::INTERVAL
    )
  ORDER BY 
    q.quality_score DESC,
    RANDOM()
  LIMIT p_limit;
END;
$$;


-- ============================================================================
-- RPC: Get Weak Topics for Retest
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_weak_topics(
  p_user_id UUID,
  p_subject_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 5
) RETURNS TABLE (
  topic_id UUID,
  topic_name TEXT,
  subject_id UUID,
  accuracy NUMERIC,
  level TEXT,
  attempts INT,
  priority_score NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uts.topic_id,
    t.name AS topic_name,
    t.subject_id,
    uts.accuracy,
    uts.level,
    uts.attempts,
    -- Priority score: lower accuracy + more attempts = higher priority
    -- Also boost topics with more attempts (we have more confidence they're weak)
    (1 - uts.accuracy) * LEAST(1.0, uts.attempts::NUMERIC / 10) AS priority_score
  FROM user_topic_stats uts
  JOIN topics t ON uts.topic_id = t.id
  WHERE 
    uts.user_id = p_user_id
    AND uts.attempts > 0
    AND (p_subject_id IS NULL OR t.subject_id = p_subject_id)
  ORDER BY priority_score DESC
  LIMIT p_limit;
END;
$$;


-- ============================================================================
-- RPC: Get Topic Recommendations
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_topic_recommendations(
  p_user_id UUID,
  p_topic_ids UUID[]
) RETURNS TABLE (
  topic_id UUID,
  topic_name TEXT,
  subject_id UUID,
  subject_name TEXT,
  user_accuracy NUMERIC,
  user_level TEXT,
  resource_id UUID,
  resource_title TEXT,
  resource_url TEXT,
  resource_type TEXT,
  reason TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_topic UUID;
  v_level TEXT;
  v_accuracy NUMERIC;
  v_resource RECORD;
  v_has_levels BOOLEAN;
BEGIN
  FOREACH v_topic IN ARRAY p_topic_ids
  LOOP
    -- Get user's stats for this topic
    SELECT uts.level, uts.accuracy 
    INTO v_level, v_accuracy
    FROM user_topic_stats uts 
    WHERE uts.user_id = p_user_id AND uts.topic_id = v_topic;
    
    -- Default to beginner if no stats
    v_level := COALESCE(v_level, 'beginner');
    v_accuracy := COALESCE(v_accuracy, 0);
    
    -- Check if subject has levels
    SELECT s.has_levels INTO v_has_levels
    FROM subjects s
    JOIN topics t ON t.subject_id = s.id
    WHERE t.id = v_topic;
    
    v_has_levels := COALESCE(v_has_levels, TRUE);
    
    -- Find appropriate resource
    IF v_has_levels THEN
      -- Multi-level subject: match topic + level
      SELECT * INTO v_resource
      FROM learning_resources lr
      WHERE lr.topic_id = v_topic AND lr.level = v_level AND lr.is_active = TRUE
      ORDER BY lr.priority ASC, lr.quality_score DESC
      LIMIT 1;
      
      -- Fallback: same topic, any level
      IF v_resource.id IS NULL THEN
        SELECT * INTO v_resource
        FROM learning_resources lr
        WHERE lr.topic_id = v_topic AND lr.is_active = TRUE
        ORDER BY lr.priority ASC
        LIMIT 1;
      END IF;
      
      -- Fallback: subject-level resource
      IF v_resource.id IS NULL THEN
        SELECT * INTO v_resource
        FROM learning_resources lr
        JOIN topics t ON t.subject_id = lr.subject_id
        WHERE t.id = v_topic AND lr.topic_id IS NULL AND lr.is_active = TRUE
        ORDER BY lr.priority ASC
        LIMIT 1;
      END IF;
    ELSE
      -- Single-playlist subject: get subject-level resource
      SELECT * INTO v_resource
      FROM learning_resources lr
      JOIN topics t ON t.subject_id = lr.subject_id
      WHERE t.id = v_topic AND lr.topic_id IS NULL AND lr.is_active = TRUE
      ORDER BY lr.priority ASC
      LIMIT 1;
    END IF;
    
    -- Return result if resource found
    IF v_resource.id IS NOT NULL THEN
      RETURN QUERY
      SELECT 
        v_topic,
        t.name,
        t.subject_id,
        s.name,
        v_accuracy,
        v_level,
        v_resource.id,
        v_resource.title,
        v_resource.youtube_url,
        v_resource.resource_type,
        CASE 
          WHEN v_accuracy < 0.5 THEN 'Low accuracy (' || ROUND(v_accuracy * 100) || '%) - needs improvement'
          WHEN v_accuracy < 0.75 THEN 'Moderate accuracy (' || ROUND(v_accuracy * 100) || '%) - keep practicing'
          ELSE 'Good accuracy (' || ROUND(v_accuracy * 100) || '%) - challenge yourself'
        END
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = v_topic;
    END IF;
  END LOOP;
END;
$$;


-- ============================================================================
-- RPC: Record Analytics Event
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_record_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::JSONB,
  p_session_id TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (user_id, event_type, event_data, session_id)
  VALUES (p_user_id, p_event_type, p_event_data, p_session_id)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;


-- ============================================================================
-- RPC: Get User Dashboard Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_get_user_dashboard(
  p_user_id UUID
) RETURNS TABLE (
  total_assessments INT,
  completed_assessments INT,
  total_questions_attempted INT,
  overall_accuracy NUMERIC,
  strongest_subject TEXT,
  weakest_subject TEXT,
  topics_attempted INT,
  topics_mastered INT,
  recent_activity JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_assessments INT;
  v_completed_assessments INT;
  v_total_questions INT;
  v_total_correct INT;
  v_overall_accuracy NUMERIC;
  v_strongest_subject TEXT;
  v_weakest_subject TEXT;
  v_topics_attempted INT;
  v_topics_mastered INT;
  v_recent_activity JSONB;
BEGIN
  -- Assessment counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_assessments, v_completed_assessments
  FROM assessments WHERE user_id = p_user_id;
  
  -- Answer stats
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct = TRUE)
  INTO v_total_questions, v_total_correct
  FROM user_answers WHERE user_id = p_user_id;
  
  v_overall_accuracy := CASE 
    WHEN v_total_questions > 0 THEN (v_total_correct::NUMERIC / v_total_questions::NUMERIC)
    ELSE 0 
  END;
  
  -- Strongest subject
  SELECT s.name INTO v_strongest_subject
  FROM user_subject_stats uss
  JOIN subjects s ON uss.subject_id = s.id
  WHERE uss.user_id = p_user_id AND uss.total_attempts >= 5
  ORDER BY uss.accuracy DESC
  LIMIT 1;
  
  -- Weakest subject
  SELECT s.name INTO v_weakest_subject
  FROM user_subject_stats uss
  JOIN subjects s ON uss.subject_id = s.id
  WHERE uss.user_id = p_user_id AND uss.total_attempts >= 5
  ORDER BY uss.accuracy ASC
  LIMIT 1;
  
  -- Topic counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE level = 'advanced')
  INTO v_topics_attempted, v_topics_mastered
  FROM user_topic_stats WHERE user_id = p_user_id;
  
  -- Recent activity (last 5 assessments)
  SELECT jsonb_agg(row_to_json(t)) INTO v_recent_activity
  FROM (
    SELECT 
      a.id, a.assessment_type, a.status, a.score, a.total_questions,
      a.completed_at, a.created_at
    FROM assessments a
    WHERE a.user_id = p_user_id
    ORDER BY a.created_at DESC
    LIMIT 5
  ) t;
  
  RETURN QUERY SELECT 
    v_total_assessments,
    v_completed_assessments,
    v_total_questions,
    v_overall_accuracy,
    v_strongest_subject,
    v_weakest_subject,
    v_topics_attempted,
    v_topics_mastered,
    COALESCE(v_recent_activity, '[]'::JSONB);
END;
$$;
