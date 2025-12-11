import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectHealthIndicatorProps {
  status: 'green' | 'amber' | 'red';
  reason?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const healthConfig = {
  green: {
    label: 'On Track',
    icon: CheckCircle,
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    borderColor: 'border-green-500',
    lightBg: 'bg-green-500/10',
  },
  amber: {
    label: 'At Risk',
    icon: AlertTriangle,
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500',
    lightBg: 'bg-amber-500/10',
  },
  red: {
    label: 'Critical',
    icon: AlertCircle,
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    borderColor: 'border-red-500',
    lightBg: 'bg-red-500/10',
  },
};

const sizeConfig = {
  sm: {
    dot: 'h-2 w-2',
    icon: 'h-3 w-3',
    text: 'text-xs',
    padding: 'px-1.5 py-0.5',
  },
  md: {
    dot: 'h-3 w-3',
    icon: 'h-4 w-4',
    text: 'text-sm',
    padding: 'px-2 py-1',
  },
  lg: {
    dot: 'h-4 w-4',
    icon: 'h-5 w-5',
    text: 'text-base',
    padding: 'px-3 py-1.5',
  },
};

export const ProjectHealthIndicator: React.FC<ProjectHealthIndicatorProps> = ({
  status,
  reason,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const config = healthConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  const indicator = (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        showLabel ? `${sizeStyles.padding} ${config.lightBg}` : '',
        className
      )}
    >
      {showLabel ? (
        <>
          <Icon className={cn(sizeStyles.icon, config.textColor)} />
          <span className={cn(sizeStyles.text, config.textColor, 'font-medium')}>
            {config.label}
          </span>
        </>
      ) : (
        <div className={cn(sizeStyles.dot, config.bgColor, 'rounded-full')} />
      )}
    </div>
  );

  if (reason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{indicator}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return indicator;
};

export default ProjectHealthIndicator;
