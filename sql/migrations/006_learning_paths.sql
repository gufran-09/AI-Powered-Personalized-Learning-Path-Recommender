-- ============================================================================
-- AI Learning Paths - Database Schema
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- 1. LEARNING_PATHS
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. LEARNING_PATH_MILESTONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_path_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES learning_resources(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL, -- Keep title in case resource_id is null/custom
  description TEXT,
  
  step_order INT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  ai_explanation TEXT, -- Why it was recommended
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning paths" ON learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning paths" ON learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning paths" ON learning_paths FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning paths" ON learning_paths FOR DELETE USING (auth.uid() = user_id);

-- Milestones depend on path ownership
CREATE POLICY "Users can view own milestones" ON learning_path_milestones 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM learning_paths lp WHERE lp.id = learning_path_milestones.path_id AND lp.user_id = auth.uid()
));

CREATE POLICY "Users can insert own milestones" ON learning_path_milestones 
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM learning_paths lp WHERE lp.id = path_id AND lp.user_id = auth.uid()
));

CREATE POLICY "Users can update own milestones" ON learning_path_milestones 
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM learning_paths lp WHERE lp.id = learning_path_milestones.path_id AND lp.user_id = auth.uid()
));

CREATE POLICY "Users can delete own milestones" ON learning_path_milestones 
FOR DELETE USING (EXISTS (
  SELECT 1 FROM learning_paths lp WHERE lp.id = learning_path_milestones.path_id AND lp.user_id = auth.uid()
));
