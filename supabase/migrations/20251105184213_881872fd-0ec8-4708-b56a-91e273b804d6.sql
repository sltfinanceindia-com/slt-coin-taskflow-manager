-- Add session tracking fields to session_logs
ALTER TABLE session_logs 
ADD COLUMN IF NOT EXISTS closure_type TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS closure_note TEXT,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster stale session queries
CREATE INDEX IF NOT EXISTS idx_session_logs_stale ON session_logs(login_time, logout_time) WHERE logout_time IS NULL;

-- Add comment for closure_type values
COMMENT ON COLUMN session_logs.closure_type IS 'Values: manual (user logout), auto (background job), heartbeat (inactivity), admin (manually closed)';