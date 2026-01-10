'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TemplateSelector } from './TemplateSelector';
import { DeliverableCard } from './DeliverableCard';
import { getTemplate } from '@/lib/terms/templates';
import { Plus, AlertCircle } from 'lucide-react';
import type {
  CreateTermsInput,
  DeliverableInput,
  TemplateType,
} from '@/types/terms';

interface TermsEditorProps {
  totalAmount: number;
  value: CreateTermsInput | null;
  onChange: (terms: CreateTermsInput) => void;
}

// Initialize state from template
function getInitialState(value: CreateTermsInput | null) {
  const templateType = value?.template_type ?? 'web_dev';
  const template = getTemplate(templateType);

  return {
    templateType,
    deliverables:
      value?.deliverables?.length ? value.deliverables : template?.defaultDeliverables ?? [],
    revisionLimit: value?.revision_limit ?? template?.defaultRevisions ?? 2,
    autoReleaseDays: value?.auto_release_days ?? template?.defaultAutoReleaseDays ?? 14,
  };
}

export function TermsEditor({ totalAmount, value, onChange }: TermsEditorProps) {
  const initialState = getInitialState(value);

  const [templateType, setTemplateType] = useState<TemplateType>(
    initialState.templateType
  );
  const [deliverables, setDeliverables] = useState<DeliverableInput[]>(
    initialState.deliverables
  );
  const [revisionLimit, setRevisionLimit] = useState(initialState.revisionLimit);
  const [autoReleaseDays, setAutoReleaseDays] = useState(initialState.autoReleaseDays);

  // Track if we've synced to prevent infinite loops
  const hasInitialized = useRef(false);

  // Sync changes to parent (after first render)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
    }
    onChange({
      template_type: templateType,
      deliverables,
      // V4 escrow always uses per-deliverable funding (proof required before each payment)
      payment_schedule: 'per_deliverable',
      revision_limit: revisionLimit,
      auto_release_days: autoReleaseDays,
    });
  }, [
    templateType,
    deliverables,
    revisionLimit,
    autoReleaseDays,
    onChange,
  ]);

  const handleTemplateChange = useCallback((newTemplate: TemplateType) => {
    setTemplateType(newTemplate);
    const template = getTemplate(newTemplate);
    if (template) {
      setDeliverables(template.defaultDeliverables);
      setRevisionLimit(template.defaultRevisions);
      setAutoReleaseDays(template.defaultAutoReleaseDays);
    }
  }, []);

  const handleDeliverableChange = useCallback(
    (index: number, updated: DeliverableInput) => {
      setDeliverables((prev) => {
        const newDeliverables = [...prev];
        newDeliverables[index] = updated;
        return newDeliverables;
      });
    },
    []
  );

  const handleAddDeliverable = useCallback(() => {
    if (deliverables.length >= 10) return;
    setDeliverables((prev) => [
      ...prev,
      { name: '', criteria: '', deadlineDays: 7, percentageOfTotal: 0 },
    ]);
  }, [deliverables.length]);

  const handleRemoveDeliverable = useCallback((index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const totalPercentage = deliverables.reduce(
    (sum, d) => sum + d.percentageOfTotal,
    0
  );
  const isValidPercentage = Math.abs(totalPercentage - 100) < 0.01;

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <Label className="text-sm font-medium">Choose Template</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Select a starting point for your terms
        </p>
        <TemplateSelector value={templateType} onChange={handleTemplateChange} />
      </div>

      {/* Deliverables */}
      <div>
        <Label className="text-sm font-medium">Deliverables</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Define what you will deliver and how it will be verified
        </p>

        <div className="space-y-3">
          {deliverables.map((deliverable, index) => (
            <DeliverableCard
              key={index}
              index={index}
              deliverable={deliverable}
              onChange={(updated) => handleDeliverableChange(index, updated)}
              onRemove={() => handleRemoveDeliverable(index)}
              canRemove={deliverables.length > 1}
              totalAmount={totalAmount}
            />
          ))}
        </div>

        {deliverables.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAddDeliverable}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Deliverable
          </Button>
        )}

        {/* Percentage validation */}
        {!isValidPercentage && deliverables.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Percentages must total 100% (currently {totalPercentage}%)</span>
          </div>
        )}
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="revision-limit">Max Revisions</Label>
          <Input
            id="revision-limit"
            type="number"
            min="0"
            max="10"
            value={revisionLimit}
            onChange={(e) => setRevisionLimit(parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="auto-release">Auto-release (days)</Label>
          <Input
            id="auto-release"
            type="number"
            min="1"
            max="90"
            value={autoReleaseDays}
            onChange={(e) => setAutoReleaseDays(parseInt(e.target.value) || 14)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Funds release automatically if no dispute
          </p>
        </div>
      </div>
    </div>
  );
}
