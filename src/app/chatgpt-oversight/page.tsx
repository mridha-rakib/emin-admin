"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Search,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDateTime, formatMoney, toNumber, useApi, type Page, type PersonListItem } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type NegotiationStatus = "SUBMITTED" | "ACCEPTED" | "COUNTERED" | "REJECTED";

type RawNegotiationLog = {
  _id: string;
  productId?: string;
  buyerId?: string;
  sellerId?: string;
  offerAmount?: unknown;
  counterAmount?: unknown;
  status?: NegotiationStatus;
  messages?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type RawProduct = { _id: string; title?: string; price?: unknown; currency?: string; sellerName?: string };
type RawSellerProfile = { _id: string; displayName?: string; businessName?: string };
type RawSetting = { _id: string; key: string; value: unknown };

type OfferRules = { maxPlatformDiscount: number; allowOffers: boolean; forbiddenKeywords: string };

const OFFER_RULES_KEY = "offer-rules";

const textOf = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : "");

const messageText = (message: Record<string, unknown>) =>
  textOf(message.text) || textOf(message.content) || textOf(message.message) || textOf(message.body);

const parseRules = (value: unknown): OfferRules | null => {
  if (!value || typeof value !== "object") return null;
  const rules = value as Record<string, unknown>;
  return {
    maxPlatformDiscount: toNumber(rules.maxPlatformDiscount),
    allowOffers: rules.allowOffers !== false,
    forbiddenKeywords: typeof rules.forbiddenKeywords === "string" ? rules.forbiddenKeywords : "",
  };
};

