-- Migration: Add terms-based escrow tables
-- Arc Invoice V4 Terms System

-- Invoice terms table (stores full terms JSON)
CREATE TABLE IF NOT EXISTS invoice_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE UNIQUE,
    template_type TEXT NOT NULL CHECK (template_type IN ('web_dev', 'design', 'consulting', 'custom')),
    deliverables JSONB NOT NULL,
    payment_schedule TEXT NOT NULL CHECK (payment_schedule IN ('upfront', 'per_deliverable', '50_50')),
    revision_limit INTEGER DEFAULT 2,
    auto_release_days INTEGER DEFAULT 14,
    terms_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Term signatures table (tracks agreement from both parties)
CREATE TABLE IF NOT EXISTS term_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    signer_wallet TEXT NOT NULL,
    signer_role TEXT NOT NULL CHECK (signer_role IN ('creator', 'payer')),
    signature TEXT NOT NULL,
    terms_hash TEXT NOT NULL,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invoice_id, signer_role)
);

-- Add columns to disputes table for V4 deliverable-specific disputes
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS violated_deliverable_index INTEGER;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS violated_criteria TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoice_terms_invoice_id ON invoice_terms(invoice_id);
CREATE INDEX IF NOT EXISTS idx_term_signatures_invoice_id ON term_signatures(invoice_id);
CREATE INDEX IF NOT EXISTS idx_term_signatures_wallet ON term_signatures(signer_wallet);

-- RLS Policies
ALTER TABLE invoice_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_signatures ENABLE ROW LEVEL SECURITY;

-- Terms: anyone can view (needed for payment page)
CREATE POLICY "terms_select_all" ON invoice_terms FOR SELECT USING (true);
CREATE POLICY "terms_insert_creator" ON invoice_terms FOR INSERT WITH CHECK (true);

-- Signatures: anyone can view, anyone can insert
CREATE POLICY "signatures_select_all" ON term_signatures FOR SELECT USING (true);
CREATE POLICY "signatures_insert_signer" ON term_signatures FOR INSERT WITH CHECK (true);
