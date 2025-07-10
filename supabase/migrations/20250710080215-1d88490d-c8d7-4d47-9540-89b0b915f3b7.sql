
-- Update the time limit for the UI/UX exam to 25 minutes
UPDATE public.ui_ux_exams 
SET time_limit_minutes = 25 
WHERE title = 'UI/UX Module Test';
