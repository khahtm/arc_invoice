'use client';

import { useEffect, useState } from 'react';
import { useReadContract, useChainId } from 'wagmi';
import { DEAL_ESCROW_ABI } from '@/lib/contracts/deal-abi';
import type { DealWithMilestones } from './useDeals';
import type { DealStatus } from '@/types/database';

const CONTRACT_STATE_MAP: Record<number, DealStatus> = {
  0: 'draft',    // CREATED
  1: 'signed',   // SIGNED
  2: 'funded',   // FUNDED
  3: 'active',   // ACTIVE
  4: 'disputed', // DISPUTED
  5: 'completed',// COMPLETED
  6: 'refunded', // REFUNDED
};

export function useDealSync(
  deal: DealWithMilestones | null,
  onSync?: (updates: Record<string, unknown>) => Promise<void>
) {
  const chainId = useChainId();
  const [synced, setSynced] = useState(false);

  const escrowAddress = deal?.escrow_address as `0x${string}` | undefined;
  const shouldSync = !!escrowAddress && !!deal && deal.contract_version === 6;

  const { data: contractState } = useReadContract({
    address: escrowAddress!,
    abi: DEAL_ESCROW_ABI,
    functionName: 'getState',
    query: { enabled: shouldSync },
  });

  const { data: contractAmounts } = useReadContract({
    address: escrowAddress!,
    abi: DEAL_ESCROW_ABI,
    functionName: 'getAmounts',
    query: { enabled: shouldSync },
  });

  useEffect(() => {
    if (!deal || !contractState || !onSync || synced) return;

    const [stateEnum] = contractState as [number, bigint, bigint, bigint, boolean, bigint];
    const contractDealStatus = CONTRACT_STATE_MAP[stateEnum];

    if (contractDealStatus && contractDealStatus !== deal.deal_status) {
      onSync({ deal_status: contractDealStatus }).then(() => setSynced(true));
    } else {
      setSynced(true);
    }
  }, [deal, contractState, onSync, synced]);

  return {
    synced,
    contractState: contractState ? CONTRACT_STATE_MAP[(contractState as unknown as [number])[0]] : null,
  };
}
