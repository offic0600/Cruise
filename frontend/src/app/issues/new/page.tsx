import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { defaultLocale, isValidLocale, localizePath } from '@/i18n/config';

export default async function NewIssuePage() {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('locale')?.value;
  const locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  redirect(localizePath(locale, '/issues'));
}
