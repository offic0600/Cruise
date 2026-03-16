'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { localizePath } from '@/i18n/config';
import { useI18n } from '@/i18n/useI18n';

export default function TasksRedirectPage() {
  const router = useRouter();
  const { locale } = useI18n();

  useEffect(() => {
    router.replace(`${localizePath(locale, '/issues')}?type=TASK`);
  }, [locale, router]);

  return null;
}
