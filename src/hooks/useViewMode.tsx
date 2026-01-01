import { useState, useEffect, useCallback } from 'react';
import { useUserRole } from './useUserRole';

export type ViewMode = 'super_admin' | 'org_admin';

const VIEW_MODE_KEY = 'tenexa_view_mode';

export function useViewMode() {
  const { isSuperAdmin, isOrgAdmin, organizationId, isLoading: roleLoading } = useUserRole();
  
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'org_admin';
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return (stored === 'super_admin' || stored === 'org_admin') ? stored : 'org_admin';
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Auto-set view mode based on role
  useEffect(() => {
    if (roleLoading) return;
    
    // If not super admin, always force org_admin mode
    if (!isSuperAdmin) {
      setViewModeState('org_admin');
    }
  }, [isSuperAdmin, roleLoading]);

  const setViewMode = useCallback((mode: ViewMode) => {
    // Only super admins can switch to super_admin view
    if (mode === 'super_admin' && !isSuperAdmin) {
      console.warn('Cannot switch to super_admin view - user is not a super admin');
      return;
    }
    setViewModeState(mode);
  }, [isSuperAdmin]);

  const toggleViewMode = useCallback(() => {
    if (!isSuperAdmin) return;
    setViewModeState(prev => prev === 'super_admin' ? 'org_admin' : 'super_admin');
  }, [isSuperAdmin]);

  // Determine effective permissions based on view mode
  const effectiveRole = viewMode === 'super_admin' && isSuperAdmin ? 'super_admin' : 'org_admin';
  const canSwitchView = isSuperAdmin && organizationId; // Must have org to switch

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    effectiveRole,
    canSwitchView,
    isViewingSuperAdmin: viewMode === 'super_admin' && isSuperAdmin,
    isViewingOrgAdmin: viewMode === 'org_admin' || !isSuperAdmin,
    isLoading: roleLoading,
  };
}
