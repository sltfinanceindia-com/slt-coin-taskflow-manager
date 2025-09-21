import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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
  ChevronUp,
  FileText,
  Image,
  Video,
  Link,
  Users,
  Hash,
  Globe,
  MapPin,
  Zap,
  TrendingUp,
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  Settings,
  Save,
  Download,
  Upload,
  Share2,
  Copy,
  RefreshCw,
  Sparkles,
  Brain,
  Mic,
  Keyboard,
  Smartphone,
  Monitor,
  History,
  Bookmark,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Plus,
  Minus,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  text: string;
  authors: string[];
  channels: string[];
  dateRange: { from: Date | null; to: Date | null };
  messageTypes: string[];
  sentimentTypes: string[];
  priorities: string[];
  tags: string[];
  hasAttachments: boolean;
  hasReactions: boolean;
  hasThreads: boolean;
  isPinned: boolean;
  isStarred: boolean;
  isEdited: boolean;
  fileSize: { min: number; max: number };
  readStatus: 'all' | 'read' | 'unread';
  sortBy: 'newest' | 'oldest' | 'relevance' | 'reactions' | 'replies';
  viewMode: 'list' | 'grid' | 'compact' | 'timeline';
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  count?: number;
  timestamp?: Date;
}

interface SearchStats {
  totalResults: number;
  searchTime: number;
  suggestions: SearchSuggestion[];
  popularFilters: { filter: string; count: number }[];
  searchHistory: SearchSuggestion[];
}

interface Author {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  isOnline?: boolean;
  lastActive?: Date;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct' | 'group';
  description?: string;
  memberCount?: number;
  avatar?: string;
}

interface SmartFilter {
  id: string;
  name: string;
  description: string;
  filters: Partial<SearchFilters>;
  isCustom: boolean;
  useCount: number;
  createdAt: Date;
}

interface SearchAndFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableAuthors: Author[];
  availableChannels: Channel[];
  smartFilters?: SmartFilter[];
  searchStats?: SearchStats;
  resultCount?: number;
  isLoading?: boolean;
  enableAI?: boolean;
  enableVoiceSearch?: boolean;
  enableSmartFilters?: boolean;
  enableAdvancedSearch?: boolean;
  enableSearchAnalytics?: boolean;
  maxRecentSearches?: number;
  onSearch?: (query: string) => void;
  onSaveFilter?: (filter: SmartFilter) => void;
  onVoiceSearch?: () => void;
  onAdvancedSearch?: (filters: SearchFilters) => void;
  className?: string;
}

