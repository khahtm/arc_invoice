'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import { useProposalGenerator } from '@/hooks/use-proposal-generator';
import { formatUSDC } from '@/lib/utils';
import Link from 'next/link';

export default function ProposePage() {
  const router = useRouter();
  const [jobText, setJobText] = useState('');
  const [copied, setCopied] = useState(false);
  const { generate, isGenerating, streamedText, result, error, reset } = useProposalGenerator();

  const handleGenerate = () => {
    if (jobText.length < 20) return;
    generate(jobText);
  };

  const handleCopyProposal = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateDeal = () => {
    if (!result) return;
    sessionStorage.setItem('proposal-deal', JSON.stringify({
      description: result.dealDescription,
      milestones: result.milestones.map((m) => ({ description: m.description, amount: m.amount })),
    }));
    router.push('/deals/new?from=proposal');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/deals">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Propose a Deal</h1>
          <p className="text-sm text-muted-foreground">Paste a job posting, get a proposal + deal ready to send.</p>
        </div>
      </div>

      {/* Input */}
      {!result && !isGenerating && (
        <Card className="p-5 space-y-4">
          <div>
            <Label className="text-sm">Job Posting / Project Description</Label>
            <Textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job description here — from Upwork, Twitter, Discord, email, wherever..."
              rows={8}
              className="mt-1.5 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">{jobText.length}/5000</p>
          </div>
          <Button onClick={handleGenerate} disabled={jobText.length < 20} className="w-full">
            Generate Proposal
          </Button>
        </Card>
      )}

      {/* Streaming */}
      {isGenerating && (
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Writing your proposal...
          </div>
          {streamedText && (
            <pre className="text-xs text-muted-foreground bg-muted/50 rounded p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
              {streamedText}
            </pre>
          )}
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="p-5 border-destructive/20">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleGenerate}>Retry</Button>
            <Button size="sm" variant="ghost" onClick={reset}>Start over</Button>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Proposal Text */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Your Proposal</h2>
              <Button size="sm" variant="ghost" onClick={handleCopyProposal} className="text-xs gap-1">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{result.proposal}</div>
          </Card>

          {/* Key Points */}
          {result.keyPoints?.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold mb-2">Key Points</h2>
              <ul className="space-y-1">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-[#005FFE] shrink-0">·</span>
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Milestones Preview */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Suggested Deal</h2>
              <span className="text-xs text-muted-foreground">{result.timeline}</span>
            </div>
            <p className="text-sm text-muted-foreground">{result.dealDescription}</p>

            <div className="space-y-2">
              {result.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm flex-1 truncate">{m.description}</span>
                  <span className="font-mono text-sm text-[#005FFE] shrink-0">{formatUSDC(m.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-semibold">Total</span>
              <span className="font-mono font-semibold text-[#005FFE]">{formatUSDC(result.totalAmount)}</span>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1">Start Over</Button>
            <Button onClick={handleCreateDeal} className="flex-1 gap-1">
              Create Deal <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
