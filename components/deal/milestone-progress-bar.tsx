'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { Milestone } from '@/types/database';

interface MilestoneProgressBarProps {
  milestones: Milestone[];
  className?: string;
}

function getProgress(m: Milestone): number {
  if (m.released) return 100;
  if (m.approved) return 75;
  if (m.delivered) return 50;
  if (m.status === 'funded') return 25;
  return 0;
}

function getLabel(m: Milestone): string {
  if (m.released) return 'Released';
  if (m.approved) return 'Approved';
  if (m.delivered) return 'Delivered';
  if (m.status === 'funded') return 'Funded';
  return 'Pending';
}

export function MilestoneProgressBar({ milestones, className }: MilestoneProgressBarProps) {
  const total = milestones.length;
  const released = milestones.filter((m) => m.released).length;
  const overallPercent = total > 0 ? Math.round((released / total) * 100) : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">
          {released === total ? 'All milestones complete' : `${released} of ${total} milestones released`}
        </p>
        <span className="text-sm font-mono font-medium text-[#005FFE]">{overallPercent}%</span>
      </div>

      {/* Steps */}
      <div className="flex gap-1.5">
        {milestones.map((m) => {
          const progress = getProgress(m);
          return (
            <div key={m.id} className="flex-1 group relative">
              {/* Track */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    progress === 100 ? 'bg-green-500' : 'bg-[#005FFE]',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap">
                  #{m.order_index + 1} {getLabel(m)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone dots */}
      <div className="flex justify-between px-0.5">
        {milestones.map((m, i) => {
          const done = m.released;
          return (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium transition-all',
                  done
                    ? 'bg-green-500 text-white'
                    : m.status === 'funded' || m.delivered || m.approved
                      ? 'bg-[#005FFE] text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
