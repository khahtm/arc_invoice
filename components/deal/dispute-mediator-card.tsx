'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Scale, AlertTriangle } from 'lucide-react';
import { useDisputeMediator } from '@/hooks/use-dispute-mediator';
import { formatUSDC } from '@/lib/utils';
import type { MediatorResponse } from '@/lib/ai/types';

interface DisputeMediatorCardProps {
  dealId: string;
  disputedAmount: number;
  onAccept: (recommendation: MediatorResponse) => void;
}

const recommendationConfig: Record<string, { label: string; color: string }> = {
  full_release: { label: 'Full Release', color: 'bg-green-500' },
  full_refund: { label: 'Full Refund', color: 'bg-red-500' },
  partial_split: { label: 'Partial Split', color: 'bg-yellow-500' },
};

const confidenceConfig = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
};

export function DisputeMediatorCard({ dealId, disputedAmount, onAccept }: DisputeMediatorCardProps) {
  const { analyze, isAnalyzing, result, error, reset } = useDisputeMediator();

  if (!result && !isAnalyzing && !error) {
    return (
      <Card className="p-5 border-yellow-500/20 bg-yellow-500/[0.03]">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">AI Dispute Mediation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Get a non-binding AI analysis of this dispute before escalating to Kleros arbitration.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => analyze(dealId)}
            >
              <Scale className="h-3.5 w-3.5 mr-1" />
              Get AI Mediation
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="p-5 border-yellow-500/20 bg-yellow-500/[0.03]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing dispute...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-5 border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
          <div>
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => { reset(); analyze(dealId); }}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!result) return null;

  const rec = recommendationConfig[result.recommendation] || { label: 'Recommendation', color: 'bg-gray-500' };

  return (
    <Card className="p-5 border-yellow-500/20 bg-yellow-500/[0.03] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium">AI Mediation Result</span>
        </div>
        <Badge className={rec.color}>{rec.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-lg bg-background border">
          <p className="text-xs text-muted-foreground">Freelancer</p>
          <p className="font-mono font-medium text-green-600">{formatUSDC(result.creatorAmount)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background border">
          <p className="text-xs text-muted-foreground">Client</p>
          <p className="font-mono font-medium text-blue-600">{formatUSDC(result.clientAmount)}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{result.reasoning}</p>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Confidence:</span>
        <span className={`font-medium capitalize ${confidenceConfig[result.confidence]}`}>
          {result.confidence}
        </span>
      </div>

      <p className="text-xs text-muted-foreground italic">
        This is a non-binding AI suggestion. Both parties can accept or escalate to Kleros.
      </p>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => onAccept(result)}>
          Accept Suggestion
        </Button>
        <Button size="sm" variant="outline" onClick={() => { reset(); analyze(dealId); }}>
          Re-analyze
        </Button>
      </div>
    </Card>
  );
}
