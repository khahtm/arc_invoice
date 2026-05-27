'use client';

import Link from 'next/link';
import { formatUSDC } from '@/lib/utils';

export interface PendingAction {
  dealId: string;
  shortCode: string;
  milestoneDescription: string;
  amount: number;
  action: 'deliver' | 'release' | 'deploy' | 'dispute-respond';
}

const actionConfig = {
  deliver: { label: 'Deliver', accent: '' },
  release: { label: 'Claim', accent: 'border-l-green-400' },
  deploy: { label: 'Deploy', accent: 'border-l-[#005FFE]' },
  'dispute-respond': { label: 'Respond', accent: 'border-l-red-400' },
};

export function ActionRequiredCard({ action: a }: { action: PendingAction }) {
  const config = actionConfig[a.action];

  return (
    <Link href={`/deals/${a.dealId}`} className="block">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.accent ? `border-l-3 ${config.accent}` : ''} hover:bg-muted/50 transition-colors animate-action-glow`}>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{a.milestoneDescription}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            #{a.shortCode} · {formatUSDC(a.amount)}
          </p>
        </div>
        <span className="text-xs font-medium text-[#005FFE] shrink-0">{config.label} →</span>
      </div>
    </Link>
  );
}
