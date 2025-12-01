import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Award, TrendingUp } from 'lucide-react';

export function TrainingHeader() {
  const { profile } = useAuth();
  
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Learner'}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">
            Continue your learning journey with our comprehensive training programs
          </p>
        </div>
        <div className="p-4 rounded-full bg-primary/10">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Courses</span>
          </div>
          <p className="text-2xl font-bold">5+</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
          </div>
          <p className="text-2xl font-bold">45%</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Certificates</span>
          </div>
          <p className="text-2xl font-bold">2</p>
        </div>
      </div>
    </div>
  );
}