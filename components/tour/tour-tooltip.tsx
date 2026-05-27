'use client';

import { TooltipRenderProps } from 'react-joyride';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TourTooltip({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const isFirst = index === 0;
  const isLast = index === size - 1;

  return (
    <div
      {...tooltipProps}
      className="bg-background border border-border rounded-2xl shadow-2xl shadow-black/20 p-5 max-w-xs z-[10000]"
    >
      <div className="flex items-start justify-between mb-2">
        {step.title && (
          <h3 className="text-sm font-semibold text-foreground">{step.title as string}</h3>
        )}
        <button
          {...closeProps}
          className="text-muted-foreground hover:text-foreground transition-colors -mt-1 -mr-1 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{step.content as string}</p>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-muted-foreground font-mono">
          {index + 1}/{size}
        </span>
        <div className="flex items-center gap-2">
          {isFirst ? (
            <Button variant="ghost" size="sm" {...skipProps} className="text-xs h-8">
              Skip
            </Button>
          ) : (
            <Button variant="ghost" size="sm" {...backProps} className="text-xs h-8">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          )}
          <Button size="sm" {...primaryProps} className="text-xs h-8 bg-[#005FFE] hover:bg-[#005FFE]/90">
            {isLast ? 'Done' : (
              <>
                Next
                <ArrowRight className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
