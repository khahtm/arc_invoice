import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { id, milestoneId } = await params;
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('wallet-address')?.value;

  const body = await req.json();
  const { status, proof_url } = body;

  // Validate: either status or proof_url must be provided
  const hasStatus = status !== undefined;
  const hasProofUrl = proof_url !== undefined;

  if (!hasStatus && !hasProofUrl) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  if (hasStatus && !['funded', 'approved', 'released'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }

  // 'funded' status can be set by payer (no auth required - on-chain tx proves payment)
  // 'approved', 'released', and 'proof_url' require auth (creator action)
  if ((hasStatus && status !== 'funded') || hasProofUrl) {
    if (!walletAddress) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = await createClient();

  // Build update data
  const updateData: Record<string, unknown> = {};

  if (hasStatus) {
    updateData.status = status;
    if (status === 'released') {
      updateData.released_at = new Date().toISOString();
    }
  }

  if (hasProofUrl) {
    // Validate URL format if provided
    if (proof_url !== null) {
      try {
        new URL(proof_url);
      } catch {
        return Response.json({ error: 'Invalid proof URL' }, { status: 400 });
      }
    }
    updateData.proof_url = proof_url;
  }

  const { data, error } = await supabase
    .from('milestones')
    .update(updateData)
    .eq('id', milestoneId)
    .eq('invoice_id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Convert micro USDC back to USDC for frontend
  const milestone = data
    ? { ...data, amount: Number(data.amount) / 1_000_000 }
    : null;

  return Response.json({ milestone });
}
