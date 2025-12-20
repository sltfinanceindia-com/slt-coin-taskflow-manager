import { useEffect } from 'react';
import { useOrganization } from './useOrganization';

interface OrgThemeColors {
  primary?: string;
  secondary?: string;
  coinName: string;
  coinRate: number;
}

export function useOrgTheme(): OrgThemeColors & { isLoading: boolean } {
  const { organization, isLoading } = useOrganization();

  useEffect(() => {
    if (!organization) return;

    // Apply organization colors as CSS variables
    const root = document.documentElement;

    if (organization.primary_color) {
      // Convert hex to HSL if needed, or apply directly if already HSL
      const primaryColor = organization.primary_color;
      if (primaryColor.startsWith('#')) {
        const hsl = hexToHSL(primaryColor);
        root.style.setProperty('--org-primary', hsl);
      } else {
        root.style.setProperty('--org-primary', primaryColor);
      }
    }

    if (organization.secondary_color) {
      const secondaryColor = organization.secondary_color;
      if (secondaryColor.startsWith('#')) {
        const hsl = hexToHSL(secondaryColor);
        root.style.setProperty('--org-secondary', hsl);
      } else {
        root.style.setProperty('--org-secondary', secondaryColor);
      }
    }

    // Cleanup on unmount
    return () => {
      root.style.removeProperty('--org-primary');
      root.style.removeProperty('--org-secondary');
    };
  }, [organization]);

  return {
    primary: organization?.primary_color || undefined,
    secondary: organization?.secondary_color || undefined,
    coinName: organization?.coin_name || 'Coins',
    coinRate: organization?.coin_rate || 1.0,
    isLoading,
  };
}

// Helper function to convert hex to HSL string
function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
