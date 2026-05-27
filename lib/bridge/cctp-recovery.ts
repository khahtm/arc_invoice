import type { BridgeTransfer } from './cctp-types';
import { BRIDGE_RECOVERY_EXPIRY_MS } from './cctp-types';

const STORAGE_KEY = 'arc-invoice-bridge-recovery';

interface StoredBridge extends BridgeTransfer {
  invoiceCode?: string;
}

export function saveBridgeState(transfer: BridgeTransfer, invoiceCode?: string): void {
  if (typeof window === 'undefined') return;

  const data: StoredBridge = { ...transfer, invoiceCode };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadBridgeState(): StoredBridge | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: StoredBridge = JSON.parse(raw);

    if (data.startedAt && Date.now() - data.startedAt > BRIDGE_RECOVERY_EXPIRY_MS) {
      clearBridgeState();
      return null;
    }

    if (data.status === 'complete' || data.status === 'idle') {
      clearBridgeState();
      return null;
    }

    return data;
  } catch {
    clearBridgeState();
    return null;
  }
}

export function clearBridgeState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
