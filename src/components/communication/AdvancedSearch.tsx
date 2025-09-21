import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Calendar, User, FileText, Hash, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query: string;
  sender: string;
  channel: string;
  fileType: string;
  dateFrom: string;
  dateTo: string;
  hasAttachments: boolean;
  messageType: 'all' | 'text' | 'file' | 'image' | 'voice';
}

interface SearchResult {
  id: string;
  content: string;
  sender_name: string;
  channel_name: string;
  created_at: string;
  message_type: string;
  attachments: any[];
  snippet: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  teamMembers: Array<{ id: string; full_name: string }>;
  channels: Array<{ id: string; name: string }>;
}

export default function AdvancedSearch({ onSearch, teamMembers, channels }: AdvancedSearchProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sender: '',
    channel: '',
    fileType: '',
    dateFrom: '',
    dateTo: '',
    hasAttachments: false,
    messageType: 'all'
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!filters.query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate search API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          content: 'Here are the latest updates on the project timeline and deliverables',
          sender_name: 'John Smith',
          channel_name: 'Project Updates',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          message_type: 'text',
          attachments: [],
          snippet: 'Here are the latest updates on the project...'
        },
        {
          id: '2',
          content: 'Please find the quarterly report attached for your review',
          sender_name: 'Sarah Johnson',
          channel_name: 'General',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          message_type: 'file',
          attachments: [{ name: 'Q3-Report.pdf', type: 'pdf' }],
          snippet: 'Please find the quarterly report attached...'
        }
      ];

      // Filter results based on criteria
      const filteredResults = mockResults.filter(result => {
        if (filters.sender && !result.sender_name.toLowerCase().includes(filters.sender.toLowerCase())) {
          return false;
        }
        if (filters.channel && result.channel_name !== filters.channel) {
          return false;
        }
        if (filters.messageType !== 'all' && result.message_type !== filters.messageType) {
          return false;
        }
        if (filters.hasAttachments && result.attachments.length === 0) {
          return false;
        }
        return result.content.toLowerCase().includes(filters.query.toLowerCase());
      });

      setSearchResults(filteredResults);
      setIsSearching(false);
      onSearch(filters);
    }, 1000);
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      sender: '',
      channel: '',
      fileType: '',
      dateFrom: '',
      dateTo: '',
      hasAttachments: false,
      messageType: 'all'
    });
    setSearchResults([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages, files, and conversations..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-9"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {isExpanded && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Advanced Filters
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="h-auto p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    From User
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.sender}
                    onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                  >
                    <option value="">Any user</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.full_name}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    In Channel
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.channel}
                    onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
                  >
                    <option value="">Any channel</option>
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.name}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Message Type
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.messageType}
                    onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value as any }))}
                  >
                    <option value="all">All types</option>
                    <option value="text">Text only</option>
                    <option value="file">Files</option>
                    <option value="image">Images</option>
                    <option value="voice">Voice messages</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">File Type</label>
                  <Input
                    placeholder="e.g., pdf, docx, xlsx"
                    value={filters.fileType}
                    onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasAttachments"
                  checked={filters.hasAttachments}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasAttachments: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="hasAttachments" className="text-sm">
                  Has attachments only
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results ({searchResults.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {searchResults.map((result) => (
              <Card key={result.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.sender_name}</span>
                        <span className="text-muted-foreground">in</span>
                        <span className="font-medium">#{result.channel_name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(result.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm">
                      {highlightText(result.snippet, filters.query)}
                    </p>
                    
                    {result.attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {result.attachments.map(att => att.name).join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Searching messages...</p>
        </div>
      )}
    </div>
  );
}