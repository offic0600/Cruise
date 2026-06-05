import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('ds-page-header', className)}>
      <div className="space-y-3">
        {eyebrow ? <div className="ds-overline">{eyebrow}</div> : null}
        <div className="space-y-2">
          <h1 className="ds-display-sm">{title}</h1>
          {description ? <p className="ds-body-lg max-w-3xl text-fg-secondary">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
