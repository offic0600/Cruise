import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { WorkspaceProvider } from '@/components/providers/WorkspaceProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { defaultLocale, isValidLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/getMessages';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cruise',
  description: 'Cruise frontend',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('locale')?.value;
  const locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <QueryProvider>
          <WorkspaceProvider>
            <I18nProvider locale={locale} messages={messages}>
              {children}
            </I18nProvider>
          </WorkspaceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
