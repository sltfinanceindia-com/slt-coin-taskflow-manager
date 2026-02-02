/**
 * Reports Module Landing Page
 * Standalone route: /reports
 * Redirects to dashboard with reports tab active
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReportsPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard?tab=reports', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    </div>
  );
}
