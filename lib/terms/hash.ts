import { keccak256, toBytes } from 'viem';
import type { CreateTermsInput } from '@/types/terms';

/**
 * Normalize terms for consistent hashing
 * Sorts keys and removes whitespace
 */
function normalizeTerms(terms: CreateTermsInput): string {
  const normalized = {
    template_type: terms.template_type,
    deliverables: terms.deliverables.map((d) => ({
      name: d.name.trim(),
      criteria: d.criteria.trim(),
      deadlineDays: d.deadlineDays,
      percentageOfTotal: d.percentageOfTotal,
    })),
    payment_schedule: terms.payment_schedule,
    revision_limit: terms.revision_limit ?? 2,
    auto_release_days: terms.auto_release_days ?? 14,
  };

  return JSON.stringify(normalized);
}

/**
 * Generate keccak256 hash of terms
 * Used for on-chain storage and signature verification
 */
export function hashTerms(terms: CreateTermsInput): string {
  const normalized = normalizeTerms(terms);
  return keccak256(toBytes(normalized));
}

/**
 * Verify terms match a given hash
 */
export function verifyTermsHash(
  terms: CreateTermsInput,
  expectedHash: string
): boolean {
  return hashTerms(terms) === expectedHash;
}
