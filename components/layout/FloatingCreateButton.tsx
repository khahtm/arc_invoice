'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function FloatingCreateButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/deals/new"
          className="md:hidden fixed right-4 bottom-20 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left">New Deal</TooltipContent>
    </Tooltip>
  );
}
