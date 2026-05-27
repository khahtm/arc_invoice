import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const walletAddress = cookieStore.get('wallet-address')?.value;

  if (!walletAddress) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: deals, error } = await supabase
    .from('invoices')
    .select('id, escrow_address, deal_status')
    .eq('creator_wallet', walletAddress)
    .eq('deal_mode', true)
    .not('escrow_address', 'is', null)
    .in('deal_status', ['signed', 'funded', 'active', 'disputed']);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    deals: deals || [],
    message: `${deals?.length || 0} active deals with escrow addresses ready for client-side sync`,
  });
}
