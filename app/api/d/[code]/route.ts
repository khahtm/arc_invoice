import { createClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: deal, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('short_code', code)
    .eq('deal_mode', true)
    .single();

  if (error || !deal) {
    return Response.json({ error: 'Deal not found' }, { status: 404 });
  }

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('invoice_id', deal.id)
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
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const supabase = await createClient();

  const { data: deal } = await supabase
    .from('invoices')
    .select('id')
    .eq('short_code', code)
    .eq('deal_mode', true)
    .single();

  if (!deal) {
    return Response.json({ error: 'Deal not found' }, { status: 404 });
  }

  const allowedFields = [
    'deal_status', 'status', 'client_wallet', 'client_signed_at',
    'funded_at', 'last_activity_at', 'tx_hash',
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (body.milestone_index !== undefined && body.milestone_updates) {
    await supabase
      .from('milestones')
      .update(body.milestone_updates)
      .eq('invoice_id', deal.id)
      .eq('order_index', body.milestone_index);
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('invoices').update(updates).eq('id', deal.id);
  }

  return Response.json({ success: true });
}
