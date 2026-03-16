"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localizePath } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export default function LocalizedHomePage() {
  const router = useRouter();
  const { locale, t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.push(localizePath(locale, token ? "/issues" : "/login"));
  }, [locale, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Cruise</h1>
        <p className="text-blue-200/60 mt-2">{t("home.subtitle")}</p>
      </div>
    </div>
  );
}
