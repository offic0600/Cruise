'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ChevronDown,
  CheckCircle2,
  Copy,
  GitBranchPlus,
  Link2,
  LoaderCircle,
  Send,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltip';
import type { Issue } from '@/lib/api';
import { cn } from '@/lib/utils';

export function IssueDetailActionBar({
  issue,
  moreMenu,
  onCopyLink,
  onCopyIdentifier,
  onCopyTitle,
  onCreateRelated,
  onAddLink,
  onCopyPrompt,
  onConfigureCodingTools,
}: {
  issue: Issue;
  moreMenu: ReactNode;
  onCopyLink: () => Promise<void>;
  onCopyIdentifier: () => Promise<void>;
  onCopyTitle: () => Promise<void>;
  onCreateRelated: (relation: 'subIssue' | 'related') => Promise<void>;
  onAddLink: () => Promise<void>;
  onCopyPrompt: () => Promise<void>;
  onConfigureCodingTools: () => void;
}) {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const runAction = async (label: string, action: () => Promise<void> | void) => {
    setBusyAction(label);
    try {
      await action();
      setLastAction(label);
      window.setTimeout(() => setLastAction((current) => (current === label ? null : current)), 2200);
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="flex justify-end">
      <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-1.5 py-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <span className="hidden h-9 items-center gap-2 rounded-full bg-slate-50 px-3 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {issue.identifier}
        </span>
        <Tooltip content="Copy issue URL">
          <ActionIconButton aria-label="Copy issue URL" onClick={() => void runAction('Link copied', onCopyLink)} disabled={busyAction === 'Link copied'}>
            {busyAction === 'Link copied' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" strokeWidth={2} />}
          </ActionIconButton>
        </Tooltip>

        <Tooltip content={`Copy ${issue.identifier}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionIconButton aria-label="Copy issue details">
                <Copy className="h-4 w-4" strokeWidth={2} />
              </ActionIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-[18px] p-1.5">
              <DropdownMenuItem onSelect={() => void runAction('ID copied', onCopyIdentifier)} className="flex items-center justify-between rounded-xl px-3 py-2.5">
                <span>Copy issue ID</span>
                <span className="text-xs text-ink-400">{issue.identifier}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void runAction('Title copied', onCopyTitle)} className="flex items-center justify-between rounded-xl px-3 py-2.5">
                <span>Copy issue title</span>
                <span className="text-xs text-ink-400">Title</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>

        <Tooltip content="Create related work">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionIconButton aria-label="Create related work">
                <GitBranchPlus className="h-4 w-4" strokeWidth={2} />
              </ActionIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-[18px] p-1.5">
              <DropdownMenuItem onSelect={() => void runAction('Sub-issue prompt opened', () => onCreateRelated('subIssue'))} className="rounded-xl px-3 py-2.5">
                New sub-issue
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void runAction('Related issue prompt opened', () => onCreateRelated('related'))} className="rounded-xl px-3 py-2.5">
                New related issue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void runAction('Link prompt opened', onAddLink)} className="rounded-xl px-3 py-2.5">
                Add external link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>

        <DropdownMenu>
          <div className="inline-flex h-9 items-center overflow-hidden rounded-full border border-slate-200 bg-white">
            <Tooltip content="Copy as prompt">
              <button
                type="button"
                aria-label="Copy as prompt"
                onClick={() => void runAction('Prompt copied', onCopyPrompt)}
                className="inline-flex h-9 items-center justify-center px-3 text-slate-700 outline-none transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                {busyAction === 'Prompt copied' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2} />}
              </button>
            </Tooltip>
            <div className="h-5 w-px bg-slate-200" />
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="inline-flex h-9 items-center justify-center rounded-r-full px-2.5 text-slate-700 outline-none transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:outline-none focus-visible:ring-0 data-[state=open]:bg-slate-50"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="end" className="w-[280px] rounded-[18px] p-1.5">
            <DropdownMenuItem onSelect={() => void runAction('Prompt copied', onCopyPrompt)} className="flex items-center justify-between rounded-xl px-3 py-2.5">
              <span>Copy as prompt</span>
              <span className="text-xs text-ink-400">Ctrl Alt P</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onConfigureCodingTools} className="gap-3 rounded-xl px-3 py-2.5">
              <Wrench className="h-4 w-4 text-ink-500" />
              <span>Configure coding tools...</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {moreMenu}
          </DropdownMenuContent>
        </DropdownMenu>
        {lastAction ? (
          <span aria-live="polite" className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {lastAction}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActionIconButton({
  children,
  className,
  ...props
}: ComponentProps<typeof Button> & { children: ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 shadow-none transition hover:bg-slate-50 hover:text-slate-950',
        'outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 data-[state=open]:bg-slate-50',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function IssueDetailMoreTrigger() {
  return (
    <div className="hidden" />
  );
}
