import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  defaultLocale,
  getPreferredLocale,
  isValidLocale,
  localeCookieName,
  localizePath,
} from "./src/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const [, maybeLocale] = pathname.split("/");
  if (isValidLocale(maybeLocale)) {
    const response = NextResponse.next();
    response.cookies.set(localeCookieName, maybeLocale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }

  const locale = getPreferredLocale({
    cookieLocale: request.cookies.get(localeCookieName)?.value ?? null,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const url = request.nextUrl.clone();
  url.pathname = localizePath(locale ?? defaultLocale, pathname);
  const response = NextResponse.redirect(url, 307);
  response.cookies.set(localeCookieName, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