export default function ChatGptOversightPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";

  const { data: logPage, error, isLoading, reload } = useApi<Page<RawNegotiationLog>>("/ai-negotiation-logs?page=1&limit=100");
  const { data: productPage } = useApi<Page<RawProduct>>("/products?page=1&limit=100");
  const { data: people } = useApi<{ items: PersonListItem[] }>("/admin/people");
  const { data: sellerPage } = useApi<Page<RawSellerProfile>>("/seller-profiles?page=1&limit=100");
  const { data: settingsPage, isLoading: rulesLoading, error: rulesLoadError } = useApi<Page<RawSetting>>("/settings?page=1&limit=100");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | NegotiationStatus>("All");

  const storedSetting = settingsPage?.items.find((item) => item.key === OFFER_RULES_KEY) ?? null;
  const [settingId, setSettingId] = useState<string | null>(null);
  const [savedRules, setSavedRules] = useState<OfferRules | null>(null);
  const [maxPlatformDiscount, setMaxPlatformDiscount] = useState("");
  const [allowOffers, setAllowOffers] = useState(true);
  const [forbiddenKeywords, setForbiddenKeywords] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!storedSetting) return;
    const rules = parseRules(storedSetting.value);
    setSettingId(storedSetting._id);
    setSavedRules(rules);
    if (rules) {
      setMaxPlatformDiscount(String(rules.maxPlatformDiscount));
      setAllowOffers(rules.allowOffers);
      setForbiddenKeywords(rules.forbiddenKeywords);
    }
  }, [storedSetting]);

  const handleSavePlatformRules = async (e: React.FormEvent) => {
    e.preventDefault();
    const discount = Number(maxPlatformDiscount);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setSaveError(isDe ? "Bitte einen Rabatt zwischen 0 und 100 % angeben." : "Enter a discount between 0 and 100 %.");
      return;
    }
    const rules: OfferRules = { maxPlatformDiscount: discount, allowOffers, forbiddenKeywords: forbiddenKeywords.trim() };
    setIsSaving(true);
    setSaveError("");
    try {
      const saved = settingId
        ? await apiRequest<RawSetting>(`/settings/${settingId}`, { method: "PATCH", body: JSON.stringify({ payload: { value: rules } }) })
        : await apiRequest<RawSetting>("/settings", {
            method: "POST",
            body: JSON.stringify({
              payload: { key: OFFER_RULES_KEY, value: rules, description: "Platform-wide rules for buyer offers and negotiations" },
            }),
          });
      if (saved?._id) setSettingId(saved._id);
      setSavedRules(rules);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      if (err instanceof SessionExpiredError) return;
      setSaveError(err instanceof Error ? err.message : isDe ? "Regeln konnten nicht gespeichert werden." : "Could not save rules.");
    } finally {
      setIsSaving(false);
    }
  };

  const logs = useMemo(() => {
    const products = new Map((productPage?.items ?? []).map((p) => [p._id, p]));
    const persons = new Map((people?.items ?? []).map((p) => [p.id, p]));
    const sellers = new Map((sellerPage?.items ?? []).map((s) => [s._id, s]));
    return (logPage?.items ?? []).map((log) => {
      const product = log.productId ? products.get(log.productId) : undefined;
      const seller = log.sellerId ? sellers.get(log.sellerId) : undefined;
      const buyer = log.buyerId ? persons.get(log.buyerId) : undefined;
      const messages = (log.messages ?? []).map(messageText).filter(Boolean);
      const status: NegotiationStatus = log.status ?? "SUBMITTED";
      const offer = toNumber(log.offerAmount);
      const counter = log.counterAmount != null ? toNumber(log.counterAmount) : null;
      return {
        id: log._id,
        productName: product?.title || textOf(log.metadata?.productName) || (isDe ? "Unbekanntes Produkt" : "Unknown product"),
        originalPrice: product?.price != null ? toNumber(product.price) : null,
        currency: product?.currency || "CHF",
        buyerName: buyer?.name || textOf(log.metadata?.buyerName) || "—",
        sellerName: seller?.displayName || seller?.businessName || product?.sellerName || textOf(log.metadata?.sellerName) || "—",
        offer,
        counter,
        finalPrice: status === "ACCEPTED" ? counter ?? offer : null,
        status,
        createdAt: log.createdAt,
        transcript: messages.length ? messages[messages.length - 1] : textOf(log.metadata?.note) || textOf(log.metadata?.reason),
        messageCount: messages.length,
      };
    });
  }, [logPage, productPage, people, sellerPage, isDe]);

  // Metrics
  const totalNegotiations = logs.length;
  const acceptedNegotiations = logs.filter((l) => l.status === "ACCEPTED").length;
  const rejectedNegotiations = logs.filter((l) => l.status === "REJECTED").length;
  const successRate = totalNegotiations > 0 ? Math.round((acceptedNegotiations / totalNegotiations) * 100) : 0;

  const filteredLogs = logs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProduct = log.productName.toLowerCase().includes(q);
      const matchBuyer = log.buyerName.toLowerCase().includes(q);
      const matchSeller = log.sellerName.toLowerCase().includes(q);
      const matchSnippet = log.transcript.toLowerCase().includes(q);
      if (!matchProduct && !matchBuyer && !matchSeller && !matchSnippet) return false;
    }
    return statusFilter === "All" || log.status === statusFilter;
  });

  const statusLabel = (status: NegotiationStatus) =>
    status === "ACCEPTED"
      ? isDe ? "Akzeptiert" : "Accepted"
      : status === "REJECTED"
      ? isDe ? "Abgelehnt" : "Declined"
      : status === "COUNTERED"
      ? isDe ? "Gegenangebot" : "Countered"
      : isDe ? "Eingereicht" : "Submitted";

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-primary" />
            {isDe ? "Angebote & Verhandlungs-Audit" : "Offers & Negotiation Audit"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isDe
              ? "Überwachen Sie alle Preisverhandlungen und legen Sie plattformweite Angebotsregeln fest."
              : "Review customer price offers and counter-offers, and define platform-wide offer rules."}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            {isDe ? "Gesamte Angebote" : "Total Offers Processed"}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{isLoading ? "—" : totalNegotiations}</span>
            <span className="text-xs font-medium text-muted-foreground">{isDe ? "Sitzungen" : "Sessions"}</span>
          </div>
        </div>

        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-500 block mb-1">
            {isDe ? "Vereinbarte Angebote" : "Deals Accepted"}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{isLoading ? "—" : acceptedNegotiations}</span>
            <span className="text-xs font-semibold text-emerald-400">{successRate}% {isDe ? "Quote" : "Rate"}</span>
          </div>
        </div>

        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-amber-500 block mb-1">
            {isDe ? "Abgelehnte Angebote" : "Offers Declined"}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">{isLoading ? "—" : rejectedNegotiations}</span>
          </div>
        </div>

        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-primary block mb-1">
            {isDe ? "Maximaler Rabattdeckel" : "Platform Discount Cap"}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{savedRules ? `${savedRules.maxPlatformDiscount}%` : "—"}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {savedRules ? (isDe ? "Gespeichert" : "Saved") : isDe ? "Nicht festgelegt" : "Not set"}
            </span>
          </div>
        </div>
      </div>

      {/* Platform-wide Rules Configuration Card */}
      <div className="bg-card border border-border dark:border-primary/30 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              {isDe ? "Plattformweite Angebotsregeln" : "Platform-Wide Offer Rules"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isDe
                ? "Diese Richtlinien werden in den Plattform-Einstellungen gespeichert."
                : "These policies are stored in the platform settings."}
            </p>
          </div>

          {savedSuccess && (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 self-start">
              <CheckCircle2 className="w-4 h-4" />
              {isDe ? "Regeln erfolgreich gespeichert!" : "Rules Saved Successfully!"}
            </span>
          )}
        </div>

        {rulesLoading || rulesLoadError ? (
          <DataState isLoading={rulesLoading} error={rulesLoadError} emptyTitle="" />
        ) : (
        <form onSubmit={handleSavePlatformRules} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              {isDe ? "Maximaler Plattform-Rabatt (%)" : "Max Platform Discount (%)"}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={maxPlatformDiscount}
              placeholder={isDe ? "z. B. 25" : "e.g. 25"}
              onChange={(e) => setMaxPlatformDiscount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {isDe ? "Höchster zulässiger Rabatt gegenüber dem Listenpreis." : "Highest discount allowed below the listing price."}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              {isDe ? "Verbotene Begriffe (Betrugsprävention)" : "Fraud Blacklist Phrases"}
            </label>
            <input
              type="text"
              value={forbiddenKeywords}
              placeholder={isDe ? "Kommagetrennte Begriffe" : "Comma-separated phrases"}
              onChange={(e) => setForbiddenKeywords(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {isDe ? "Begriffe, die auf Plattformumgehung oder Betrug hinweisen." : "Phrases that indicate circumvention or external payments."}
            </span>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
                {isDe ? "Käuferangebote Status" : "Buyer Offers Status"}
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="globalAiToggle"
                  checked={allowOffers}
                  onChange={(e) => setAllowOffers(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="globalAiToggle" className="text-xs font-semibold text-foreground cursor-pointer">
                  {allowOffers
                    ? isDe ? "Direktangebote Aktiv" : "Direct Offers Active Globally"
                    : isDe ? "Global Pausiert" : "Temporarily Paused"}
                </label>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              {saveError && <p className="text-xs font-medium text-destructive">{saveError}</p>}
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? (isDe ? "Speichern…" : "Saving…") : isDe ? "Regeln Speichern" : "Save Global Rules"}
              </Button>
            </div>
          </div>
        </form>
        )}
      </div>

      {/* Negotiation Logs Section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {isDe ? "Kundenangebot- & Verhandlungsprotokolle" : "Customer Offer & Negotiation Logs"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isDe ? "Aufzeichnungen von Preisangeboten und Gegenangeboten." : "Audit trail of customer price offers and counter-offers."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border rounded-xl overflow-x-auto">
              {(["All", "SUBMITTED", "COUNTERED", "ACCEPTED", "REJECTED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "All" ? (isDe ? "Alle" : "All") : statusLabel(st)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isDe ? "Suche nach Produkt, Käufer..." : "Search logs..."}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {isLoading || error || logs.length === 0 ? (
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error && logs.length === 0}
            emptyTitle={isDe ? "Noch keine Angebote" : "No offers yet"}
            emptyDescription={
              isDe
                ? "Sobald Käufer Preisangebote abgeben, erscheinen die Verhandlungen hier."
                : "Negotiations will appear here as soon as buyers submit price offers."
            }
            onRetry={() => void reload()}
          />
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {isDe ? "Keine Einträge entsprechen dem Filter." : "No logs match the current filter."}
          </div>
        ) : (
        /* Logs Table */
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">{isDe ? "Produkt" : "Product"}</th>
                <th className="py-3 px-4">{isDe ? "Käufer & Verkäufer" : "Buyer & Seller"}</th>
                <th className="py-3 px-4">{isDe ? "Angebot / Finaler Preis" : "Offer / Final Price"}</th>
                <th className="py-3 px-4">{isDe ? "Status" : "Status"}</th>
                <th className="py-3 px-4">{isDe ? "Zeitstempel" : "Timestamp"}</th>
                <th className="py-3 px-4">{isDe ? "Letzte Nachricht" : "Latest Message"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <span className="truncate block max-w-[180px]">{log.productName}</span>
                    {log.originalPrice != null && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {isDe ? "Listenpreis" : "List price"}: {formatMoney(log.originalPrice, log.currency)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-foreground">{log.buyerName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isDe ? "Verkäufer" : "Seller"}: {log.sellerName}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-foreground block">{formatMoney(log.offer, log.currency)}</span>
                    {log.finalPrice != null ? (
                      <span className="text-[10px] font-bold text-emerald-500">
                        Deal: {formatMoney(log.finalPrice, log.currency)}
                      </span>
                    ) : log.counter != null ? (
                      <span className="text-[10px] font-semibold text-primary">
                        {isDe ? "Gegenangebot" : "Counter"}: {formatMoney(log.counter, log.currency)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{isDe ? "Kein Deal" : "No deal"}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {statusLabel(log.status)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>

                  <td className="py-3.5 px-4">
                    {log.transcript ? (
                      <p className="text-[11px] text-foreground bg-muted/40 p-2.5 rounded-xl border border-border max-w-md">
                        {log.transcript}
                        {log.messageCount > 1 && (
                          <span className="block text-[10px] text-muted-foreground mt-1">
                            {log.messageCount} {isDe ? "Nachrichten" : "messages"}
                          </span>
                        )}
                      </p>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
