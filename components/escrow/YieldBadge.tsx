'use client';

import { Badge } from '@/components/ui/badge';
import { TrendingUp as TrendingUpIcon } from 'lucide-react';

export function YieldBadge() {
  return (
    <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700">
      <TrendingUpIcon className="h-3 w-3 mr-1" />
      Earning Yield
    </Badge>
  );
}
