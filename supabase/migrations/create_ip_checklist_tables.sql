-- IP Checklist Progress Table
-- Tracks each user's progress on each checklist item

CREATE TABLE IF NOT EXISTS ip_checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,  -- References the checklist item ID from our data
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'done', 'blocked', 'skipped')),
  
  -- Discovery answers
  discovery_answer TEXT CHECK (discovery_answer IN ('yes', 'no', 'unsure')),
  discovery_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Action tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Evidence/proof of completion
  evidence_type TEXT,  -- 'file', 'url', 'text', 'date'
  evidence_value TEXT,  -- The actual evidence (URL, text note, etc.)
  evidence_file_path TEXT,  -- For uploaded files
  
  -- Notes and context
  notes TEXT,
  blockers TEXT,  -- What's preventing completion
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per item
  UNIQUE(user_id, item_id)
);

-- Index for fast lookups
CREATE INDEX idx_checklist_user ON ip_checklist_progress(user_id);
CREATE INDEX idx_checklist_status ON ip_checklist_progress(status);
CREATE INDEX idx_checklist_item ON ip_checklist_progress(item_id);

-- Row Level Security
ALTER TABLE ip_checklist_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own progress
CREATE POLICY "Users can view own checklist progress"
  ON ip_checklist_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON ip_checklist_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON ip_checklist_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON ip_checklist_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checklist_updated_at
  BEFORE UPDATE ON ip_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_updated_at();


-- Discovery Session Table
-- Tracks the AI-guided discovery conversations

CREATE TABLE IF NOT EXISTS ip_discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session status
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  current_item_index INTEGER DEFAULT 0,
  
  -- Summary stats (cached for quick access)
  total_items INTEGER,
  items_done INTEGER DEFAULT 0,
  items_not_done INTEGER DEFAULT 0,
  items_unsure INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for discovery sessions
ALTER TABLE ip_discovery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discovery sessions"
  ON ip_discovery_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discovery sessions"
  ON ip_discovery_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discovery sessions"
  ON ip_discovery_sessions FOR UPDATE
  USING (auth.uid() = user_id);


-- Action Log Table
-- Tracks when users take actions (click links, ask agent, etc.)

CREATE TABLE IF NOT EXISTS ip_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  
  -- Action details
  action_type TEXT NOT NULL,  -- 'link_click', 'agent_request', 'file_upload', 'form_submit'
  action_label TEXT,
  action_url TEXT,
  agent_prompt TEXT,
  
  -- Result
  result TEXT,  -- 'success', 'failed', 'pending'
  result_data JSONB,  -- Any data returned from the action
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for action log
ALTER TABLE ip_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action log"
  ON ip_action_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action log"
  ON ip_action_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- View for dashboard summary
CREATE OR REPLACE VIEW ip_checklist_summary AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'done') as completed_count,
  COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'not-started') as not_started_count,
  COUNT(*) FILTER (WHERE status = 'blocked') as blocked_count,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped_count,
  COUNT(*) as total_items,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'done')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    1
  ) as completion_percentage
FROM ip_checklist_progress
GROUP BY user_id;
