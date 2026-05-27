'use client';

import { isArcChain, getChainName } from '@/lib/chains';

interface BridgeFeeEstimateProps {
  sourceChainId: number | undefined;
}

const GAS_ESTIMATES: Record<string, string> = {
  Sepolia: '~$5-50',
  'Base Sepolia': '~$0.30',
  'Arbitrum Sepolia': '~$0.30',
  'Polygon Amoy': '~$0.10',
  'OP Sepolia': '~$0.30',
};

export function BridgeFeeEstimate({ sourceChainId }: BridgeFeeEstimateProps) {
  if (!sourceChainId) return null;

  if (isArcChain(sourceChainId)) {
    return (
      <p className="text-xs text-muted-foreground text-center">
        No bridge fees — paying directly on Arc
      </p>
    );
  }

  const chainName = getChainName(sourceChainId);
  const gasEstimate = GAS_ESTIMATES[chainName] ?? '~$0.50';

  return (
    <div className="text-xs text-muted-foreground text-center space-y-0.5">
      <p>Cross-chain via Circle CCTP — est. gas {gasEstimate}</p>
      <p>Bridge time: ~30 seconds</p>
    </div>
  );
}
