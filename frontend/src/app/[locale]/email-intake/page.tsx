import { redirect } from 'next/navigation';

export default async function LocaleEmailIntakeRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/teams/current/settings/email-intake`);
}
