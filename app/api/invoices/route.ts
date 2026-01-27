import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { generateShortCode } from '@/lib/utils';
import { invoiceWithTermsSchema } from '@/lib/validation';
import { hashTerms } from '@/lib/terms/hash';
import { z } from 'zod';

export async function GET() {
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('wallet-address')?.value;

  if (!walletAddress) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('creator_wallet', walletAddress)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ invoices: data });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('wallet-address')?.value;

  if (!walletAddress) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = invoiceWithTermsSchema.parse(body);

    const supabase = await createClient();

    // Extract yield_escrow_enabled
    const yieldEscrowEnabled = validatedData.yield_escrow_enabled ?? false;

    // Determine contract version:
    // v5 = yield escrow (USYC yield via YIELD_FACTORY)
    // v4 = terms-based escrow (new default)
    // v3 = milestones (pay-per-milestone)
    // v1 = simple escrow
    const hasTerms = validatedData.terms && validatedData.payment_type === 'escrow';
    const hasMilestones =
      validatedData.milestones && validatedData.milestones.length > 0;

    // Yield escrow takes priority when enabled
    const contractVersion =
      yieldEscrowEnabled && validatedData.payment_type === 'escrow'
        ? 5
        : hasTerms
          ? 4
          : hasMilestones
            ? 3
            : 1;

    // Create invoice (exclude milestones and terms from insert)
    const { milestones, terms, yield_escrow_enabled, ...invoiceData } = validatedData;
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        auto_release_days: invoiceData.auto_release_days ?? 14,
        short_code: generateShortCode(),
        creator_wallet: walletAddress,
        status: 'pending',
        contract_version: contractVersion,
        yield_escrow_enabled: yieldEscrowEnabled,
      })
      .select()
      .single();

    if (invoiceError) {
      return Response.json({ error: invoiceError.message }, { status: 500 });
    }

    // Handle V4 terms
    if (hasTerms && terms) {
      const termsHash = hashTerms(terms);

      // Insert invoice terms
      const { error: termsError } = await supabase.from('invoice_terms').insert({
        invoice_id: invoice.id,
        template_type: terms.template_type,
        deliverables: terms.deliverables,
        payment_schedule: terms.payment_schedule,
        revision_limit: terms.revision_limit ?? 2,
        auto_release_days: terms.auto_release_days ?? 14,
        terms_hash: termsHash,
      });

      if (termsError) {
        console.error('Failed to save terms:', termsError);
        // Continue anyway - invoice was created
      }

      // Record creator signature (implicit - creator signs by creating)
      const { error: sigError } = await supabase
        .from('term_signatures')
        .insert({
          invoice_id: invoice.id,
          signer_wallet: walletAddress,
          signer_role: 'creator',
          signature: 'implicit',
          terms_hash: termsHash,
        });

      if (sigError) {
        console.error('Failed to save creator signature:', sigError);
      }
    }

    // Handle legacy V3 milestones
    if (!hasTerms && milestones && milestones.length > 0) {
      const milestonesWithInvoiceId = milestones.map((m, i) => ({
        invoice_id: invoice.id,
        order_index: i,
        amount: Math.round(m.amount * 1_000_000), // Convert USDC to micro USDC for bigint
        description: m.description,
        status: 'pending',
      }));

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestonesWithInvoiceId);

      if (milestonesError) {
        // Rollback: delete the invoice if milestones failed
        await supabase.from('invoices').delete().eq('id', invoice.id);
        return Response.json({ error: milestonesError.message }, { status: 500 });
      }
    }

    return Response.json({ invoice }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues }, { status: 400 });
    }
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
