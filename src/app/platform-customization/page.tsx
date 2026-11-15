"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Globe,
  ShieldCheck,
  FileText,
  HelpCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDateTime, useApi } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type PlatformCustomization = {
  _id: string;
  key: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  supportEmail?: string;
  branding?: Record<string, unknown> | null;
  aiRules?: Record<string, unknown> | null;
  updatedAt?: string;
};

const COLOR_PRESETS = [
  { label: "Sky Cyan", hex: "#0EA5E9" },
  { label: "Indigo Blue", hex: "#4F46E5" },
  { label: "Emerald Green", hex: "#10B981" },
  { label: "Violet Royal", hex: "#8B5CF6" },
  { label: "Rose Crimson", hex: "#F43F5E" },
  { label: "Amber Gold", hex: "#F59E0B" },
];

const str = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join(", ") : str(value);

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all";
const textareaClass =
  "w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none transition-all";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5";

export default function PlatformCustomizationPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload, setData } = useApi<PlatformCustomization | null>("/platform-customization/default");

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <Palette className="w-8 h-8 text-[#F4B057]" />
          {isDe ? "Plattform-Anpassung & Content-Management" : "Platform Customization & Content CMS"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {isDe
            ? "Passen Sie Logo, Theme-Akzentfarben, KI-Erkennungskategorien und rechtliche Richtlinien an."
            : "Customize branding, UI theme colors, AI recognition categories, and bilingual legal policies."}
        </p>
      </div>

      {isLoading || error ? (
        <DataState isLoading={isLoading} error={error} emptyTitle="" onRetry={reload} />
      ) : (
        <CustomizationForm record={data} onSaved={setData} />
      )}
    </div>
  );
}

