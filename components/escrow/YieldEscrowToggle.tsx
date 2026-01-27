'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info as InfoIcon } from 'lucide-react';

interface YieldEscrowToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function YieldEscrowToggle({
  enabled,
  onToggle,
  disabled = false,
}: YieldEscrowToggleProps) {
  return (
    <Card
      className={`transition-all ${
        enabled
          ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20'
          : ''
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="yield-escrow-toggle"
              className={`font-medium ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
            >
              Yield Escrow
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>
                    Funds earn ~3-4% APY from US Treasury yields while locked
                    in escrow
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="yield-escrow-toggle"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
        </div>

        {enabled && (
          <div className="text-sm text-muted-foreground pt-1">
            Your escrowed funds will be automatically deposited into USYC
            (Hashnote US Yield Coin) to earn yield from US Treasury returns
            while safely locked. Yield accrues continuously and compounds
            automatically.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
