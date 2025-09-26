import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Users, 
  MessageCircle, 
  FileText,
  Filter,
  Calendar,
  User,
  Hash,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'person' | 'message' | 'file' | 'channel';
  title: string;
  content?: string;
  timestamp?: string;
  avatar?: string;
  channel?: string;
  sender?: string;
  fileType?: string;
  size?: string;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
}

export default function AdvancedSearch({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onResultSelect
}: AdvancedSearchProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'people' | 'messages' | 'files'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [senderFilter, setSenderFilter] = useState('');

  // Mock search results - in real app, this would come from API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'person',
      title: 'Eric Ishida',
      content: 'Admin • eric@sltfinance.com',
      avatar: '/avatars/eric.jpg'
    },
    {
      id: '2',
      type: 'message',
      title: 'Project Update',
      content: 'Hey team, just wanted to update everyone on the project progress...',
      timestamp: '2024-01-15T10:30:00Z',
      channel: '#general',
      sender: 'Harsha Vardhana'
    },
    {
      id: '3',
      type: 'file',
      title: 'Q4_Report_Final.pdf',
      content: 'Financial report for Q4 2023',
      timestamp: '2024-01-14T14:20:00Z',
      fileType: 'pdf',
      size: '2.4 MB',
      sender: 'Sarah Johnson'
    },
    {
      id: '4',
      type: 'channel',
      title: 'Development Team',
      content: '12 members • Last message 2 hours ago'
    }
  ];

  const filteredResults = useMemo(() => {
    let filtered = mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeFilter !== 'all') {
      filtered = filtered.filter(result => {
        if (activeFilter === 'people') return result.type === 'person';
        if (activeFilter === 'messages') return result.type === 'message';
        if (activeFilter === 'files') return result.type === 'file';
        return true;
      });
    }

    if (senderFilter) {
      filtered = filtered.filter(result => 
        result.sender?.toLowerCase().includes(senderFilter.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, activeFilter, senderFilter]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'person':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'file':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'channel':
        return <Hash className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                placeholder="Search for people, messages, files..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              All
            </Button>
            <Button
              variant={activeFilter === 'people' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('people')}
            >
              <Users className="h-3 w-3 mr-1" />
              People
            </Button>
            <Button
              variant={activeFilter === 'messages' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('messages')}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Messages
            </Button>
            <Button
              variant={activeFilter === 'files' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('files')}
            >
              <FileText className="h-3 w-3 mr-1" />
              Files
            </Button>
          </div>
        </div>

        {/* Search Results */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {searchQuery === '' ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search Everything</h3>
                <p className="text-muted-foreground">
                  Find people, messages, files, and channels across your workspace
                </p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      onResultSelect?.(result);
                      onClose();
                    }}
                  >
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {result.type === 'person' ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={result.avatar} />
                          <AvatarFallback>
                            {getInitials(result.title)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      {result.content && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {result.content}
                        </p>
                      )}
                      
                      {result.channel && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            in {result.channel}
                          </span>
                          {result.sender && (
                            <span className="text-xs text-muted-foreground">
                              by {result.sender}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {result.fileType && result.size && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {result.fileType.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.size}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Search Tips */}
        {searchQuery === '' && (
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Search tips:</strong></p>
              <p>• Use quotes for exact phrases: "project update"</p>
              <p>• Search by sender: from:@username</p>
              <p>• Search in specific channel: in:#channel-name</p>
              <p>• Search file types: filetype:pdf</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}