const quickDateRanges = [
  { label: 'Today', value: 'today', getDates: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Yesterday', value: 'yesterday', getDates: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: 'Last 7 days', value: '7days', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', value: '30days', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 3 months', value: '3months', getDates: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
];

const messageTypeConfig = [
  { id: 'text', label: 'Text Messages', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'file', label: 'Documents', icon: FileText, color: 'bg-green-500' },
  { id: 'image', label: 'Images', icon: Image, color: 'bg-purple-500' },
  { id: 'video', label: 'Videos', icon: Video, color: 'bg-red-500' },
  { id: 'audio', label: 'Audio', icon: Mic, color: 'bg-orange-500' },
  { id: 'link', label: 'Links', icon: Link, color: 'bg-cyan-500' },
  { id: 'code', label: 'Code Snippets', icon: Hash, color: 'bg-gray-500' },
];

const sentimentTypes = [
  { id: 'positive', label: '😊 Positive', color: 'text-green-600' },
  { id: 'negative', label: '😞 Negative', color: 'text-red-600' },
  { id: 'neutral', label: '😐 Neutral', color: 'text-gray-600' },
  { id: 'question', label: '❓ Questions', color: 'text-blue-600' },
];

const priorityTypes = [
  { id: 'urgent', label: '🔥 Urgent', color: 'text-red-600' },
  { id: 'high', label: '⚡ High', color: 'text-orange-600' },
  { id: 'normal', label: '📋 Normal', color: 'text-blue-600' },
  { id: 'low', label: '📝 Low', color: 'text-gray-600' },
];

export function SearchAndFilters({ 
  filters, 
  onFiltersChange, 
  availableAuthors,
  availableChannels = [],
  smartFilters = [],
  searchStats,
  resultCount,
  isLoading = false,
  enableAI = true,
  enableVoiceSearch = true,
  enableSmartFilters = true,
  enableAdvancedSearch = true,
  enableSearchAnalytics = false,
  maxRecentSearches = 10,
  onSearch,
  onSaveFilter,
  onVoiceSearch,
  onAdvancedSearch,
  className
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAuthorPicker, setShowAuthorPicker] = useState(false);
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [showSmartFilters, setShowSmartFilters] = useState(false);
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');
  const [channelSearch, setChannelSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [customFilterName, setCustomFilterName] = useState('');
  const [customFilterDescription, setCustomFilterDescription] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Enhanced search suggestions with AI
  const generateSearchSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchSuggestions(searchHistory.slice(0, 5));
      return;
    }

    const suggestions: SearchSuggestion[] = [];
    
    // Recent searches
    const recentMatches = searchHistory.filter(item => 
      item.text.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
    suggestions.push(...recentMatches);

    // AI-powered suggestions (simulated)
    if (enableAI) {
      const aiSuggestions = [
        { id: 'ai-1', text: `${query} in last week`, type: 'suggestion' as const },
        { id: 'ai-2', text: `files from ${query}`, type: 'suggestion' as const },
        { id: 'ai-3', text: `${query} with attachments`, type: 'suggestion' as const },
      ];
      suggestions.push(...aiSuggestions);
    }

    // Trending searches from stats
    if (searchStats?.suggestions) {
      const trendingMatches = searchStats.suggestions
        .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2);
      suggestions.push(...trendingMatches);
    }

    setSearchSuggestions(suggestions.slice(0, 8));
  }, [searchHistory, searchStats, enableAI]);

  // Debounced search suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateSearchSuggestions(filters.text);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [filters.text, generateSearchSuggestions]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      text: '',
      authors: [],
      channels: [],
      dateRange: { from: null, to: null },
      messageTypes: [],
      sentimentTypes: [],
      priorities: [],
      tags: [],
      hasAttachments: false,
      hasReactions: false,
      hasThreads: false,
      isPinned: false,
      isStarred: false,
      isEdited: false,
      fileSize: { min: 0, max: 100 },
      readStatus: 'all',
      sortBy: 'newest',
      viewMode: 'list'
    });
  }, [onFiltersChange]);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      // Add to search history
      const historyItem: SearchSuggestion = {
        id: Date.now().toString(),
        text: query,
        type: 'recent',
        timestamp: new Date()
      };
      
      setSearchHistory(prev => [
        historyItem,
        ...prev.filter(item => item.text !== query).slice(0, maxRecentSearches - 1)
      ]);
    }
    
    onSearch?.(query);
    setShowSuggestions(false);
  }, [onSearch, maxRecentSearches]);

  const handleVoiceSearch = useCallback(async () => {
    if (!enableVoiceSearch) return;
    
    setIsVoiceRecording(true);
    try {
      await onVoiceSearch?.();
      toast({
        title: "Voice search completed",
        description: "Your voice has been converted to text",
      });
    } catch (error) {
      toast({
        title: "Voice search failed",
        description: "Could not process voice input. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoiceRecording(false);
    }
  }, [enableVoiceSearch, onVoiceSearch, toast]);

  const handleSaveSmartFilter = useCallback(() => {
    if (!customFilterName.trim()) return;

    const smartFilter: SmartFilter = {
      id: Date.now().toString(),
      name: customFilterName,
      description: customFilterDescription,
      filters: { ...filters },
      isCustom: true,
      useCount: 0,
      createdAt: new Date()
    };

    onSaveFilter?.(smartFilter);
    setShowSaveFilter(false);
    setCustomFilterName('');
    setCustomFilterDescription('');
    
    toast({
      title: "Filter saved",
      description: `"${customFilterName}" has been saved to your smart filters`,
    });
  }, [customFilterName, customFilterDescription, filters, onSaveFilter, toast]);

  const applySmartFilter = useCallback((smartFilter: SmartFilter) => {
    onFiltersChange({ ...filters, ...smartFilter.filters });
    setShowSmartFilters(false);
    
    toast({
      title: "Filter applied",
      description: `"${smartFilter.name}" filter has been applied`,
    });
  }, [filters, onFiltersChange, toast]);

  const removeFilter = useCallback((type: string, value?: string) => {
    switch (type) {
      case 'author':
        updateFilters({ authors: filters.authors.filter(id => id !== value) });
        break;
      case 'channel':
        updateFilters({ channels: filters.channels.filter(id => id !== value) });
        break;
      case 'messageType':
        updateFilters({ messageTypes: filters.messageTypes.filter(t => t !== value) });
        break;
      case 'sentimentType':
        updateFilters({ sentimentTypes: filters.sentimentTypes.filter(t => t !== value) });
        break;
      case 'priority':
        updateFilters({ priorities: filters.priorities.filter(t => t !== value) });
        break;
      case 'tag':
        updateFilters({ tags: filters.tags.filter(t => t !== value) });
        break;
      case 'dateRange':
        updateFilters({ dateRange: { from: null, to: null } });
        break;
      case 'hasAttachments':
        updateFilters({ hasAttachments: false });
        break;
      case 'hasReactions':
        updateFilters({ hasReactions: false });
        break;
      case 'hasThreads':
        updateFilters({ hasThreads: false });
        break;
      case 'isPinned':
        updateFilters({ isPinned: false });
        break;
      case 'isStarred':
        updateFilters({ isStarred: false });
        break;
      case 'isEdited':
        updateFilters({ isEdited: false });
        break;
    }
  }, [updateFilters, filters]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.authors.length > 0) count++;
    if (filters.channels.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.messageTypes.length > 0) count++;
    if (filters.sentimentTypes.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.hasAttachments) count++;
    if (filters.hasReactions) count++;
    if (filters.hasThreads) count++;
    if (filters.isPinned) count++;
    if (filters.isStarred) count++;
    if (filters.isEdited) count++;
    if (filters.readStatus !== 'all') count++;
    return count;
  }, [filters]);

  const filteredAuthors = useMemo(() => {
    return availableAuthors.filter(author =>
      author.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
      author.role?.toLowerCase().includes(authorSearch.toLowerCase()) ||
      author.department?.toLowerCase().includes(authorSearch.toLowerCase())
    );
  }, [availableAuthors, authorSearch]);

  const filteredChannels = useMemo(() => {
    return availableChannels.filter(channel =>
      channel.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
      channel.description?.toLowerCase().includes(channelSearch.toLowerCase())
    );
  }, [availableChannels, channelSearch]);

  const getAuthorName = useCallback((authorId: string) => {
    return availableAuthors.find(a => a.id === authorId)?.name || 'Unknown';
  }, [availableAuthors]);

  const getChannelName = useCallback((channelId: string) => {
    return availableChannels.find(c => c.id === channelId)?.name || 'Unknown';
  }, [availableChannels]);

  const formatDateRange = useCallback(() => {
    const { from, to } = filters.dateRange;
    if (from && to) {
      if (from.toDateString() === to.toDateString()) {
        return format(from, 'MMM d, yyyy');
      }
      return `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`;
    } else if (from) {
      return `From ${format(from, 'MMM d, yyyy')}`;
    } else if (to) {
      return `Until ${format(to, 'MMM d, yyyy')}`;
    }
    return '';
  }, [filters.dateRange]);

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0 || filters.text;

  const renderSearchSuggestions = () => {
    if (!showSuggestions || searchSuggestions.length === 0) return null;

    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border-primary/20">
        <CardContent className="p-2">
          <div className="space-y-1">
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full text-left px-3 py-2 hover:bg-accent rounded-md flex items-center justify-between transition-colors"
                onClick={() => {
                  updateFilters({ text: suggestion.text });
                  handleSearch(suggestion.text);
                }}
              >
                <div className="flex items-center gap-2">
                  {suggestion.type === 'recent' && <History className="h-3 w-3 text-muted-foreground" />}
                  {suggestion.type === 'trending' && <TrendingUp className="h-3 w-3 text-orange-500" />}
                  {suggestion.type === 'suggestion' && <Sparkles className="h-3 w-3 text-purple-500" />}
                  <span className="text-sm">{suggestion.text}</span>
                </div>
                {suggestion.count && (
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSmartFilters = () => (
    <div className="space-y-4 w-96">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Smart Filters</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveFilter(true)}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Save Current
        </Button>
      </div>

      <ScrollArea className="max-h-80">
        <div className="space-y-2">
          {smartFilters.map((filter) => (
            <Card key={filter.id} className="p-3 hover:bg-accent/50 cursor-pointer transition-colors">
              <div 
                className="space-y-2"
                onClick={() => applySmartFilter(filter)}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">{filter.name}</h5>
                  <div className="flex items-center gap-1">
                    {filter.isCustom ? (
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">System</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{filter.useCount}</span>
                  </div>
                </div>
                {filter.description && (
                  <p className="text-xs text-muted-foreground">{filter.description}</p>
                )}
              </div>
            </Card>
          ))}

          {smartFilters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved filters yet</p>
              <p className="text-xs">Create smart filters to save time</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="w-[600px] max-h-[80vh]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <ScrollArea className="max-h-[500px] mt-4">
          <TabsContent value="basic" className="space-y-6 px-1">
            {/* Authors Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <label className="text-sm font-medium">People</label>
                <Badge variant="outline" className="text-xs">
                  {filters.authors.length}
                </Badge>
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
                  <Command>
                    <CommandInput 
                      placeholder="Search people..." 
                      value={authorSearch}
                      onValueChange={setAuthorSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No people found.</CommandEmpty>
                      <CommandGroup>
                        {filteredAuthors.map((author) => (
                          <CommandItem key={author.id} className="flex items-center space-x-3 p-2">
                            <Checkbox
                              checked={filters.authors.includes(author.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFilters({ authors: [...filters.authors, author.id] });
                                } else {
                                  updateFilters({ authors: filters.authors.filter(id => id !== author.id) });
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
                              <div className="text-sm font-medium truncate">{author.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {author.role && <span>{author.role}</span>}
                                {author.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Channels Filter */}
            {availableChannels.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <label className="text-sm font-medium">Channels</label>
                  <Badge variant="outline" className="text-xs">
                    {filters.channels.length}
                  </Badge>
                </div>
                
                <Popover open={showChannelPicker} onOpenChange={setShowChannelPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.channels.length > 0 
                        ? `${filters.channels.length} selected` 
                        : "Select channels"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search channels..." 
                        value={channelSearch}
                        onValueChange={setChannelSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No channels found.</CommandEmpty>
                        <CommandGroup>
                          {filteredChannels.map((channel) => (
                            <CommandItem key={channel.id} className="flex items-center space-x-3 p-2">
                              <Checkbox
                                checked={filters.channels.includes(channel.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilters({ channels: [...filters.channels, channel.id] });
                                  } else {
                                    updateFilters({ channels: filters.channels.filter(id => id !== channel.id) });
                                  }
                                }}
                              />
                              <div className={cn(
                                "w-6 h-6 rounded flex items-center justify-center text-xs font-medium",
                                channel.type === 'private' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                              )}>
                                {channel.type === 'private' ? '🔒' : '#'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{channel.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {channel.memberCount} members • {channel.type}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Date Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <label className="text-sm font-medium">Date Range</label>
              </div>
              
              {/* Quick date ranges */}
              <div className="grid grid-cols-2 gap-2">
                {quickDateRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dates = range.getDates();
                      updateFilters({ dateRange: dates });
                    }}
                    className="text-xs justify-start"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formatDateRange() || "Custom date range"}
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
          </TabsContent>

          <TabsContent value="content" className="space-y-6 px-1">
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
                      className="justify-start gap-2 h-9"
                    >
                      <div className={cn("w-2 h-2 rounded-full", type.color)} />
                      <Icon className="h-3 w-3" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* AI-Powered Sentiment Analysis */}
            {enableAI && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <label className="text-sm font-medium">Sentiment</label>
                  <Badge variant="secondary" className="text-xs">AI</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {sentimentTypes.map((sentiment) => {
                    const isSelected = filters.sentimentTypes.includes(sentiment.id);
                    
                    return (
                      <Button
                        key={sentiment.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            updateFilters({ 
                              sentimentTypes: filters.sentimentTypes.filter(t => t !== sentiment.id) 
                            });
                          } else {
                            updateFilters({ 
                              sentimentTypes: [...filters.sentimentTypes, sentiment.id] 
                            });
                          }
                        }}
                        className={cn("justify-start gap-2 h-9", sentiment.color)}
                      >
                        <span className="text-sm">{sentiment.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Priority Levels */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <label className="text-sm font-medium">Priority</label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {priorityTypes.map((priority) => {
                  const isSelected = filters.priorities.includes(priority.id);
                  
                  return (
                    <Button
                      key={priority.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          updateFilters({ 
                            priorities: filters.priorities.filter(t => t !== priority.id) 
                          });
                        } else {
                          updateFilters({ 
                            priorities: [...filters.priorities, priority.id] 
                          });
                        }
                      }}
                      className={cn("justify-start gap-2 h-9", priority.color)}
                    >
                      <span className="text-sm">{priority.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6 px-1">
            {/* File Size Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <label className="text-sm font-medium">File Size (MB)</label>
              </div>
              
              <div className="px-2">
                <Slider
                  value={[filters.fileSize.min, filters.fileSize.max]}
                  onValueChange={(value) => 
                    updateFilters({ 
                      fileSize: { min: value[0], max: value[1] } 
                    })
                  }
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.fileSize.min}MB</span>
                  <span>{filters.fileSize.max}MB</span>
                </div>
              </div>
            </div>

            {/* Read Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <label className="text-sm font-medium">Read Status</label>
              </div>
              
              <RadioGroup
                value={filters.readStatus}
                onValueChange={(value: any) => updateFilters({ readStatus: value })}
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { value: 'all', label: 'All', icon: Eye },
                  { value: 'read', label: 'Read', icon: CheckCircle },
                  { value: 'unread', label: 'Unread', icon: AlertCircle },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <label 
                      key={option.value}
                      className={cn(
                        "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors",
                        filters.readStatus === option.value ? "border-primary bg-primary/5" : "hover:bg-accent"
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <Icon className="h-3 w-3" />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Special Filters */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Special Properties</label>
              
              <div className="space-y-3">
                {[
                  { key: 'hasAttachments', label: 'Has attachments', icon: Paperclip },
                  { key: 'hasReactions', label: 'Has reactions', icon: Heart },
                  { key: 'hasThreads', label: 'Has replies', icon: MessageSquare },
                  { key: 'isPinned', label: 'Pinned messages', icon: Pin },
                  { key: 'isStarred', label: 'Starred messages', icon: Star },
                  { key: 'isEdited', label: 'Edited messages', icon: Edit3 },
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <div key={filter.key} className="flex items-center justify-between">
                      <label className="text-sm flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {filter.label}
                      </label>
                      <Switch
                        checked={filters[filter.key as keyof SearchFilters] as boolean}
                        onCheckedChange={(checked) => 
                          updateFilters({ [filter.key]: checked })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 px-1">
            {/* Sort Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <label className="text-sm font-medium">Sort Order</label>
              </div>
              
              <RadioGroup
                value={filters.sortBy}
                onValueChange={(value: any) => updateFilters({ sortBy: value })}
                className="space-y-2"
              >
                {[
                  { value: 'newest', label: 'Newest first', icon: ArrowDown },
                  { value: 'oldest', label: 'Oldest first', icon: ArrowUp },
                  { value: 'relevance', label: 'Most relevant', icon: Star },
                  { value: 'reactions', label: 'Most reactions', icon: Heart },
                  { value: 'replies', label: 'Most replies', icon: MessageSquare },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <label 
                      key={option.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* View Mode */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                <label className="text-sm font-medium">View Mode</label>
              </div>
              
              <RadioGroup
                value={filters.viewMode}
                onValueChange={(value: any) => updateFilters({ viewMode: value })}
                className="grid grid-cols-2 gap-2"
              >
                {[
                  { value: 'list', label: 'List', icon: List },
                  { value: 'grid', label: 'Grid', icon: Grid3X3 },
                  { value: 'compact', label: 'Compact', icon: Minimize2 },
                  { value: 'timeline', label: 'Timeline', icon: Activity },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <label 
                      key={option.value}
                      className={cn(
                        "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors",
                        filters.viewMode === option.value ? "border-primary bg-primary/5" : "hover:bg-accent"
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <Icon className="h-3 w-3" />
                      <span className="text-xs">{option.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Search Analytics */}
            {enableSearchAnalytics && searchStats && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <label className="text-sm font-medium">Search Analytics</label>
                </div>
                
                <Card className="p-3 bg-muted/30">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Search time:</span>
                      <span className="font-mono">{searchStats.searchTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total results:</span>
                      <span className="font-mono">{searchStats.totalResults}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Popular filters:</span>
                      <div className="flex gap-1">
                        {searchStats.popularFilters.slice(0, 2).map((filter) => (
                          <Badge key={filter.filter} variant="secondary" className="text-xs">
                            {filter.filter}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );

  return (
    <TooltipProvider>
      <div className={cn("space-y-3 bg-gradient-to-r from-background/95 to-muted/30 backdrop-blur-lg border-b p-4", className)}>
        {/* Enhanced Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search messages, files, or people... Use @ for users, # for channels"
              value={filters.text}
              onChange={(e) => updateFilters({ text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch(filters.text);
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-20 h-11 bg-background/60 border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
              disabled={isLoading}
            />
            
            {/* Search controls */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {enableVoiceSearch && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceSearch}
                      disabled={isVoiceRecording}
                      className={cn(
                        "h-7 w-7 p-0 transition-colors",
                        isVoiceRecording && "text-red-500 animate-pulse"
                      )}
                    >
                      <Mic className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice search</TooltipContent>
                </Tooltip>
              )}
              
              {filters.text && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ text: '' })}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Search Suggestions */}
            {renderSearchSuggestions()}
          </div>

          {/* Smart Filters */}
          {enableSmartFilters && smartFilters.length > 0 && (
            <Popover open={showSmartFilters} onOpenChange={setShowSmartFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 px-3 gap-2">
                  <Sparkles className="h-4 w-4" />
                  Smart
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4" align="end">
                {renderSmartFilters()}
              </PopoverContent>
            </Popover>
          )}

          {/* Advanced Search */}
          {enableAdvancedSearch && (
            <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 px-3 gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Advanced Search & Filters
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  {renderAdvancedFilters()}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Basic Filter Button */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-11 px-3 gap-2 relative"
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
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Quick Filters</h4>
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

              <ScrollArea className="max-h-96 p-4">
                <div className="space-y-4">
                  {/* Quick toggles */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'hasAttachments', label: 'Files', icon: Paperclip },
                      { key: 'isPinned', label: 'Pinned', icon: Pin },
                      { key: 'isStarred', label: 'Starred', icon: Star },
                      { key: 'hasReactions', label: 'Reactions', icon: Heart },
                    ].map((filter) => {
                      const Icon = filter.icon;
                      const isActive = filters[filter.key as keyof SearchFilters] as boolean;
                      return (
                        <Button
                          key={filter.key}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => 
                            updateFilters({ [filter.key]: !isActive })
                          }
                          className="justify-start gap-2 h-8"
                        >
                          <Icon className="h-3 w-3" />
                          <span className="text-xs">{filter.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Quick date filters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Dates</label>
                    <div className="grid grid-cols-2 gap-1">
                      {quickDateRanges.slice(0, 4).map((range) => (
                        <Button
                          key={range.value}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const dates = range.getDates();
                            updateFilters({ dateRange: dates });
                          }}
                          className="text-xs h-8"
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Sort Quick Access */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ 
                  sortBy: filters.sortBy === 'newest' ? 'oldest' : 'newest' 
                })}
                className="h-11 px-3"
              >
                {filters.sortBy === 'newest' ? 
                  <SortDesc className="h-4 w-4" /> : 
                  <SortAsc className="h-4 w-4" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Currently sorting by {filters.sortBy} • Click to toggle
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Active Filters & Results Display */}
        {(hasActiveFilters || resultCount !== undefined) && (
          <div className="flex items-start justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              {/* Results count */}
              {resultCount !== undefined && (
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-normal",
                      isLoading && "animate-pulse"
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      <>
                        <Search className="h-3 w-3 mr-1" />
                        {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''}
                        {searchStats && (
                          <span className="text-muted-foreground ml-1">
                            ({searchStats.searchTime}ms)
                          </span>
                        )}
                      </>
                    )}
                  </Badge>
                  {resultCount > 0 && filters.text && (
                    <span className="text-muted-foreground">for</span>
                  )}
                </div>
              )}
              
              {/* Search query */}
              {filters.text && (
                <Badge variant="secondary" className="gap-1 max-w-48">
                  <span className="truncate">"{filters.text}"</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ text: '' })}
                    className="h-3 w-3 p-0 hover:bg-transparent"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              
              {/* Active filters */}
              <div className="flex flex-wrap gap-1 min-w-0">
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

                {filters.channels.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {filters.channels.length === 1 
                      ? getChannelName(filters.channels[0])
                      : `${filters.channels.length} channels`
                    }
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('channel')}
                      className="h-3 w-3 p-0 hover:bg-transparent"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                
                {formatDateRange() && (
                  <Badge variant="secondary" className="gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span className="truncate max-w-24">{formatDateRange()}</span>
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
                
                {filters.messageTypes.map((type) => {
                  const config = messageTypeConfig.find(t => t.id === type);
                  if (!config) return null;
                  
                  return (
                    <Badge key={type} variant="secondary" className="gap-1">
                      <config.icon className="h-3 w-3" />
                      {config.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter('messageType', type)}
                        className="h-3 w-3 p-0 hover:bg-transparent"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  );
                })}

                {/* Other active filters */}
                {Object.entries({
                  hasAttachments: { icon: Paperclip, label: 'With files' },
                  hasReactions: { icon: Heart, label: 'With reactions' },
                  hasThreads: { icon: MessageSquare, label: 'With replies' },
                  isPinned: { icon: Pin, label: 'Pinned' },
                  isStarred: { icon: Star, label: 'Starred' },
                  isEdited: { icon: Edit3, label: 'Edited' },
                }).map(([key, config]) => {
                  if (!filters[key as keyof SearchFilters]) return null;
                  
                  const Icon = config.icon;
                  return (
                    <Badge key={key} variant="secondary" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {config.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(key)}
                        className="h-3 w-3 p-0 hover:bg-transparent"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  );
                })}

                {filters.readStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {filters.readStatus === 'read' ? 'Read' : 'Unread'}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFilters({ readStatus: 'all' })}
                      className="h-3 w-3 p-0 hover:bg-transparent"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>

            {/* Clear all button */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground whitespace-nowrap h-6 text-xs"
                >
                  Clear all
                </Button>
                
                {enableSmartFilters && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSaveFilter(true)}
                        className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save as smart filter</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}

        {/* Save Filter Dialog */}
        <Dialog open={showSaveFilter} onOpenChange={setShowSaveFilter}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Smart Filter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter Name</label>
                <Input
                  placeholder="e.g., Important files from last week"
                  value={customFilterName}
                  onChange={(e) => setCustomFilterName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="Brief description of what this filter finds"
                  value={customFilterDescription}
                  onChange={(e) => setCustomFilterDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveFilter(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSmartFilter} disabled={!customFilterName.trim()}>
                  Save Filter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
