import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('ds-empty-state', className)}>
      {icon ? <div className="ds-empty-state__icon">{icon}</div> : null}
      <div className="space-y-2">
        <div className="ds-title-sm">{title}</div>
        {description ? <p className="ds-body-sm text-fg-tertiary">{description}</p> : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
