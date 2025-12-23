import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export function ProductivityLineChart() {
  const { tasks } = useTasks();
  const { timeLogs } = useTimeLogs();

  // Generate last 14 days of data
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const completedTasks = tasks.filter(t => {
      const updatedAt = new Date(t.updated_at);
      return t.status === 'verified' && updatedAt >= dayStart && updatedAt <= dayEnd;
    }).length;

    const hoursLogged = timeLogs
      .filter(log => {
        const logDate = new Date(log.date_logged);
        return logDate >= dayStart && logDate <= dayEnd;
      })
      .reduce((sum, log) => sum + log.hours_worked, 0);

    return {
      date: format(date, 'MMM dd'),
      tasks: completedTasks,
      hours: Math.round(hoursLogged * 10) / 10,
    };
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Productivity Trends</CardTitle>
        <CardDescription>Tasks completed and hours logged over 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={last14Days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="tasks"
              name="Tasks Completed"
              stroke="hsl(140, 60%, 45%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(140, 60%, 45%)', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hours"
              name="Hours Logged"
              stroke="hsl(220, 70%, 50%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(220, 70%, 50%)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
