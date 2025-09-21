-- Enhanced messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mentions TEXT[];
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_count INTEGER DEFAULT 0;

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Channel read status
CREATE TABLE IF NOT EXISTS channel_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES communication_channels(id),
  user_id UUID REFERENCES profiles(id),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- File attachments
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all message reactions" ON message_reactions
FOR SELECT USING (true);

CREATE POLICY "Users can create reactions" ON message_reactions
FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own reactions" ON message_reactions
FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add RLS policies for channel_read_status
ALTER TABLE channel_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own read status" ON channel_read_status
FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own read status" ON channel_read_status
FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add RLS policies for message_attachments
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in accessible messages" ON message_attachments
FOR SELECT USING (
  message_id IN (
    SELECT m.id FROM messages m
    WHERE m.channel_id IN (
      SELECT cm.channel_id FROM channel_members cm
      WHERE cm.user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
    OR m.sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR m.receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can create attachments for their messages" ON message_attachments
FOR INSERT WITH CHECK (
  message_id IN (
    SELECT m.id FROM messages m
    WHERE m.sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);