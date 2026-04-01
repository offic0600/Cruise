'use client';

import { CalendarDays, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function formatDate(value: string | null, locale: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ProjectDatePickerPill({
  value,
  onChange,
  label,
  clearLabel,
  locale,
  disabled = false,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  clearLabel: string;
  locale: string;
  disabled?: boolean;
}) {
  const display = formatDate(value, locale) ?? label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="h-11 rounded-full border border-border-soft bg-white px-4 text-[15px] font-medium text-ink-700 shadow-none hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarDays className="mr-2 h-4 w-4 text-ink-400" />
          <span>{display}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] rounded-[20px] border-border-subtle p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-ink-900">{label}</div>
          <Input type="date" value={value ?? ''} onChange={(event) => onChange(event.target.value || null)} />
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="mr-1 h-4 w-4" />
              {clearLabel}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
