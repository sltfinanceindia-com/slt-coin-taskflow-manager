import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const COLORS = [
  'hsl(140, 60%, 45%)',
  'hsl(220, 70%, 50%)',
  'hsl(280, 60%, 55%)',
  'hsl(45, 85%, 55%)',
  'hsl(0, 70%, 55%)',
];

export function TeamPerformanceBarChart() {
  const { tasks } = useTasks();

  const { data: profiles } = useQuery({
    queryKey: ['org-profiles-chart'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return [];

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (!userProfile?.organization_id) return [];

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true);

      return data || [];
    },
  });

  // Calculate performance data per user
  const performanceData = profiles?.map(profile => {
    const userTasks = tasks.filter(t => t.assigned_to === profile.id);
    const completed = userTasks.filter(t => t.status === 'verified').length;
    const pending = userTasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
    const coins = userTasks
      .filter(t => t.status === 'verified')
      .reduce((sum, t) => sum + t.slt_coin_value, 0);

    return {
      name: profile.full_name?.split(' ')[0] || 'Unknown',
      fullName: profile.full_name,
      completed,
      pending,
      coins,
    };
  }).filter(d => d.completed > 0 || d.pending > 0).slice(0, 8) || [];

  if (performanceData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Assign tasks to see team performance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Team Performance</CardTitle>
        <CardDescription>Task completion by team members</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label) => performanceData.find(d => d.name === label)?.fullName || label}
            />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="hsl(140, 60%, 45%)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="pending" name="Pending" fill="hsl(45, 85%, 55%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
