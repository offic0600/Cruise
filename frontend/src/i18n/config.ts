export const locales = ["zh-CN", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh-CN";
export const localeCookieName = "locale";

export function isValidLocale(value: string | null | undefined): value is Locale {
  return !!value && locales.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  return null;
}

export function stripLocale(pathname: string): string {
  return pathname || "/";
}

export function localizePath(locale: Locale, pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized.replace(/\/{2,}/g, "/");
}

export function getPreferredLocale(input?: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isValidLocale(input?.cookieLocale)) {
    return input.cookieLocale;
  }

  const header = input?.acceptLanguage?.toLowerCase() ?? "";
  if (header.includes("zh")) {
    return "zh-CN";
  }
  if (header.includes("en")) {
    return "en";
  }
  return defaultLocale;
}
