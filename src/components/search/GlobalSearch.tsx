import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useUniversalSearch, SearchResultType, UniversalSearchResult } from '@/hooks/useUniversalSearch';
import { Search, CheckSquare, FolderKanban, Users, Settings, LayoutDashboard, Calendar, FileText, Plus, MessageCircle, Clock, Briefcase, Loader2, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { standaloneRoutes, getRouteForTab } from '@/config/navigation';

const getIconForType = (type: SearchResultType) => {
  switch (type) {
    case 'task': return CheckSquare;
    case 'project': return FolderKanban;
    case 'employee': return Users;
    case 'message': return MessageCircle;
    case 'channel': return Hash;
    case 'leave': return Calendar;
    case 'timelog': return Clock;
    case 'request': return Briefcase;
    default: return FileText;
  }
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { results, loading, performSearch, clearResults } = useUniversalSearch();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, performSearch, clearResults]);

  // standaloneRoutes imported from @/config/navigation

  const navigateToTab = useCallback((tab: string) => {
    setOpen(false);
    setQuery('');
    navigate(getRouteForTab(tab));
  }, [navigate]);

  const handleResultClick = useCallback((result: UniversalSearchResult) => {
    setOpen(false);
    setQuery('');
    
    if (result.url) {
      const params = new URLSearchParams(result.url.replace('?', ''));
      const tab = params.get('tab');
      if (tab) {
        // Navigate directly to dashboard with tab parameter
        navigate(`/dashboard?tab=${tab}`);
      }
    }
  }, [navigate]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    setQuery('');
    command();
  }, []);

  const hasResults = results.length > 0;
  const isSearching = query.length >= 2;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search everything...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search tasks, projects, people, messages..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && isSearching && !hasResults && (
            <CommandEmpty>No results found for "{query}"</CommandEmpty>
          )}

          {!isSearching && (
            <>
              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={() => navigateToTab('tasks')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Task
                </CommandItem>
                <CommandItem onSelect={() => navigateToTab('projects')}>
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Create New Project
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Navigation">
                <CommandItem onSelect={() => navigateToTab('overview')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </CommandItem>
                <CommandItem onSelect={() => navigateToTab('tasks')}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Tasks
                </CommandItem>
                <CommandItem onSelect={() => navigateToTab('projects')}>
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Projects
                </CommandItem>
                <CommandItem onSelect={() => navigateToTab('interns')}>
                  <Users className="mr-2 h-4 w-4" />
                  Team Members
                </CommandItem>
                <CommandItem onSelect={() => navigateToTab('calendar')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </CommandItem>
                <CommandItem onSelect={() => navigateToTab('communication')}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Communication
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {!loading && hasResults && results.map((group) => {
            const Icon = getIconForType(group.type);
            return (
              <CommandGroup key={group.type} heading={group.label}>
                {group.results.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result)}
                    className="flex items-start gap-3 py-3"
                  >
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.title}</span>
                        {result.subtitle && (
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">
                            {result.subtitle}
                          </Badge>
                        )}
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
