import { redirect } from 'next/navigation';

export default async function LocaleTemplatesRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/teams/current/settings/templates`);
}
