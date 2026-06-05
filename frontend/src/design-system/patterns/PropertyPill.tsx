import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PropertyPillProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function PropertyPill({ children, className, interactive = true }: PropertyPillProps) {
  return (
    <div className={cn(interactive ? 'ds-property-pill' : 'ds-property-pill-static', className)}>
      {children}
    </div>
  );
}
