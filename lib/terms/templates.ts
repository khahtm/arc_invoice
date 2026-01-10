import type { TermsTemplate, DeliverableInput } from '@/types/terms';

export const TEMPLATES: TermsTemplate[] = [
  {
    id: 'web_dev',
    name: 'Web Development',
    description: 'For website or web app projects',
    defaultDeliverables: [
      {
        name: 'Design mockup',
        criteria: 'Figma/design file delivered with specified screens',
        deadlineDays: 7,
        percentageOfTotal: 20,
      },
      {
        name: 'Development',
        criteria: 'Deployed to staging URL, all features functional',
        deadlineDays: 21,
        percentageOfTotal: 60,
      },
      {
        name: 'Final delivery',
        criteria: 'All revisions addressed, deployed to production',
        deadlineDays: 7,
        percentageOfTotal: 20,
      },
    ],
    defaultPaymentSchedule: 'per_deliverable',
    defaultRevisions: 2,
    defaultAutoReleaseDays: 14,
  },
  {
    id: 'design',
    name: 'Design Work',
    description: 'For logos, graphics, UI design',
    defaultDeliverables: [
      {
        name: 'Initial concepts',
        criteria: '3 concept variations delivered',
        deadlineDays: 5,
        percentageOfTotal: 40,
      },
      {
        name: 'Final delivery',
        criteria: 'Selected concept with source files (AI/PSD/Figma)',
        deadlineDays: 7,
        percentageOfTotal: 60,
      },
    ],
    defaultPaymentSchedule: 'per_deliverable',
    defaultRevisions: 3,
    defaultAutoReleaseDays: 7,
  },
  {
    id: 'consulting',
    name: 'Consulting/Advisory',
    description: 'For hourly or project-based consulting',
    defaultDeliverables: [
      {
        name: 'Deliverable',
        criteria: 'Report/presentation/document delivered',
        deadlineDays: 14,
        percentageOfTotal: 100,
      },
    ],
    defaultPaymentSchedule: 'per_deliverable',
    defaultRevisions: 1,
    defaultAutoReleaseDays: 7,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Define your own terms',
    defaultDeliverables: [],
    defaultPaymentSchedule: 'per_deliverable',
    defaultRevisions: 2,
    defaultAutoReleaseDays: 14,
  },
];

export function getTemplate(id: string): TermsTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function calculateDeliverableAmounts(
  totalAmount: number,
  deliverables: DeliverableInput[]
): number[] {
  return deliverables.map(
    (d) => Math.round((d.percentageOfTotal / 100) * totalAmount * 1e6) / 1e6
  );
}
