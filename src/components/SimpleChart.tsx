interface SimpleBarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  color?: string;
}

interface SimpleLineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  color?: string;
}

export function SimpleBarChart({ 
  data, 
  dataKey, 
  xAxisKey, 
  height = 200, 
  color = "hsl(var(--primary))" 
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
  
  return (
    <div className="space-y-2" style={{ height }}>
      <div className="flex items-end justify-between gap-1 h-full">
        {data.map((item, index) => {
          const value = item[dataKey] || 0;
          const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center gap-1 flex-1">
              <div className="text-xs text-muted-foreground">{value}</div>
              <div 
                className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                style={{ 
                  height: `${heightPercentage}%`,
                  backgroundColor: color,
                  minHeight: value > 0 ? '4px' : '0px'
                }}
              />
              <div className="text-xs text-muted-foreground text-center">
                {item[xAxisKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SimpleLineChart({ 
  data, 
  dataKey, 
  xAxisKey, 
  height = 200, 
  color = "hsl(var(--primary))" 
}: SimpleLineChartProps) {
  const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
  
  return (
    <div className="space-y-2" style={{ height }}>
      <div className="relative h-full">
        {/* Chart area */}
        <div className="relative h-5/6 border-l border-b border-border">
          {data.map((item, index) => {
            const value = item[dataKey] || 0;
            const x = (index / (data.length - 1)) * 100;
            const y = maxValue > 0 ? ((maxValue - value) / maxValue) * 100 : 100;
            
            return (
              <div
                key={index}
                className="absolute w-2 h-2 rounded-full -translate-x-1 -translate-y-1"
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  backgroundColor: color 
                }}
                title={`${item[xAxisKey]}: ${value}`}
              />
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-muted-foreground">
              {item[xAxisKey]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}