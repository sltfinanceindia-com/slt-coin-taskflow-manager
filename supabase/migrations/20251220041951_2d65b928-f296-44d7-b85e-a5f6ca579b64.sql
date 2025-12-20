-- Add coin_name and coin_rate to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS coin_name TEXT DEFAULT 'SLT Coin';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS coin_rate NUMERIC(10,2) DEFAULT 1.00;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS two_fa_policy TEXT DEFAULT 'optional';

-- Create active_sessions table for device management
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  geo_location JSONB DEFAULT '{}',
  login_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  work_mode TEXT DEFAULT 'office',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add device_info and geo_location to activity_logs if not exists
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}';
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS geo_location JSONB DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for active_sessions
CREATE POLICY "Users can view their own sessions"
ON active_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions"
ON active_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
ON active_sessions FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
ON active_sessions FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view org sessions"
ON active_sessions FOR SELECT
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS Policies for security_alerts
CREATE POLICY "Admins can manage security alerts"
ON security_alerts FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

CREATE POLICY "Users can view their own alerts"
ON security_alerts FOR SELECT
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_org_id ON active_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_is_active ON active_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_security_alerts_org_id ON security_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);