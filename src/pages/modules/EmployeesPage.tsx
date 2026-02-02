/**
 * Employees Module Landing Page
 * Standalone route: /employees
 * Redirects to dashboard with employees tab active
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || '';
  
  useEffect(() => {
    // Redirect to dashboard with employees tab
    const params = view ? `?tab=interns&view=${view}` : '?tab=interns';
    navigate(`/dashboard${params}`, { replace: true });
  }, [navigate, view]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading employees...</p>
      </div>
    </div>
  );
}
