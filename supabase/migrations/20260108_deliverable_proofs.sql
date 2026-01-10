-- Deliverable proofs for V4 terms-based invoices
-- Tracks proof of work for each deliverable (required before payer can fund)

CREATE TABLE IF NOT EXISTS deliverable_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  deliverable_index INTEGER NOT NULL CHECK (deliverable_index >= 0 AND deliverable_index <= 9),
  proof_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each deliverable can only have one proof
  UNIQUE(invoice_id, deliverable_index)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_deliverable_proofs_invoice_id ON deliverable_proofs(invoice_id);

-- Enable RLS
ALTER TABLE deliverable_proofs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read proofs (for payer to verify)
CREATE POLICY "deliverable_proofs_select" ON deliverable_proofs
  FOR SELECT USING (true);

-- Policy: Only invoice creator can insert/update proofs
CREATE POLICY "deliverable_proofs_insert" ON deliverable_proofs
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

CREATE POLICY "deliverable_proofs_update" ON deliverable_proofs
  FOR UPDATE USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );
