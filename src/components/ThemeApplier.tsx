import { useEffect } from 'react';
import { useOrgTheme } from '@/hooks/useOrgTheme';

/**
 * ThemeApplier component that applies organization theme colors as CSS variables.
 * This component should be rendered inside OrganizationProvider.
 */
export function ThemeApplier() {
  const { primary, secondary, isLoading } = useOrgTheme();

  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;

    // Apply organization primary color
    if (primary) {
      const primaryHSL = hexToHSL(primary);
      root.style.setProperty('--primary', primaryHSL);
      root.style.setProperty('--primary-hover', adjustLightness(primaryHSL, 5));
      root.style.setProperty('--primary-glow', adjustLightness(primaryHSL, 15));
      root.style.setProperty('--ring', primaryHSL);
    }

    // Apply organization secondary color
    if (secondary) {
      const secondaryHSL = hexToHSL(secondary);
      root.style.setProperty('--secondary', secondaryHSL);
      root.style.setProperty('--secondary-hover', adjustLightness(secondaryHSL, -5));
      root.style.setProperty('--secondary-glow', adjustLightness(secondaryHSL, 15));
      root.style.setProperty('--accent', secondaryHSL);
      root.style.setProperty('--accent-hover', adjustLightness(secondaryHSL, -5));
    }

    // Cleanup on unmount - reset to defaults
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-hover');
      root.style.removeProperty('--primary-glow');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-hover');
      root.style.removeProperty('--secondary-glow');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--ring');
    };
  }, [primary, secondary, isLoading]);

  return null;
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

// Helper to adjust lightness of HSL string
function adjustLightness(hsl: string, amount: number): string {
  const parts = hsl.split(' ');
  if (parts.length !== 3) return hsl;
  
  const h = parts[0];
  const s = parts[1];
  const lValue = parseInt(parts[2].replace('%', ''));
  const newL = Math.max(0, Math.min(100, lValue + amount));
  
  return `${h} ${s} ${newL}%`;
}

export default ThemeApplier;
