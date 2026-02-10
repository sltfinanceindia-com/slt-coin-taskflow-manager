import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseTabPersistenceOptions {
  defaultTab: string;
  paramName?: string;
  storageKey?: string;
}

export function useTabPersistence({
  defaultTab,
  paramName = 'tab',
  storageKey
}: UseTabPersistenceOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial tab from URL, sessionStorage, or default
  const getInitialTab = () => {
    const urlTab = searchParams.get(paramName);
    if (urlTab) {
      // Return base tab without embedded query params (e.g., "tasks?view=kanban" → "tasks")
      return urlTab.split('?')[0];
    }
    
    if (storageKey) {
      const storedTab = sessionStorage.getItem(storageKey);
      if (storedTab) {
        // Also clean stored tab of any query params
        return storedTab.split('?')[0];
      }
    }
    
    return defaultTab;
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  // Sync tab state with URL and storage
  const setActiveTab = useCallback((tab: string | unknown) => {
    // Guard against non-string values (e.g., objects passed from event handlers)
    const tabStr = typeof tab === 'string' ? tab : String(tab || defaultTab);
    if (tabStr === '[object Object]' || !tabStr) {
      return; // Ignore invalid tab values
    }
    
    setActiveTabState(tabStr);
    
    // Update URL without full page reload
    const newParams = new URLSearchParams(searchParams);
    newParams.set(paramName, tabStr);
    setSearchParams(newParams, { replace: true });
    
    // Store in sessionStorage for refresh persistence
    if (storageKey) {
      sessionStorage.setItem(storageKey, tabStr);
    }
  }, [searchParams, setSearchParams, paramName, storageKey, defaultTab]);

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const urlTab = searchParams.get(paramName);
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
      if (storageKey) {
        sessionStorage.setItem(storageKey, urlTab);
      }
    }
  }, [searchParams, paramName, activeTab, storageKey]);

  // Listen for custom navigation events from GlobalSearch
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent<string>) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    return () => {
      window.removeEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    };
  }, [setActiveTab]);

  return {
    activeTab,
    setActiveTab
  };
}

// Hook for preserving scroll position within tabs
export function useScrollPersistence(tabId: string) {
  const storageKey = `scroll_${tabId}`;

  useEffect(() => {
    // Restore scroll position on mount
    const savedPosition = sessionStorage.getItem(storageKey);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      requestAnimationFrame(() => {
        window.scrollTo(0, position);
      });
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [storageKey, tabId]);
}
