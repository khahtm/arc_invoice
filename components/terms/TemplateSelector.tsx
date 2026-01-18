'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TEMPLATES } from '@/lib/terms/templates';
import type { TemplateType } from '@/types/terms';
import { Code, Palette, MessageSquare, Settings, LucideIcon } from 'lucide-react';

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
}

const ICONS: Record<TemplateType, LucideIcon> = {
  web_dev: Code,
  design: Palette,
  consulting: MessageSquare,
  custom: Settings,
};

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((template) => {
        const Icon = ICONS[template.id];
        return (
          <Card
            key={template.id}
            className={cn(
              'p-4 cursor-pointer border-2 transition-colors',
              value === template.id
                ? 'border-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            )}
            onClick={() => onChange(template.id)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-md">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
