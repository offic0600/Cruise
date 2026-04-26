'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter, FolderKanban, MessageSquare, Search, SlidersHorizontal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { getDocs, getIssues, getProjects, type Doc, type Issue, type Project } from '@/lib/api';
import { issueDetailPath, workspaceSectionPath } from '@/lib/routes';

type SearchTab = 'all' | 'issues' | 'projects' | 'documents';

const tabs: SearchTab[] = ['all', 'issues', 'projects', 'documents'];

export default function SearchPage() {
  const { t } = useI18n();
  const { organizationId, currentOrganizationSlug, currentTeamId } = useCurrentWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const activeTab = normalizeTab(searchParams.get('type'));
  const hasQuery = q.trim().length > 0;

  const issuesQuery = useQuery({
    queryKey: ['search', 'issues', organizationId ?? 1, currentTeamId ?? 'all', q],
    queryFn: () => getIssues({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined, q }),
    select: (response) => response.items,
    enabled: hasQuery && (activeTab === 'all' || activeTab === 'issues'),
  });

  const projectsQuery = useQuery({
    queryKey: ['search', 'projects', organizationId ?? 1, currentTeamId ?? 'all', q],
    queryFn: () => getProjects({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined, q }),
    select: (response) => response.items,
    enabled: hasQuery && (activeTab === 'all' || activeTab === 'projects'),
  });

  const docsQuery = useQuery({
    queryKey: ['search', 'documents', organizationId ?? 1, currentTeamId ?? 'all', q],
    queryFn: () => getDocs({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined, q }),
    enabled: hasQuery && (activeTab === 'all' || activeTab === 'documents'),
  });

  const tabResults = useMemo(() => {
    if (activeTab === 'issues') return (issuesQuery.data ?? []) as Issue[];
    if (activeTab === 'projects') return (projectsQuery.data ?? []) as Project[];
    if (activeTab === 'documents') return (docsQuery.data ?? []) as Doc[];
    return [];
  }, [activeTab, issuesQuery.data, projectsQuery.data, docsQuery.data]);

  const allResults = useMemo(() => ({
    issues: issuesQuery.data ?? [],
    projects: projectsQuery.data ?? [],
    documents: docsQuery.data ?? [],
  }), [docsQuery.data, issuesQuery.data, projectsQuery.data]);

  const totalResults = activeTab === 'all'
    ? allResults.issues.length + allResults.projects.length + allResults.documents.length
    : tabResults.length;

  const isLoading = activeTab === 'all'
    ? issuesQuery.isLoading || projectsQuery.isLoading || docsQuery.isLoading
    : activeTab === 'issues'
      ? issuesQuery.isLoading
      : activeTab === 'projects'
        ? projectsQuery.isLoading
        : docsQuery.isLoading;

  const renderResult = (result: Issue | Project | Doc, type: Exclude<SearchTab, 'all'>) => {
    if (type === 'issues') {
      const issue = result as Issue;
      return (
        <Link
          key={`issue-${issue.id}`}
          href={currentOrganizationSlug ? issueDetailPath(currentOrganizationSlug, issue) : '#'}
          className="group block rounded-[18px] border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{issue.identifier}</div>
              <div className="mt-1 truncate text-[15px] font-medium text-zinc-100">{issue.title}</div>
              <div className="mt-1 line-clamp-2 text-sm text-zinc-500">{issue.description ?? t('common.empty')}</div>
            </div>
            <Badge className="border-white/10 bg-white/10 text-zinc-300">{issue.state}</Badge>
          </div>
        </Link>
      );
    }

    if (type === 'projects') {
      const project = result as Project;
      return (
        <Link
          key={`project-${project.id}`}
          href={currentOrganizationSlug ? workspaceSectionPath(currentOrganizationSlug, 'projects') : '#'}
          className="group block rounded-[18px] border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-start gap-3">
            <FolderKanban className="mt-0.5 h-4 w-4 text-zinc-500" />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{project.key ?? `#${project.id}`}</div>
              <div className="mt-1 truncate text-[15px] font-medium text-zinc-100">{project.name}</div>
              <div className="mt-1 line-clamp-2 text-sm text-zinc-500">{project.description ?? t('common.empty')}</div>
            </div>
          </div>
        </Link>
      );
    }

    const doc = result as Doc;
    return (
      <Link
        key={`doc-${doc.id}`}
        href={docHref(doc, currentOrganizationSlug)}
        className="group block rounded-[18px] border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
      >
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-4 w-4 text-zinc-500" />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{doc.slug}</div>
            <div className="mt-1 truncate text-[15px] font-medium text-zinc-100">{doc.title}</div>
            <div className="mt-1 line-clamp-2 text-sm text-zinc-500">{doc.currentContent?.content ?? t('common.empty')}</div>
          </div>
        </div>
      </Link>
    );
  };

  const updateSearch = (next: { q?: string; type?: SearchTab }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set('q', next.q);
      else params.delete('q');
    }
    if (next.type) {
      params.set('type', next.type);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1480px] flex-col overflow-hidden rounded-[18px] border border-zinc-800 bg-[#0d0d0e] text-zinc-100 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              autoFocus
              value={q}
              onChange={(event) => updateSearch({ q: event.target.value })}
              placeholder={t('searchPage.placeholder')}
              className="h-9 border-none bg-transparent pl-9 pr-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0"
            />
          </div>
          <button
            type="button"
            aria-label={t('projects.workspace.filter')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-400 transition hover:bg-white/20 hover:text-zinc-200"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t('views.display.title')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-400 transition hover:bg-white/20 hover:text-zinc-200"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => updateSearch({ type: tab })}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                activeTab === tab ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              {t(`searchPage.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="flex-1 px-4 pb-16 pt-2">
          {!hasQuery ? (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[22px] border border-dashed border-white/10 text-sm text-zinc-600">
              {t('searchPage.empty')}
            </div>
          ) : isLoading ? (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[22px] border border-dashed border-white/10 text-sm text-zinc-600">
              {t('common.loading')}
            </div>
          ) : totalResults ? (
            <div className="space-y-6">
              {activeTab === 'all' ? (
                <>
                  <ResultSection title={t('searchPage.tabs.issues')} count={allResults.issues.length}>
                    {allResults.issues.map((issue) => renderResult(issue, 'issues'))}
                  </ResultSection>
                  <ResultSection title={t('searchPage.tabs.projects')} count={allResults.projects.length}>
                    {allResults.projects.map((project) => renderResult(project, 'projects'))}
                  </ResultSection>
                  <ResultSection title={t('searchPage.tabs.documents')} count={allResults.documents.length}>
                    {allResults.documents.map((doc) => renderResult(doc, 'documents'))}
                  </ResultSection>
                </>
              ) : (
                <ResultSection title={t(`searchPage.tabs.${activeTab}`)} count={tabResults.length}>
                  {(tabResults as Array<Issue | Project | Doc>).map((result) => renderResult(result, activeTab as Exclude<SearchTab, 'all'>))}
                </ResultSection>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[22px] border border-dashed border-white/10 text-sm text-zinc-600">
              {t('searchPage.noResults')}
            </div>
          )}
        </div>

        <div className="pointer-events-none sticky bottom-0 flex justify-end bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e]/90 to-transparent p-4">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
          >
            <MessageSquare className="h-4 w-4" />
            Ask Linear
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function normalizeTab(value: string | null): SearchTab {
  if (value === 'all' || value === 'projects' || value === 'documents') return value;
  if (value === 'issues') return value;
  return 'all';
}

function ResultSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  if (!count) return null;
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
        <span>{title}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-500">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function docHref(doc: Doc, workspaceSlug: string | null) {
  if (!workspaceSlug) return '#';
  if (doc.projectId) return workspaceSectionPath(workspaceSlug, 'projects');
  if (doc.initiativeId) return workspaceSectionPath(workspaceSlug, 'initiatives');
  return workspaceSectionPath(workspaceSlug, 'projects');
}
