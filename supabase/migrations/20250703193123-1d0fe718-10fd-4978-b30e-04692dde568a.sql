-- Create email notifications table to track sent emails
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('task_assigned', 'task_completed', 'comment_added', 'coins_earned', 'login_notification', 'logout_notification')),
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  task_id UUID NULL,
  comment_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert email notifications" 
ON public.email_notifications 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.email_notifications 
ADD CONSTRAINT email_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.email_notifications 
ADD CONSTRAINT email_notifications_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id);

ALTER TABLE public.email_notifications 
ADD CONSTRAINT email_notifications_comment_id_fkey 
FOREIGN KEY (comment_id) REFERENCES public.task_comments(id);