import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'control-surface h-11 w-full px-3 py-2.5 text-sm placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500/15',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
