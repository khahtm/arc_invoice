'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useTour } from '@/components/tour/tour-provider';

export function Header() {
  const { startTour } = useTour();

  return (
    <header className="border-b bg-background h-16 flex items-center px-4 md:px-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/dashboard" className="shrink-0" data-tour="header-logo">
            <Image
              src="/logo-new.png"
              alt="Arc Invoice"
              width={160}
              height={40}
              className="h-9 w-auto"
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">Go to Dashboard</TooltipContent>
      </Tooltip>
      <div className="ml-auto flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="sm" className="hidden md:inline-flex" data-tour="new-deal-btn">
              <Link href="/deals/new">
                <Plus className="h-4 w-4 mr-1" />
                New Deal
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create a new escrow deal</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={startTour}
              data-tour="help-btn"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-accent"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Platform tour</TooltipContent>
        </Tooltip>
        <div data-tour="connect-wallet">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
