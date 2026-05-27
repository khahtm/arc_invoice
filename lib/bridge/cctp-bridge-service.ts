import { type Address, type Hash, encodePacked, keccak256, pad } from 'viem';
import type { BridgeTransfer } from './cctp-types';
import { getCCTPConfig, getArcDomainId } from '@/lib/contracts/cctp-addresses';
import { pollAttestation } from './cctp-attestation';
import { TOKEN_MESSENGER_ABI, ERC20_APPROVE_ABI, MESSAGE_TRANSMITTER_ABI } from './cctp-abi';

// Converts an address to bytes32 (CCTP requires bytes32 for mintRecipient)
export function addressToBytes32(address: Address): `0x${string}` {
  return pad(address, { size: 32 });
}

// Extract message hash from burn transaction logs
export function extractMessageHash(logs: readonly { data: string; topics: readonly string[] }[]): string | null {
  for (const log of logs) {
    // MessageSent event topic
    const messageSentTopic = keccak256(
      encodePacked(['string'], ['MessageSent(bytes)'])
    );

    if (log.topics[0] === messageSentTopic && log.data) {
      return keccak256(log.data as `0x${string}`);
    }
  }
  return null;
}

export interface BridgeParams {
  sourceChainId: number;
  amount: bigint;
  recipient: Address;
  writeContract: (args: {
    address: Address;
    abi: readonly unknown[];
    functionName: string;
    args: readonly unknown[];
    chainId?: number;
  }) => Promise<Hash>;
  waitForReceipt: (hash: Hash, chainId?: number) => Promise<{ logs: readonly { data: string; topics: readonly string[] }[] }>;
  switchChain: (chainId: number) => Promise<void>;
  onStatusChange: (transfer: BridgeTransfer) => void;
  signal?: AbortSignal;
}

export async function bridgeUSDC(params: BridgeParams): Promise<BridgeTransfer> {
  const {
    sourceChainId,
    amount,
    recipient,
    writeContract,
    waitForReceipt,
    switchChain,
    onStatusChange,
    signal,
  } = params;

  const sourceConfig = getCCTPConfig(sourceChainId);
  if (!sourceConfig) {
    throw new Error(`CCTP not supported on chain ${sourceChainId}`);
  }

  const arcDomainId = getArcDomainId();
  const mintRecipient = addressToBytes32(recipient);

  let transfer: BridgeTransfer = {
    status: 'approving',
    sourceChainId,
    startedAt: Date.now(),
  };
  onStatusChange(transfer);

  // Step 1: Approve USDC for TokenMessenger
  const approveTx = await writeContract({
    address: sourceConfig.usdc,
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [sourceConfig.tokenMessenger, amount],
    chainId: sourceChainId,
  });
  await waitForReceipt(approveTx, sourceChainId);

  // Step 2: Burn USDC via depositForBurn
  transfer = { ...transfer, status: 'burning' };
  onStatusChange(transfer);

  const burnTx = await writeContract({
    address: sourceConfig.tokenMessenger,
    abi: TOKEN_MESSENGER_ABI,
    functionName: 'depositForBurn',
    args: [amount, arcDomainId, mintRecipient, sourceConfig.usdc],
    chainId: sourceChainId,
  });

  const burnReceipt = await waitForReceipt(burnTx, sourceChainId);
  transfer = { ...transfer, sourceTxHash: burnTx };
  onStatusChange(transfer);

  // Step 3: Extract message hash from burn logs
  const messageHash = extractMessageHash(burnReceipt.logs);
  if (!messageHash) {
    throw new Error('Failed to extract message hash from burn transaction');
  }

  transfer = { ...transfer, status: 'attesting', messageHash };
  onStatusChange(transfer);

  // Step 4: Poll for attestation
  const attestation = await pollAttestation(messageHash, signal);
  transfer = { ...transfer, attestation };
  onStatusChange(transfer);

  // Step 5: Switch to Arc and mint
  transfer = { ...transfer, status: 'minting' };
  onStatusChange(transfer);

  const arcConfig = getCCTPConfig(5042002); // Arc testnet
  if (!arcConfig) {
    throw new Error('Arc CCTP config not found');
  }

  await switchChain(5042002);

  // receiveMessage requires the original message bytes + attestation
  // The message bytes are the data from the MessageSent event log
  const messageBytes = extractMessageBytes(burnReceipt.logs);
  if (!messageBytes) {
    throw new Error('Failed to extract message bytes from burn transaction');
  }

  const mintTx = await writeContract({
    address: arcConfig.messageTransmitter,
    abi: MESSAGE_TRANSMITTER_ABI,
    functionName: 'receiveMessage',
    args: [messageBytes, attestation],
    chainId: 5042002,
  });

  await waitForReceipt(mintTx, 5042002);

  transfer = { ...transfer, status: 'complete', mintTxHash: mintTx };
  onStatusChange(transfer);

  return transfer;
}

// Extract raw message bytes from MessageSent event
function extractMessageBytes(logs: readonly { data: string; topics: readonly string[] }[]): `0x${string}` | null {
  const messageSentTopic = keccak256(
    encodePacked(['string'], ['MessageSent(bytes)'])
  );

  for (const log of logs) {
    if (log.topics[0] === messageSentTopic && log.data) {
      return log.data as `0x${string}`;
    }
  }
  return null;
}
