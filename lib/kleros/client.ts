/**
 * Kleros API client for dispute arbitration
 * Note: Kleros primarily operates on Ethereum mainnet
 */

const KLEROS_API = 'https://api.kleros.io';

export interface KlerosDispute {
  id: string;
  status: 'waiting' | 'evidence' | 'voting' | 'appeal' | 'resolved';
  ruling: number | null;
  currentRuling: number | null;
  evidenceDeadline: string;
  appealDeadline: string | null;
  arbitrated: string; // contract address
  numberOfRulingOptions: number;
}

export interface KlerosMetaEvidence {
  title: string;
  description: string;
  question: string;
  rulingOptions: {
    type: string;
    titles: string[];
    descriptions: string[];
  };
}

/**
 * Get dispute status from Kleros API
 */
export async function getDisputeStatus(disputeId: string): Promise<KlerosDispute | null> {
  try {
    const res = await fetch(`${KLEROS_API}/disputes/${disputeId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Create meta-evidence for Arc Invoice dispute
 * For V4 invoices, includes deliverable-specific context
 */
export function createMetaEvidence(
  invoiceCode: string,
  invoiceAmount: number,
  disputeReason: string,
  deliverableName?: string,
  deliverableCriteria?: string,
  violatedCriteria?: string
): KlerosMetaEvidence {
  const baseDescription = `Dispute regarding invoice ${invoiceCode} for ${(invoiceAmount / 1_000_000).toFixed(2)} USDC.`;

  // Build context based on whether this is a V4 dispute with deliverable info
  const deliverableContext = deliverableName
    ? `\n\nDisputed Deliverable: ${deliverableName}\nAgreed Criteria: ${deliverableCriteria}\nClaim: ${violatedCriteria || disputeReason}`
    : `\n\nReason: ${disputeReason}`;

  // V4 disputes get a specific question about the deliverable
  const question = deliverableName
    ? `Did the deliverable "${deliverableName}" meet the agreed criteria: "${deliverableCriteria}"?`
    : 'How should the escrowed funds be distributed?';

  return {
    title: `Arc Invoice Dispute - ${invoiceCode}${deliverableName ? ` (${deliverableName})` : ''}`,
    description: baseDescription + deliverableContext,
    question,
    rulingOptions: {
      type: 'single-select',
      titles: ['Refuse to Arbitrate', 'Refund to Payer', 'Release to Creator', 'Split 50/50'],
      descriptions: [
        'Jurors cannot reach a decision',
        deliverableName
          ? 'Deliverable did NOT meet criteria - refund payer'
          : 'Full refund to the payer',
        deliverableName
          ? 'Deliverable DID meet criteria - release to creator'
          : 'Full release to the invoice creator',
        'Partial completion - split funds equally',
      ],
    },
  };
}

/**
 * Kleros ruling codes
 */
export const KLEROS_RULING = {
  REFUSE: 0,
  PAYER_WINS: 1,
  CREATOR_WINS: 2,
  SPLIT: 3,
} as const;

export type KlerosRulingCode = (typeof KLEROS_RULING)[keyof typeof KLEROS_RULING];

/**
 * Convert Kleros ruling code to readable string
 */
export function rulingToString(ruling: number): string {
  switch (ruling) {
    case KLEROS_RULING.REFUSE:
      return 'refused';
    case KLEROS_RULING.PAYER_WINS:
      return 'payer';
    case KLEROS_RULING.CREATOR_WINS:
      return 'creator';
    case KLEROS_RULING.SPLIT:
      return 'split';
    default:
      return 'unknown';
  }
}

/**
 * Calculate amounts based on ruling
 */
export function calculateRulingAmounts(
  ruling: number,
  totalAmount: number
): { payerAmount: number; creatorAmount: number } {
  switch (ruling) {
    case KLEROS_RULING.PAYER_WINS:
      return { payerAmount: totalAmount, creatorAmount: 0 };
    case KLEROS_RULING.CREATOR_WINS:
      return { payerAmount: 0, creatorAmount: totalAmount };
    case KLEROS_RULING.SPLIT:
      const half = Math.floor(totalAmount / 2);
      return { payerAmount: half, creatorAmount: totalAmount - half };
    default:
      // REFUSE - default to split
      const defaultHalf = Math.floor(totalAmount / 2);
      return { payerAmount: defaultHalf, creatorAmount: totalAmount - defaultHalf };
  }
}