function CustomizationForm({
  record,
  onSaved,
}: {
  record: PlatformCustomization | null;
  onSaved: (record: PlatformCustomization) => void;
}) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const branding = record?.branding ?? {};
  const aiRules = record?.aiRules ?? {};

  const [platformName, setPlatformName] = useState(str(branding.platformName));
  const [primaryColor, setPrimaryColor] = useState(record?.primaryColor ?? "");
  const [logoUrl, setLogoUrl] = useState(record?.logoUrl ?? "");
  const [supportEmail, setSupportEmail] = useState(record?.supportEmail ?? "");
  const [aiCategories, setAiCategories] = useState(list(aiRules.categories));
  const [termsText, setTermsText] = useState(str(branding.buyerProtectionSummary));
  const [faqQuestions, setFaqQuestions] = useState(str(aiRules.faqKnowledgeBase));
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supportEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail.trim())) {
      setNotice({ type: "error", text: isDe ? "Ungültige Support-E-Mail-Adresse." : "Invalid support email address." });
      return;
    }
    setIsSaving(true);
    setNotice(null);
    const payload = {
      primaryColor,
      logoUrl: logoUrl.trim(),
      supportEmail: supportEmail.trim(),
      branding: { ...branding, platformName: platformName.trim(), buyerProtectionSummary: termsText.trim() },
      aiRules: {
        ...aiRules,
        categories: aiCategories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        faqKnowledgeBase: faqQuestions.trim(),
      },
    };
    try {
      // PATCH /default only updates an existing record, so the first save creates it.
      let saved = await apiRequest<PlatformCustomization | null>("/platform-customization/default", {
        method: "PATCH",
        body: JSON.stringify({ payload }),
      });
      if (!saved) {
        saved = await apiRequest<PlatformCustomization>("/platform-customization", {
          method: "POST",
          body: JSON.stringify({ payload: { key: "default", ...payload } }),
        });
      }
      setNotice({ type: "success", text: isDe ? "Einstellungen erfolgreich gespeichert!" : "Changes Saved Successfully!" });
      if (saved) onSaved(saved);
    } catch (saveError) {
      if (saveError instanceof SessionExpiredError) return;
      setNotice({
        type: "error",
        text: saveError instanceof Error ? saveError.message : isDe ? "Speichern fehlgeschlagen." : "Could not save the settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isPreset = COLOR_PRESETS.some((preset) => preset.hex.toLowerCase() === primaryColor.toLowerCase());

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {record
            ? `${isDe ? "Zuletzt gespeichert" : "Last saved"}: ${formatDateTime(record.updatedAt)}`
            : isDe
              ? "Noch keine Anpassungen gespeichert. Füllen Sie die Felder aus und speichern Sie."
              : "No customization saved yet. Fill in the fields and save to create it."}
        </p>
        {notice && (
          <span
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs border ${
              notice.type === "success"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60"
                : "bg-destructive/10 text-destructive border-destructive/40"
            }`}
          >
            {notice.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notice.text}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Branding & Theme Colors (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Branding Card */}
          <div className="bg-card rounded-2xl p-6 border border-border dark:border-[#F4B057]/40 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#F4B057]" />
              {isDe ? "Branding & Plattformname" : "Platform Identity & Branding"}
            </h2>

            <div>
              <label className={labelClass}>{isDe ? "Plattform-Titel" : "Platform Title / Name"}</label>
              <input
                type="text"
                value={platformName}
                placeholder={isDe ? "z. B. Odaboo Marketplace" : "e.g. Odaboo Marketplace"}
                onChange={(e) => setPlatformName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Mail className="w-3.5 h-3.5" />
                {isDe ? "Support-E-Mail" : "Support Email"}
              </label>
              <input
                type="email"
                value={supportEmail}
                placeholder="support@example.com"
                onChange={(e) => setSupportEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Theme Color Selector */}
            <div>
              <label className={`${labelClass} mb-2`}>
                {isDe ? "Primäre Theme-Akzentfarbe" : "Primary Accent Theme Color"}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setPrimaryColor(preset.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      primaryColor.toLowerCase() === preset.hex.toLowerCase()
                        ? "border-[#F4B057] bg-[#F4B057]/15 text-[#F4B057] shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.hex }}></span>
                    <span>{preset.label}</span>
                  </button>
                ))}
                <label
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    primaryColor && !isPreset
                      ? "border-[#F4B057] bg-[#F4B057]/15 text-[#F4B057]"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(primaryColor) ? primaryColor : "#0EA5E9"}
                    onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())}
                    className="h-3.5 w-3.5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  />
                  <span>{primaryColor && !isPreset ? primaryColor : isDe ? "Eigene" : "Custom"}</span>
                </label>
              </div>
              {!primaryColor && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {isDe ? "Noch keine Akzentfarbe gewählt." : "No accent color selected yet."}
                </p>
              )}
            </div>

            {/* Logo */}
            <div>
              <label className={`${labelClass} mb-2`}>{isDe ? "Plattform Logo" : "Platform Logo"}</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
                <div className="relative w-28 h-12 shrink-0 bg-card rounded-xl border border-border p-1 flex items-center justify-center overflow-hidden">
                  {logoUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl.trim()} alt="Logo" className="max-h-10 max-w-[100px] object-contain" />
                  ) : (
                    <Image src="/logo.png" alt="Logo" width={100} height={40} className="object-contain" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5 text-xs text-muted-foreground">
                  <p className="font-bold text-foreground">
                    {logoUrl.trim()
                      ? isDe
                        ? "Eigenes Logo aktiv"
                        : "Custom Logo Active"
                      : isDe
                        ? "Standard-Logo aktiv"
                        : "Default Logo Active"}
                  </p>
                  <input
                    type="url"
                    value={logoUrl}
                    placeholder={isDe ? "Logo-URL (https://…)" : "Logo URL (https://…)"}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Category Recognition Configuration */}
          <div className="bg-card rounded-2xl p-6 border border-border dark:border-[#F4B057]/40 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F4B057]" />
              {isDe ? "KI-Kategorien & Erkennungs-Tags" : "AI Category & Tag Recognition Settings"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isDe
                ? "Definieren Sie Kategorien, die unsere Bild-KI automatisch zuweist."
                : "Configure target taxonomy that the AI Photo Inspector assigns to vendor uploads."}
            </p>

            <div>
              <label className={labelClass}>
                {isDe ? "Erlaubte Kategorien (Kommagetrennt)" : "AI Taxonomy Categories (Comma separated)"}
              </label>
              <textarea
                rows={3}
                value={aiCategories}
                placeholder={isDe ? "z. B. Elektronik, Möbel, Mode" : "e.g. Electronics, Furniture, Fashion"}
                onChange={(e) => setAiCategories(e.target.value)}
                className={textareaClass}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right: Content Management (FAQ, Terms, Policies) (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border dark:border-[#F4B057]/40 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F4B057]" />
              {isDe ? "Inhaltsverwaltung & Rechtliche Richtlinien" : "Content Management & Platform Policies"}
            </h2>

            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {isDe ? "Käuferschutz & AGB Zusammenfassung" : "Buyer Escrow Protection & Terms Summary"}
              </label>
              <textarea
                rows={3}
                value={termsText}
                placeholder={
                  isDe ? "Kurze Zusammenfassung des Käuferschutzes" : "Short summary of the buyer protection policy"
                }
                onChange={(e) => setTermsText(e.target.value)}
                className={textareaClass}
              ></textarea>
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                {isDe ? "FAQ-Wissensbasis für die KI" : "Platform FAQ Knowledge Base (AI)"}
              </label>
              <textarea
                rows={4}
                value={faqQuestions}
                placeholder={isDe ? "F: … A: …" : "Q: … A: …"}
                onChange={(e) => setFaqQuestions(e.target.value)}
                className={textareaClass}
              ></textarea>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {isDe
                  ? "Öffentliche FAQs, AGB und Datenschutz werden unter Einstellungen verwaltet."
                  : "Public FAQs, Terms and Privacy Policy are managed under Settings."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#F4B057] shrink-0" />
              <span>
                {isDe
                  ? "Die Einstellungen werden zentral im Backend gespeichert und gelten für alle Sprachansichten."
                  : "Settings are stored centrally in the backend and apply to both English and German views."}
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl bg-[#F4B057] hover:bg-[#F4B057]/90 text-black font-extrabold text-sm shadow-md cursor-pointer transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving
                  ? isDe
                    ? "Speichern…"
                    : "Saving…"
                  : isDe
                    ? "Alle Anpassungen speichern"
                    : "Save All Customizations"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
