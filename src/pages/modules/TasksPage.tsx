/**
 * Tasks Module Landing Page
 * Standalone route: /tasks (list view)
 * Redirects to dashboard with tasks tab active
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function TasksPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'kanban';
  
  useEffect(() => {
    // Redirect to dashboard with tasks tab and view param
    navigate(`/dashboard?tab=tasks&view=${view}`, { replace: true });
  }, [navigate, view]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    </div>
  );
}
