'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSDC } from '@/lib/utils';
import { Check, RotateCcw } from 'lucide-react';
import type { AIMilestone } from '@/lib/ai/types';

interface AIMilestonePreviewProps {
  milestones: AIMilestone[];
  totalAmount: number;
  summary: string;
  onApply: () => void;
  onRegenerate: () => void;
}

export function AIMilestonePreview({ milestones, totalAmount, summary, onApply, onRegenerate }: AIMilestonePreviewProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{summary}</p>

      {milestones.map((m, i) => (
        <Card key={i} className="p-3 bg-[#005FFE]/[0.02] border-[#005FFE]/15">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                <span className="text-sm font-medium">{m.description}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">{m.rationale}</p>
            </div>
            <span className="text-sm font-mono font-medium text-[#005FFE] shrink-0">
              {formatUSDC(m.amount)}
            </span>
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm font-semibold">Total</span>
        <span className="font-mono font-medium text-[#005FFE]">{formatUSDC(totalAmount)}</span>
      </div>

      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1" size="sm">
          <Check className="h-3.5 w-3.5 mr-1" />
          Apply to Form
        </Button>
        <Button onClick={onRegenerate} variant="outline" size="sm">
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
