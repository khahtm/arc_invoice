'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PrismButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PrismButton = forwardRef<HTMLButtonElement, PrismButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex items-center justify-center overflow-hidden rounded-[26px] px-6 py-3 font-semibold text-white transition-all duration-300',
          'bg-[#005FFE] hover:bg-[#0050DD]',
          'shadow-lg shadow-[#005FFE]/25 hover:scale-[1.02] active:scale-[0.98]',
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

PrismButton.displayName = 'PrismButton';
