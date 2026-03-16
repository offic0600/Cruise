"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button variant="secondary" size="sm" className="gap-2">
          <span>{t("common.language")}</span>
          <span className="text-ink-400">{locale === "zh-CN" ? "简中" : "EN"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
