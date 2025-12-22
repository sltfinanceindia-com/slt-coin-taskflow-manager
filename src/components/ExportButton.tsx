import { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useCanExport } from '@/hooks/useDeviceDetection';
import { Download } from 'lucide-react';

interface ExportButtonProps extends ButtonProps {
  children?: ReactNode;
  showIcon?: boolean;
}

/**
 * Export button that only renders on actual desktop/laptop devices.
 * This prevents export functionality on mobile devices even in "desktop mode".
 */
export function ExportButton({ 
  children, 
  showIcon = true,
  className,
  ...props 
}: ExportButtonProps) {
  const canExport = useCanExport();
  
  // Don't render on mobile devices (even in desktop mode)
  if (!canExport) {
    return null;
  }
  
  return (
    <Button className={className} {...props}>
      {showIcon && <Download className="h-4 w-4 mr-2" />}
      {children || 'Export'}
    </Button>
  );
}

/**
 * Wrapper component for any export-related UI
 * Only renders children on actual desktop/laptop devices
 */
export function ExportWrapper({ children }: { children: ReactNode }) {
  const canExport = useCanExport();
  
  if (!canExport) {
    return null;
  }
  
  return <>{children}</>;
}
