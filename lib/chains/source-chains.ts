import { mainnet, base, arbitrum, polygon, optimism } from 'viem/chains';
import { sepolia, baseSepolia, arbitrumSepolia, polygonAmoy, optimismSepolia } from 'viem/chains';

export const SOURCE_CHAINS_MAINNET = [mainnet, base, arbitrum, polygon, optimism] as const;

export const SOURCE_CHAINS_TESTNET = [sepolia, baseSepolia, arbitrumSepolia, polygonAmoy, optimismSepolia] as const;

export const SOURCE_CHAINS = SOURCE_CHAINS_TESTNET;
