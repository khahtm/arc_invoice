import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyMessage } from 'viem';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { signature, wallet, termsHash } = await request.json();

  // Verify signature matches the expected message
  const message = `I agree to the escrow terms.\n\nTerms Hash: ${termsHash}\n\nSigned by: ${wallet}`;

  try {
    const isValid = await verifyMessage({
      address: wallet as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: 'Signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Verify terms hash matches
  const { data: terms } = await supabase
    .from('invoice_terms')
    .select('terms_hash')
    .eq('invoice_id', id)
    .single();

  if (!terms || terms.terms_hash !== termsHash) {
    return NextResponse.json({ error: 'Terms hash mismatch' }, { status: 400 });
  }

  // Record signature
  const { error } = await supabase.from('term_signatures').insert({
    invoice_id: id,
    signer_wallet: wallet.toLowerCase(),
    signer_role: 'payer',
    signature,
    terms_hash: termsHash,
  });

  if (error) {
    // Check if already signed
    if (error.code === '23505') {
      return NextResponse.json({ success: true, message: 'Already signed' });
    }
    return NextResponse.json(
      { error: 'Failed to save signature' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
