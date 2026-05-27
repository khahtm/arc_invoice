'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useDealBuilderAgent } from '@/hooks/use-deal-builder-agent';
import { AIMilestonePreview } from './ai-milestone-preview';
import type { AIMilestone } from '@/lib/ai/types';

const PROJECT_TYPES = [
  'Web App', 'Mobile App', 'Landing Page', 'E-commerce',
  'API / Backend', 'Design', 'Smart Contract', 'Other',
] as const;

const TIMELINE_OPTIONS = [
  '< 1 week', '1-2 weeks', '2-4 weeks', '1-2 months', '2+ months',
] as const;

interface DealBuilderPromptProps {
  onApply: (milestones: AIMilestone[], description: string) => void;
  currentDescription?: string;
}

export function DealBuilderPrompt({ onApply, currentDescription }: DealBuilderPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const { generate, isGenerating, streamedText, result, error, reset } = useDealBuilderAgent();

  const buildPrompt = () => {
    const parts = [input || currentDescription || ''];
    if (projectType) parts.push(`Project type: ${projectType}`);
    if (budget) parts.push(`Budget range: ~$${budget} USDC`);
    if (timeline) parts.push(`Timeline: ${timeline}`);
    return parts.join('\n');
  };

  const handleGenerate = () => {
    const prompt = buildPrompt();
    if (prompt.length < 10) return;
    generate(prompt);
  };

  const canGenerate = (input || currentDescription || '').length >= 10;

  const handleApply = () => {
    if (!result) return;
    onApply(result.milestones, input || currentDescription || '');
    reset();
    setIsOpen(false);
    setInput('');
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
    setInput('');
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true);
          setInput(currentDescription || '');
        }}
        className="gap-1.5 text-[#005FFE] border-[#005FFE]/30 hover:bg-[#005FFE]/5"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate milestones with AI
      </Button>
    );
  }

  return (
    <Card className="p-4 border-[#005FFE]/20 bg-[#005FFE]/[0.02] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="h-3.5 w-3.5 text-[#005FFE]" />
          AI Deal Builder
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={handleClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {!isGenerating && !result && (
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">What do you need built?</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'Build a landing page with animations, contact form, and CMS integration'"
              rows={3}
              className="text-sm mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Project type</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setProjectType(projectType === t ? '' : t)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      projectType === t
                        ? 'bg-[#005FFE] text-white border-[#005FFE]'
                        : 'bg-background border-border hover:border-[#005FFE]/50 text-muted-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Budget (USDC)</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 2000"
                className="text-sm mt-1"
                min="1"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Timeline</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {TIMELINE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeline(timeline === t ? '' : t)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      timeline === t
                        ? 'bg-[#005FFE] text-white border-[#005FFE]'
                        : 'bg-background border-border hover:border-[#005FFE]/50 text-muted-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full"
          >
            Generate Milestones
          </Button>
        </div>
      )}

      {isGenerating && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating milestones...
          </div>
          {streamedText && (
            <pre className="text-xs text-muted-foreground bg-muted/50 rounded p-3 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
              {streamedText}
            </pre>
          )}
        </div>
      )}

      {result && (
        <AIMilestonePreview
          milestones={result.milestones}
          totalAmount={result.totalAmount}
          summary={result.summary}
          onApply={handleApply}
          onRegenerate={() => {
            reset();
            handleGenerate();
          }}
        />
      )}

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={handleGenerate}>
            Retry
          </Button>
        </div>
      )}
    </Card>
  );
}
