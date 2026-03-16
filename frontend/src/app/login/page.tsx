'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';
import { login } from '@/lib/api';
import { storeSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
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
        },
      });
      router.push(localizePath(locale, '/issues'));
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page-glow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_26%),linear-gradient(135deg,_#1e3a8a,_#1d4ed8_42%,_#0f172a)]">
        <div className="absolute right-6 top-6 z-20">
          <LocaleSwitcher />
        </div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-panel border border-white/20 bg-white/12 p-8 shadow-elevated backdrop-blur-glass">
          <div className="text-center mb-8">
            <div className="brand-badge mb-4 inline-flex h-16 w-16 items-center justify-center rounded-card">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Cruise</h1>
            <p className="text-blue-200/80">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-blue-200/60">
            <p>{t('login.testAccount')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
