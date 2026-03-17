"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-control border border-white/70 bg-white/65 px-3 text-sm font-medium text-ink-700 shadow-card backdrop-blur-sm transition hover:bg-white/85 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
        >
          <Languages className="h-4 w-4 text-brand-600" />
          <span className="hidden sm:inline">{t("common.language")}</span>
          <span className="text-ink-400">{locale === "zh-CN" ? "简中" : "EN"}</span>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {locales.map((item) => (
          <DropdownMenuItem key={item} onClick={() => changeLocale(item as Locale)} className="justify-between gap-4">
            <span>{item === "zh-CN" ? t("common.zhCN") : t("common.en")}</span>
            {item === locale && <Check className="h-4 w-4 text-brand-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
