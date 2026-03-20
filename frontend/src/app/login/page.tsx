'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/useI18n';
import { getAuthProviders, login, sendMagicLink, type AuthProvider } from '@/lib/api';
import { storeSession } from '@/lib/auth';
import { publicPath } from '@/lib/routes';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeMethod, setActiveMethod] = useState<'email' | 'password' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [legacyPasswordEnabled, setLegacyPasswordEnabled] = useState(true);

  useEffect(() => {
    let alive = true;
    getAuthProviders()
      .then((response) => {
        if (!alive) return;
        setProviders(response.providers);
        setLegacyPasswordEnabled(response.legacyPasswordEnabled);
      })
      .catch(() => {
        if (!alive) return;
        setLegacyPasswordEnabled(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const oidcProviders = useMemo(
    () => providers.filter((provider) => provider.providerType === 'GOOGLE_OIDC' || provider.providerType === 'ENTERPRISE_OIDC'),
    [providers]
  );
  const activeOidcProviders = useMemo(() => oidcProviders.filter((provider) => provider.configured), [oidcProviders]);
  const pendingOidcProviders = useMemo(() => oidcProviders.filter((provider) => !provider.configured), [oidcProviders]);
  const emailEnabled = providers.some((provider) => provider.providerType === 'EMAIL_MAGIC_LINK');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const response = await login(username, password);
      storeSession({
        token: response.token,
        user: {
          id: response.userId,
          username: response.username,
          email: response.email,
          role: response.role,
          organizationId: response.organizationId,
        },
      });
      router.push(response.organizationId ? '/' : publicPath('/create-workspace'));
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const response = await sendMagicLink(email);
      setInfo(t('login.magicLinkSent', { minutes: response.expiresInMinutes }));
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.magicLinkError'));
    } finally {
      setLoading(false);
    }
  };

  const startProviderLogin = (provider: AuthProvider) => {
    if (!provider.loginUrl || !provider.configured) {
      setError(provider.disabledReason || t('login.providerConfigRequired'));
      return;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
    window.location.href = `${apiBase}${provider.loginUrl}`;
  };

  const closeActiveMethod = () => {
    setActiveMethod(null);
    setError('');
    setInfo('');
  };

  const showMethodButtons = activeMethod === null;
  const showTestAccount = process.env.NODE_ENV !== 'production';

  const renderProviderIcon = (provider: AuthProvider) => {
    if (provider.providerType === 'GOOGLE_OIDC') {
      return (
        <span className="text-lg font-semibold leading-none text-brand-600" aria-hidden="true">
          G
        </span>
      );
    }

    return <Building2 className="h-5 w-5" />;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_20%),linear-gradient(180deg,_#f6f9ff_0%,_#e8f0ff_36%,_#f8fafc_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.03),transparent_32%,rgba(37,99,235,0.08)_100%)]" />
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="brand-badge flex h-10 w-10 items-center justify-center rounded-control">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div>
          <LocaleSwitcher />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 lg:px-10">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.84fr_1.08fr] lg:items-center">
          <section className="mx-auto max-w-md lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-pill border border-brand-500/15 bg-white/75 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-600 shadow-card">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('login.eyebrow')}
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-ink-900 lg:text-[3.15rem] lg:leading-[1.02]">
              {t('login.heroTitle')}
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-7 text-ink-700">
              {t('login.subtitle')}
            </p>
            <div className="mt-5 max-w-sm border-l border-brand-500/15 pl-4">
              <div className="meta-label">{t('login.heroWorkflowTitle')}</div>
              <p className="mt-2 text-sm leading-6 text-ink-700/90">{t('login.heroWorkflowDescription')}</p>
            </div>
          </section>

          <Card className="mx-auto w-full max-w-xl border-white/70 bg-white/78 shadow-elevated backdrop-blur-glass">
            <CardContent className="p-6 sm:p-7">
              <div className="mb-6 border-b border-border-subtle pb-5">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-card bg-brand-gradient text-white shadow-brand">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-ink-900">{t('login.panelTitle')}</h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-700">
                  {t('login.panelDescription')}
                </p>
              </div>

              <div className="space-y-5">
            {showMethodButtons && activeOidcProviders.length > 0 && (
              <div className="space-y-3">
                <div className="meta-label">{t('login.oauthTitle')}</div>
                <div className="grid gap-3">
                  {activeOidcProviders.map((provider) => (
                    <Button
                      key={provider.providerKey}
                      type="button"
                      variant="secondary"
                      className="h-auto w-full justify-start rounded-card border-border-subtle px-4 py-4 text-left"
                      disabled={!provider.configured}
                      onClick={() => startProviderLogin(provider)}
                    >
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-control bg-surface-soft text-brand-600">
                        {renderProviderIcon(provider)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{provider.displayName === 'Google' ? t('login.google') : provider.displayName}</div>
                        <div className="text-xs text-ink-400">{t('login.oauthDescription')}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showMethodButtons && (
              <div className="grid gap-3">
                {emailEnabled && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-auto w-full justify-start rounded-card border-border-subtle px-4 py-4 text-left"
                    onClick={() => {
                      setActiveMethod('email');
                      setError('');
                      setInfo('');
                    }}
                  >
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-control bg-surface-soft text-brand-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{t('login.emailTitle')}</div>
                      <div className="text-xs text-ink-400">{t('login.emailDescription')}</div>
                    </div>
                  </Button>
                )}
                {legacyPasswordEnabled && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-auto w-full justify-start rounded-card border-border-subtle px-4 py-4 text-left"
                    onClick={() => {
                      setActiveMethod('password');
                      setError('');
                      setInfo('');
                    }}
                  >
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-control bg-surface-soft text-brand-600">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{t('login.passwordTitle')}</div>
                      <div className="text-xs text-ink-400">{t('login.passwordDescription')}</div>
                    </div>
                  </Button>
                )}
              </div>
            )}

            {showMethodButtons && pendingOidcProviders.length > 0 && (
              <div className="rounded-card border border-dashed border-border-subtle bg-surface-soft/70 px-4 py-4">
                <div className="meta-label">{t('login.heroAccessTitle')}</div>
                <div className="mt-3 space-y-2">
                  {pendingOidcProviders.map((provider) => (
                    <div key={provider.providerKey} className="flex items-start gap-3 rounded-control px-1 py-1.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-control bg-white text-brand-600 shadow-card">
                        {renderProviderIcon(provider)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink-900">
                          {provider.displayName === 'Google' ? t('login.google') : provider.displayName}
                        </div>
                        <div className="mt-0.5 text-xs leading-5 text-ink-400">
                          {t('login.providerConfigRequired')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {emailEnabled && activeMethod === 'email' && (
              <form onSubmit={handleMagicLink} className="space-y-4 rounded-card border border-border-subtle bg-surface-soft p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-ink-700">{t('login.emailTitle')}</div>
                  <Button type="button" variant="ghost" className="text-ink-400 hover:text-ink-900" onClick={closeActiveMethod}>
                    {t('common.cancel')}
                  </Button>
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-border-soft bg-white text-ink-900 placeholder:text-ink-400"
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {t('login.sendMagicLink')}
                </Button>
              </form>
            )}

            {legacyPasswordEnabled && activeMethod === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-card border border-border-subtle bg-surface-soft p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-ink-700">{t('login.passwordTitle')}</div>
                  <Button type="button" variant="ghost" className="text-ink-400 hover:text-ink-900" onClick={closeActiveMethod}>
                    {t('common.cancel')}
                  </Button>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-700">{t('login.username')}</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="border-border-soft bg-white text-ink-900 placeholder:text-ink-400"
                    placeholder={t('login.usernamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink-700">{t('login.password')}</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="border-border-soft bg-white text-ink-900 placeholder:text-ink-400"
                    placeholder={t('login.passwordPlaceholder')}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t('login.submitting') : t('login.submit')}
                </Button>
              </form>
            )}

                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {info && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</div>}
              </div>
            </CardContent>
          </Card>
        </div>
        {showTestAccount && (
          <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-pill border border-white/70 bg-white/65 px-4 py-2 text-[11px] text-ink-400 shadow-card backdrop-blur-sm">
            {t('login.testAccount')}
          </div>
        )}
      </div>
    </div>
  );
}
