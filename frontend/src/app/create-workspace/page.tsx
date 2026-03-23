'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n/useI18n';
import { checkOrganizationSlugAvailability, createOrganization, getOrganizations, getTeams, joinWorkspaceInvite } from '@/lib/api';
import { clearSession, type AuthSession, getStoredSession, storeSession } from '@/lib/auth';
import { publicPath, teamActivePath, workspaceRootPath } from '@/lib/routes';

const regions = ['Asia Pacific', 'United States', 'Europe'] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInvite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const marker = 'invite=';
  if (trimmed.includes(marker)) {
    return trimmed.split(marker)[1]?.split('&')[0]?.trim() ?? '';
  }
  const slashValue = trimmed.substring(trimmed.lastIndexOf('/') + 1).trim();
  return slashValue || trimmed;
}

export default function CreateWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const {
    organizations,
    currentOrganizationSlug,
    currentTeamKey,
    isLoading: isWorkspaceLoading,
    setCurrentOrganizationId,
    setCurrentTeamId,
  } = useCurrentWorkspace();
  const [mode, setMode] = useState<'create' | 'join'>(searchParams.get('invite') ? 'join' : 'create');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [region, setRegion] = useState<(typeof regions)[number]>('Asia Pacific');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [inviteCodeOrLink, setInviteCodeOrLink] = useState(searchParams.get('invite') ?? '');
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  useEffect(() => {
    const replace = (target: string) => {
      if (typeof window !== 'undefined' && window.location.pathname !== target) {
        window.location.replace(target);
        return;
      }
      router.replace(target);
    };
    if (session === undefined) return;
    if (!session?.user) {
      replace(publicPath('/login'));
    }
  }, [router, session]);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) {
      setInviteCodeOrLink(invite);
      setMode('join');
    }
  }, [searchParams]);

  const normalizedSlug = useMemo(() => slugify(slug), [slug]);
  const slugFormatValid = normalizedSlug.length > 0 && normalizedSlug === slug;
  const normalizedInvite = useMemo(() => parseInvite(inviteCodeOrLink), [inviteCodeOrLink]);
  const hasInvite = Boolean(searchParams.get('invite'));

  const organizationsGuardQuery = useQuery({
    queryKey: ['organizations', 'create-workspace-guard'],
    queryFn: () => getOrganizations(),
    enabled: session !== undefined && Boolean(session?.user) && !hasInvite,
  });
  const guardedOrganization = organizationsGuardQuery.data?.[0] ?? null;
  const guardedTeamsQuery = useQuery({
    queryKey: ['teams', 'create-workspace-guard', guardedOrganization?.id ?? null],
    queryFn: () => getTeams({ organizationId: guardedOrganization?.id ?? undefined }),
    enabled: guardedOrganization?.id != null,
  });
  const guardedTeam = guardedTeamsQuery.data?.[0] ?? null;
  const guardError = organizationsGuardQuery.error ?? guardedTeamsQuery.error ?? null;
  const guardAuthError = isAuthError(guardError);
  const isGuardCheckingExistingWorkspace =
    session !== undefined &&
    Boolean(session?.user) &&
    !hasInvite &&
    !guardError &&
    (isWorkspaceLoading || organizationsGuardQuery.isLoading || guardedTeamsQuery.isLoading);
  const shouldBlockWorkspaceForm =
    session !== undefined &&
    Boolean(session?.user) &&
    !hasInvite &&
    (isGuardCheckingExistingWorkspace || Boolean(guardedOrganization));

  useEffect(() => {
    const replace = (target: string) => {
      if (typeof window !== 'undefined' && window.location.pathname !== target) {
        window.location.replace(target);
        return;
      }
      router.replace(target);
    };
    if (
      session === undefined ||
      !session?.user ||
      hasInvite ||
      isWorkspaceLoading ||
      organizationsGuardQuery.isLoading ||
      guardedTeamsQuery.isLoading
    ) return;
    if (guardAuthError) {
      clearSession();
      replace(publicPath('/login'));
      return;
    }
    if (guardError) return;
    if (!guardedOrganization) return;

    if (currentOrganizationSlug && currentTeamKey) {
      replace(teamActivePath(currentOrganizationSlug, currentTeamKey));
      return;
    }

    if (guardedOrganization.slug && guardedTeam?.key) {
      replace(teamActivePath(guardedOrganization.slug, guardedTeam.key));
      return;
    }

    replace(workspaceRootPath(guardedOrganization.slug));
  }, [
    currentOrganizationSlug,
    currentTeamKey,
    guardedOrganization,
    guardedTeam,
    guardedTeamsQuery.isLoading,
    hasInvite,
    isWorkspaceLoading,
    organizationsGuardQuery.isLoading,
    router,
    session,
    guardAuthError,
    guardError,
  ]);

  const slugAvailabilityQuery = useQuery({
    queryKey: ['organizations', 'slug-availability', normalizedSlug],
    queryFn: () => checkOrganizationSlugAvailability(normalizedSlug),
    enabled: mode === 'create' && normalizedSlug.length > 0 && slugFormatValid,
    staleTime: 5000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createOrganization({
        name: name.trim(),
        slug: normalizedSlug,
        region,
      }),
    onSuccess: (response) => {
      applySessionAndRedirect({
        token: response.authSession.token,
        userId: response.authSession.userId,
        username: response.authSession.username,
        email: response.authSession.email,
        role: response.authSession.role,
        organizationId: response.authSession.organizationId,
        teamId: response.initialTeam.id,
        organizationSlug: response.organization.slug,
        teamKey: response.initialTeam.key,
      });
    },
    onError: (error: any) => handleAuthOrMessage(error, t('createWorkspace.errors.generic')),
  });

  const joinMutation = useMutation({
    mutationFn: () => joinWorkspaceInvite({ inviteCodeOrLink: normalizedInvite }),
    onSuccess: (response) => {
      applySessionAndRedirect({
        token: response.authSession.token,
        userId: response.authSession.userId,
        username: response.authSession.username,
        email: response.authSession.email,
        role: response.authSession.role,
        organizationId: response.authSession.organizationId,
        teamId: response.team.id,
        organizationSlug: response.organization.slug,
        teamKey: response.team.key,
      });
    },
    onError: (error: any) => handleAuthOrMessage(error, t('createWorkspace.errors.joinGeneric')),
  });

  const nameError = submitted && mode === 'create' && !name.trim() ? t('createWorkspace.errors.nameRequired') : '';
  const slugError =
    mode !== 'create'
      ? ''
      : (submitted && !normalizedSlug ? t('createWorkspace.errors.slugRequired') : '') ||
        (slug.length > 0 && !slugFormatValid ? t('createWorkspace.errors.slugFormat') : '') ||
        (slugAvailabilityQuery.data && !slugAvailabilityQuery.data.available ? t('createWorkspace.errors.slugTaken') : '');
  const inviteError =
    mode === 'join' && submitted && !normalizedInvite ? t('createWorkspace.errors.inviteRequired') : '';

  const canCreate =
    Boolean(name.trim()) &&
    Boolean(normalizedSlug) &&
    slugFormatValid &&
    slugAvailabilityQuery.isSuccess &&
    slugAvailabilityQuery.data?.available !== false &&
    !createMutation.isPending;
  const canJoin = Boolean(normalizedInvite) && !joinMutation.isPending;

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Loading workspace...</div>;
  }

  if (!session?.user) return null;

  if (guardError && !hasInvite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page-glow text-ink-700">
        <div>{t('createWorkspace.errors.generic')}</div>
        <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (shouldBlockWorkspaceForm) {
    return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Loading workspace...</div>;
  }

  function handleAuthOrMessage(error: any, fallback: string) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      router.replace(publicPath('/login'));
      return;
    }
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
    setServerError(message);
  }

  function applySessionAndRedirect(next: {
    token: string;
    userId: number;
    username: string;
    email: string;
    role: string;
    organizationId: number | null;
    teamId: number;
    organizationSlug?: string | null;
    teamKey?: string | null;
  }) {
    storeSession({
      token: next.token,
      user: {
        id: next.userId,
        username: next.username,
        email: next.email,
        role: next.role,
        organizationId: next.organizationId,
      },
    });
    if (next.organizationId != null) {
      setCurrentOrganizationId(next.organizationId);
    }
    setCurrentTeamId(next.teamId);
    if (next.organizationSlug && next.teamKey) {
      router.push(teamActivePath(next.organizationSlug, next.teamKey));
      return;
    }
    router.push('/');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.10),_transparent_18%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_46%,_#ffffff_100%)]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-10 py-8 text-sm text-ink-600">
        <Link href={session.user.organizationId ? '/' : publicPath('/login')} className="inline-flex items-center gap-2 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('createWorkspace.back')}</span>
        </Link>
        <div className="text-right">
          <div>{t('createWorkspace.loggedInAs')}</div>
          <div className="mt-1 text-base text-ink-900">{session.user.email}</div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-ink-900">{t('createWorkspace.title')}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-xl leading-9 text-ink-600">{t('createWorkspace.subtitle')}</p>

          <div className="mx-auto mt-8 flex w-fit rounded-full border border-white/70 bg-white/80 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${mode === 'create' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
              onClick={() => {
                setMode('create');
                setServerError('');
                setSubmitted(false);
              }}
            >
              {t('createWorkspace.tabs.create')}
            </button>
            <button
              type="button"
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${mode === 'join' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
              onClick={() => {
                setMode('join');
                setServerError('');
                setSubmitted(false);
              }}
            >
              {t('createWorkspace.tabs.join')}
            </button>
          </div>

          <Card className="mx-auto mt-12 max-w-[36rem] rounded-[1.8rem] border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardContent className="space-y-7 p-8 pt-8 text-left">
              {mode === 'create' ? (
                <>
                  <div className="space-y-3">
                    <label className="text-lg font-medium text-ink-900">{t('createWorkspace.fields.name')}</label>
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      data-testid="create-workspace-name-input"
                      className="h-14 rounded-[1rem] border-brand-500/40 px-4 text-lg"
                      autoFocus
                    />
                    <FieldHint text={nameError || null} tone={nameError ? 'error' : 'muted'} />
                  </div>

                  <div className="space-y-3">
                    <label className="text-lg font-medium text-ink-900">{t('createWorkspace.fields.slug')}</label>
                    <div className="flex h-14 items-center rounded-[1rem] border border-border-soft bg-slate-50 px-4 text-lg text-ink-900">
                      <span className="mr-2 text-ink-500">cruise.app/</span>
                      <input
                        value={slug}
                        onChange={(event) => {
                          setSlugTouched(true);
                          setSlug(slugify(event.target.value));
                        }}
                        data-testid="create-workspace-slug-input"
                        className="min-w-0 flex-1 bg-transparent outline-none"
                      />
                    </div>
                    <FieldHint
                      text={
                        slugError ||
                        (normalizedSlug && slugAvailabilityQuery.data?.available
                          ? t('createWorkspace.hints.slugAvailable')
                          : null)
                      }
                      tone={slugError ? 'error' : 'muted'}
                    />
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-3">
                      <label className="text-lg font-medium text-ink-900">{t('createWorkspace.fields.region')}</label>
                      <div className="flex items-center gap-3">
                        <span className="text-lg text-ink-600">{t('createWorkspace.hostedIn')}</span>
                        <Select value={region} onValueChange={(value) => setRegion(value as (typeof regions)[number])}>
                          <SelectTrigger className="h-11 w-48 rounded-full border-border-soft bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-white text-ink-500"
                      aria-label={t('createWorkspace.help')}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </div>

                </>
              ) : (
                <div className="space-y-3">
                  <label className="text-lg font-medium text-ink-900">{t('createWorkspace.fields.invite')}</label>
                  <Input
                    value={inviteCodeOrLink}
                    onChange={(event) => setInviteCodeOrLink(event.target.value)}
                    placeholder={t('createWorkspace.fields.invitePlaceholder')}
                    className="h-14 rounded-[1rem] px-4 text-lg"
                    autoFocus
                  />
                  <FieldHint text={inviteError || t('createWorkspace.hints.invite')} tone={inviteError ? 'error' : 'muted'} />
                </div>
              )}

              {serverError ? <FieldHint text={serverError} tone="error" /> : null}
            </CardContent>
          </Card>

          <Button
            type="button"
            className="mt-8 h-14 min-w-80 rounded-full px-10 text-lg"
            data-testid="create-workspace-submit-button"
            disabled={mode === 'create' ? !canCreate : !canJoin}
            onClick={() => {
              setSubmitted(true);
              setServerError('');
              if (mode === 'create') {
                if (!canCreate) return;
                createMutation.mutate();
                return;
              }
              if (!canJoin) return;
              joinMutation.mutate();
            }}
          >
            {mode === 'create'
              ? createMutation.isPending
                ? t('createWorkspace.creating')
                : t('createWorkspace.submit')
              : joinMutation.isPending
                ? t('createWorkspace.joining')
                : t('createWorkspace.joinSubmit')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function isAuthError(error: unknown) {
  const status = (error as { response?: { status?: number } } | null)?.response?.status;
  return status === 401 || status === 403;
}

function FieldHint({ text, tone }: { text: string | null; tone: 'error' | 'muted' }) {
  if (!text) return <div className="h-5" />;
  return <div className={`text-sm ${tone === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>{text}</div>;
}
