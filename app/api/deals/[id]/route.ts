import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const walletAddress = cookieStore.get('wallet-address')?.value;

    if (!walletAddress) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: deal, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('deal_mode', true)
      .single();

    if (error || !deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('invoice_id', id)
      .order('order_index', { ascending: true });

    const fromMicro = (n: number) => n / 1_000_000;
    return Response.json({
      deal: {
        ...deal,
        amount: fromMicro(deal.amount),
        milestones: (milestones || []).map((m: { amount: number }) => ({
          ...m,
          amount: fromMicro(m.amount),
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Deal fetch failed:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const walletAddress = cookieStore.get('wallet-address')?.value;

    if (!walletAddress) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const allowedFields = [
      'deal_status', 'escrow_address', 'tx_hash', 'status',
      'client_wallet', 'client_signed_at', 'creator_signed_at',
      'last_activity_at', 'dispute_reason', 'disputed_milestone_index',
      'terms_hash', 'funded_at',
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: deal, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .eq('deal_mode', true)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      deal: { ...deal, amount: deal.amount / 1_000_000 },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Deal update failed:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
