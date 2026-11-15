"use client";

import type { LucideIcon } from "lucide-react";
import { Ban, CheckCircle2, Clock, Mail, Phone, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX, XCircle } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import type { IdentityStatus, PersonSummary, VerificationSummary } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "bad" | "muted";

const toneClass: Record<Tone, string> = {
  ok: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  bad: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  muted: "bg-muted text-muted-foreground border-border",
};

function Chip({ tone, icon: Icon, label, title }: { tone: Tone; icon: LucideIcon; label: string; title?: string }) {
  return (
    <span
      title={title ?? label}
      className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", toneClass[tone])}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export const ACCOUNT_STATUSES = ["ACTIVE", "PENDING", "SUSPENDED", "BLOCKED", "DELETED"] as const;

export function AccountStatusControl({
  status,
  disabled,
  onChange,
}: {
  status: string;
  disabled?: boolean;
  onChange: (status: string) => void;
}) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  return (
    <label className="flex min-w-[10rem] flex-col gap-1 text-xs font-medium text-muted-foreground">
      {isDe ? "Kontostatus" : "Account status"}
      <select
        value={ACCOUNT_STATUSES.includes(status as (typeof ACCOUNT_STATUSES)[number]) ? status : "ACTIVE"}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="border-border bg-background text-foreground h-9 rounded-md border px-2 text-sm disabled:opacity-60"
      >
        {ACCOUNT_STATUSES.map((value) => (
          <option key={value} value={value}>
            {accountStatusLabel(value, isDe)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function accountStatusLabel(status: PersonSummary["status"] | string, isDe: boolean) {
  switch (status) {
    case "ACTIVE":
      return isDe ? "Aktiv" : "Active";
    case "PENDING":
      return isDe ? "Ausstehend" : "Pending";
    case "BLOCKED":
      return isDe ? "Gesperrt" : "Blocked";
    case "SUSPENDED":
      return isDe ? "Suspendiert" : "Suspended";
    case "DELETED":
      return isDe ? "Gelöscht" : "Deleted";
    default:
      return status;
  }
}

export function AccountStatusBadge({ status }: { status: PersonSummary["status"] | string }) {
  const { language } = useTranslation();
  const label = accountStatusLabel(status, language === "DE");
  if (status === "ACTIVE") return <Chip tone="ok" icon={CheckCircle2} label={label} />;
  if (status === "PENDING") return <Chip tone="warn" icon={Clock} label={label} />;
  if (status === "BLOCKED" || status === "SUSPENDED") return <Chip tone="bad" icon={Ban} label={label} />;
  return <Chip tone="muted" icon={XCircle} label={label} />;
}

export function identityLabel(status: IdentityStatus, isDe: boolean) {
  switch (status) {
    case "APPROVED":
      return isDe ? "ID verifiziert" : "ID verified";
    case "PENDING":
      return isDe ? "ID in Prüfung" : "ID in review";
    case "REJECTED":
      return isDe ? "ID abgelehnt" : "ID rejected";
    default:
      return isDe ? "Keine ID-Prüfung" : "No ID check";
  }
}

export function IdentityBadge({ status }: { status: IdentityStatus }) {
  const { language } = useTranslation();
  const label = identityLabel(status, language === "DE");
  if (status === "APPROVED") return <Chip tone="ok" icon={ShieldCheck} label={label} />;
  if (status === "PENDING") return <Chip tone="warn" icon={ShieldAlert} label={label} />;
  if (status === "REJECTED") return <Chip tone="bad" icon={ShieldX} label={label} />;
  return <Chip tone="muted" icon={ShieldQuestion} label={label} />;
}

/**
 * Email / phone / identity verification chips. Buyers need email + Swiss phone;
 * sellers and providers additionally need an approved ID check.
 */
export function VerificationBadges({
  verification,
  role,
  className,
}: {
  verification: VerificationSummary;
  role?: "buyer" | "seller";
  className?: string;
}) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const ready = role === "seller" ? verification.canSell : verification.canBuy;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      <Chip
        tone={verification.email ? "ok" : "muted"}
        icon={Mail}
        label={isDe ? "E-Mail" : "Email"}
        title={verification.email ? (isDe ? "E-Mail bestätigt" : "Email verified") : isDe ? "E-Mail nicht bestätigt" : "Email not verified"}
      />
      <Chip
        tone={verification.phone ? "ok" : "muted"}
        icon={Phone}
        label={isDe ? "Telefon" : "Phone"}
        title={verification.phone ? (isDe ? "Schweizer Mobilnummer bestätigt" : "Swiss mobile verified") : isDe ? "Telefon nicht bestätigt" : "Phone not verified"}
      />
      <IdentityBadge status={verification.identity} />
      {role && (
        <Chip
          tone={ready ? "ok" : "warn"}
          icon={ready ? CheckCircle2 : Clock}
          label={
            role === "seller"
              ? ready
                ? isDe ? "Darf verkaufen" : "Can sell"
                : isDe ? "Verkauf gesperrt" : "Cannot sell yet"
              : ready
                ? isDe ? "Darf kaufen" : "Can buy"
                : isDe ? "Kauf gesperrt" : "Cannot buy yet"
          }
        />
      )}
    </div>
  );
}
