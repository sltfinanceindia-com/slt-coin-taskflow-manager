import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Play, Award, Clock } from 'lucide-react';
import { TrainingSection } from '@/types/training';

interface TrainingStatsProps {
  sections: TrainingSection[];
}

export function TrainingStats({ sections }: TrainingStatsProps) {
  const totalVideos = sections.reduce((acc, section) => acc + (section.videos?.length || 0), 0);
  const totalAssignments = sections.reduce((acc, section) => acc + (section.assignments?.length || 0), 0);
  const totalDuration = sections.reduce((acc, section) => 
    acc + (section.videos?.reduce((videoAcc, video) => videoAcc + (video.duration_minutes || 0), 0) || 0), 0
  );

  const stats = [
    {
      icon: BookOpen,
      value: sections.length,
      label: "Training Sections",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Play,
      value: totalVideos,
      label: "Video Lessons", 
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      icon: Award,
      value: totalAssignments,
      label: "Assignments",
      bgColor: "bg-accent/10", 
      iconColor: "text-accent"
    },
    {
      icon: Clock,
      value: `${Math.round(totalDuration / 60)}h`,
      label: "Total Duration",
      bgColor: "bg-success/10",
      iconColor: "text-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}