import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, Star, Award, Sparkles, ThumbsUp, Medal, Trophy, Zap, Send, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BADGE_TYPES = [
  { value: 'appreciation', label: 'Appreciation', icon: Heart, color: 'bg-pink-500' },
  { value: 'star_performer', label: 'Star Performer', icon: Star, color: 'bg-yellow-500' },
  { value: 'team_player', label: 'Team Player', icon: ThumbsUp, color: 'bg-blue-500' },
  { value: 'innovator', label: 'Innovator', icon: Sparkles, color: 'bg-purple-500' },
  { value: 'achiever', label: 'Achiever', icon: Award, color: 'bg-green-500' },
  { value: 'mentor', label: 'Mentor', icon: Medal, color: 'bg-orange-500' },
  { value: 'champion', label: 'Champion', icon: Trophy, color: 'bg-amber-500' },
  { value: 'go_getter', label: 'Go-Getter', icon: Zap, color: 'bg-cyan-500' },
];

interface Kudos {
  id: string;
  message: string;
  badge_type: string;
  created_at: string;
  from_user: { id: string; full_name: string; avatar_url: string | null };
  to_user: { id: string; full_name: string; avatar_url: string | null };
}

export function KudosWall() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [badgeType, setBadgeType] = useState('appreciation');

  // Fetch kudos
  const { data: kudos = [], isLoading } = useQuery({
    queryKey: ['kudos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kudos')
        .select(`
          id,
          message,
          badge_type,
          created_at,
          from_user:from_user_id(id, full_name, avatar_url),
          to_user:to_user_id(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as Kudos[];
    },
  });

  // Fetch users for selection
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-kudos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('is_active', true)
        .neq('id', profile?.id)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Create kudos mutation
  const createKudos = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('kudos').insert({
        from_user_id: profile?.id,
        to_user_id: selectedUser,
        message,
        badge_type: badgeType,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kudos'] });
      toast.success('Kudos sent successfully!');
      setIsDialogOpen(false);
      setSelectedUser('');
      setMessage('');
      setBadgeType('appreciation');
    },
    onError: () => {
      toast.error('Failed to send kudos');
    },
  });

  const getBadgeInfo = (type: string) => {
    return BADGE_TYPES.find(b => b.value === type) || BADGE_TYPES[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kudos Wall</h2>
          <p className="text-muted-foreground">Celebrate your colleagues' achievements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Give Kudos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Give Kudos</DialogTitle>
              <DialogDescription>
                Recognize a colleague for their great work
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Colleague</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a colleague" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {user.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Badge Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGE_TYPES.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <button
                        key={badge.value}
                        onClick={() => setBadgeType(badge.value)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          badgeType === badge.value
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${badge.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">{badge.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Write a message to celebrate their achievement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => createKudos.mutate()}
                disabled={!selectedUser || !message || createKudos.isPending}
              >
                <Send className="h-4 w-4" />
                {createKudos.isPending ? 'Sending...' : 'Send Kudos'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : kudos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No kudos yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Be the first to recognize a colleague's great work!
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>Give Kudos</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kudos.map((kudo) => {
            const badge = getBadgeInfo(kudo.badge_type);
            const BadgeIcon = badge.icon;
            return (
              <Card key={kudo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-1.5 ${badge.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${badge.color} shrink-0`}>
                      <BadgeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={kudo.to_user?.avatar_url || ''} />
                          <AvatarFallback>{kudo.to_user?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{kudo.to_user?.full_name}</p>
                          <Badge variant="secondary" className="text-xs">{badge.label}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        "{kudo.message}"
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={kudo.from_user?.avatar_url || ''} />
                          <AvatarFallback>{kudo.from_user?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>from {kudo.from_user?.full_name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(kudo.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
