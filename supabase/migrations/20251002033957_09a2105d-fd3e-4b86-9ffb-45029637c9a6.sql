-- Fix call_history table foreign key constraints
-- Drop existing foreign key constraints that point to auth.users
ALTER TABLE public.call_history DROP CONSTRAINT IF EXISTS call_history_caller_id_fkey;
ALTER TABLE public.call_history DROP CONSTRAINT IF EXISTS call_history_receiver_id_fkey;

-- Add proper foreign key constraints to profiles table
ALTER TABLE public.call_history 
  ADD CONSTRAINT call_history_caller_id_fkey 
  FOREIGN KEY (caller_id) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

ALTER TABLE public.call_history 
  ADD CONSTRAINT call_history_receiver_id_fkey 
  FOREIGN KEY (receiver_id) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_call_history_caller_receiver 
  ON public.call_history(caller_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_call_history_status 
  ON public.call_history(status);

CREATE INDEX IF NOT EXISTS idx_call_history_created_at 
  ON public.call_history(created_at DESC);