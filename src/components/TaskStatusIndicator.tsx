
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TaskStatusIndicatorProps {
  status: Task['status'];
  coinValue: number;
}

export function TaskStatusIndicator({ status, coinValue }: TaskStatusIndicatorProps) {
  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: Clock,
          message: '⏳ Task submitted and awaiting admin approval for Coins',
          bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case 'verified':
        return {
          icon: CheckCircle,
          message: `✅ Task approved! ${coinValue} Coins awarded`,
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        };
      case 'rejected':
        return {
          icon: XCircle,
          message: '❌ Task rejected. Please review feedback and resubmit if needed.',
          bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig(status);
  
  if (!config) return null;

  const { icon: Icon, message, bgColor, borderColor, textColor } = config;

  return (
    <Card className={`${bgColor} ${borderColor} border animate-fade-in`}>
      <CardContent className="p-3">
        <div className="flex items-start space-x-2">
          <Icon className={`h-4 w-4 ${textColor} mt-0.5 flex-shrink-0`} />
          <p className={`text-sm ${textColor} leading-relaxed`}>
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
