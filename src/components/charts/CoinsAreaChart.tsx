import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Coins } from 'lucide-react';

export function CoinsAreaChart() {
  const { transactions } = useCoinTransactions();

  // Generate last 30 days of coin data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dailyCoins = transactions
      .filter(t => {
        const transDate = new Date(t.transaction_date);
        return t.status === 'approved' && transDate >= dayStart && transDate <= dayEnd;
      })
      .reduce((sum, t) => sum + t.coins_earned, 0);

    return {
      date: format(date, 'MMM dd'),
      coins: dailyCoins,
    };
  });

  // Calculate cumulative coins
  let cumulative = 0;
  const cumulativeData = last30Days.map(d => {
    cumulative += d.coins;
    return { ...d, cumulative };
  });

  const totalCoins = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + t.coins_earned, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-coin-gold" />
          Coins Awarded (30 Days)
        </CardTitle>
        <CardDescription>
          Total: <span className="font-bold text-coin-gold">{totalCoins}</span> coins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cumulativeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="coinGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(140, 65%, 45%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(140, 65%, 45%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              interval={4}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `${value} coins`,
                name === 'cumulative' ? 'Total' : 'Daily'
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Total Coins"
              stroke="hsl(140, 65%, 45%)"
              strokeWidth={2}
              fill="url(#coinGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
