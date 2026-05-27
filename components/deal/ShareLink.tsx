'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ShareLinkProps {
  shortCode: string;
}

export function ShareLink({ shortCode }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/d/${shortCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Deal link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-[#005FFE]/[0.03] border-[#005FFE]/20">
      <h3 className="font-semibold mb-2">Share with your client</h3>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-background px-4 py-2.5 rounded-xl text-sm break-all font-mono border">
          {url}
        </code>
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Link href={`/d/${shortCode}`} target="_blank">
          <Button variant="outline" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Your client will review terms, sign, and fund milestones through this link.
      </p>
    </Card>
  );
}
