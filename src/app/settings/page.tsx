"use client";

import { ChevronRight, Globe, Shield, Lock, FileText, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { LanguageFlag } from "@/components/common/LanguageFlag";

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();

  const settingsOptions = [
    {
      id: "change-password",
      title: t.settings.changePassword,
      path: "/settings/change-password",
      icon: Lock,
    },
    {
      id: "privacy-policy",
      title: t.settings.privacyPolicy,
      path: "/settings/privacy-policy",
      icon: Shield,
    },
    {
      id: "terms-conditions",
      title: t.settings.termsConditions,
      path: "/settings/terms-conditions",
      icon: FileText,
    },
    {
      id: "about-us",
      title: t.settings.aboutUs,
      path: "/settings/about-us",
      icon: Info,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold">{t.settings.title}</h2>
        <p className="text-sm opacity-90 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              {t.settings.languagePreference}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.settings.languageDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setLanguage("EN")}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              language === "EN"
                ? "border-amber-500 bg-amber-500/10 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold shadow-sm"
                : "border-border hover:bg-muted/50 text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <LanguageFlag language="EN" className="h-5 w-7" />
              <div className="text-left">
                <div className="text-sm font-semibold">English</div>
                <div className="text-xs text-muted-foreground">United Kingdom / International</div>
              </div>
            </div>
            {language === "EN" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white">Active</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLanguage("DE")}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              language === "DE"
                ? "border-amber-500 bg-amber-500/10 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold shadow-sm"
                : "border-border hover:bg-muted/50 text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <LanguageFlag language="DE" className="h-5 w-7" />
              <div className="text-left">
                <div className="text-sm font-semibold">Deutsch</div>
                <div className="text-xs text-muted-foreground">Deutschland / Österreich / Schweiz</div>
              </div>
            </div>
            {language === "DE" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white">Aktiv</span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {settingsOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div key={option.id}>
              <button
                onClick={() => router.push(option.path)}
                className="hover:bg-muted/50 flex w-full items-center justify-between p-5 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-foreground text-base font-semibold">{option.title}</span>
                </div>
                <ChevronRight className="text-muted-foreground h-5 w-5" />
              </button>
              {index < settingsOptions.length - 1 && <div className="border-border mx-5 border-b" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
