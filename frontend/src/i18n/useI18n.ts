"use client";

import { useI18nContext } from "./I18nProvider";

function getValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function useI18n() {
  const context = useI18nContext();

  const humanizeFallback = (path: string) => {
    const candidate = path.split(".").at(-1) ?? path;
    return candidate
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const t = (path: string, variables?: Record<string, string | number>) => {
    const value = getValue(context.messages, path);
    if (typeof value !== "string") {
      return humanizeFallback(path);
    }
    if (!variables) return value;
    return Object.entries(variables).reduce(
      (result, [key, variable]) => result.replaceAll(`{${key}}`, String(variable)),
      value
    );
  };

  return {
    locale: context.locale,
    setLocale: context.setLocale,
    messages: context.messages,
    t,
  };
}
