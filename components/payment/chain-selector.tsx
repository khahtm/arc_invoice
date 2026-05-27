'use client';

import { useRef, useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isArcChain, isSourceChain, ALL_CHAINS, getChainName, getChainLogo } from '@/lib/chains';
import { useMultiChainBalance } from '@/hooks/use-multi-chain-balance';
import { cn } from '@/lib/utils';

interface ChainSelectorProps {
  amount: number;
}

export function ChainSelector({ amount }: ChainSelectorProps) {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { balance, isLoading, isInsufficient } = useMultiChainBalance();

  if (!isConnected || !chainId) return null;

  const currentChainName = getChainName(chainId);
  const currentLogo = getChainLogo(chainId);
  const onArc = isArcChain(chainId);
  const onSource = isSourceChain(chainId);
  const supported = onArc || onSource;
  const insufficient = isInsufficient(amount);

  return (
    <Card className="p-4 space-y-3">
      {/* Current chain */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {currentLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentLogo} alt="" className="w-7 h-7 rounded-full" />
          )}
          <div>
            <p className="text-xs text-muted-foreground">Paying from</p>
            <p className="font-semibold text-sm">{currentChainName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onArc && <Badge variant="secondary">Direct</Badge>}
          {onSource && <Badge variant="outline">Cross-chain</Badge>}
          {!supported && <Badge variant="destructive">Unsupported</Badge>}
        </div>
      </div>

      {supported && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">USDC Balance</span>
          <span className={cn('font-mono font-medium', insufficient && 'text-destructive')}>
            {isLoading ? '...' : `$${balance.toFixed(2)}`}
            {insufficient && !isLoading && ' (insufficient)'}
          </span>
        </div>
      )}

      {!supported && (
        <p className="text-sm text-destructive">
          Please switch to a supported network.
        </p>
      )}

      {/* Chain switch buttons */}
      <ChainButtons chainId={chainId} onSwitch={(id) => switchChain({ chainId: id })} />
    </Card>
  );
}

function ChainButtons({ chainId, onSwitch }: { chainId: number; onSwitch: (id: number) => void }) {
  const logoRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const handleClick = useCallback((id: number) => {
    const el = logoRefs.current.get(id);
    if (el) {
      el.classList.remove('burst');
      void el.offsetWidth;
      el.classList.add('burst');
    }
    onSwitch(id);
  }, [onSwitch]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {ALL_CHAINS.filter((c) => c.id !== chainId).slice(0, 6).map((chain) => {
        const logo = getChainLogo(chain.id);
        return (
          <button
            key={chain.id}
            className="chain-switch-btn flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-left cursor-pointer"
            onClick={() => handleClick(chain.id)}
          >
            {logo && (
              <span
                className="chain-logo-wrap shrink-0"
                ref={(el) => { if (el) logoRefs.current.set(chain.id, el); }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="w-5 h-5 rounded-full" />
              </span>
            )}
            <span className="text-xs font-medium truncate">{chain.name}</span>
          </button>
        );
      })}
    </div>
  );
}
