import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  MessageSquare,
  Star,
  Pin,
  Paperclip,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react';

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

interface SearchAndFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableAuthors: { id: string; name: string }[];
  resultCount?: number;
}

export function SearchAndFilters({ 
  filters, 
  onFiltersChange, 
  availableAuthors,
  resultCount 
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
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

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search messages, files, or people..."
          value={filters.text}
          onChange={(e) => updateFilters({ text: e.target.value })}
          className="pl-10 pr-12"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter Messages</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </div>

                <Separator />

                {/* Authors Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    From
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableAuthors.map((author) => (
                      <div key={author.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={author.id}
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
                        <label 
                          htmlFor={author.id} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {author.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Message Types */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message Type
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'text', label: 'Text Messages' },
                      { id: 'file', label: 'File Shares' },
                      { id: 'image', label: 'Images' },
                      { id: 'video', label: 'Videos' },
                      { id: 'link', label: 'Links' }
                    ].map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={filters.messageTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilters({ 
                                messageTypes: [...filters.messageTypes, type.id] 
                              });
                            } else {
                              updateFilters({ 
                                messageTypes: filters.messageTypes.filter(t => t !== type.id) 
                              });
                            }
                          }}
                        />
                        <label 
                          htmlFor={type.id} 
                          className="text-sm font-medium leading-none"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Special Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attachments"
                        checked={filters.hasAttachments}
                        onCheckedChange={(checked) => 
                          updateFilters({ hasAttachments: checked as boolean })
                        }
                      />
                      <label htmlFor="attachments" className="text-sm flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        Has attachments
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pinned"
                        checked={filters.isPinned}
                        onCheckedChange={(checked) => 
                          updateFilters({ isPinned: checked as boolean })
                        }
                      />
                      <label htmlFor="pinned" className="text-sm flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned messages
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="starred"
                        checked={filters.isStarred}
                        onCheckedChange={(checked) => 
                          updateFilters({ isStarred: checked as boolean })
                        }
                      />
                      <label htmlFor="starred" className="text-sm flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Starred messages
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Sort by
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.sortBy === 'newest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilters({ sortBy: 'newest' })}
                      className="flex-1"
                    >
                      <SortDesc className="h-3 w-3 mr-1" />
                      Newest
                    </Button>
                    <Button
                      variant={filters.sortBy === 'oldest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilters({ sortBy: 'oldest' })}
                      className="flex-1"
                    >
                      <SortAsc className="h-3 w-3 mr-1" />
                      Oldest
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilterCount > 0 || filters.text) && (
        <div className="flex items-center gap-2 text-sm">
          {resultCount !== undefined && (
            <span className="text-muted-foreground">
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
          )}
          
          {filters.text && (
            <Badge variant="secondary">
              "{filters.text}"
            </Badge>
          )}
          
          {filters.authors.length > 0 && (
            <Badge variant="secondary">
              From: {filters.authors.length} user{filters.authors.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {filters.messageTypes.length > 0 && (
            <Badge variant="secondary">
              Type: {filters.messageTypes.join(', ')}
            </Badge>
          )}
          
          {filters.hasAttachments && (
            <Badge variant="secondary">
              <Paperclip className="h-3 w-3 mr-1" />
              With files
            </Badge>
          )}
          
          {filters.isPinned && (
            <Badge variant="secondary">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
          
          {filters.isStarred && (
            <Badge variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              Starred
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}