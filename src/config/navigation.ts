// Centralized navigation configuration
// This is the single source of truth for standalone routes

/**
 * Pages that have their own routes (not dashboard tabs)
 * Used by AppSidebar, BottomNavigation, GlobalSearch, and other navigation components
 */
export const standaloneRoutes: Record<string, string> = {
  'training': '/training',
  'tutorial': '/tutorial',
  'kudos': '/kudos',
  'pulse-surveys': '/pulse-surveys',
  'my-goals': '/my-goals',
  'profile': '/profile',
  'roles': '/admin/roles-permissions',
  'org-chart': '/organization/chart',
  'settings': '/admin/organization-settings',
};

/**
 * Check if a tab should navigate to a standalone route
 */
export function isStandaloneRoute(tab: string): boolean {
  return tab in standaloneRoutes;
}

/**
 * Get the route for a tab (standalone or dashboard)
 */
export function getRouteForTab(tab: string): string {
  return standaloneRoutes[tab] || `/dashboard?tab=${tab}`;
}
