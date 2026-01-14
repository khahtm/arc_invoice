'use client';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FundTermsEscrowButton } from '@/components/escrow/FundTermsEscrowButton';
import { formatUSDC } from '@/lib/utils';
import {
  FileText,
  Clock,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { InvoiceTerms, Deliverable, DeliverableProof } from '@/types/terms';

// Status types for deliverables
type DeliverableStatus = 'approved' | 'funded' | 'proof_submitted' | 'pending';

interface TermsReviewProps {
  terms: InvoiceTerms;
  totalAmount: number;
  onAgree: (agreed: boolean) => void;
  agreed: boolean;
  // V4 per-deliverable props
  escrowAddress?: `0x${string}`;
  currentDeliverable?: number;
  proofs?: DeliverableProof[];
  deliverableStatuses?: { funded: boolean; approved: boolean }[];
  termsAgreed?: boolean;
  onFundSuccess?: (txHash: string) => void;
  onFundError?: (error: Error) => void;
}

// Helper: Get status for a deliverable
function getDeliverableStatus(
  index: number,
  statuses?: { funded: boolean; approved: boolean }[],
  proofs?: DeliverableProof[]
): DeliverableStatus {
  const status = statuses?.[index];
  const hasProof = proofs?.some((p) => p.deliverable_index === index);

  if (status?.approved) return 'approved';
  if (status?.funded) return 'funded';
  if (hasProof) return 'proof_submitted';
  return 'pending';
}

// Helper: Get proof URL for a deliverable
function getProofUrl(
  index: number,
  proofs?: DeliverableProof[]
): string | null {
  return proofs?.find((p) => p.deliverable_index === index)?.proof_url ?? null;
}

// Status badge config
const statusBadgeConfig = {
  approved: {
    label: 'Released',
    className: 'bg-green-500 text-white',
    Icon: CheckCircle,
  },
  funded: {
    label: 'Funded',
    className: 'bg-blue-500 text-white',
    Icon: CheckCircle2,
  },
  proof_submitted: {
    label: 'Proof submitted',
    className: 'border-yellow-500 text-yellow-600 bg-yellow-50',
    Icon: AlertCircle,
  },
  pending: {
    label: 'Awaiting proof',
    className: 'text-muted-foreground',
    Icon: Clock,
  },
};

// Status badge component
function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const config = statusBadgeConfig[status];
  const { Icon } = config;
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Deliverable row component
function DeliverableRow({
  deliverable,
  index,
  amount,
  status,
  proofUrl,
  canFund,
  showFundControls,
  escrowAddress,
  termsHash,
  termsAgreed,
  onFundSuccess,
  onFundError,
}: {
  deliverable: Deliverable;
  index: number;
  amount: number;
  status: DeliverableStatus;
  proofUrl: string | null;
  canFund: boolean;
  showFundControls: boolean;
  escrowAddress?: `0x${string}`;
  termsHash?: string;
  termsAgreed?: boolean;
  onFundSuccess?: (txHash: string) => void;
  onFundError?: (error: Error) => void;
}) {
  return (
    <div className="border rounded-lg p-3 bg-muted/30">
      {/* Header: Name + Amount + Status */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {index + 1}. {deliverable.name}
          </span>
          <Badge variant="outline" className="text-xs font-mono">
            {formatUSDC(amount)}
          </Badge>
        </div>
        <DeliverableStatusBadge status={status} />
      </div>

      {/* Criteria */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">Criteria:</span> {deliverable.criteria}
      </p>

      {/* Deadline */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {deliverable.deadlineDays} days
        </span>
      </div>

      {/* Proof Link */}
      {proofUrl && (
        <div className="mt-2 pt-2 border-t">
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View proof <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Fund Button (V4 mode only) */}
      {showFundControls &&
        escrowAddress &&
        termsHash &&
        onFundSuccess &&
        onFundError && (
          <div className="mt-3">
            {canFund ? (
              <FundTermsEscrowButton
                escrowAddress={escrowAddress}
                termsHash={termsHash}
                deliverableIndex={index}
                deliverableAmount={amount}
                termsAgreed={termsAgreed ?? false}
                onSuccess={onFundSuccess}
                onError={onFundError}
              />
            ) : status === 'pending' ? (
              <Button disabled className="w-full" variant="outline" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Awaiting proof
              </Button>
            ) : null}
          </div>
        )}
    </div>
  );
}

export function TermsReview({
  terms,
  totalAmount,
  onAgree,
  agreed,
  // V4 props
  escrowAddress,
  currentDeliverable = 0,
  proofs,
  deliverableStatuses,
  termsAgreed,
  onFundSuccess,
  onFundError,
}: TermsReviewProps) {
  const deliverables: Deliverable[] = terms.deliverables;
  const isV4Mode = !!escrowAddress;

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b pb-3">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Terms of Agreement</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        This escrow protects both parties. Funds will be released upon completion
        of the following deliverables:
      </p>

      {/* Deliverables List */}
      <div className="space-y-3">
        {deliverables.map((d, index) => {
          const amount = (d.percentageOfTotal / 100) * totalAmount;
          const status = isV4Mode
            ? getDeliverableStatus(index, deliverableStatuses, proofs)
            : 'pending';
          const proofUrl = getProofUrl(index, proofs);
          const canFund =
            isV4Mode &&
            index === currentDeliverable &&
            status === 'proof_submitted' &&
            termsAgreed;

          return (
            <DeliverableRow
              key={index}
              deliverable={d}
              index={index}
              amount={amount}
              status={status}
              proofUrl={proofUrl}
              canFund={canFund ?? false}
              showFundControls={isV4Mode}
              escrowAddress={escrowAddress}
              termsHash={terms.terms_hash}
              termsAgreed={termsAgreed}
              onFundSuccess={onFundSuccess}
              onFundError={onFundError}
            />
          );
        })}
      </div>

      {/* Terms Summary */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <span>Revisions included: {terms.revision_limit}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Auto-release: {terms.auto_release_days} days</span>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="flex items-start gap-3 pt-3 border-t">
        <Checkbox
          id="agree-terms"
          checked={agreed}
          onCheckedChange={(checked: boolean | 'indeterminate') =>
            onAgree(checked === true)
          }
        />
        <label
          htmlFor="agree-terms"
          className="text-sm cursor-pointer leading-relaxed"
        >
          I have read and agree to these terms. I understand that funds will be
          held in escrow until deliverables are approved or the auto-release
          deadline passes.
        </label>
      </div>
    </Card>
  );
}
