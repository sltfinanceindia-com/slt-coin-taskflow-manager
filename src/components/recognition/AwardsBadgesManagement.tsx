/**
 * Awards & Badges Management
 * Manage employee recognition awards and achievement badges
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layouts/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Award, Plus, Search, Trophy, Star, Medal, Target, Zap, Heart, Users } from 'lucide-react';

const badgeIcons: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  medal: Medal,
  target: Target,
  zap: Zap,
  heart: Heart,
  users: Users,
  award: Award,
};

const badgeColors = [
  { name: 'Gold', value: '#FFD700' },
  { name: 'Silver', value: '#C0C0C0' },
  { name: 'Bronze', value: '#CD7F32' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Purple', value: '#8B5CF6' },
];

export function AwardsBadgesManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    category: 'performance',
    icon: 'award',
    badge_color: '#FFD700',
    points: 100,
  });

  // Fetch achievements/badges
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Create achievement mutation
  const createAchievement = useMutation({
    mutationFn: async (badge: typeof newBadge) => {
      const { error } = await supabase
        .from('achievements')
        .insert({
          ...badge,
          organization_id: profile?.organization_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setIsCreateOpen(false);
      setNewBadge({
        name: '',
        description: '',
        category: 'performance',
        icon: 'award',
        badge_color: '#FFD700',
        points: 100,
      });
      toast.success('Badge created successfully!');
    },
    onError: () => {
      toast.error('Failed to create badge');
    },
  });

  const filteredAchievements = achievements?.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const categories = [...new Set(achievements?.map(a => a.category) || [])];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Awards & Badges"
        description="Manage recognition badges and employee achievements"
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Badge</DialogTitle>
                <DialogDescription>
                  Design a new achievement badge for recognition
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Badge Name</Label>
                  <Input
                    id="name"
                    value={newBadge.name}
                    onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                    placeholder="e.g., Top Performer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBadge.description}
                    onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                    placeholder="Describe the achievement..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={newBadge.category} 
                      onValueChange={(v) => setNewBadge({ ...newBadge, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="teamwork">Teamwork</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="innovation">Innovation</SelectItem>
                        <SelectItem value="tenure">Tenure</SelectItem>
                        <SelectItem value="skill">Skill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input
                      type="number"
                      value={newBadge.points}
                      onChange={(e) => setNewBadge({ ...newBadge, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select 
                      value={newBadge.icon} 
                      onValueChange={(v) => setNewBadge({ ...newBadge, icon: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(badgeIcons).map(icon => (
                          <SelectItem key={icon} value={icon}>
                            <span className="capitalize">{icon}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select 
                      value={newBadge.badge_color} 
                      onValueChange={(v) => setNewBadge({ ...newBadge, badge_color: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {badgeColors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createAchievement.mutate(newBadge)}
                  disabled={!newBadge.name || createAchievement.isPending}
                >
                  Create Badge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search badges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs by Category */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Badges</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BadgeGrid badges={filteredAchievements} isLoading={isLoading} />
        </TabsContent>

        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <BadgeGrid 
              badges={filteredAchievements.filter(a => a.category === cat)} 
              isLoading={isLoading} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function BadgeGrid({ badges, isLoading }: { badges: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No badges found</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first badge to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {badges.map((badge) => {
        const IconComponent = badgeIcons[badge.icon || 'award'] || Award;
        return (
          <Card key={badge.id} className="hover:shadow-md transition-shadow group cursor-pointer">
            <CardContent className="p-6 text-center">
              <div 
                className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${badge.badge_color}20` }}
              >
                <IconComponent 
                  className="h-8 w-8" 
                  style={{ color: badge.badge_color }}
                />
              </div>
              <h3 className="font-semibold text-foreground">{badge.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {badge.description}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge variant="secondary" className="capitalize">
                  {badge.category}
                </Badge>
                <Badge variant="outline">
                  {badge.points} pts
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
