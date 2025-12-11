import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Coins, CheckCircle2, Crown, Flame } from 'lucide-react';
import { useLeaderboard, LeaderboardPeriod } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/50';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/50';
    default:
      return 'bg-card hover:bg-accent/50';
  }
};

export function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { leaderboard, currentUserRank, isLoading } = useLeaderboard(period);
  const { profile } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-2">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2">Month</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-2">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current User Rank Card */}
        {currentUserRank && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Your Rank</p>
                <p className="text-2xl font-bold text-primary">#{currentUserRank.rank}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{currentUserRank.total_coins}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{currentUserRank.tasks_completed} tasks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performers */}
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry) => (
            <div
              key={entry.user_id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                getRankStyle(entry.rank),
                entry.user_id === profile?.id && 'ring-2 ring-primary'
              )}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="text-sm font-semibold">
                  {entry.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{entry.full_name}</p>
                <Badge variant="outline" className="text-xs capitalize">
                  {entry.role}
                </Badge>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span>{entry.total_coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{entry.tasks_completed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No leaderboard data yet</p>
            <p className="text-sm">Complete tasks to earn coins and climb the ranks!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
