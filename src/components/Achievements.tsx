import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Award, Target, Clock, BookOpen, Coins, 
  Users, Flame, CheckCircle2, Lock, Star
} from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'trophy': Trophy,
  'check-circle': CheckCircle2,
  'crown': Star,
  'sunrise': Clock,
  'clock': Clock,
  'book-open': BookOpen,
  'graduation-cap': BookOpen,
  'coins': Coins,
  'gem': Coins,
  'users': Users,
  'award': Award,
  'flame': Flame,
};

const categoryLabels: Record<string, string> = {
  tasks: 'Tasks',
  attendance: 'Attendance',
  training: 'Training',
  coins: 'Coins',
  communication: 'Communication',
  assessment: 'Assessments',
  engagement: 'Engagement',
  general: 'General',
};

export function Achievements() {
  const { achievements, userAchievements, isLoading, hasAchievement } = useAchievements();

  const categories = [...new Set(achievements.map((a) => a.category))];

  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {earnedCount} / {totalCount}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0] || 'tasks'}>
          <TabsList className="w-full flex-wrap h-auto gap-1 mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs px-2 py-1">
                {categoryLabels[category] || category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => {
            const categoryAchievements = achievements.filter((a) => a.category === category);
            
            return (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryAchievements.map((achievement) => {
                    const earned = hasAchievement(achievement.id);
                    const Icon = iconMap[achievement.icon] || Trophy;
                    
                    return (
                      <div
                        key={achievement.id}
                        className={cn(
                          'relative p-4 rounded-lg border text-center transition-all',
                          earned 
                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30' 
                            : 'bg-muted/30 border-border opacity-60 grayscale'
                        )}
                      >
                        {!earned && (
                          <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                            earned ? 'bg-primary/20' : 'bg-muted'
                          )}
                          style={{ 
                            backgroundColor: earned ? `${achievement.badge_color}20` : undefined 
                          }}
                        >
                          <Icon 
                            className="h-6 w-6" 
                            style={{ color: earned ? achievement.badge_color : undefined }}
                          />
                        </div>
                        <h4 className="font-medium text-sm mb-1">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                        <Badge 
                          variant={earned ? 'default' : 'outline'} 
                          className="mt-2 text-xs"
                        >
                          +{achievement.points} pts
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No achievements available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
