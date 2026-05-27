import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { milestoneIndex, txHash, bridgeTxHash, walletAddress } = body;

  if (milestoneIndex === undefined || !walletAddress) {
    return Response.json({ error: 'Missing milestoneIndex or walletAddress' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: deal } = await supabase
    .from('invoices')
    .select('id, client_wallet, deal_status')
    .eq('id', id)
    .eq('deal_mode', true)
    .single();

  if (!deal) {
    return Response.json({ error: 'Deal not found' }, { status: 404 });
  }

  if (deal.client_wallet?.toLowerCase() !== walletAddress.toLowerCase()) {
    return Response.json({ error: 'Not the deal client' }, { status: 403 });
  }

  // Get milestones to find the right one by index
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('invoice_id', id)
    .order('order_index', { ascending: true });

  if (!milestones || !milestones[milestoneIndex]) {
    return Response.json({ error: 'Milestone not found' }, { status: 404 });
  }

  const milestone = milestones[milestoneIndex];

  // Update milestone status to funded
  const { error: msError } = await supabase
    .from('milestones')
    .update({ status: 'funded' })
    .eq('id', milestone.id);

  if (msError) {
    return Response.json({ error: msError.message }, { status: 500 });
  }

  // Update deal status to active (milestone is funded, work can begin)
  await supabase
    .from('invoices')
    .update({
      deal_status: 'active',
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', id);

  return Response.json({ success: true, milestoneId: milestone.id, dealStatus: 'active' });
}
