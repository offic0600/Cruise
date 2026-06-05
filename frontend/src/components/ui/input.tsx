import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'control-surface w-full px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400',
  {
    variants: {
      size: {
        md: 'h-[var(--input-height-md)]',
        lg: 'h-[var(--input-height-lg)] text-[15px]',
      },
      state: {
        default: 'bg-[color:var(--interactive-default)]',
        error: 'border-rose-300 bg-rose-50/40',
        success: 'border-emerald-300 bg-emerald-50/40',
        disabled: 'bg-[color:var(--interactive-disabled)] text-ink-400',
        readOnly: 'bg-surface-soft',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputVariants({ size, state }), className)}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input, inputVariants };
