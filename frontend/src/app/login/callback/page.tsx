'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeSession } from '@/lib/auth';
import { publicPath } from '@/lib/routes';

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');
    const error = searchParams.get('error');

    if (error) {
      router.replace(`${publicPath('/login')}?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token && username && email && role) {
      storeSession({
        token,
        user: {
          id: userId ? Number(userId) : undefined,
          username,
          email,
          role,
          organizationId: organizationId ? Number(organizationId) : null,
        },
      });
      router.replace(organizationId ? '/' : publicPath('/create-workspace'));
      return;
    }

    router.replace(publicPath('/login'));
  }, [router, searchParams]);

  return <div className="flex min-h-screen items-center justify-center bg-page-glow text-ink-700">Signing you in...</div>;
}
