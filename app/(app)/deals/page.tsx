'use client';

import { useDeals } from '@/hooks/useDeals';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PrismButton } from '@/components/ui/prism-button';
import { formatUSDC } from '@/lib/utils';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  signed: 'bg-blue-500',
  funded: 'bg-indigo-500',
  active: 'bg-[#005FFE]',
  disputed: 'bg-yellow-500',
  completed: 'bg-green-500',
  refunded: 'bg-red-500',
};

export default function DealsPage() {
  const { deals, isLoading, error } = useDeals();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No deals yet</h2>
        <p className="mt-2 text-muted-foreground">Create your first deal to get started with escrow-protected payments.</p>
        <Link href="/deals/new">
          <PrismButton className="mt-6">
            <Plus className="h-4 w-4" /> Create Deal
          </PrismButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Deals</h1>
        <span className="text-muted-foreground">{deals.length} total</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const completed = deal.milestones.filter((m) => m.released).length;
          const total = deal.milestones.length;

          return (
            <Link key={deal.id} href={`/deals/${deal.id}`}>
              <Card className="p-5 hover:border-[#005FFE]/30 transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-mono text-sm text-muted-foreground">{deal.short_code}</p>
                  <Badge className={statusColors[deal.deal_status] || 'bg-gray-500'}>
                    {deal.deal_status}
                  </Badge>
                </div>
                <p className="font-medium text-lg font-mono text-[#005FFE]">{formatUSDC(deal.amount)}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{deal.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    {completed}/{total} milestones
                  </span>
                  {/* Progress bar */}
                  <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-[#005FFE] rounded-full transition-all"
                      style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
