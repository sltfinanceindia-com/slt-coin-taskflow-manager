import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ContentProtectionProps {
  children: ReactNode;
}

/**
 * Content protection wrapper that prevents screenshots and screen recording
 * for non-admin users. Admins are exempt from these restrictions.
 */
export function ContentProtection({ children }: ContentProtectionProps) {
  const { profile } = useAuth();
  
  // Check if user is admin (super_admin, org_admin, or admin)
  const isAdmin = profile?.role && ['super_admin', 'org_admin', 'admin'].includes(profile.role);
  
  useEffect(() => {
    // Skip protection for admins
    if (isAdmin) return;
    
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    // Prevent keyboard shortcuts for screenshots
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        return false;
      }
      
      // Cmd+Shift+3 or Cmd+Shift+4 (Mac screenshot)
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) {
        e.preventDefault();
        return false;
      }
      
      // Cmd+Shift+5 (Mac screen recording)
      if (e.metaKey && e.shiftKey && e.key === '5') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'i') {
        e.preventDefault();
        return false;
      }
    };
    
    // Prevent drag events on images
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        return false;
      }
    };
    
    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    
    // Add CSS to prevent selection and user interactions
    const style = document.createElement('style');
    style.id = 'content-protection-styles';
    style.textContent = `
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      /* Allow selection in input fields */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      img {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
      }
      
      /* Prevent copy of page content */
      @media print {
        body {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      
      const existingStyle = document.getElementById('content-protection-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isAdmin]);
  
  // For non-admin users, add a subtle watermark
  if (!isAdmin && profile) {
    return (
      <div className="relative min-h-screen">
        {children}
        {/* Watermark overlay */}
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] select-none"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 200px,
              rgba(128, 128, 128, 0.02) 200px,
              rgba(128, 128, 128, 0.02) 400px
            )`
          }}
          aria-hidden="true"
        >
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-[0.015]"
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              transform: 'rotate(-30deg)',
              whiteSpace: 'nowrap',
              color: 'currentColor'
            }}
          >
            {profile.email || profile.full_name}
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
