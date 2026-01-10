import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { z } from 'zod';

const proofSchema = z.object({
  deliverable_index: z.number().int().min(0).max(9),
  proof_url: z.string().url().max(2000),
});

// GET: Fetch all proofs for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('deliverable_proofs')
    .select('*')
    .eq('invoice_id', id)
    .order('deliverable_index', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ proofs: data || [] });
}

// POST: Submit proof for a deliverable (creator only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('wallet-address')?.value;

  if (!walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // Verify creator owns this invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select('creator_wallet, contract_version')
    .eq('id', id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.creator_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
    return NextResponse.json({ error: 'Only creator can submit proofs' }, { status: 403 });
  }

  if (invoice.contract_version !== 4) {
    return NextResponse.json({ error: 'Proofs only for V4 invoices' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = proofSchema.parse(body);

    // Use admin client to bypass RLS (auth already verified above)
    const adminClient = createAdminClient();

    // Upsert proof (allows updating existing proof)
    const { data, error } = await adminClient
      .from('deliverable_proofs')
      .upsert({
        invoice_id: id,
        deliverable_index: validatedData.deliverable_index,
        proof_url: validatedData.proof_url,
        submitted_at: new Date().toISOString(),
      }, {
        onConflict: 'invoice_id,deliverable_index',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ proof: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
