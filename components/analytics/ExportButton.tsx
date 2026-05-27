'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => void;
}

export function ExportButton({ onClick }: ExportButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={onClick}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </TooltipTrigger>
      <TooltipContent>Download analytics data as CSV</TooltipContent>
    </Tooltip>
  );
}
