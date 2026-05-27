export interface AIMilestone {
  description: string;
  amount: number;
  rationale: string;
}

export interface DealBuilderResponse {
  milestones: AIMilestone[];
  totalAmount: number;
  summary: string;
}

export interface MediatorResponse {
  recommendation: 'full_release' | 'full_refund' | 'partial_split';
  creatorAmount: number;
  clientAmount: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface PaymentAdvice {
  recommendedChainId: number;
  chainName: string;
  reason: string;
  estimatedTime: string;
}

export interface ProposalResponse {
  proposal: string;
  dealDescription: string;
  milestones: AIMilestone[];
  totalAmount: number;
  timeline: string;
  keyPoints: string[];
}
