import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimpleLineChart } from '@/components/SimpleChart';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCoinRate } from '@/lib/currency';

type TimeRange = '24h' | '7d' | '30d' | '1y';

export function CoinRateChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { data: ratesData, isLoading } = useQuery({
    queryKey: ['coin-rates', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('coin_rates')
        .select('*')
        .gte('rate_date', startDate.toISOString())
        .lte('rate_date', now.toISOString())
        .order('rate_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Format data for chart
  const chartData = ratesData?.map(rate => {
    const date = new Date(rate.rate_date);
    let label = '';
    
    if (timeRange === '24h') {
      label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '7d') {
      label = date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeRange === '30d') {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    return {
      date: label,
      rate: Number(rate.rate),
      change: Number(rate.change_percentage || 0),
    };
  }) || [];

  // Calculate statistics
  const latestRate = ratesData?.[ratesData.length - 1];
  const oldestRate = ratesData?.[0];
  const priceChange = latestRate && oldestRate 
    ? Number(latestRate.rate) - Number(oldestRate.rate)
    : 0;
  const priceChangePercent = latestRate && oldestRate
    ? ((Number(latestRate.rate) - Number(oldestRate.rate)) / Number(oldestRate.rate)) * 100
    : 0;

  const highestRate = ratesData?.reduce((max, rate) => 
    Number(rate.rate) > Number(max.rate) ? rate : max, 
    ratesData[0]
  );
  const lowestRate = ratesData?.reduce((min, rate) => 
    Number(rate.rate) < Number(min.rate) ? rate : min, 
    ratesData[0]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="24h">24H</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="1y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>

        {latestRate && (
          <div className="flex items-center gap-2">
            {priceChange >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="min-h-[300px]">
        {chartData.length > 0 ? (
          <SimpleLineChart
            data={chartData}
            dataKey="rate"
            xAxisKey="date"
            height={300}
            color="hsl(var(--primary))"
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available for this time range
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Current Rate</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {latestRate ? formatCoinRate(Number(latestRate.rate)) : '₹0.0000'}
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">24h Change</p>
          <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+₹' : '₹'}{Math.abs(priceChange).toFixed(4)}
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">High</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {highestRate ? formatCoinRate(Number(highestRate.rate)) : '₹0.0000'}
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Low</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {lowestRate ? formatCoinRate(Number(lowestRate.rate)) : '₹0.0000'}
          </p>
        </div>
      </div>

      {/* Volume & Market Cap */}
      {latestRate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">24h Volume</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              ₹{latestRate.volume_24h ? Number(latestRate.volume_24h).toLocaleString() : '0'}
            </p>
          </div>
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Market Cap</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              ₹{latestRate.market_cap ? Number(latestRate.market_cap).toLocaleString() : '0'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
