import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Clock, MapPin, Users, Globe } from 'lucide-react';

export function TrainingProgramsList() {
  const { programs, isLoading } = useTrainingPrograms();

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading programs...</div>;
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12">
          <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No Training Programs</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Programs will appear here once created.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {programs.map((program) => (
        <Card key={program.id}>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">{program.title}</span>
                </CardTitle>
                {program.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{program.description}</p>
                )}
              </div>
              <div className="flex gap-2 self-start">
                {program.is_mandatory && <Badge variant="destructive" className="text-xs">Mandatory</Badge>}
                <Badge variant={program.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {program.status || 'active'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              {program.category && (
                <span className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{program.category}</Badge>
                </span>
              )}
              {program.duration_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  {program.duration_hours}h
                </span>
              )}
              {program.max_participants && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  {program.current_participants || 0}/{program.max_participants}
                </span>
              )}
              {program.is_online ? (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                  Online
                </span>
              ) : program.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  {program.location}
                </span>
              ) : null}
              {program.trainer && (
                <span className="text-foreground font-medium">Trainer: {program.trainer}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
