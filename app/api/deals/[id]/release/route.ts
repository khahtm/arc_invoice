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
  const { milestoneIndex } = body;

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
    return Response.json({ error: 'Only creator can release' }, { status: 403 });
  }

  const { data: milestone, error } = await supabase
    .from('milestones')
    .update({
      released: true,
      released_at: new Date().toISOString(),
    })
    .eq('invoice_id', id)
    .eq('order_index', milestoneIndex)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Check if all milestones are released → mark deal completed
  const { data: allMilestones } = await supabase
    .from('milestones')
    .select('released')
    .eq('invoice_id', id);

  const allReleased = allMilestones?.every((m) => m.released);

  await supabase
    .from('invoices')
    .update({
      deal_status: allReleased ? 'completed' : 'active',
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', id);

  return Response.json({ milestone, dealStatus: allReleased ? 'completed' : 'active' });
}
