-- Fix foreign key relationships
ALTER TABLE public.task_comments 
ADD CONSTRAINT task_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.task_comments 
ADD CONSTRAINT task_comments_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id);

ALTER TABLE public.projects 
ADD CONSTRAINT projects_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);