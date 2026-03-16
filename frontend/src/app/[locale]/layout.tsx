import type { Metadata } from "next";
import { I18nProvider } from "@/i18n/I18nProvider";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const messages = getMessages(locale);
  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const messages = getMessages(locale);

  return <I18nProvider locale={locale} messages={messages}>{children}</I18nProvider>;
}
