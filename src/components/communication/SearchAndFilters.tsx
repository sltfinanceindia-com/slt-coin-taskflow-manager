import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  User,
  MessageSquare,
  File,
  Image,
  Video,
  Mic,
  Star,
  Archive,
  Tag,
  Settings,
  Save,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  Hash,
  AtSign,
  Paperclip
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  dateRange?: DateRange;
  sender?: string;
  messageType: 'all' | 'text' | 'image' | 'file' | 'voice' | 'video';
  hasAttachments: boolean;
  isStarred: boolean;
  isArchived: boolean;
  channel?: string;
  tags: string[];
  minLength?: number;
  maxLength?: number;
  sortBy: 'date' | 'relevance' | 'sender' | 'length';
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  channel: string;
  isStarred: boolean;
  isArchived: boolean;
  tags: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
  }>;
  highlight?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface SearchAndFiltersProps {
  className?: string;
  onSearch?: (filters: SearchFilters) => void;
  onResultClick?: (result: SearchResult) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function SearchAndFilters({
  className,
  onSearch,
  onResultClick,
  initialFilters
}: SearchAndFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    messageType: 'all',
    hasAttachments: false,
    isStarred: false,
    isArchived: false,
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const availableTags = ['urgent', 'meeting', 'project', 'feedback', 'announcement', 'question'];
  const availableChannels = ['general', 'development', 'design', 'marketing', 'support'];
  const availableSenders = ['John Doe', 'Sarah Wilson', 'Mike Johnson', 'Emily Davis'];

  useEffect(() => {
    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        content: 'Can we schedule a meeting to discuss the project timeline?',
        sender: { id: '1', name: 'John Doe', avatar: '/avatars/john.png' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text',
        channel: 'general',
        isStarred: true,
        isArchived: false,
        tags: ['meeting', 'project'],
        highlight: 'meeting to discuss the project'
      },
      {
        id: '2',
        content: 'Here are the design mockups for the new feature',
        sender: { id: '2', name: 'Sarah Wilson', avatar: '/avatars/sarah.png' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        type: 'image',
        channel: 'design',
        isStarred: false,
        isArchived: false,
        tags: ['design'],
        attachments: [{ id: '1', name: 'mockups.png', type: 'image/png', size: 2048576 }]
      }
    ];

    setSearchResults(mockResults);
  }, []);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onSearch?.(newFilters);
  };

  const performSearch = async () => {
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      toast.success(`Found ${searchResults.length} results`);
    }, 1000);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      messageType: 'all',
      hasAttachments: false,
      isStarred: false,
      isArchived: false,
      tags: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onSearch?.(clearedFilters);
    toast.success('Filters cleared');
  };

  const saveSearch = () => {
    if (saveSearchName.trim()) {
      const newSavedSearch: SavedSearch = {
        id: Date.now().toString(),
        name: saveSearchName.trim(),
        filters: { ...filters },
        createdAt: new Date()
      };
      
      setSavedSearches(prev => [...prev, newSavedSearch]);
      setSaveSearchName('');
      setShowSaveDialog(false);
      toast.success('Search saved');
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    onSearch?.(savedSearch.filters);
    toast.success(`Loaded search: ${savedSearch.name}`);
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
    toast.success('Saved search deleted');
  };

  const exportResults = () => {
    // Export search results to CSV
    toast.success('Exporting search results...');
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'file': return <File className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={exportResults}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages, files, and more..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            className="pl-10 pr-10"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => updateFilters({ query: '' })}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.messageType !== 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ messageType: filters.messageType === 'all' ? 'text' : 'all' })}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Messages
          </Button>
          <Button
            variant={filters.hasAttachments ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ hasAttachments: !filters.hasAttachments })}
          >
            <Paperclip className="h-3 w-3 mr-1" />
            Attachments
          </Button>
          <Button
            variant={filters.isStarred ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ isStarred: !filters.isStarred })}
          >
            <Star className="h-3 w-3 mr-1" />
            Starred
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.sender || filters.channel || filters.dateRange) && (
          <div className="flex flex-wrap gap-2">
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => updateFilters({ tags: filters.tags.filter(t => t !== tag) })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            {filters.sender && (
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {filters.sender}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => updateFilters({ sender: undefined })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {filters.channel && (
              <Badge variant="secondary" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />
                {filters.channel}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => updateFilters({ channel: undefined })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(range) => updateFilters({ dateRange: range })}
                />
              </div>

              {/* Message Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Message Type</Label>
                <Select
                  value={filters.messageType}
                  onValueChange={(value: SearchFilters['messageType']) => updateFilters({ messageType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text Messages</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="file">Files</SelectItem>
                    <SelectItem value="voice">Voice Messages</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sender</Label>
                <Select
                  value={filters.sender || ''}
                  onValueChange={(value) => updateFilters({ sender: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any sender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any sender</SelectItem>
                    {availableSenders.map(sender => (
                      <SelectItem key={sender} value={sender}>{sender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Channel */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Channel</Label>
                <Select
                  value={filters.channel || ''}
                  onValueChange={(value) => updateFilters({ channel: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any channel</SelectItem>
                    {availableChannels.map(channel => (
                      <SelectItem key={channel} value={channel}>#{channel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({ tags: [...filters.tags, tag] });
                        } else {
                          updateFilters({ tags: filters.tags.filter(t => t !== tag) });
                        }
                      }}
                    />
                    <Label htmlFor={tag} className="text-sm">{tag}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Length */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Message Length (characters)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Minimum</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minLength || ''}
                    onChange={(e) => updateFilters({ minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Maximum</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxLength || ''}
                    onChange={(e) => updateFilters({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort by</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: SearchFilters['sortBy']) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="sender">Sender</SelectItem>
                    <SelectItem value="length">Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: SearchFilters['sortOrder']) => updateFilters({ sortOrder: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      <div className="flex items-center">
                        <SortDesc className="h-4 w-4 mr-2" />
                        Descending
                      </div>
                    </SelectItem>
                    <SelectItem value="asc">
                      <div className="flex items-center">
                        <SortAsc className="h-4 w-4 mr-2" />
                        Ascending
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Search Button */}
        <Button 
          onClick={performSearch} 
          className="w-full" 
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>

        {/* Save Search */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-1" />
            Save Search
          </Button>
        </div>

        {showSaveDialog && (
          <Card className="p-4 space-y-3">
            <Label className="text-sm font-medium">Save Search</Label>
            <Input
              placeholder="Enter search name..."
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveSearch()}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveSearch}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saved Searches</Label>
            <div className="space-y-1">
              {savedSearches.map(savedSearch => (
                <div key={savedSearch.id} className="flex items-center justify-between p-2 border rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSavedSearch(savedSearch)}
                    className="flex-1 justify-start"
                  >
                    {savedSearch.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSavedSearch(savedSearch.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Search Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Search Results ({searchResults.length})
            </Label>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {searchResults.map(result => (
                <Card
                  key={result.id}
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onResultClick?.(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{result.sender.name}</span>
                          <span className="text-xs text-muted-foreground">#{result.channel}</span>
                          {result.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">
                        {result.highlight ? (
                          <span dangerouslySetInnerHTML={{ 
                            __html: result.content.replace(
                              new RegExp(`(${result.highlight})`, 'gi'),
                              '<mark>$1</mark>'
                            )
                          }} />
                        ) : (
                          result.content
                        )}
                      </p>
                      
                      {result.attachments && result.attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {result.attachments[0].name} ({formatFileSize(result.attachments[0].size)})
                          </span>
                        </div>
                      )}
                      
                      {result.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {result.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {searchResults.length === 0 && filters.query && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}