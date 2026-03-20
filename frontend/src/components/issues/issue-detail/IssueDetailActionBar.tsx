'use client';

import type { ComponentProps, ReactNode } from 'react';
import {
  ChevronDown,
  Copy,
  GitBranchPlus,
  Link2,
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
  return (
    <div className="flex justify-end">
      <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-1.5 py-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <Tooltip content="Copy issue URL">
          <ActionIconButton aria-label="Copy issue URL" onClick={() => void onCopyLink()}>
            <Link2 className="h-4 w-4" strokeWidth={2} />
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
              <DropdownMenuItem onSelect={() => void onCopyIdentifier()} className="rounded-xl px-3 py-2.5">
                Copy issue ID
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onCopyTitle()} className="rounded-xl px-3 py-2.5">
                Copy issue title
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
              <DropdownMenuItem onSelect={() => void onCreateRelated('subIssue')} className="rounded-xl px-3 py-2.5">
                New sub-issue
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onCreateRelated('related')} className="rounded-xl px-3 py-2.5">
                New related issue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void onAddLink()} className="rounded-xl px-3 py-2.5">
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
                onClick={() => void onCopyPrompt()}
                className="inline-flex h-9 items-center justify-center px-3 text-slate-700 outline-none transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <Send className="h-4 w-4" strokeWidth={2} />
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
            <DropdownMenuItem onSelect={() => void onCopyPrompt()} className="flex items-center justify-between rounded-xl px-3 py-2.5">
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
