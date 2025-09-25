import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStateIndicatorProps {
  state: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  className?: string;
}

export default function MessageStateIndicator({ state, className }: MessageStateIndicatorProps) {
  const getStateIcon = () => {
    switch (state) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      {getStateIcon()}
    </div>
  );
}