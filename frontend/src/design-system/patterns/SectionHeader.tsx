import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('ds-section-header', className)}>
      <div className="space-y-1">
        <div className="ds-title-sm">{title}</div>
        {description ? <p className="ds-body-sm text-fg-tertiary">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
