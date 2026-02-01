-- Fix RLS policies to add organization_id checks where applicable
-- Only updating policies for tables that have the appropriate columns

-- ai_usage_logs - has user_id and organization_id
DROP POLICY IF EXISTS "System can create usage logs" ON public.ai_usage_logs;
CREATE POLICY "Users can create usage logs with org scope"
ON public.ai_usage_logs FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- chat_users - has user_id and organization_id
DROP POLICY IF EXISTS "System can insert chat users" ON public.chat_users;
CREATE POLICY "Users can join chats in their org"
ON public.chat_users FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- kanban_events - has user_id and organization_id
DROP POLICY IF EXISTS "System can insert kanban events" ON public.kanban_events;
CREATE POLICY "Users can create kanban events in their org"
ON public.kanban_events FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- user_achievements - has user_id and organization_id
DROP POLICY IF EXISTS "System can insert user achievements" ON public.user_achievements;
CREATE POLICY "Users can earn achievements in their org"
ON public.user_achievements FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- ai_insights - only has organization_id, no user_id (system generated)
-- Keep existing policy but add org scope
DROP POLICY IF EXISTS "System can create insights" ON public.ai_insights;
CREATE POLICY "System can create insights with org scope"
ON public.ai_insights FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IS NOT NULL 
  AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);