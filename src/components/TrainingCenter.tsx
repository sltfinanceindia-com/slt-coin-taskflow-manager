
import { useTrainingSections } from '@/hooks/useTrainingSections';
import { TrainingCourses } from '@/components/training/TrainingCourses';
import { useAuth } from '@/hooks/useAuth';

export function TrainingCenter() {
  const { user } = useAuth();
  const { data: sections = [], isLoading } = useTrainingSections(!!user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Training Center</h2>
        <p className="text-muted-foreground">Access your training materials and courses</p>
      </div>

      <TrainingCourses sections={sections} isLoading={isLoading} />
    </div>
  );
}
