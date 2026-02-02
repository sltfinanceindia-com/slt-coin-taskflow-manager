/**
 * Performance Module Landing Page
 * Standalone route: /performance
 * Redirects to dashboard with OKRs tab active
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PerformancePage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard?tab=okrs', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading performance...</p>
      </div>
    </div>
  );
}
