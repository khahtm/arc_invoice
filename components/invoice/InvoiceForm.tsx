'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PaymentTypeSelector } from './PaymentTypeSelector';
import { MilestoneInputList } from './MilestoneInputList';
import { TermsEditor } from '@/components/terms/TermsEditor';
import { invoiceSchema, type InvoiceFormData } from '@/lib/validation';
import type { MilestoneInput } from '@/types/database';
import type { CreateTermsInput } from '@/types/terms';

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData & { terms?: CreateTermsInput }) => Promise<void>;
  isLoading?: boolean;
}

export function InvoiceForm({ onSubmit, isLoading }: InvoiceFormProps) {
  const [enableMilestones, setEnableMilestones] = useState(false);
  const [enableTerms, setEnableTerms] = useState(true); // V4 terms enabled by default
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [terms, setTerms] = useState<CreateTermsInput | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      payment_type: 'direct',
      auto_release_days: 14,
    },
  });

  const paymentType = watch('payment_type');
  const amount = watch('amount') || 0;

  const handleTermsChange = useCallback(
    (newTerms: CreateTermsInput) => {
      setTerms(newTerms);
      // Sync auto_release_days from terms
      if (newTerms.auto_release_days) {
        setValue('auto_release_days', newTerms.auto_release_days);
      }
    },
    [setValue]
  );

  const handleFormSubmit = async (data: InvoiceFormData) => {
    await onSubmit({
      ...data,
      // Include terms for escrow with V4 terms enabled
      terms: paymentType === 'escrow' && enableTerms ? terms ?? undefined : undefined,
      // Include milestones for legacy V3 flow
      milestones: paymentType === 'escrow' && enableMilestones && !enableTerms ? milestones : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <Label>Payment Type</Label>
        <PaymentTypeSelector
          value={paymentType}
          onChange={(val) => setValue('payment_type', val)}
        />
      </div>

      <div>
        <Label htmlFor="amount">Amount (USDC)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive mt-1">
            {errors.amount.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What is this payment for?"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_name">Client Name (optional)</Label>
          <Input id="client_name" {...register('client_name')} />
        </div>
        <div>
          <Label htmlFor="client_email">Client Email (optional)</Label>
          <Input id="client_email" type="email" {...register('client_email')} />
        </div>
      </div>

      {paymentType === 'escrow' && (
        <>
          {/* V4 Terms-based or V3 Milestone switch */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label htmlFor="enable-terms">Use Contract Terms (Recommended)</Label>
              <p className="text-sm text-muted-foreground">
                Define deliverables with acceptance criteria
              </p>
            </div>
            <Switch
              id="enable-terms"
              checked={enableTerms}
              onCheckedChange={(checked) => {
                setEnableTerms(checked);
                if (checked) {
                  setEnableMilestones(false);
                  setMilestones([]);
                  setValue('milestones', undefined);
                }
              }}
            />
          </div>

          {/* V4 Terms Editor */}
          {enableTerms && amount > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Contract Terms</h3>
              <TermsEditor
                totalAmount={amount}
                value={terms}
                onChange={handleTermsChange}
              />
            </div>
          )}

          {enableTerms && amount <= 0 && (
            <p className="text-sm text-muted-foreground">
              Enter an amount above to configure contract terms
            </p>
          )}

          {/* Legacy V3 Milestones (hidden when terms enabled) */}
          {!enableTerms && (
            <>
              <div>
                <Label htmlFor="auto_release_days">Auto-release after (days)</Label>
                <Input
                  id="auto_release_days"
                  type="number"
                  min="1"
                  max="90"
                  {...register('auto_release_days', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Funds auto-release if no dispute is raised
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-milestones">Enable Milestones (Legacy)</Label>
                  <p className="text-sm text-muted-foreground">
                    Split payment into multiple milestones
                  </p>
                </div>
                <Switch
                  id="enable-milestones"
                  checked={enableMilestones}
                  onCheckedChange={(checked) => {
                    setEnableMilestones(checked);
                    if (!checked) {
                      setMilestones([]);
                      setValue('milestones', undefined);
                    }
                  }}
                />
              </div>

              {enableMilestones && amount > 0 && (
                <MilestoneInputList
                  milestones={milestones}
                  onChange={(newMilestones) => {
                    setMilestones(newMilestones);
                    setValue('milestones', newMilestones);
                  }}
                  totalAmount={amount}
                />
              )}

              {enableMilestones && amount <= 0 && (
                <p className="text-sm text-muted-foreground">
                  Enter an amount above to add milestones
                </p>
              )}
            </>
          )}
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Invoice'}
      </Button>
    </form>
  );
}
