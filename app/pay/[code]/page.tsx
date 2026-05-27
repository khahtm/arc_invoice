'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { DirectPayButton } from '@/components/payment/DirectPayButton';
import { TransakPayButton } from '@/components/payment/TransakPayButton';
import { FundEscrowButton } from '@/components/escrow/FundEscrowButton';
import { ChainSelector } from '@/components/payment/chain-selector';
import { CrossChainPayButton } from '@/components/payment/cross-chain-pay-button';
import { BridgeFeeEstimate } from '@/components/payment/bridge-fee-estimate';
import { PaymentAdvisorBanner } from '@/components/payment/payment-advisor-banner';
import { isArcChain, isSourceChain } from '@/lib/chains';
import { formatUSDC, truncateAddress } from '@/lib/utils';
import { toast } from 'sonner';
import { useSwitchChain } from 'wagmi';
import type { Invoice } from '@/types/database';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Awaiting Payment', color: 'bg-yellow-500' },
  funded: { label: 'Funded', color: 'bg-blue-500' },
  released: { label: 'Paid', color: 'bg-green-500' },
  refunded: { label: 'Refunded', color: 'bg-red-500' },
};

export default function PaymentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onArc = isArcChain(chainId);
  const onSource = isSourceChain(chainId);

  useEffect(() => {
    fetch(`/api/pay/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setInvoice(data.invoice);
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setIsLoading(false));
  }, [code]);

  const handlePaymentSuccess = async (txHash: string) => {
    try {
      const res = await fetch(`/api/pay/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: invoice?.payment_type === 'direct' ? 'released' : 'funded',
          tx_hash: txHash,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update invoice');
      }

      toast.success('Payment successful!');
      router.push(`/pay/${code}/success?tx=${txHash}`);
    } catch (err) {
      console.error('Payment update error:', err);
      toast.error('Payment sent! Status update may be delayed.');
      router.push(`/pay/${code}/success?tx=${txHash}`);
    }
  };

  const handlePaymentError = (err: Error) => {
    if (err.message?.includes('User rejected') || err.message?.includes('user rejected')) {
      toast.error('Transaction cancelled');
      return;
    }
    toast.error(err.message || 'Payment failed');
  };

  const handleTransakSuccess = async (orderId: string) => {
    try {
      const res = await fetch(`/api/pay/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: invoice?.payment_type === 'direct' ? 'released' : 'funded',
          tx_hash: `transak:${orderId}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update invoice');
      }

      toast.success('Payment successful!');
      router.push(`/pay/${code}/success?tx=transak:${orderId}`);
    } catch (err) {
      console.error('Payment update error:', err);
      toast.error('Payment processing. Status update may be delayed.');
      router.push(`/pay/${code}/success?tx=transak:${orderId}`);
    }
  };

  // Cross-chain bridge complete → USDC now on Arc, execute payment
  const handleBridgeComplete = async (mintTxHash: string) => {
    toast.success('USDC bridged to Arc! Completing payment...');
    await handlePaymentSuccess(mintTxHash);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-xl font-bold text-destructive">Invoice Not Found</h1>
          <p className="text-muted-foreground mt-2">
            This invoice doesn&apos;t exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  const isPaid = ['released', 'refunded', 'funded'].includes(invoice.status);
  const status = statusConfig[invoice.status] || { label: invoice.status, color: 'bg-gray-500' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Invoice</p>
            <p className="font-mono font-semibold">{invoice.short_code}</p>
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>

        {/* Amount */}
        <div className="text-center py-8 border-y">
          <p className="text-4xl font-medium font-mono">{formatUSDC(invoice.amount)}</p>
          <p className="text-muted-foreground mt-1">USDC</p>
        </div>

        {/* Description */}
        <div className="py-4 space-y-1">
          <p className="text-sm font-medium">Description</p>
          <p className="text-muted-foreground">{invoice.description}</p>
        </div>

        {/* Recipient */}
        <div className="py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Paying to:{' '}
            <span className="font-mono text-foreground">
              {truncateAddress(invoice.creator_wallet)}
            </span>
          </p>
        </div>

        {/* Payment Actions */}
        {isPaid ? (
          <div className="mt-4 text-center">
            <p className="text-muted-foreground">
              This invoice has already been {invoice.status}.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Payment Options
                </span>
              </div>
            </div>

            {/* Connect Wallet */}
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            {/* Chain Selector — shows after wallet connected */}
            {isConnected && (
              <>
                <ChainSelector amount={invoice.amount} />
                <PaymentAdvisorBanner
                  amount={invoice.amount}
                  onSwitchChain={(id) => switchChain?.({ chainId: id })}
                />
              </>
            )}

            {/* Arc-native payment (existing flow) */}
            {isConnected && onArc && (
              <div className="space-y-2">
                {invoice.payment_type === 'direct' && (
                  <DirectPayButton
                    amount={invoice.amount}
                    recipient={invoice.creator_wallet as `0x${string}`}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}

                {invoice.payment_type === 'escrow' && invoice.escrow_address && (
                  <FundEscrowButton
                    escrowAddress={invoice.escrow_address as `0x${string}`}
                    amount={invoice.amount.toString()}
                    contractVersion={invoice.contract_version}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}

                {invoice.payment_type === 'escrow' && !invoice.escrow_address && (
                  <p className="text-sm text-muted-foreground text-center">
                    Escrow not yet created. Please contact the invoice creator.
                  </p>
                )}
              </div>
            )}

            {/* Cross-chain payment via CCTP */}
            {isConnected && onSource && (
              <CrossChainPayButton
                amount={invoice.amount}
                recipientOnArc={invoice.creator_wallet as `0x${string}`}
                onBridgeComplete={handleBridgeComplete}
                onError={handlePaymentError}
              />
            )}

            {/* Unsupported chain */}
            {isConnected && !onArc && !onSource && (
              <p className="text-sm text-destructive text-center">
                Please switch to a supported network to pay.
              </p>
            )}

            {/* Bridge fee estimate */}
            {isConnected && <BridgeFeeEstimate sourceChainId={chainId} />}

            {/* Fiat payment */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or pay with card
                </span>
              </div>
            </div>

            <TransakPayButton
              amount={invoice.amount}
              walletAddress={invoice.escrow_address || invoice.creator_wallet}
              invoiceCode={invoice.short_code}
              onSuccess={handleTransakSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {/* Payment Type Info */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {invoice.payment_type === 'direct'
              ? 'Instant payment — funds sent immediately to recipient'
              : 'Protected payment — funds held securely until release'}
          </p>
        </div>
      </Card>
    </div>
  );
}
