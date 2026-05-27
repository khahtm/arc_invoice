import type { Chain } from 'viem';
import { arcTestnet, arcMainnet } from './arc';
import { SOURCE_CHAINS } from './source-chains';

export { arcTestnet, arcMainnet } from './arc';
export { SOURCE_CHAINS, SOURCE_CHAINS_MAINNET, SOURCE_CHAINS_TESTNET } from './source-chains';

export const ARC_CHAINS = [arcTestnet, arcMainnet] as const;
export const ALL_CHAINS = [arcTestnet, arcMainnet, ...SOURCE_CHAINS] as const;

export function isArcChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return chainId === arcTestnet.id || chainId === arcMainnet.id;
}

export function isSourceChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return SOURCE_CHAINS.some((c) => c.id === chainId);
}

export function isSupportedChain(chainId: number | undefined): boolean {
  return isArcChain(chainId) || isSourceChain(chainId);
}

export function getChain(chainId: number): Chain | undefined {
  return ALL_CHAINS.find((c) => c.id === chainId);
}

export function getChainName(chainId: number): string {
  return getChain(chainId)?.name ?? `Chain ${chainId}`;
}

export function getExplorerUrl(chainId: number): string | undefined {
  return getChain(chainId)?.blockExplorers?.default.url;
}

export function getExplorerTxUrl(chainId: number, txHash: string): string | undefined {
  const baseUrl = getExplorerUrl(chainId);
  return baseUrl ? `${baseUrl}/tx/${txHash}` : undefined;
}

const CHAIN_LOGOS: Record<number, string> = {
  // Mainnet
  1: '/chains/ethereum.png',
  8453: '/chains/base.png',
  42161: '/chains/arbitrum.png',
  137: '/chains/polygon.png',
  10: '/chains/optimism.png',
  // Testnet
  11155111: '/chains/ethereum.png',
  84532: '/chains/base.png',
  421614: '/chains/arbitrum.png',
  80002: '/chains/polygon.png',
  11155420: '/chains/optimism.png',
  // Arc
  5042001: '/chains/arc.svg',
  5042002: '/chains/arc.svg',
};

export function getChainLogo(chainId: number): string | undefined {
  return CHAIN_LOGOS[chainId];
}
