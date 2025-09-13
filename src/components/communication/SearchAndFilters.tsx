import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  MessageSquare,
  Star,
  Pin,
  Paperclip,
  Clock,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  FileText,
  Image,
  Video,
  Link,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilters {
  text: string;
  authors: string[];
  dateRange: { from: Date | null; to: Date | null };
  messageTypes: string[];
  hasAttachments: boolean;
  isPinned: boolean;
  isStarred: boolean;
  sortBy: 'newest' | 'oldest' | 'relevance';
}

interface Author {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface SearchAndFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableAuthors: Author[];
  resultCount?: number;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchAndFilters({ 
  filters, 
  onFiltersChange, 
  availableAuthors,
  resultCount,
  isLoading = false,
  onSearch
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAuthorPicker, setShowAuthorPicker] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      text: '',
      authors: [],
      dateRange: { from: null, to: null },
      messageTypes: [],
      hasAttachments: false,
      isPinned: false,
      isStarred: false,
      sortBy: 'newest'
    });
  };

  const clearTextSearch = () => {
    updateFilters({ text: '' });
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'author':
        updateFilters({ 
          authors: filters.authors.filter(id => id !== value) 
        });
        break;
      case 'messageType':
        updateFilters({ 
          messageTypes: filters.messageTypes.filter(t => t !== value) 
        });
        break;
      case 'dateRange':
        updateFilters({ dateRange: { from: null, to: null } });
        break;
      case 'hasAttachments':
        updateFilters({ hasAttachments: false });
        break;
      case 'isPinned':
        updateFilters({ isPinned: false });
        break;
      case 'isStarred':
        updateFilters({ isStarred: false });
        break;
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.authors.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.messageTypes.length > 0) count++;
    if (filters.hasAttachments) count++;
    if (filters.isPinned) count++;
    if (filters.isStarred) count++;
    return count;
  };

  const filteredAuthors = useMemo(() => {
    return availableAuthors.filter(author =>
      author.name.toLowerCase().includes(authorSearch.toLowerCase())
    );
  }, [availableAuthors, authorSearch]);

  const getAuthorName = (authorId: string) => {
    return availableAuthors.find(a => a.id === authorId)?.name || 'Unknown';
  };

  const formatDateRange = () => {
    const { from, to } = filters.dateRange;
    if (from && to) {
      return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
    } else if (from) {
      return `From ${from.toLocaleDateString()}`;
    } else if (to) {
      return `Until ${to.toLocaleDateString()}`;
    }
    return '';
  };

  const messageTypeConfig = [
    { id: 'text', label: 'Text Messages', icon: MessageSquare },
    { id: 'file', label: 'Files', icon: FileText },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'link', label: 'Links', icon: Link }
  ];

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-3 bg-background/95 backdrop-blur-sm border-b p-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search messages, files, or people..."
            value={filters.text}
            onChange={(e) => updateFilters({ text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSearch) {
                onSearch(filters.text);
              }
            }}
            className="pl-10 pr-10 h-10 bg-background/50"
            disabled={isLoading}
          />
          {filters.text && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTextSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-10 px-3 gap-2 relative"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filter Messages</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-96">
              <div className="p-4 space-y-6">
                {/* Authors Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <label className="text-sm font-medium">From People</label>
                  </div>
                  
                  <Popover open={showAuthorPicker} onOpenChange={setShowAuthorPicker}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filters.authors.length > 0 
                          ? `${filters.authors.length} selected` 
                          : "Select people"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-3 border-b">
                        <Input
                          placeholder="Search people..."
                          value={authorSearch}
                          onChange={(e) => setAuthorSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <ScrollArea className="max-h-48">
                        <div className="p-2">
                          {filteredAuthors.map((author) => (
                            <div key={author.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-md">
                              <Checkbox
                                id={`author-${author.id}`}
                                checked={filters.authors.includes(author.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilters({ 
                                      authors: [...filters.authors, author.id] 
                                    });
                                  } else {
                                    updateFilters({ 
                                      authors: filters.authors.filter(id => id !== author.id) 
                                    });
                                  }
                                }}
                              />
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {author.name}
                                </div>
                                {author.role && (
                                  <div className="text-xs text-muted-foreground">
                                    {author.role}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <Separator />

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <label className="text-sm font-medium">Date Range</label>
                  </div>
                  
                  <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {formatDateRange() || "Select date range"}
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: filters.dateRange.from || undefined,
                          to: filters.dateRange.to || undefined
                        }}
                        onSelect={(range) => {
                          updateFilters({
                            dateRange: {
                              from: range?.from || null,
                              to: range?.to || null
                            }
                          });
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Separator />

                {/* Message Types */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <label className="text-sm font-medium">Content Type</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {messageTypeConfig.map((type) => {
                      const Icon = type.icon;
                      const isSelected = filters.messageTypes.includes(type.id);
                      
                      return (
                        <Button
                          key={type.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              updateFilters({ 
                                messageTypes: filters.messageTypes.filter(t => t !== type.id) 
                              });
                            } else {
                              updateFilters({ 
                                messageTypes: [...filters.messageTypes, type.id] 
                              });
                            }
                          }}
                          className="justify-start gap-2"
                        >
                          <Icon className="h-3 w-3" />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Special Filters */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Special Filters</label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="attachments"
                        checked={filters.hasAttachments}
                        onCheckedChange={(checked) => 
                          updateFilters({ hasAttachments: checked as boolean })
                        }
                      />
                      <label htmlFor="attachments" className="text-sm flex items-center gap-2 cursor-pointer">
                        <Paperclip className="h-4 w-4" />
                        Has attachments
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="pinned"
                        checked={filters.isPinned}
                        onCheckedChange={(checked) => 
                          updateFilters({ isPinned: checked as boolean })
                        }
                      />
                      <label htmlFor="pinned" className="text-sm flex items-center gap-2 cursor-pointer">
                        <Pin className="h-4 w-4" />
                        Pinned messages
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="starred"
                        checked={filters.isStarred}
                        onCheckedChange={(checked) => 
                          updateFilters({ isStarred: checked as boolean })
                        }
                      />
                      <label htmlFor="starred" className="text-sm flex items-center gap-2 cursor-pointer">
                        <Star className="h-4 w-4" />
                        Starred messages
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sort Options */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <label className="text-sm font-medium">Sort Order</label>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { value: 'newest', label: 'Newest', icon: SortDesc },
                      { value: 'oldest', label: 'Oldest', icon: SortAsc },
                      { value: 'relevance', label: 'Relevance', icon: Star }
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          variant={filters.sortBy === option.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateFilters({ sortBy: option.value as any })}
                          className="gap-1"
                        >
                          <Icon className="h-3 w-3" />
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Sort Quick Access */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateFilters({ 
            sortBy: filters.sortBy === 'newest' ? 'oldest' : 'newest' 
          })}
          className="h-10 px-3"
          title={`Sort by ${filters.sortBy === 'newest' ? 'oldest' : 'newest'} first`}
        >
          {filters.sortBy === 'newest' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Active Filters & Results */}
      {(activeFilterCount > 0 || filters.text || resultCount !== undefined) && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {resultCount !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {isLoading ? 'Searching...' : `${resultCount} result${resultCount !== 1 ? 's' : ''}`}
                </Badge>
                {resultCount > 0 && filters.text && (
                  <span className="text-muted-foreground">for</span>
                )}
              </div>
            )}
            
            {filters.text && (
              <Badge variant="secondary" className="gap-1">
                "{filters.text}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTextSearch}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.authors.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {filters.authors.length === 1 
                  ? getAuthorName(filters.authors[0])
                  : `${filters.authors.length} people`
                }
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('author')}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {formatDateRange() && (
              <Badge variant="secondary" className="gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formatDateRange()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('dateRange')}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.messageTypes.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {messageTypeConfig.find(t => t.id === type)?.label || type}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('messageType', type)}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            
            {filters.hasAttachments && (
              <Badge variant="secondary" className="gap-1">
                <Paperclip className="h-3 w-3" />
                With files
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('hasAttachments')}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.isPinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" />
                Pinned
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('isPinned')}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            
            {filters.isStarred && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Starred
                <Button
                  variant="ghost"
                  Size="sm"
                  onClick={() => removeFilter('isStarred')}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
          </div>

          {(activeFilterCount > 0 || filters.text) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
