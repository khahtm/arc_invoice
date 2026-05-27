import { StatCard } from '@/components/common/StatCard';
import { formatUSDC } from '@/lib/utils';
import { DollarSign, Clock, Users, Percent } from 'lucide-react';

interface StatCardsProps {
  stats: {
    totalRevenue: number;
    pendingRevenue: number;
    unpaidAmount: number;
    uniqueClients: number;
    escrowCount: number;
    directCount: number;
    totalInvoices: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const escrowRatio =
    stats.totalInvoices > 0 ? Math.round((stats.escrowCount / stats.totalInvoices) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Revenue" value={formatUSDC(stats.totalRevenue)} icon={DollarSign} tip="Sum of all released USDC payments" />
      <StatCard
        title="Pending"
        value={formatUSDC(stats.pendingRevenue)}
        description="In escrow"
        icon={Clock}
        tip="Funds currently held in escrow contracts"
      />
      <StatCard title="Clients" value={stats.uniqueClients} icon={Users} tip="Unique client addresses you've dealt with" />
      <StatCard
        title="Escrow Usage"
        value={`${escrowRatio}%`}
        description={`${stats.escrowCount}/${stats.totalInvoices} invoices`}
        icon={Percent}
        tip="Percentage of deals using escrow protection"
      />
    </div>
  );
}
