import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  tip?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, tip, className }: StatCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={cn('p-4 cursor-default', className)}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{title}</p>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className={cn('text-2xl font-medium mt-1', typeof value === 'string' && value.startsWith('$') && 'font-mono text-[#005FFE]')}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </Card>
      </TooltipTrigger>
      {tip && <TooltipContent>{tip}</TooltipContent>}
    </Tooltip>
  );
}
