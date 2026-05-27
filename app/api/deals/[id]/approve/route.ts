import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { milestoneIndex, walletAddress } = body;

  const cookieStore = await cookies();
  const resolvedWallet = cookieStore.get('wallet-address')?.value || walletAddress;

  if (milestoneIndex === undefined || !resolvedWallet) {
    return Response.json({ error: 'milestoneIndex and wallet required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: deal } = await supabase
    .from('invoices')
    .select('client_wallet, deal_status')
    .eq('id', id)
    .eq('deal_mode', true)
    .single();

  if (!deal) {
    return Response.json({ error: 'Deal not found' }, { status: 404 });
  }

  if (deal.client_wallet?.toLowerCase() !== resolvedWallet.toLowerCase()) {
    return Response.json({ error: 'Only the client can approve' }, { status: 403 });
  }

  const { data: milestone, error } = await supabase
    .from('milestones')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
    })
    .eq('invoice_id', id)
    .eq('order_index', milestoneIndex)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from('invoices')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', id);

  return Response.json({ milestone });
}
