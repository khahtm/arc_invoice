/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useSignTerms } from '@/hooks/useSignTerms';
import { useFundTermsEscrow } from '@/hooks/useFundTermsEscrow';
import { useTermsEscrowStatus } from '@/hooks/useTermsEscrowStatus';
import { Loader2, CheckCircle, Signature, Wallet } from 'lucide-react';

interface FundTermsEscrowButtonProps {
  escrowAddress: `0x${string}`;
  termsHash: string;
  deliverableIndex: number;
  deliverableAmount: number;
  termsAgreed: boolean;
  onSuccess: (txHash: string) => void;
  onError: (error: Error) => void;
}

type Step = 'idle' | 'signing' | 'approving' | 'funding' | 'complete';

/**
 * Multi-step funding button for Terms-based Escrow (V4).
 *
 * Flow: Sign Terms → Approve USDC → Fund Deliverable
 *
 * Note: This component uses effects to react to wagmi's async state changes,
 * which triggers React Compiler lint warnings. This is a valid pattern for
 * integrating with external state management systems like wagmi.
 */
export function FundTermsEscrowButton({
  escrowAddress,
  termsHash,
  deliverableIndex,
  deliverableAmount,
  termsAgreed,
  onSuccess,
  onError,
}: FundTermsEscrowButtonProps) {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<Step>('idle');

  // Track which events we've already processed to avoid double-processing
  const processedSignatureRef = useRef<string | null>(null);
  const processedTxHashRef = useRef<string | null>(null);

  // Use refs for callbacks to avoid stale closures
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const { isSigned, isActive, currentDeliverable, refetch } =
    useTermsEscrowStatus(escrowAddress);
  const {
    signTerms,
    signature,
    isPending: isSigningMessage,
    isSuccess: signatureSuccess,
    error: signatureError,
  } = useSignTerms();
  const {
    signTermsOnChain,
    approveUsdc,
    fundDeliverable,
    hash,
    isPending,
    isConfirming,
    isSuccess: txSuccess,
    error: txError,
    reset,
  } = useFundTermsEscrow(escrowAddress);

  // Handle signature completion - transition from signing to on-chain signing or approval
  useEffect(() => {
    if (
      step === 'signing' &&
      signatureSuccess &&
      signature &&
      processedSignatureRef.current !== signature
    ) {
      processedSignatureRef.current = signature;

      if (!isSigned && !isActive) {
        // Sign on-chain first
        signTermsOnChain(signature as `0x${string}`);
      } else {
        // Already signed on-chain, go to approve
        setStep('approving');
        approveUsdc(deliverableAmount);
      }
    }
  }, [signatureSuccess, signature, step, isSigned, isActive, signTermsOnChain, approveUsdc, deliverableAmount]);

  // Handle transaction success - progress through the flow
  useEffect(() => {
    if (txSuccess && hash && processedTxHashRef.current !== hash) {
      processedTxHashRef.current = hash;

      if (step === 'signing' && !isSigned) {
        // On-chain signature complete, now approve
        setStep('approving');
        reset();
        approveUsdc(deliverableAmount);
      } else if (step === 'approving') {
        // Approval complete, now fund
        setStep('funding');
        reset();
        fundDeliverable(deliverableIndex);
      } else if (step === 'funding') {
        // Funding complete
        setStep('complete');
        refetch();
        onSuccessRef.current(hash);
      }
    }
  }, [txSuccess, hash, step, isSigned, reset, approveUsdc, fundDeliverable, deliverableAmount, deliverableIndex, refetch]);

  // Handle errors
  useEffect(() => {
    const error = signatureError || txError;
    if (error && step !== 'idle') {
      onErrorRef.current(error);
      setStep('idle');
      reset();
      processedSignatureRef.current = null;
      processedTxHashRef.current = null;
    }
  }, [signatureError, txError, step, reset]);

  const handleClick = async () => {
    if (!termsAgreed) return;

    // Refetch latest on-chain state to prevent stale data race conditions
    const { data: latestDetails } = await refetch();
    if (latestDetails) {
      const latestCurrentDeliverable = Number(latestDetails[10]);
      if (deliverableIndex !== latestCurrentDeliverable) {
        onErrorRef.current(
          new Error(
            `Cannot fund deliverable ${deliverableIndex + 1}. ` +
            `Deliverable ${latestCurrentDeliverable + 1} must be funded first.`
          )
        );
        return;
      }
    }

    // Reset processed refs for new flow
    processedSignatureRef.current = null;
    processedTxHashRef.current = null;

    // If escrow already signed/active, skip to approve
    if (isSigned || isActive) {
      setStep('approving');
      approveUsdc(deliverableAmount);
    } else {
      // Need to sign first
      setStep('signing');
      signTerms(termsHash);
    }
  };

  const isLoading = isPending || isConfirming || isSigningMessage;
  const isDisabled =
    !isConnected ||
    !termsAgreed ||
    isLoading ||
    deliverableIndex !== currentDeliverable;

  const getButtonContent = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!termsAgreed) return 'Agree to Terms First';
    if (deliverableIndex !== currentDeliverable)
      return `Fund Deliverable ${currentDeliverable + 1} First`;

    switch (step) {
      case 'signing':
        return (
          <>
            <Signature className="mr-2 h-4 w-4" />
            {isSigningMessage ? 'Sign in Wallet...' : 'Confirming Signature...'}
          </>
        );
      case 'approving':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Approving USDC...
          </>
        );
      case 'funding':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Funding Escrow...
          </>
        );
      case 'complete':
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Funded!
          </>
        );
      default:
        return (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            {isSigned || isActive ? 'Fund Deliverable' : 'Sign & Fund'}
          </>
        );
    }
  };

  return (
    <Button onClick={handleClick} disabled={isDisabled} className="w-full">
      {isLoading && step !== 'signing' && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {getButtonContent()}
    </Button>
  );
}
