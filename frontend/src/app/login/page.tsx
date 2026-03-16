'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { getAuthProviders, login, sendMagicLink, type AuthProvider } from '@/lib/api';
import { storeSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
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
      router.push(localizePath(locale, '/issues'));
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
    if (!provider.loginUrl) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
    window.location.href = `${apiBase}${provider.loginUrl}`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page-glow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_26%),linear-gradient(135deg,_#1e3a8a,_#1d4ed8_42%,_#0f172a)]">
        <div className="absolute right-6 top-6 z-20">
          <LocaleSwitcher />
        </div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500 blur-3xl mix-blend-multiply" />
          <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-cyan-500 blur-3xl mix-blend-multiply" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 h-96 w-96 animate-pulse rounded-full bg-indigo-500 blur-3xl mix-blend-multiply" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className="relative z-10 mx-4 w-full max-w-xl">
        <div className="rounded-panel border border-white/20 bg-white/12 p-8 shadow-elevated backdrop-blur-glass">
          <div className="mb-8 text-center">
            <div className="brand-badge mb-4 inline-flex h-16 w-16 items-center justify-center rounded-card">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white">Cruise</h1>
            <p className="text-blue-200/80">{t('login.subtitle')}</p>
          </div>

          <div className="space-y-6">
            {oidcProviders.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-blue-100/80">{t('login.oauthTitle')}</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {oidcProviders.map((provider) => (
                    <Button key={provider.providerKey} type="button" variant="secondary" className="w-full" onClick={() => startProviderLogin(provider)}>
                      {provider.displayName === 'Google' ? t('login.google') : provider.displayName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {emailEnabled && (
              <form onSubmit={handleMagicLink} className="space-y-4 rounded-card border border-white/15 bg-white/8 p-5">
                <div className="text-sm font-medium text-blue-100/80">{t('login.emailTitle')}</div>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-blue-100/50"
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {t('login.sendMagicLink')}
                </Button>
              </form>
            )}

            {legacyPasswordEnabled && (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-card border border-white/15 bg-white/8 p-5">
                <div className="text-sm font-medium text-blue-100/80">{t('login.passwordTitle')}</div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-blue-100/80">{t('login.username')}</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="border-white/20 bg-white/10 text-white placeholder:text-blue-100/50"
                    placeholder={t('login.usernamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-blue-100/80">{t('login.password')}</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="border-white/20 bg-white/10 text-white placeholder:text-blue-100/50"
                    placeholder={t('login.passwordPlaceholder')}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t('login.submitting') : t('login.submit')}
                </Button>
              </form>
            )}

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-center text-sm text-red-200 backdrop-blur-sm">{error}</div>}
            {info && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 text-center text-sm text-emerald-100 backdrop-blur-sm">{info}</div>}
          </div>

          <div className="mt-8 text-center text-sm text-blue-200/60">
            <p>{t('login.testAccount')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
