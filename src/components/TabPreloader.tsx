import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';

interface TabPreloaderProps {
  tabs: string[];
  activeTab: string;
  renderTab: (tab: string) => ReactNode;
}

/**
 * Component that preloads tab content in the background
 * for instant tab switching experience
 */
export function TabPreloader({ tabs, activeTab, renderTab }: TabPreloaderProps) {
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([activeTab]));
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Preload other tabs after a delay
  useEffect(() => {
    // Clear any pending preload
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    
    // Start preloading after 1 second of idle time
    preloadTimeoutRef.current = setTimeout(() => {
      const tabsToLoad = tabs.filter(t => !loadedTabs.has(t));
      
      // Load tabs one by one with small delays to not block the main thread
      tabsToLoad.forEach((tab, index) => {
        setTimeout(() => {
          setLoadedTabs(prev => new Set([...prev, tab]));
        }, index * 200); // 200ms between each tab
      });
    }, 1000);
    
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [tabs, loadedTabs]);
  
  // Always add active tab to loaded tabs
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      setLoadedTabs(prev => new Set([...prev, activeTab]));
    }
  }, [activeTab, loadedTabs]);
  
  return (
    <>
      {tabs.map(tab => (
        <div
          key={tab}
          style={{
            display: tab === activeTab ? 'block' : 'none',
            // Keep inactive tabs in the DOM but hidden for instant switching
            visibility: tab === activeTab ? 'visible' : 'hidden',
            height: tab === activeTab ? 'auto' : 0,
            overflow: 'hidden'
          }}
        >
          {loadedTabs.has(tab) && renderTab(tab)}
        </div>
      ))}
    </>
  );
}

/**
 * Hook to manage tab preloading state
 */
export function useTabPreloading(tabs: string[], activeTab: string) {
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([activeTab]));
  
  // Preload remaining tabs after initial render
  useEffect(() => {
    const timeout = setTimeout(() => {
      const remainingTabs = tabs.filter(t => !loadedTabs.has(t));
      remainingTabs.forEach((tab, index) => {
        setTimeout(() => {
          setLoadedTabs(prev => new Set([...prev, tab]));
        }, index * 150);
      });
    }, 800);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Ensure active tab is always loaded
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      setLoadedTabs(prev => new Set([...prev, activeTab]));
    }
  }, [activeTab]);
  
  const isTabLoaded = useCallback((tab: string) => loadedTabs.has(tab), [loadedTabs]);
  
  return { isTabLoaded, loadedTabs };
}
