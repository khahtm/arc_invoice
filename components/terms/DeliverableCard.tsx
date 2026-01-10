'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, GripVertical } from 'lucide-react';
import type { DeliverableInput } from '@/types/terms';

interface DeliverableCardProps {
  index: number;
  deliverable: DeliverableInput;
  onChange: (deliverable: DeliverableInput) => void;
  onRemove: () => void;
  canRemove: boolean;
  totalAmount: number;
}

export function DeliverableCard({
  index,
  deliverable,
  onChange,
  onRemove,
  canRemove,
  totalAmount,
}: DeliverableCardProps) {
  const calculatedAmount = (deliverable.percentageOfTotal / 100) * totalAmount;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Deliverable {index + 1}</span>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`name-${index}`} className="text-xs">
            Name
          </Label>
          <Input
            id={`name-${index}`}
            placeholder="e.g., Design mockup"
            value={deliverable.name}
            onChange={(e) => onChange({ ...deliverable, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor={`criteria-${index}`} className="text-xs">
            Acceptance Criteria
          </Label>
          <Textarea
            id={`criteria-${index}`}
            placeholder="How will completion be verified?"
            value={deliverable.criteria}
            onChange={(e) =>
              onChange({ ...deliverable, criteria: e.target.value })
            }
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`deadline-${index}`} className="text-xs">
              Deadline (days)
            </Label>
            <Input
              id={`deadline-${index}`}
              type="number"
              min="1"
              max="365"
              value={deliverable.deadlineDays}
              onChange={(e) =>
                onChange({
                  ...deliverable,
                  deadlineDays: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor={`percentage-${index}`} className="text-xs">
              % of Total
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`percentage-${index}`}
                type="number"
                min="1"
                max="100"
                value={deliverable.percentageOfTotal}
                onChange={(e) =>
                  onChange({
                    ...deliverable,
                    percentageOfTotal: parseInt(e.target.value) || 0,
                  })
                }
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ≈ ${calculatedAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
