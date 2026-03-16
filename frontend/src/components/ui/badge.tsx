import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-soft text-ink-700',
        brand: 'bg-brand-600/12 text-brand-600',
        success: 'bg-emerald-500/12 text-emerald-700',
        warning: 'bg-amber-500/12 text-amber-700',
        danger: 'bg-rose-500/12 text-rose-700',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
