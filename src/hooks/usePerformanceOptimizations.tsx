import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  persistence?: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      persistence: 'memory',
      ...options
    };

    // Load from persistent storage if enabled
    if (this.options.persistence !== 'memory') {
      this.loadFromStorage();
    }
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    const valid = entries.filter(([_, entry]) => now - entry.timestamp <= entry.ttl);
    
    return {
      total: this.cache.size,
      valid: valid.length,
      expired: this.cache.size - valid.length,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    return JSON.stringify(Array.from(this.cache.entries())).length;
  }

  private loadFromStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      const cached = storage.getItem(`cache_${this.constructor.name}`);
      if (cached) {
        const entries = JSON.parse(cached);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      const entries = Array.from(this.cache.entries());
      storage.setItem(`cache_${this.constructor.name}`, JSON.stringify(entries));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private getStorage(): Storage | null {
    switch (this.options.persistence) {
      case 'localStorage':
        return typeof window !== 'undefined' ? localStorage : null;
      case 'sessionStorage':
        return typeof window !== 'undefined' ? sessionStorage : null;
      default:
        return null;
    }
  }
}

// Specialized caches for different data types
export const messageCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 1000,
  persistence: 'localStorage'
});

export const channelCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
  persistence: 'localStorage'
});

export const userCache = new CacheManager({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 200,
  persistence: 'localStorage'
});

export const fileCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 100,
  persistence: 'sessionStorage'
});

// Hook for cached data fetching
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cache?: CacheManager<T>;
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const {
    cache = messageCache,
    enabled = true,
    refetchInterval
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = cache.get(key);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return cached;
      }

      // Fetch fresh data
      const result = await fetcher();
      cache.set(key, result);
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, cache]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    fetchData();
  }, [key, cache, fetchData]);

  const mutate = useCallback((newData: T) => {
    cache.set(key, newData);
    setData(newData);
  }, [key, cache]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidate,
    mutate
  };
}

// Hook for offline capability
export function useOfflineCapability() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToSyncQueue = useCallback((action: string, data: any) => {
    const item = {
      id: crypto.randomUUID(),
      action,
      data,
      timestamp: Date.now()
    };

    setSyncQueue(prev => [...prev, item]);
    
    // Store in localStorage for persistence
    try {
      const stored = localStorage.getItem('sync_queue') || '[]';
      const queue = JSON.parse(stored);
      queue.push(item);
      localStorage.setItem('sync_queue', JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }
  }, []);

  const processSyncQueue = useCallback(async () => {
    try {
      const stored = localStorage.getItem('sync_queue');
      if (!stored) return;

      const queue = JSON.parse(stored);
      const processed: string[] = [];

      for (const item of queue) {
        try {
          await processQueueItem(item);
          processed.push(item.id);
        } catch (error) {
          console.warn('Failed to process sync item:', error);
          // Keep failed items in queue for retry
        }
      }

      // Remove processed items
      const remaining = queue.filter((item: any) => !processed.includes(item.id));
      localStorage.setItem('sync_queue', JSON.stringify(remaining));
      setSyncQueue(remaining);
    } catch (error) {
      console.warn('Failed to process sync queue:', error);
    }
  }, []);

  const processQueueItem = async (item: any) => {
    switch (item.action) {
      case 'send_message':
        await supabase.from('messages').insert(item.data);
        break;
      case 'update_message':
        await supabase.from('messages').update(item.data).eq('id', item.data.id);
        break;
      case 'delete_message':
        await supabase.from('messages').delete().eq('id', item.data.id);
        break;
      default:
        console.warn('Unknown sync action:', item.action);
    }
  };

  return {
    isOnline,
    syncQueue,
    addToSyncQueue,
    processSyncQueue
  };
}

// Service Worker for background sync (if supported)
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  }
}

// Performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    messageRenderTime: 0,
    cacheHitRate: 0,
    networkLatency: 0
  });

  const measureRenderTime = useCallback((startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      messageRenderTime: renderTime
    }));
  }, []);

  const updateCacheStats = useCallback(() => {
    const stats = messageCache.getStats();
    const hitRate = stats.total > 0 ? (stats.valid / stats.total) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate
    }));
  }, []);

  const measureNetworkLatency = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      await fetch('/api/ping', { method: 'HEAD' });
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: latency
      }));
    } catch (error) {
      console.warn('Failed to measure network latency:', error);
    }
  }, []);

  return {
    metrics,
    measureRenderTime,
    updateCacheStats,
    measureNetworkLatency
  };
}
