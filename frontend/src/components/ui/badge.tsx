import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'border-border-soft bg-surface-soft text-ink-700',
        brand: 'border-transparent bg-brand-600/12 text-brand-600',
        success: 'border-transparent bg-emerald-500/12 text-emerald-700',
        warning: 'border-transparent bg-amber-500/12 text-amber-700',
        danger: 'border-transparent bg-rose-500/12 text-rose-700',
      },
      tone: {
        subtle: '',
        solid: '',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      tone: 'subtle',
      size: 'md',
    },
  }
);

function Badge({
  className,
  variant,
  tone,
  size,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant, tone, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
