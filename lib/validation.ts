import { z } from 'zod';

export const milestoneSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description required').max(200),
});

export const invoiceSchema = z
  .object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required').max(500),
    payment_type: z.enum(['direct', 'escrow']),
    client_name: z.string().max(255).optional(),
    client_email: z
      .string()
      .optional()
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        'Invalid email'
      ),
    auto_release_days: z.number().min(1).max(90).optional(),
    milestones: z.array(milestoneSchema).max(10).optional(),
    yield_escrow_enabled: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // If milestones provided, sum must equal amount
      if (data.milestones && data.milestones.length > 0) {
        const sum = data.milestones.reduce((acc, m) => acc + m.amount, 0);
        return Math.abs(sum - data.amount) < 0.01; // Allow small floating point diff
      }
      return true;
    },
    { message: 'Milestone amounts must equal invoice total' }
  );

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type MilestoneFormData = z.infer<typeof milestoneSchema>;

// V4 Terms validation schemas
export const deliverableSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  criteria: z.string().min(1, 'Criteria required').max(500),
  deadlineDays: z.number().min(1).max(365),
  percentageOfTotal: z.number().min(1).max(100),
});

export const termsSchema = z
  .object({
    template_type: z.enum(['web_dev', 'design', 'consulting', 'custom']),
    deliverables: z.array(deliverableSchema).min(1).max(10),
    // V4 escrow always requires per-deliverable funding after proof submission
    payment_schedule: z.literal('per_deliverable'),
    revision_limit: z.number().min(0).max(10).optional().default(2),
    auto_release_days: z.number().min(1).max(90).optional().default(14),
  })
  .refine(
    (data) => {
      const total = data.deliverables.reduce(
        (sum, d) => sum + d.percentageOfTotal,
        0
      );
      return Math.abs(total - 100) < 0.01;
    },
    { message: 'Deliverable percentages must total 100%' }
  );

export type TermsFormData = z.infer<typeof termsSchema>;
export type DeliverableFormData = z.infer<typeof deliverableSchema>;

// Extended invoice schema with V4 terms support
export const invoiceWithTermsSchema = invoiceSchema.extend({
  terms: termsSchema.optional(),
});
