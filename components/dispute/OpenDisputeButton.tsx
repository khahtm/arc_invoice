'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Deliverable } from '@/types/terms';

interface OpenDisputeButtonProps {
  onSubmit: (
    reason: string,
    deliverableIndex?: number,
    violatedCriteria?: string
  ) => Promise<void>;
  isV4?: boolean;
  deliverables?: Deliverable[];
}

export function OpenDisputeButton({
  onSubmit,
  isV4 = false,
  deliverables = [],
}: OpenDisputeButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>('');
  const [violatedCriteria, setViolatedCriteria] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (reason.length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    if (isV4 && !selectedDeliverable) {
      toast.error('Please select the deliverable that has an issue');
      return;
    }

    if (isV4 && violatedCriteria.length < 10) {
      toast.error('Please explain how the criteria was not met');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(
        reason,
        isV4 ? parseInt(selectedDeliverable) : undefined,
        isV4 ? violatedCriteria : undefined
      );
      toast.success('Dispute opened');
      setOpen(false);
      setReason('');
      setSelectedDeliverable('');
      setViolatedCriteria('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open dispute');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDeliverableData =
    isV4 && selectedDeliverable
      ? deliverables[parseInt(selectedDeliverable)]
      : null;

  const isFormValid = isV4
    ? reason.length >= 10 &&
      selectedDeliverable !== '' &&
      violatedCriteria.length >= 10
    : reason.length >= 10;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Open Dispute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open a Dispute</DialogTitle>
          <DialogDescription>
            {isV4
              ? 'Select the deliverable that has an issue and explain what criteria was not met.'
              : 'Describe the issue you are experiencing. Both parties will have 7 days to reach a resolution.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* V4: Deliverable Selection */}
          {isV4 && deliverables.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="deliverable">Which deliverable has an issue?</Label>
              <Select
                value={selectedDeliverable}
                onValueChange={setSelectedDeliverable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deliverable" />
                </SelectTrigger>
                <SelectContent>
                  {deliverables.map((d, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {index + 1}. {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* V4: Show selected deliverable criteria */}
          {selectedDeliverableData && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium">Agreed Criteria:</p>
              <p className="text-muted-foreground mt-1">
                {selectedDeliverableData.criteria}
              </p>
            </div>
          )}

          {/* V4: How criteria was violated */}
          {isV4 && selectedDeliverable && (
            <div className="space-y-2">
              <Label htmlFor="violated-criteria">
                How was the criteria not met?
              </Label>
              <Textarea
                id="violated-criteria"
                placeholder="Explain specifically what is wrong with the deliverable..."
                value={violatedCriteria}
                onChange={(e) => setViolatedCriteria(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Reason (required for all) */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {isV4 ? 'Additional details' : 'Reason for dispute'}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                isV4
                  ? 'Any additional context that might help resolve this...'
                  : 'Describe the issue in detail...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !isFormValid}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Open Dispute'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
