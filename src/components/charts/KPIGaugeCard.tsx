import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIGaugeCardProps {
  title: string;
  value: number;
  target: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

const colorClasses = {
  green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  red: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
};

const progressColors = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
};

export function KPIGaugeCard({
  title,
  value,
  target,
  unit = '',
  trend = 'neutral',
  trendValue,
  icon,
  color = 'green',
}: KPIGaugeCardProps) {
  const percentage = Math.min((value / target) * 100, 100);
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="hover-scale transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">{value.toLocaleString()}</span>
          <span className="text-muted-foreground">{unit}</span>
          <span className="text-sm text-muted-foreground">/ {target.toLocaleString()}</span>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}% of target</span>
            {trendValue && (
              <span className={cn('flex items-center gap-1', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trendValue}
              </span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500 rounded-full', progressColors[color])}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
