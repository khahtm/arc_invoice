'use client';

import { useSignMessage, useAccount } from 'wagmi';

interface SignTermsResult {
  signTerms: (termsHash: string) => void;
  signature: string | undefined;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function useSignTerms(): SignTermsResult {
  const { address } = useAccount();
  const {
    signMessage,
    data: signature,
    isPending,
    isSuccess,
    error,
  } = useSignMessage();

  const signTerms = (termsHash: string) => {
    const message = `I agree to the escrow terms.\n\nTerms Hash: ${termsHash}\n\nSigned by: ${address}`;
    signMessage({ message });
  };

  return {
    signTerms,
    signature,
    isPending,
    isSuccess,
    error,
  };
}
