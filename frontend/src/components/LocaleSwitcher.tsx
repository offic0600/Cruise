"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultLocale, localizePath, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    const nextPath = localizePath(nextLocale, pathname || `/${defaultLocale}`);
    const query = searchParams.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span>{t("common.language")}</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {item === "zh-CN" ? t("common.zhCN") : t("common.en")}
          </option>
        ))}
      </select>
    </label>
  );
}
