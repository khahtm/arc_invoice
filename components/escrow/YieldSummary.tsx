'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatUSDC } from '@/lib/utils';
import {
  CheckCircle2 as CheckCircle2Icon,
  TrendingUp as TrendingUpIcon,
  Clock as ClockIcon,
} from 'lucide-react';

interface YieldSummaryProps {
  originalAmount: number;
  yieldEarned: number;
  totalReceived: number;
  lockedDays: number;
  releasedAt: Date;
}

export function YieldSummary({
  originalAmount,
  yieldEarned,
  totalReceived,
  lockedDays,
  releasedAt,
}: YieldSummaryProps) {
  // Calculate APY
  const apy = lockedDays > 0
    ? (yieldEarned / originalAmount) * (365 / lockedDays) * 100
    : 0;

  return (
    <Card className="border-green-300 bg-gradient-to-br from-green-50/50 to-transparent dark:border-green-700 dark:from-green-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2Icon className="h-5 w-5" />
          Escrow Released with Yield
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Original Amount</span>
            <span className="font-mono font-medium">
              {formatUSDC(originalAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span className="text-sm flex items-center gap-1.5">
              <TrendingUpIcon className="h-4 w-4" />
              Yield Earned
            </span>
            <span className="font-mono font-medium">
              +{formatUSDC(yieldEarned)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total Received</span>
            <span className="font-mono font-bold text-green-600 dark:text-green-400">
              {formatUSDC(totalReceived)}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Realized APY</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              {apy.toFixed(2)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Time Locked</p>
            <p className="font-medium flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {lockedDays} {lockedDays === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Release Info */}
        <div className="pt-3 border-t space-y-1">
          <p className="text-xs text-muted-foreground">Released At</p>
          <p className="text-sm font-medium">
            {releasedAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Congratulatory Message */}
        <div className="pt-2 text-sm text-muted-foreground text-center">
          🎉 Congratulations! Your funds have been released with earned yield.
        </div>
      </CardContent>
    </Card>
  );
}
