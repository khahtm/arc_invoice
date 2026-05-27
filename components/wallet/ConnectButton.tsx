'use client';

import {
  useAccount,
  useConnect,
  useDisconnect,
} from 'wagmi';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Wallet, LogOut, Copy, Check, AlertTriangle } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { isSupportedChain, getChainName } from '@/lib/chains';
import { useMultiChainBalance } from '@/hooks/use-multi-chain-balance';
import { toast } from 'sonner';

export function ConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { balance, isLoading: balanceLoading } = useMultiChainBalance();
  const [copied, setCopied] = useState(false);

  const supported = isSupportedChain(chainId);
  const chainName = chainId ? getChainName(chainId) : '';

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && address && !supported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive" className="gap-2" disabled>
            <AlertTriangle className="h-4 w-4" />
            Unsupported Network
          </Button>
        </TooltipTrigger>
        <TooltipContent>Switch to a supported network in your wallet</TooltipContent>
      </Tooltip>
    );
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="font-mono">{truncateAddress(address)}</span>
            <span className="text-xs text-muted-foreground">{chainName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <div className="px-2 py-2 text-center">
            <p className="text-xs text-muted-foreground">USDC on {chainName}</p>
            <p className="text-lg font-medium font-mono">
              {balanceLoading ? '...' : `$${balance.toFixed(2)}`}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-sm">{truncateAddress(address, 6)}</span>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
