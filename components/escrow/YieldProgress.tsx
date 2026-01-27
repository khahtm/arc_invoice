'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useYieldEscrowStatus } from '@/hooks/useYieldEscrowStatus';
import { formatUSDC } from '@/lib/utils';
import { Clock as ClockIcon, TrendingUp as TrendingUpIcon } from 'lucide-react';

interface YieldProgressProps {
  escrowAddress: `0x${string}`;
  fundedAt: Date;
  autoReleaseDays: number;
}

export function YieldProgress({
  escrowAddress,
  fundedAt,
  autoReleaseDays,
}: YieldProgressProps) {
  const status = useYieldEscrowStatus(escrowAddress);
  const [animatedYield, setAnimatedYield] = useState(0);

  // Return null if not funded
  if (status.state !== 'FUNDED') {
    return null;
  }

  const originalAmount = parseFloat(status.originalAmount);
  const currentValue = parseFloat(status.currentValue);
  const yieldEarned = parseFloat(status.accruedYield);

  // Animated yield counter
  useEffect(() => {
    let frame = 0;
    const totalFrames = 20;
    const increment = yieldEarned / totalFrames;

    const interval = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setAnimatedYield(yieldEarned);
        clearInterval(interval);
      } else {
        setAnimatedYield(frame * increment);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [yieldEarned]);

  // Calculate time metrics
  const now = new Date();
  const timeLocked = Math.floor(
    (now.getTime() - fundedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysToRelease = Math.max(0, autoReleaseDays - timeLocked);
  const progressPercent = Math.min(
    100,
    (timeLocked / autoReleaseDays) * 100
  );

  // Estimate APY based on current yield
  const annualizedYield = timeLocked > 0
    ? (yieldEarned / originalAmount) * (365 / timeLocked) * 100
    : 0;

  // Show skeleton while loading initial data
  if (status.isLoading) {
    return (
      <Card className="border-green-300 bg-gradient-to-br from-green-50/50 to-transparent dark:border-green-700 dark:from-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
            Yield Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-300 bg-gradient-to-br from-green-50/50 to-transparent dark:border-green-700 dark:from-green-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          Yield Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Amount Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Original Amount</p>
            <p className="font-mono font-medium text-sm">
              {formatUSDC(originalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Value</p>
            <p className="font-mono font-medium text-sm text-green-600 dark:text-green-400">
              {formatUSDC(currentValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Yield Earned</p>
            <p className="font-mono font-medium text-sm text-green-600 dark:text-green-400">
              +{formatUSDC(animatedYield)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <span>Time to Auto-Release</span>
            </div>
            <span className="font-medium">
              {daysToRelease} {daysToRelease === 1 ? 'day' : 'days'}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{timeLocked} days locked</span>
            <span>{autoReleaseDays} days total</span>
          </div>
        </div>

        {/* APY Estimate */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Estimated APY</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              {annualizedYield > 0 ? `${annualizedYield.toFixed(2)}%` : 'Calculating...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
