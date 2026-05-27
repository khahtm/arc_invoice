-- Arc Invoice — Full Database Setup
-- Run this in Supabase SQL Editor for a fresh project

-- ============================================================
-- 1. Core: invoices table
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code TEXT UNIQUE NOT NULL,
    creator_wallet TEXT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'direct' CHECK (payment_type IN ('direct', 'escrow')),
    client_name TEXT,
    client_email TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'funded', 'released', 'refunded')),
    escrow_address TEXT,
    auto_release_days INT DEFAULT 14,
    funded_at TIMESTAMPTZ,
    tx_hash TEXT,
    contract_version INT DEFAULT 1,
    proof_url TEXT,
    deal_mode BOOLEAN DEFAULT false,
    terms_hash TEXT,
    client_wallet TEXT,
    client_signed_at TIMESTAMPTZ,
    creator_signed_at TIMESTAMPTZ,
    deal_status TEXT DEFAULT 'draft' CHECK (deal_status IN ('draft', 'signed', 'funded', 'active', 'disputed', 'completed', 'refunded')),
    last_activity_at TIMESTAMPTZ,
    dispute_reason TEXT,
    disputed_milestone_index INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_all" ON invoices FOR SELECT USING (true);
CREATE POLICY "invoices_insert_any" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "invoices_update_any" ON invoices FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_invoices_creator ON invoices(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_invoices_short_code ON invoices(short_code);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_deal_mode ON invoices(deal_mode) WHERE deal_mode = true;
CREATE INDEX IF NOT EXISTS idx_invoices_deal_status ON invoices(deal_status) WHERE deal_mode = true;
CREATE INDEX IF NOT EXISTS idx_invoices_client_wallet ON invoices(client_wallet) WHERE client_wallet IS NOT NULL;

-- ============================================================
-- 2. Milestones
-- ============================================================
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'approved', 'released')),
    proof_url TEXT,
    delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    released BOOLEAN DEFAULT false,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invoice_id, order_index)
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_select_all" ON milestones FOR SELECT USING (true);
CREATE POLICY "milestones_insert_any" ON milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "milestones_update_any" ON milestones FOR UPDATE USING (true);
CREATE INDEX IF NOT EXISTS idx_milestones_invoice_id ON milestones(invoice_id);

-- ============================================================
-- 3. Disputes
-- ============================================================
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    opened_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'proposed', 'resolved', 'escalated', 'expired')),
    resolution_type TEXT CHECK (resolution_type IN ('refund', 'release', 'split')),
    resolution_payer_amount BIGINT,
    resolution_creator_amount BIGINT,
    proposed_by TEXT,
    proposed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    violated_deliverable_index INT,
    violated_criteria TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
    submitted_by TEXT NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disputes_select_all" ON disputes FOR SELECT USING (true);
CREATE POLICY "disputes_insert_any" ON disputes FOR INSERT WITH CHECK (true);
CREATE POLICY "disputes_update_any" ON disputes FOR UPDATE USING (true);
CREATE POLICY "evidence_select_all" ON dispute_evidence FOR SELECT USING (true);
CREATE POLICY "evidence_insert_any" ON dispute_evidence FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_disputes_invoice ON disputes(invoice_id);

-- ============================================================
-- 4. Notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    email_on_funded BOOLEAN DEFAULT true,
    email_on_released BOOLEAN DEFAULT true,
    email_on_dispute BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_prefs_all" ON notification_preferences FOR ALL USING (true);
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true);

-- ============================================================
-- 5. Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
