'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ExternalLink, Send, Pencil, X } from 'lucide-react';

interface ProofSubmitProps {
  invoiceId: string;
  currentProofUrl: string | null;
  onSuccess: (proofUrl: string) => void;
}

export function ProofSubmit({ invoiceId, currentProofUrl, onSuccess }: ProofSubmitProps) {
  const [isEditing, setIsEditing] = useState(!currentProofUrl);
  const [proofUrl, setProofUrl] = useState(currentProofUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofUrl.trim()) {
      toast.error('Please enter a proof URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(proofUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_url: proofUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit proof');
      }

      toast.success('Proof submitted!');
      onSuccess(proofUrl);
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing && currentProofUrl) {
    return (
      <Card className="p-4 bg-green-500/5 border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Proof of Work</p>
            <a
              href={currentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
            >
              {currentProofUrl.length > 50
                ? currentProofUrl.substring(0, 50) + '...'
                : currentProofUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-dashed">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">Submit Proof of Work</p>
          <p className="text-xs text-muted-foreground mb-3">
            Add a link to your completed work (Google Drive, Notion, GitHub, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://..."
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting} size="icon" className="h-9 w-9 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
          {currentProofUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setProofUrl(currentProofUrl);
                setIsEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

interface MilestoneProofSubmitProps {
  invoiceId: string;
  milestoneId: string;
  milestoneIndex: number;
  currentProofUrl: string | null;
  onSuccess: (proofUrl: string) => void;
}

export function MilestoneProofSubmit({
  invoiceId,
  milestoneId,
  milestoneIndex,
  currentProofUrl,
  onSuccess,
}: MilestoneProofSubmitProps) {
  const [isEditing, setIsEditing] = useState(!currentProofUrl);
  const [proofUrl, setProofUrl] = useState(currentProofUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofUrl.trim()) {
      toast.error('Please enter a proof URL');
      return;
    }

    try {
      new URL(proofUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_url: proofUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit proof');
      }

      toast.success(`Milestone ${milestoneIndex + 1} proof submitted!`);
      onSuccess(proofUrl);
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing && currentProofUrl) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <a
          href={currentProofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:underline flex items-center gap-1"
        >
          View proof <ExternalLink className="h-3 w-3" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <Input
        type="url"
        placeholder="Proof URL..."
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
        disabled={isSubmitting}
        className="h-8 text-xs"
      />
      <Button type="submit" disabled={isSubmitting} size="icon" className="h-8 w-8 shrink-0">
        <Send className="h-3 w-3" />
      </Button>
      {currentProofUrl && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => {
            setProofUrl(currentProofUrl);
            setIsEditing(false);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </form>
  );
}
