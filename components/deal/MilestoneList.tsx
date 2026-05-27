'use client';

import { cn } from '@/lib/utils';
import { formatUSDC } from '@/lib/utils';
import { Check, Circle, Clock, Loader2, AlertTriangle, DollarSign } from 'lucide-react';
import type { Milestone } from '@/types/database';

interface MilestoneListProps {
  milestones: Milestone[];
  className?: string;
}

function getMilestoneIcon(m: Milestone) {
  if (m.released) return <Check className="h-4 w-4 text-green-500" />;
  if (m.approved) return <DollarSign className="h-4 w-4 text-blue-500" />;
  if (m.delivered) return <Clock className="h-4 w-4 text-yellow-500" />;
  if (m.status === 'funded') return <Loader2 className="h-4 w-4 text-[#005FFE] animate-spin" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

function getMilestoneLabel(m: Milestone) {
  if (m.released) return 'Released';
  if (m.approved) return 'Approved';
  if (m.delivered) return 'Delivered';
  if (m.status === 'funded') return 'Funded';
  return 'Pending';
}

function getMilestoneColor(m: Milestone) {
  if (m.released) return 'text-green-600 bg-green-50';
  if (m.approved) return 'text-blue-600 bg-blue-50';
  if (m.delivered) return 'text-yellow-600 bg-yellow-50';
  if (m.status === 'funded') return 'text-[#005FFE] bg-[#005FFE]/5';
  return 'text-muted-foreground bg-muted';
}

export function MilestoneList({ milestones, className }: MilestoneListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {milestones.map((m, i) => (
        <div
          key={m.id}
          className={cn(
            'flex items-center gap-4 p-4 rounded-xl border transition-colors',
            m.released && 'border-green-200 bg-green-50/50',
            !m.released && m.status === 'funded' && 'border-[#005FFE]/20 bg-[#005FFE]/[0.02]',
          )}
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-mono font-semibold shrink-0">
            {i + 1}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{m.description}</p>
            {m.proof_url && (
              <a
                href={m.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View proof →
              </a>
            )}
          </div>

          <span className="font-mono font-medium text-[#005FFE] shrink-0">
            {formatUSDC(m.amount)}
          </span>

          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
            getMilestoneColor(m),
          )}>
            {getMilestoneIcon(m)}
            {getMilestoneLabel(m)}
          </span>
        </div>
      ))}
    </div>
  );
}
