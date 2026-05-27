import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('wallet-address')?.value;

  if (!walletAddress) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const milestoneIndex = body.milestoneIndex ?? body.milestone_index;
  const proofUrl = body.proof_url || null;

  if (milestoneIndex === undefined) {
    return Response.json({ error: 'milestoneIndex required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: deal } = await supabase
    .from('invoices')
    .select('creator_wallet, deal_status')
    .eq('id', id)
    .eq('deal_mode', true)
    .single();

  if (!deal) {
    return Response.json({ error: 'Deal not found' }, { status: 404 });
  }

  if (walletAddress.toLowerCase() !== deal.creator_wallet.toLowerCase()) {
    return Response.json({ error: 'Only creator can submit delivery' }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {
    delivered: true,
    delivered_at: new Date().toISOString(),
  };
  if (proofUrl) updateData.proof_url = proofUrl;

  const { data: milestone, error } = await supabase
    .from('milestones')
    .update(updateData)
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
