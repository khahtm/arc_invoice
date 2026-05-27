'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrismButton } from '@/components/ui/prism-button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/common/StatCard';
import { ActionRequiredCard, type PendingAction } from '@/components/deal/ActionRequiredCard';
import { DealPromoBanner } from '@/components/deal/deal-promo-banner';
import { useDeals, type DealWithMilestones } from '@/hooks/useDeals';
import { formatUSDC } from '@/lib/utils';
import { Briefcase, DollarSign, Clock, CheckCircle, Plus, ArrowRight, Zap, Shield } from 'lucide-react';

function getPendingActions(deals: DealWithMilestones[]): PendingAction[] {
  const actions: PendingAction[] = [];
  for (const deal of deals) {
    if (deal.deal_status === 'disputed') {
      actions.push({
        dealId: deal.id, shortCode: deal.short_code,
        milestoneDescription: deal.description,
        amount: deal.amount, action: 'dispute-respond',
      });
      continue;
    }
    if (deal.deal_status !== 'active' && deal.deal_status !== 'funded') continue;

    for (const m of deal.milestones) {
      if (m.approved && !m.released) {
        actions.push({
          dealId: deal.id, shortCode: deal.short_code,
          milestoneDescription: m.description,
          amount: m.amount, action: 'release',
        });
      } else if (m.status === 'funded' && !m.delivered) {
        actions.push({
          dealId: deal.id, shortCode: deal.short_code,
          milestoneDescription: m.description,
          amount: m.amount, action: 'deliver',
        });
      }
    }
  }
  return actions;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500', signed: 'bg-blue-500', funded: 'bg-indigo-500',
  active: 'bg-[#005FFE]', disputed: 'bg-yellow-500',
  completed: 'bg-green-500', refunded: 'bg-red-500',
};

export default function DashboardPage() {
  const { deals, isLoading } = useDeals();

  const activeDeals = deals.filter((d) => !['completed', 'refunded'].includes(d.deal_status));
  const totalEarned = deals.reduce((sum, d) => {
    const released = d.milestones.filter((m) => m.released).reduce((s, m) => s + m.amount, 0);
    return sum + released;
  }, 0);
  const pendingAmount = deals.reduce((sum, d) => {
    const pending = d.milestones.filter((m) => m.status === 'funded' && !m.released).reduce((s, m) => s + m.amount, 0);
    return sum + pending;
  }, 0);
  const completedCount = deals.filter((d) => d.deal_status === 'completed').length;
  const pendingActions = getPendingActions(deals);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card className="p-8 text-center border-[#005FFE]/20 bg-[#005FFE]/[0.02]">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[#005FFE]/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-[#005FFE]" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Create your first deal</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Set up milestones, share a link with your client, and get paid with escrow protection.
          </p>
          <Link href="/deals/new">
            <PrismButton><Plus className="h-4 w-4" /> Create Deal</PrismButton>
          </Link>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#005FFE]/10 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-[#005FFE]" />
            </div>
            <div>
              <p className="font-semibold text-sm">Milestone Payments</p>
              <p className="text-sm text-muted-foreground mt-0.5">Break projects into milestones. Get paid as you deliver.</p>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-[#00E5FF]" />
            </div>
            <div>
              <p className="font-semibold text-sm">Escrow Protection</p>
              <p className="text-sm text-muted-foreground mt-0.5">Funds held in smart contract. Safe for both parties.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/deals/new" className="hidden md:block">
          <PrismButton><Plus className="h-4 w-4" /> New Deal</PrismButton>
        </Link>
      </div>

      {/* Promo Banner */}
      <DealPromoBanner />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stat-cards">
        <StatCard title="Active Deals" value={activeDeals.length} icon={Briefcase} tip="Deals currently in progress" />
        <StatCard title="Earned" value={formatUSDC(totalEarned)} icon={DollarSign} tip="Total USDC released from completed milestones" />
        <StatCard title="Pending" value={formatUSDC(pendingAmount)} icon={Clock} tip="USDC locked in escrow awaiting release" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} tip="Deals fully completed and paid out" />
      </div>

      {/* Action Required */}
      {pendingActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Action Required
            <Badge className="bg-[#FF5C00]">{pendingActions.length}</Badge>
          </h2>
          <div className="space-y-3">
            {pendingActions.slice(0, 5).map((action, i) => (
              <ActionRequiredCard key={`${action.dealId}-${i}`} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Active Deals */}
      {activeDeals.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4" data-tour="deals-list">
            <h2 className="text-lg font-semibold">Active Deals</h2>
            <Link href="/deals" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {activeDeals.slice(0, 5).map((deal) => {
              const completed = deal.milestones.filter((m) => m.released).length;
              const total = deal.milestones.length;
              return (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="p-4 hover:border-[#005FFE]/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-muted-foreground">{deal.short_code}</p>
                          <Badge className={statusColors[deal.deal_status] || 'bg-gray-500'} >{deal.deal_status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{deal.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-medium text-[#005FFE]">{formatUSDC(deal.amount)}</p>
                        <p className="text-xs text-muted-foreground">{completed}/{total} done</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
