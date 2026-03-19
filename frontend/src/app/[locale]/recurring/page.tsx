import { redirect } from 'next/navigation';

export default async function LocaleRecurringRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/teams/current/settings/recurring`);
}
