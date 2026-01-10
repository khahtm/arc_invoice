// Terms template types
export type TemplateType = 'web_dev' | 'design' | 'consulting' | 'custom';
// V4 escrow always requires per-deliverable funding after proof submission
export type PaymentSchedule = 'per_deliverable';

// Deliverable structure (stored in JSONB)
export interface Deliverable {
  name: string;
  criteria: string;
  deadlineDays: number;
  percentageOfTotal: number;
}

// Database types
export interface InvoiceTerms {
  id: string;
  invoice_id: string;
  template_type: TemplateType;
  deliverables: Deliverable[];
  payment_schedule: PaymentSchedule;
  revision_limit: number;
  auto_release_days: number;
  terms_hash: string;
  created_at: string;
}

export interface TermSignature {
  id: string;
  invoice_id: string;
  signer_wallet: string;
  signer_role: 'creator' | 'payer';
  signature: string;
  terms_hash: string;
  signed_at: string;
}

// Proof of work for each deliverable
export interface DeliverableProof {
  id: string;
  invoice_id: string;
  deliverable_index: number;
  proof_url: string;
  submitted_at: string;
}

// Input types for creating terms
export interface DeliverableInput {
  name: string;
  criteria: string;
  deadlineDays: number;
  percentageOfTotal: number;
}

export interface CreateTermsInput {
  template_type: TemplateType;
  deliverables: DeliverableInput[];
  payment_schedule: PaymentSchedule;
  revision_limit?: number;
  auto_release_days?: number;
}

// Template definitions (client-side only)
export interface TermsTemplate {
  id: TemplateType;
  name: string;
  description: string;
  defaultDeliverables: DeliverableInput[];
  defaultPaymentSchedule: PaymentSchedule;
  defaultRevisions: number;
  defaultAutoReleaseDays: number;
}

// Combined invoice with terms (for API responses)
export interface InvoiceWithTerms {
  invoice: import('./database').Invoice;
  terms: InvoiceTerms | null;
  signatures: TermSignature[];
}
