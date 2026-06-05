import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'control-surface min-h-28 w-full resize-y px-3 py-3 text-sm text-ink-900 placeholder:text-ink-400',
  {
    variants: {
      state: {
        default: 'bg-[color:var(--interactive-default)]',
        error: 'border-rose-300 bg-rose-50/40',
        success: 'border-emerald-300 bg-emerald-50/40',
        disabled: 'bg-[color:var(--interactive-disabled)] text-ink-400',
        readOnly: 'bg-surface-soft',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textareaVariants>
>(
  ({ className, state, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
