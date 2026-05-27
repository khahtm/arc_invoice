export type BridgeStatus =
  | 'idle'
  | 'approving'
  | 'burning'
  | 'attesting'
  | 'minting'
  | 'complete'
  | 'error';

export interface BridgeTransfer {
  status: BridgeStatus;
  sourceChainId: number;
  sourceTxHash?: string;
  messageHash?: string;
  attestation?: string;
  mintTxHash?: string;
  error?: string;
  startedAt?: number;
}

export interface BridgeStep {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  txHash?: string;
  chainId?: number;
}

export const ATTESTATION_POLL_INTERVAL_MS = 2000;
export const ATTESTATION_TIMEOUT_MS = 5 * 60 * 1000;
export const BRIDGE_RECOVERY_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const ATTESTATION_API_URL = 'https://iris-api-sandbox.circle.com/v2/attestations';
