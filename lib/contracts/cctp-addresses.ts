import { sepolia, baseSepolia, arbitrumSepolia, polygonAmoy, optimismSepolia } from 'viem/chains';
import { arcTestnet } from '@/lib/chains/arc';

export interface CCTPChainConfig {
  domainId: number;
  tokenMessenger: `0x${string}`;
  messageTransmitter: `0x${string}`;
  usdc: `0x${string}`;
}

// CCTP V2 uses identical contract addresses across all EVM chains
const CCTP_V2_TOKEN_MESSENGER = '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d' as const;
const CCTP_V2_MESSAGE_TRANSMITTER = '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64' as const;

// Testnet CCTP V2 contract addresses (different from mainnet)
const CCTP_V2_TOKEN_MESSENGER_TESTNET = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as const;
const CCTP_V2_MESSAGE_TRANSMITTER_TESTNET = '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD' as const;

// CCTP Domain IDs — assigned by Circle per chain
// See: https://developers.circle.com/cctp/cctp-supported-blockchains
export const CCTP_TESTNET_CONFIG: Record<number, CCTPChainConfig> = {
  [sepolia.id]: {
    domainId: 0,
    tokenMessenger: CCTP_V2_TOKEN_MESSENGER_TESTNET,
    messageTransmitter: CCTP_V2_MESSAGE_TRANSMITTER_TESTNET,
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
  [baseSepolia.id]: {
    domainId: 6,
    tokenMessenger: CCTP_V2_TOKEN_MESSENGER_TESTNET,
    messageTransmitter: CCTP_V2_MESSAGE_TRANSMITTER_TESTNET,
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  [arbitrumSepolia.id]: {
    domainId: 3,
    tokenMessenger: CCTP_V2_TOKEN_MESSENGER_TESTNET,
    messageTransmitter: CCTP_V2_MESSAGE_TRANSMITTER_TESTNET,
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  },
  [polygonAmoy.id]: {
    domainId: 7,
    tokenMessenger: CCTP_V2_TOKEN_MESSENGER_TESTNET,
    messageTransmitter: CCTP_V2_MESSAGE_TRANSMITTER_TESTNET,
    usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  },
  [optimismSepolia.id]: {
    domainId: 2,
    tokenMessenger: CCTP_V2_TOKEN_MESSENGER_TESTNET,
    messageTransmitter: CCTP_V2_MESSAGE_TRANSMITTER_TESTNET,
    usdc: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  },
  [arcTestnet.id]: {
    domainId: 12,
    tokenMessenger: CCTP_V2_TOKEN_MESSENGER_TESTNET,
    messageTransmitter: CCTP_V2_MESSAGE_TRANSMITTER_TESTNET,
    usdc: '0x3600000000000000000000000000000000000000',
  },
};

// Mainnet config — populate when Arc mainnet launches
export const CCTP_MAINNET_CONFIG: Record<number, CCTPChainConfig> = {};

export const CCTP_CONFIG = CCTP_TESTNET_CONFIG;

export function getCCTPConfig(chainId: number): CCTPChainConfig | undefined {
  return CCTP_CONFIG[chainId];
}

export function getSourceUSDCAddress(chainId: number): `0x${string}` | undefined {
  return CCTP_CONFIG[chainId]?.usdc;
}

export function getArcDomainId(): number {
  return CCTP_CONFIG[arcTestnet.id].domainId;
}

export function isCCTPSupported(chainId: number): boolean {
  return chainId in CCTP_CONFIG;
}
