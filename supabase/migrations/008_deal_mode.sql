-- Migration 008: Add deal mode columns to support ArcDeal pivot
-- Additive only — no renames, no data loss, existing invoices unaffected

-- New columns on invoices for deal mode
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deal_mode BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS terms_hash TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_wallet TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS creator_signed_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deal_status TEXT DEFAULT 'draft' CHECK (deal_status IN ('draft', 'signed', 'funded', 'active', 'disputed', 'completed', 'refunded'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS dispute_reason TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS disputed_milestone_index INT;

-- Delivery tracking on milestones
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS released BOOLEAN DEFAULT false;

-- Index for deal queries
CREATE INDEX IF NOT EXISTS idx_invoices_deal_mode ON invoices(deal_mode) WHERE deal_mode = true;
CREATE INDEX IF NOT EXISTS idx_invoices_deal_status ON invoices(deal_status) WHERE deal_mode = true;
CREATE INDEX IF NOT EXISTS idx_invoices_client_wallet ON invoices(client_wallet) WHERE client_wallet IS NOT NULL;
