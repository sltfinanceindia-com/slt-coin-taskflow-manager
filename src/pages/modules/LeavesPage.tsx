/**
 * Leave Management Module Landing Page
 * Standalone route: /leaves
 * Redirects to dashboard with leave tab active
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LeavesPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard?tab=leave', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading leave management...</p>
      </div>
    </div>
  );
}
