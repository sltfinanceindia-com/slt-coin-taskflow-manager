import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Calendar, User, MessageSquare, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string;
  channel_id: string;
  channel_name: string;
  created_at: string;
  highlighted_content?: string;
}

interface MessageSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  onResultClick: (result: SearchResult) => void;
  channels?: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface SearchFilters {
  channelId?: string;
  senderId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function MessageSearch({
  onSearch,
  onResultClick,
  channels = [],
  isOpen,
  onClose,
  className
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await onSearch(query, filters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, filters, onSearch]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <Card className={cn("w-96 max-h-[500px] flex flex-col shadow-lg", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Messages
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("h-6 w-6 p-0", showFilters && "text-primary")}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-2 space-y-2 pt-2 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Channel</label>
                <Select
                  value={filters.channelId || 'all'}
                  onValueChange={(value) =>
                    setFilters(prev => ({ ...prev, channelId: value === 'all' ? undefined : value }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    {channels.map(channel => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">From date</label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))
                  }
                />
              </div>
            </div>
            {(filters.channelId || filters.dateFrom) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({})}
                className="text-xs h-6"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-2">
        {isSearching ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {query.length >= 2 ? 'No messages found' : 'Type to search messages'}
            </p>
            {query.length > 0 && query.length < 2 && (
              <p className="text-xs text-muted-foreground mt-1">
                Enter at least 2 characters
              </p>
            )}
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground px-1">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onResultClick(result)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{result.sender_name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      #{result.channel_name}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(result.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {highlightMatch(result.content, query)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
