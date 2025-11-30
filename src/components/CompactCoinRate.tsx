import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { useCoinRates } from '@/hooks/useCoinRates';

interface CompactCoinRateProps {
  showDetails?: boolean;
  className?: string;
}

export function CompactCoinRate({ showDetails = true, className = '' }: CompactCoinRateProps) {
  const { latestRate, isLoading } = useCoinRates();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-coin-gold animate-pulse" />
              <div>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded mt-1" />
              </div>
            </div>
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestRate) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Coins className="h-5 w-5" />
            <span className="text-sm">Rate not available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rate = Number(latestRate.rate);
  const changePercentage = Number(latestRate.change_percentage || 0);
  const isPositive = changePercentage >= 0;

  return (
    <Card className={`hover-lift transition-all duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-coin-gold/10 flex items-center justify-center">
              <Coins className="h-5 w-5 text-coin-gold" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">SLT Coin Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-coin-gold">${rate.toFixed(4)}</p>
                {showDetails && (
                  <Badge 
                    variant={isPositive ? 'success' : 'destructive'} 
                    className="text-xs flex items-center gap-1"
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPositive ? '+' : ''}{changePercentage.toFixed(2)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
