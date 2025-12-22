import { useState, useEffect } from 'react';

interface DeviceInfo {
  isActualMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  isMobileUA: boolean;
}

/**
 * Detects actual device type (not screen size based)
 * Even in "desktop mode" on mobile, this will still detect it as mobile
 */
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isActualMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    isMobileUA: false
  });

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      
      // Check for mobile/tablet patterns in user agent
      const mobilePatterns = [
        /android/i,
        /webos/i,
        /iphone/i,
        /ipad/i,
        /ipod/i,
        /blackberry/i,
        /windows phone/i,
        /mobile/i,
        /tablet/i,
        /silk/i,
        /kindle/i,
        /playbook/i,
        /bb10/i
      ];
      
      const isMobileUA = mobilePatterns.some(pattern => pattern.test(ua));
      
      // Check for touch capability - mobile devices have touch
      const hasTouch = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       (navigator as any).msMaxTouchPoints > 0;
      
      // Check screen characteristics typical of mobile
      const isSmallScreen = window.screen.width < 1024;
      const hasDevicePixelRatio = window.devicePixelRatio >= 2;
      
      // Check for mobile platform
      const platform = navigator.platform?.toLowerCase() || '';
      const isMobilePlatform = /iphone|ipad|ipod|android|arm/.test(platform);
      
      // Check for connection type (mobile networks)
      const connection = (navigator as any).connection;
      const isMobileConnection = connection?.type === 'cellular' || 
                                  connection?.effectiveType === '2g' ||
                                  connection?.effectiveType === '3g';
      
      // Determine device type
      // A device is considered mobile if:
      // 1. User agent indicates mobile AND has touch OR
      // 2. Has touch capability AND matches mobile platform OR
      // 3. Has high pixel ratio AND touch AND mobile UA patterns
      const isActualMobile = (isMobileUA && hasTouch) || 
                             (hasTouch && isMobilePlatform) ||
                             (hasDevicePixelRatio && hasTouch && (isMobileUA || isMobileConnection));
      
      // Tablet detection
      const isTablet = (isMobileUA && /ipad|tablet|playbook|silk/i.test(ua)) ||
                       (hasTouch && window.screen.width >= 768 && window.screen.width < 1024);
      
      // Desktop is anything that's not mobile and not tablet
      const isDesktop = !isActualMobile && !isTablet;

      setDeviceInfo({
        isActualMobile,
        isTablet,
        isDesktop,
        hasTouch,
        isMobileUA
      });
    };

    detectDevice();
    
    // Re-detect on resize (orientation change on mobile)
    window.addEventListener('resize', detectDevice);
    
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceInfo;
}

/**
 * Simple check if exports should be allowed
 * Only actual desktop/laptop computers can export
 */
export function useCanExport(): boolean {
  const { isDesktop, hasTouch } = useDeviceDetection();
  
  // Only allow exports on desktop devices without touch (actual laptops/desktops)
  // This prevents export even in "desktop mode" on mobile
  return isDesktop && !hasTouch;
}

/**
 * Hook to check if device is actual desktop (not mobile in desktop mode)
 */
export function useIsActualDesktop(): boolean {
  const { isDesktop, hasTouch } = useDeviceDetection();
  return isDesktop && !hasTouch;
}
