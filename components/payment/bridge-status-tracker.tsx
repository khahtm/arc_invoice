'use client';

import type { BridgeTransfer } from '@/lib/bridge/cctp-types';
import { getExplorerTxUrl, getChainName } from '@/lib/chains';
import { truncateAddress } from '@/lib/utils';
import { ExternalLink, Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BridgeStatusTrackerProps {
  transfer: BridgeTransfer;
  onRetry?: () => void;
}

interface Step {
  label: string;
  state: 'pending' | 'active' | 'complete' | 'error';
  txHash?: string;
  chainId?: number;
}

function getSteps(transfer: BridgeTransfer): Step[] {
  const { status, sourceChainId, sourceTxHash, mintTxHash } = transfer;
  const chainName = getChainName(sourceChainId);

  const steps: Step[] = [
    {
      label: `Approve USDC on ${chainName}`,
      state: status === 'approving' ? 'active' :
             ['burning', 'attesting', 'minting', 'complete'].includes(status) ? 'complete' :
             status === 'error' ? 'error' : 'pending',
    },
    {
      label: `Bridge from ${chainName}`,
      state: status === 'burning' ? 'active' :
             ['attesting', 'minting', 'complete'].includes(status) ? 'complete' :
             'pending',
      txHash: sourceTxHash,
      chainId: sourceChainId,
    },
    {
      label: 'Waiting for confirmation',
      state: status === 'attesting' ? 'active' :
             ['minting', 'complete'].includes(status) ? 'complete' :
             'pending',
    },
    {
      label: 'Completing payment',
      state: status === 'minting' ? 'active' :
             status === 'complete' ? 'complete' :
             'pending',
      txHash: mintTxHash,
      chainId: 5042002,
    },
  ];

  return steps;
}

function StepIcon({ state }: { state: Step['state'] }) {
  switch (state) {
    case 'complete':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'active':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

export function BridgeStatusTracker({ transfer, onRetry }: BridgeStatusTrackerProps) {
  if (transfer.status === 'idle') return null;

  const steps = getSteps(transfer);

  return (
    <div className="space-y-3 py-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-0.5">
            <StepIcon state={step.state} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{step.label}</p>
            {step.txHash && step.chainId && (
              <a
                href={getExplorerTxUrl(step.chainId, step.txHash) ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                {truncateAddress(step.txHash)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ))}

      {transfer.status === 'error' && (
        <div className="pt-2 space-y-2">
          <p className="text-sm text-destructive">{transfer.error}</p>
          {transfer.sourceTxHash && (
            <p className="text-xs text-muted-foreground">
              Your funds are safe. Burn tx: {truncateAddress(transfer.sourceTxHash)}
            </p>
          )}
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
