'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      {children}
      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 opacity-0 transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="rounded-xl border border-border-soft bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-[0_10px_28px_rgba(15,23,42,0.12)] whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  );
}
