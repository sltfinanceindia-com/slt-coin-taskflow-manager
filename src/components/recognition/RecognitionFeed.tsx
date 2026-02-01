/**
 * Recognition Feed Component
 * Real-time feed of employee recognitions and kudos
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layouts/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  Award, 
  Sparkles, 
  Search,
  TrendingUp,
  ThumbsUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Recognition types with colors using design tokens
const recognitionTypes = {
  kudos: { icon: Heart, colorClass: 'text-pink-500', bgClass: 'bg-pink-100 dark:bg-pink-900/20' },
  achievement: { icon: Award, colorClass: 'text-primary', bgClass: 'bg-primary/10' },
  shoutout: { icon: Sparkles, colorClass: 'text-accent-foreground', bgClass: 'bg-accent/20' },
};

export function RecognitionFeed() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'received' | 'given'>('all');

  // Fetch kudos/recognitions
  const { data: recognitions, isLoading } = useQuery({
    queryKey: ['recognition-feed', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kudos')
        .select(`
          id,
          message,
          badge_type,
          created_at,
          from_user_id,
          to_user_id,
          is_public
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Fetch sender and receiver profiles separately
      const userIds = new Set<string>();
      data?.forEach(k => {
        userIds.add(k.from_user_id);
        userIds.add(k.to_user_id);
      });
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department')
        .in('id', Array.from(userIds));
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data?.map(k => ({
        ...k,
        sender: profileMap.get(k.from_user_id),
        receiver: profileMap.get(k.to_user_id),
      })) || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Filter recognitions
  const filteredRecognitions = recognitions?.filter(rec => {
    if (filter === 'received' && rec.to_user_id !== profile?.id) return false;
    if (filter === 'given' && rec.from_user_id !== profile?.id) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rec.message?.toLowerCase().includes(query) ||
        rec.sender?.full_name?.toLowerCase().includes(query) ||
        rec.receiver?.full_name?.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  // Stats
  const stats = {
    totalThisWeek: recognitions?.filter(r => {
      const createdAt = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length || 0,
    received: recognitions?.filter(r => r.to_user_id === profile?.id).length || 0,
    given: recognitions?.filter(r => r.from_user_id === profile?.id).length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recognition Feed"
        description="See what's being celebrated across the organization"
        actions={
          <Button>
            <Heart className="h-4 w-4 mr-2" />
            Give Recognition
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalThisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <ThumbsUp className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.received}</p>
              <p className="text-sm text-muted-foreground">Received</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/20">
              <Heart className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.given}</p>
              <p className="text-sm text-muted-foreground">Given</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recognitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="given">Given</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading feed...</p>
            </CardContent>
          </Card>
        ) : filteredRecognitions.length > 0 ? (
          filteredRecognitions.map((recognition) => {
            const typeConfig = recognitionTypes.kudos;
            const IconComponent = typeConfig.icon;
            
            return (
              <Card key={recognition.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Type Icon */}
                    <div className={cn("p-2 rounded-full h-fit", typeConfig.bgClass)}>
                      <IconComponent className={cn("h-5 w-5", typeConfig.colorClass)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={recognition.sender?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {recognition.sender?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {recognition.sender?.full_name || 'Unknown'}
                        </span>
                        <span className="text-muted-foreground">recognized</span>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={recognition.receiver?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {recognition.receiver?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {recognition.receiver?.full_name || 'Unknown'}
                        </span>
                      </div>

                      <p className="text-foreground">{recognition.message}</p>

                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(recognition.created_at), { addSuffix: true })}
                        </span>
                        {recognition.badge_type && (
                          <Badge variant="secondary" className="text-xs">
                            {recognition.badge_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium text-foreground">No recognitions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to recognize someone's great work!
              </p>
              <Button className="mt-4">
                <Heart className="h-4 w-4 mr-2" />
                Give Recognition
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
