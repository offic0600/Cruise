'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { type Locale, localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { getDocs, getIssues, getProjects, type Doc, type Issue, type Project } from '@/lib/api';

type SearchTab = 'issues' | 'projects' | 'documents';

const tabs: SearchTab[] = ['issues', 'projects', 'documents'];

export default function SearchPage() {
  const { locale, t } = useI18n();
  const { organizationId, currentTeamId } = useCurrentWorkspace();
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
    enabled: hasQuery && activeTab === 'issues',
  });

  const projectsQuery = useQuery({
    queryKey: ['search', 'projects', organizationId ?? 1, currentTeamId ?? 'all', q],
    queryFn: () => getProjects({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined, q }),
    select: (response) => response.items,
    enabled: hasQuery && activeTab === 'projects',
  });

  const docsQuery = useQuery({
    queryKey: ['search', 'documents', organizationId ?? 1, currentTeamId ?? 'all', q],
    queryFn: () => getDocs({ organizationId: organizationId ?? 1, teamId: currentTeamId ?? undefined, q }),
    enabled: hasQuery && activeTab === 'documents',
  });

  const results = useMemo(() => {
    if (activeTab === 'issues') return (issuesQuery.data ?? []) as Issue[];
    if (activeTab === 'projects') return (projectsQuery.data ?? []) as Project[];
    return (docsQuery.data ?? []) as Doc[];
  }, [activeTab, issuesQuery.data, projectsQuery.data, docsQuery.data]);

  const isLoading = issuesQuery.isLoading || projectsQuery.isLoading || docsQuery.isLoading;

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900">{t('searchPage.title')}</h1>
        </div>

        <div className="space-y-4">
          <div className="relative max-w-3xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <Input
              autoFocus
              value={q}
              onChange={(event) => updateSearch({ q: event.target.value })}
              placeholder={t('searchPage.placeholder')}
              className="h-12 rounded-full pl-12 pr-4 text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => updateSearch({ type: tab })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab ? 'bg-slate-900 text-white' : 'border border-border-soft bg-white text-ink-700 hover:bg-slate-50'
                }`}
              >
                {t(`searchPage.tabs.${tab}`)}
              </button>
            ))}
          </div>
        </div>

        {!hasQuery ? (
          <div className="rounded-panel border border-border-subtle bg-surface-raised p-8 text-sm text-ink-500">
            {t('searchPage.empty')}
          </div>
        ) : isLoading ? (
          <div className="rounded-panel border border-border-subtle bg-surface-raised p-8 text-sm text-ink-500">
            {t('common.loading')}
          </div>
        ) : results.length ? (
          <div className="space-y-3">
            {activeTab === 'issues'
              ? (results as Issue[]).map((issue) => (
                  <Link
                    key={issue.id}
                    href={localizePath(locale, `/issues/${issue.id}`)}
                    className="block rounded-panel border border-border-subtle bg-surface-raised p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{issue.identifier}</div>
                        <div className="mt-2 truncate text-lg font-semibold text-ink-900">{issue.title}</div>
                        <div className="mt-2 line-clamp-2 text-sm text-ink-700">{issue.description ?? t('common.empty')}</div>
                      </div>
                      <Badge>{issue.state}</Badge>
                    </div>
                  </Link>
                ))
              : activeTab === 'projects'
                ? (results as Project[]).map((project) => (
                    <Link
                      key={project.id}
                      href={localizePath(locale, '/projects')}
                      className="block rounded-panel border border-border-subtle bg-surface-raised p-5 transition hover:bg-slate-50"
                    >
                      <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{project.key ?? `#${project.id}`}</div>
                      <div className="mt-2 text-lg font-semibold text-ink-900">{project.name}</div>
                      <div className="mt-2 line-clamp-2 text-sm text-ink-700">{project.description ?? t('common.empty')}</div>
                    </Link>
                  ))
                : (results as Doc[]).map((doc) => (
                    <Link
                      key={doc.id}
                      href={docHref(doc, locale)}
                      className="block rounded-panel border border-border-subtle bg-surface-raised p-5 transition hover:bg-slate-50"
                    >
                      <div className="text-xs uppercase tracking-[0.18em] text-ink-400">{doc.slug}</div>
                      <div className="mt-2 text-lg font-semibold text-ink-900">{doc.title}</div>
                      <div className="mt-2 text-sm text-ink-700">{doc.currentContent?.content ?? t('common.empty')}</div>
                    </Link>
                  ))}
          </div>
        ) : (
          <div className="rounded-panel border border-border-subtle bg-surface-raised p-8 text-sm text-ink-500">
            {t('searchPage.noResults')}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function normalizeTab(value: string | null): SearchTab {
  if (value === 'projects' || value === 'documents') return value;
  return 'issues';
}

function docHref(doc: Doc, locale: Locale) {
  if (doc.issueId) return localizePath(locale, `/issues/${doc.issueId}`);
  if (doc.projectId) return localizePath(locale, '/projects');
  if (doc.initiativeId) return localizePath(locale, '/initiatives');
  return localizePath(locale, '/projects');
}
