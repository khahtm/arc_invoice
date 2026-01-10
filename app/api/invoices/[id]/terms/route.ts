import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: terms, error } = await supabase
    .from('invoice_terms')
    .select('*')
    .eq('invoice_id', id)
    .single();

  if (error || !terms) {
    return NextResponse.json({ error: 'Terms not found' }, { status: 404 });
  }

  return NextResponse.json({ terms });
}
