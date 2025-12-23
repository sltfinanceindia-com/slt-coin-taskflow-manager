import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';

const COLORS = [
  'hsl(220, 70%, 50%)',   // Assigned - Blue
  'hsl(45, 85%, 55%)',    // In Progress - Yellow
  'hsl(280, 60%, 55%)',   // Completed - Purple
  'hsl(140, 60%, 45%)',   // Verified - Green
  'hsl(0, 70%, 55%)',     // Rejected - Red
];

export function TaskPieChart() {
  const { tasks } = useTasks();

  const data = [
    { name: 'Assigned', value: tasks.filter(t => t.status === 'assigned').length, color: COLORS[0] },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: COLORS[1] },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: COLORS[2] },
    { name: 'Verified', value: tasks.filter(t => t.status === 'verified').length, color: COLORS[3] },
    { name: 'Rejected', value: tasks.filter(t => t.status === 'rejected').length, color: COLORS[4] },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
          <CardDescription>No tasks available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Create tasks to see distribution</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Task Distribution</CardTitle>
        <CardDescription>Current status breakdown of all tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} tasks`, 'Count']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-muted-foreground ml-2">Total Tasks</span>
        </div>
      </CardContent>
    </Card>
  );
}
