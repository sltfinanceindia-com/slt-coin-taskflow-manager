import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface KanbanFiltersState {
  priority: string[];
  assignedTo: string[];
  dateRange: { start: string | null; end: string | null };
  projects: string[];
}

const DEFAULT_FILTERS: KanbanFiltersState = {
  priority: [],
  assignedTo: [],
  dateRange: { start: null, end: null },
  projects: [],
};

/**
 * Persists Kanban board filters per user in localStorage.
 * Filters are keyed by user profile ID + board variant.
 */
export function usePersistedKanbanFilters(boardId: string = 'default') {
  const { profile } = useAuth();
  const storageKey = `kanban-filters-${profile?.id || 'anon'}-${boardId}`;

  const [filters, setFiltersRaw] = useState<KanbanFiltersState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return DEFAULT_FILTERS;
  });

  // Re-load when user changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setFiltersRaw(JSON.parse(stored));
      else setFiltersRaw(DEFAULT_FILTERS);
    } catch {
      setFiltersRaw(DEFAULT_FILTERS);
    }
  }, [storageKey]);

  const setFilters = useCallback((newFilters: KanbanFiltersState | ((prev: KanbanFiltersState) => KanbanFiltersState)) => {
    setFiltersRaw(prev => {
      const resolved = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      try {
        localStorage.setItem(storageKey, JSON.stringify(resolved));
      } catch { /* quota exceeded, ignore */ }
      return resolved;
    });
  }, [storageKey]);

  const clearFilters = useCallback(() => {
    setFiltersRaw(DEFAULT_FILTERS);
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }, [storageKey]);

  // Convert serialized date strings back to Date objects for consumers
  const filtersWithDates = {
    priority: filters.priority,
    assignedTo: filters.assignedTo,
    dateRange: {
      start: filters.dateRange.start ? new Date(filters.dateRange.start) : null,
      end: filters.dateRange.end ? new Date(filters.dateRange.end) : null,
    },
    projects: filters.projects,
  };

  // Wrapper that serializes dates before storing
  const setFiltersWithDates = useCallback((incoming: any) => {
    const serialize = (f: any) => ({
      ...f,
      dateRange: {
        start: f.dateRange?.start ? (f.dateRange.start instanceof Date ? f.dateRange.start.toISOString() : f.dateRange.start) : null,
        end: f.dateRange?.end ? (f.dateRange.end instanceof Date ? f.dateRange.end.toISOString() : f.dateRange.end) : null,
      },
    });

    if (typeof incoming === 'function') {
      setFilters(prev => serialize(incoming({
        ...prev,
        dateRange: {
          start: prev.dateRange.start ? new Date(prev.dateRange.start) : null,
          end: prev.dateRange.end ? new Date(prev.dateRange.end) : null,
        },
      })));
    } else {
      setFilters(serialize(incoming));
    }
  }, [setFilters]);

  return { filters: filtersWithDates, setFilters: setFiltersWithDates, clearFilters };
}
