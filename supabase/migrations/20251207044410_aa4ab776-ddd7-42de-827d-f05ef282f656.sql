-- Step 1: Clean up duplicate roles - keep only one role per user (highest priority)
-- Remove duplicate 'admin' role if user already has 'super_admin' or 'org_admin'
DELETE FROM user_roles ur1
WHERE ur1.role = 'admin'
AND EXISTS (
  SELECT 1 FROM user_roles ur2 
  WHERE ur2.user_id = ur1.user_id 
  AND ur2.role IN ('super_admin', 'org_admin')
);

-- Step 2: Ensure all messages have organization_id from sender
UPDATE messages m
SET organization_id = (
  SELECT p.organization_id FROM profiles p WHERE p.id = m.sender_id
)
WHERE m.organization_id IS NULL;

-- Step 3: Ensure all communication_channels have organization_id from creator
UPDATE communication_channels cc
SET organization_id = (
  SELECT p.organization_id FROM profiles p WHERE p.id = cc.created_by
)
WHERE cc.organization_id IS NULL;

-- Step 4: Ensure all channel_members have organization_id
UPDATE channel_members cm
SET organization_id = (
  SELECT p.organization_id FROM profiles p WHERE p.id = cm.user_id
)
WHERE cm.organization_id IS NULL;

-- Step 5: Ensure all user_roles have organization_id from their profile
UPDATE user_roles ur
SET organization_id = (
  SELECT p.organization_id FROM profiles p WHERE p.user_id = ur.user_id
)
WHERE ur.organization_id IS NULL;

-- Step 6: Add indexes for better performance on organization filtering
CREATE INDEX IF NOT EXISTS idx_messages_organization_id ON messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id_created_at ON messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_channels_organization_id ON communication_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_organization_id ON channel_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id_active ON profiles(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);