'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useCurrentWorkspace } from '@/components/providers/WorkspaceProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { checkOrganizationSlugAvailability, createOrganization } from '@/lib/api';
import { getStoredSession, storeSession } from '@/lib/auth';

const regions = ['Asia Pacific', 'United States', 'Europe'] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { setCurrentOrganizationId, setCurrentTeamId } = useCurrentWorkspace();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [region, setRegion] = useState<(typeof regions)[number]>('Asia Pacific');
  const [initialTeamName, setInitialTeamName] = useState('General');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const session = getStoredSession();

  useEffect(() => {
    if (!session?.user) {
      router.replace(localizePath(locale, '/login'));
    }
  }, [locale, router, session?.user]);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(name));
  }, [name, slugTouched]);

  const normalizedSlug = useMemo(() => slugify(slug), [slug]);
  const slugFormatValid = normalizedSlug.length > 0 && normalizedSlug === slug;

  const slugAvailabilityQuery = useQuery({
    queryKey: ['organizations', 'slug-availability', normalizedSlug],
    queryFn: () => checkOrganizationSlugAvailability(normalizedSlug),
    enabled: normalizedSlug.length > 0 && slugFormatValid,
    staleTime: 5000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createOrganization({
        name: name.trim(),
        slug: normalizedSlug,
        region,
        initialTeamName: initialTeamName.trim() || 'General',
      }),
    onSuccess: (response) => {
      storeSession({
        token: response.authSession.token,
        user: {
          id: response.authSession.userId,
          username: response.authSession.username,
          email: response.authSession.email,
          role: response.authSession.role,
          organizationId: response.authSession.organizationId,
        },
      });
      setCurrentOrganizationId(response.organization.id);
      setCurrentTeamId(response.initialTeam.id);
      router.push(localizePath(locale, '/issues'));
    },
    onError: (error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        router.replace(localizePath(locale, '/login'));
        return;
      }
      const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || t('createWorkspace.errors.generic');
      setServerError(message);
    },
  });

  const nameError = submitted && !name.trim() ? t('createWorkspace.errors.nameRequired') : '';
  const slugError =
    (submitted && !normalizedSlug ? t('createWorkspace.errors.slugRequired') : '') ||
    (slug.length > 0 && !slugFormatValid ? t('createWorkspace.errors.slugFormat') : '') ||
    (slugAvailabilityQuery.data && !slugAvailabilityQuery.data.available ? t('createWorkspace.errors.slugTaken') : '');

  const canSubmit =
    Boolean(name.trim()) &&
    Boolean(normalizedSlug) &&
    slugFormatValid &&
    slugAvailabilityQuery.data?.available !== false &&
    !createMutation.isPending;

  if (!session?.user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.10),_transparent_18%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_46%,_#ffffff_100%)]">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-10 py-8 text-sm text-ink-600">
        <Link href={localizePath(locale, session.user.organizationId ? '/issues' : '/login')} className="inline-flex items-center gap-2 hover:text-ink-900">
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

          <Card className="mx-auto mt-12 max-w-[36rem] rounded-[1.8rem] border-white/80 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur">
            <CardContent className="space-y-7 p-8 pt-8 text-left">
              <div className="space-y-3">
                <label className="text-lg font-medium text-ink-900">{t('createWorkspace.fields.name')}</label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
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

              <div className="space-y-3">
                <label className="text-lg font-medium text-ink-900">{t('createWorkspace.fields.initialTeamName')}</label>
                <Input
                  value={initialTeamName}
                  onChange={(event) => setInitialTeamName(event.target.value)}
                  className="h-12 rounded-[1rem] px-4"
                />
              </div>

              {serverError ? <FieldHint text={serverError} tone="error" /> : null}
            </CardContent>
          </Card>

          <Button
            type="button"
            className="mt-8 h-14 min-w-80 rounded-full px-10 text-lg"
            disabled={!canSubmit}
            onClick={() => {
              setSubmitted(true);
              setServerError('');
              if (!canSubmit) return;
              createMutation.mutate();
            }}
          >
            {createMutation.isPending ? t('createWorkspace.creating') : t('createWorkspace.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldHint({ text, tone }: { text: string | null; tone: 'error' | 'muted' }) {
  if (!text) return <div className="h-5" />;
  return <div className={`text-sm ${tone === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>{text}</div>;
}
