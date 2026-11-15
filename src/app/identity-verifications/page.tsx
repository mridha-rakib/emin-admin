"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Eye, IdCard, Lock, Mail, Phone, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/LanguageContext";

type Status = "PENDING" | "APPROVED" | "REJECTED";
type Side = "FRONT" | "BACK" | "SELFIE" | "LEFT" | "RIGHT";
type DocumentType = "SWISS_ID_CARD" | "SWISS_PASSPORT" | "RESIDENCE_PERMIT_B" | "RESIDENCE_PERMIT_C" | "LIVENESS_CHECK";

type VerificationUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneVerifiedAt?: string;
  emailVerifiedAt?: string;
  createdAt?: string;
  identityRejectionCount?: number;
  identityUploadBlockedAt?: string;
};

type Reviewer = { firstName?: string; lastName?: string; email?: string } | null;

type DocumentItem = {
  side: Side;
  status: Status;
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: Reviewer | string;
  imageDeletedAt?: string;
  hasImage: boolean;
  imageUrl?: string;
};

type Verification = {
  _id: string;
  userId: VerificationUser | null;
  documentType: DocumentType;
  status: Status;
  items: DocumentItem[];
  createdAt: string;
  updatedAt: string;
};

type VerificationDetail = Verification & { imageUrlExpiresInSeconds: number; maxRejections: number };

type ListResponse = {
  items: Verification[];
  meta: { page: number; limit: number; total: number; pages: number };
  counts: Partial<Record<Status, number>>;
};

const DOCUMENT_LABELS: Record<DocumentType, { en: string; de: string }> = {
  SWISS_ID_CARD: { en: "Swiss ID card", de: "Schweizer ID" },
  SWISS_PASSPORT: { en: "Swiss passport", de: "Schweizer Pass" },
  RESIDENCE_PERMIT_B: { en: "Residence permit B", de: "Ausweis B" },
  RESIDENCE_PERMIT_C: { en: "Residence permit C", de: "Ausweis C" },
  LIVENESS_CHECK: { en: "Selfie / liveness check", de: "Selfie / Lebenderkennung" },
};

const REJECTION_PRESETS = [
  { en: "The photo is blurry or cut off. Please retake it with all corners visible.", de: "Das Foto ist unscharf oder abgeschnitten. Bitte mit allen sichtbaren Ecken neu aufnehmen." },
  { en: "There is glare on the document. Please retake it without reflections.", de: "Das Dokument spiegelt. Bitte ohne Reflexionen neu aufnehmen." },
  { en: "The name does not match the account.", de: "Der Name stimmt nicht mit dem Konto überein." },
  { en: "The document is expired or not an accepted Swiss document.", de: "Das Dokument ist abgelaufen oder kein akzeptiertes Schweizer Dokument." },
];

const fullName = (user?: VerificationUser | null) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Unknown user";

const reviewerName = (reviewer?: Reviewer | string) =>
  reviewer && typeof reviewer === "object" ? [reviewer.firstName, reviewer.lastName].filter(Boolean).join(" ") || reviewer.email : undefined;

const formatDateTime = (value: string | undefined, isDe: boolean) =>
  value
    ? new Intl.DateTimeFormat(isDe ? "de-CH" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const statusStyles: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

function statusLabel(status: Status, isDe: boolean) {
  return { PENDING: isDe ? "Offen" : "Pending", APPROVED: isDe ? "Genehmigt" : "Approved", REJECTED: isDe ? "Abgelehnt" : "Rejected" }[status];
}

function sideLabel(side: Side, isDe: boolean) {
  const labels: Record<Side, { en: string; de: string }> = {
    FRONT: { en: "Front", de: "Vorderseite" },
    BACK: { en: "Back", de: "Rückseite" },
    SELFIE: { en: "Straight selfie", de: "Selfie von vorne" },
    LEFT: { en: "Turn left", de: "Nach links drehen" },
    RIGHT: { en: "Turn right", de: "Nach rechts drehen" },
  };
  return labels[side][isDe ? "de" : "en"];
}

function StatusBadge({ status, isDe }: { status: Status; isDe: boolean }) {
  return <Badge variant="outline" className={cn("font-bold", statusStyles[status])}>{statusLabel(status, isDe)}</Badge>;
}

function ItemChip({ item, isDe }: { item: DocumentItem; isDe: boolean }) {
  const Icon = item.status === "APPROVED" ? CheckCircle2 : item.status === "REJECTED" ? XCircle : Clock;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", statusStyles[item.status])}>
      <Icon className="h-3 w-3" />
      {sideLabel(item.side, isDe)}
    </span>
  );
}

/** One document photo with its own approve / reject controls. */
function DocumentReviewCard({
  item,
  isDe,
  onDecide,
}: {
  item: DocumentItem;
  isDe: boolean;
  onDecide: (side: Side, decision: "approve" | "reject", reason?: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const decide = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !reason.trim()) {
      setError(isDe ? "Bitte einen Ablehnungsgrund angeben." : "Please enter a reason for the rejection.");
      return;
    }
    setIsBusy(true);
    setError("");
    try {
      await onDecide(item.side, decision, reason.trim());
      setReason("");
    } catch (decideError) {
      setError(decideError instanceof Error ? decideError.message : "Decision failed.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">{sideLabel(item.side, isDe)}</p>
        <StatusBadge status={item.status} isDe={isDe} />
      </div>

      {item.imageUrl ? (
        <a href={item.imageUrl} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-border bg-muted">
          <div className="aspect-[1.58] w-full overflow-hidden">
            <img src={item.imageUrl} alt={sideLabel(item.side, isDe)} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
          </div>
        </a>
      ) : (
        <div className="flex aspect-[1.58] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center text-xs text-muted-foreground">
          {isDe ? "Bild nach dem Entscheid gelöscht (Datenminimierung)." : "Image deleted after the decision (data minimisation)."}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {isDe ? "Hochgeladen: " : "Uploaded: "}{formatDateTime(item.uploadedAt, isDe)}
        {item.reviewedAt && (
          <>
            {" · "}{isDe ? "Geprüft: " : "Reviewed: "}{formatDateTime(item.reviewedAt, isDe)}
            {reviewerName(item.reviewedBy) && ` (${reviewerName(item.reviewedBy)})`}
          </>
        )}
      </p>
      {item.status === "REJECTED" && item.rejectionReason && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">{item.rejectionReason}</p>
      )}

      {item.status === "PENDING" && (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            {REJECTION_PRESETS.map((preset) => (
              <button
                key={preset.en}
                type="button"
                onClick={() => setReason(isDe ? preset.de : preset.en)}
                className="rounded-lg border border-border px-2 py-1 text-left text-[11px] text-muted-foreground hover:bg-muted"
              >
                {(isDe ? preset.de : preset.en).slice(0, 40)}…
              </button>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none focus:border-primary"
            placeholder={isDe ? "Ablehnungsgrund (wird dem Benutzer angezeigt)" : "Rejection reason (shown to the user)"}
          />
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive hover:text-white" disabled={isBusy} onClick={() => void decide("reject")}>
              <XCircle className="mr-1.5 h-4 w-4" />
              {isDe ? "Ablehnen" : "Reject"}
            </Button>
            <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isBusy} onClick={() => void decide("approve")}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {isDe ? "Genehmigen" : "Approve"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IdentityVerificationsPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const [status, setStatus] = useState<Status | "ALL">("PENDING");
  const [data, setData] = useState<ListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const query = status === "ALL" ? "" : `?status=${status}`;
      setData(await apiRequest<ListResponse>(`/admin/identity-verifications${query}`));
    } catch (loadError) {
      if (loadError instanceof SessionExpiredError) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load verifications.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      setDetail(await apiRequest<VerificationDetail>(`/admin/identity-verifications/${id}`));
    } catch (detailError) {
      if (!(detailError instanceof SessionExpiredError)) {
        setError(detailError instanceof Error ? detailError.message : "Could not open verification.");
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  const decideItem = async (side: Side, decision: "approve" | "reject", reason?: string) => {
    if (!detail) return;
    const updated = await apiRequest<VerificationDetail>(`/admin/identity-verifications/${detail._id}/items/${side}/${decision}`, {
      method: "POST",
      body: JSON.stringify(decision === "reject" ? { reason } : {}),
    });
    setDetail(updated);
    void load();
  };

  const unblockUploads = async () => {
    if (!detail) return;
    const updated = await apiRequest<VerificationDetail>(`/admin/identity-verifications/${detail._id}/unblock-uploads`, {
      method: "POST",
    });
    setDetail(updated);
    void load();
  };

  const tabs: Array<{ key: Status | "ALL"; label: string; count?: number }> = [
    { key: "PENDING", label: isDe ? "Offen" : "Pending", count: data?.counts.PENDING },
    { key: "APPROVED", label: isDe ? "Genehmigt" : "Approved", count: data?.counts.APPROVED },
    { key: "REJECTED", label: isDe ? "Abgelehnt" : "Rejected", count: data?.counts.REJECTED },
    { key: "ALL", label: isDe ? "Alle" : "All" },
  ];

  const pendingInDetail = detail?.items.filter((item) => item.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-foreground">
            <IdCard className="h-6 w-6 text-primary" />
            {isDe ? "Ausweisprüfung" : "Identity Verification"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDe
              ? "Jedes Dokumentfoto einzeln prüfen: Schweizer ID, Pass, Ausweis B oder C."
              : "Review every document photo individually: Swiss ID card, passport, or permit B/C."}
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={isLoading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          {isDe ? "Aktualisieren" : "Refresh"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatus(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
              status === tab.key ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("rounded-full px-2 text-xs", status === tab.key ? "bg-white/20" : "bg-muted")}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{isDe ? "Benutzer" : "User"}</th>
              <th className="px-4 py-3">{isDe ? "Dokument" : "Document"}</th>
              <th className="px-4 py-3">{isDe ? "Fotos" : "Photos"}</th>
              <th className="hidden px-4 py-3 md:table-cell">{isDe ? "Kontakt" : "Contact checks"}</th>
              <th className="hidden px-4 py-3 md:table-cell">{isDe ? "Aktualisiert" : "Updated"}</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{isDe ? "Wird geladen…" : "Loading…"}</td></tr>
            ) : !data || data.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{isDe ? "Keine Einträge." : "No verifications in this list."}</td></tr>
            ) : (
              data.items.map((verification) => {
                const pending = verification.items.filter((item) => item.status === "PENDING").length;
                return (
                  <tr key={verification._id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{fullName(verification.userId)}</p>
                      <p className="text-xs text-muted-foreground">{verification.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">{DOCUMENT_LABELS[verification.documentType][isDe ? "de" : "en"]}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {verification.items.map((item) => <ItemChip key={item.side} item={item} isDe={isDe} />)}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex gap-2 text-xs">
                        <span className={cn("flex items-center gap-1", verification.userId?.emailVerifiedAt ? "text-emerald-600" : "text-muted-foreground")}>
                          <Mail className="h-3.5 w-3.5" />{verification.userId?.emailVerifiedAt ? "✓" : "✗"}
                        </span>
                        <span className={cn("flex items-center gap-1", verification.userId?.phoneVerifiedAt ? "text-emerald-600" : "text-muted-foreground")}>
                          <Phone className="h-3.5 w-3.5" />{verification.userId?.phoneVerifiedAt ? "✓" : "✗"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDateTime(verification.updatedAt, isDe)}</td>
                    <td className="px-4 py-3"><StatusBadge status={verification.status} isDe={isDe} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant={pending > 0 ? "default" : "outline"} onClick={() => void openDetail(verification._id)} disabled={isDetailLoading}>
                        <Eye className="mr-1.5 h-4 w-4" />
                        {pending > 0 ? (isDe ? `Prüfen (${pending})` : `Review (${pending})`) : (isDe ? "Ansehen" : "View")}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {fullName(detail.userId)}
                  <StatusBadge status={detail.status} isDe={isDe} />
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">{isDe ? "E-Mail: " : "Email: "}</span>{detail.userId?.email} {detail.userId?.emailVerifiedAt && <CheckCircle2 className="inline h-4 w-4 text-emerald-600" />}</p>
                <p><span className="text-muted-foreground">{isDe ? "Mobil: " : "Mobile: "}</span>{detail.userId?.phone || "—"} {detail.userId?.phoneVerifiedAt && <CheckCircle2 className="inline h-4 w-4 text-emerald-600" />}</p>
                <p><span className="text-muted-foreground">{isDe ? "Dokument: " : "Document: "}</span>{DOCUMENT_LABELS[detail.documentType][isDe ? "de" : "en"]}</p>
                <p><span className="text-muted-foreground">{isDe ? "Eingereicht: " : "Submitted: "}</span>{formatDateTime(detail.createdAt, isDe)}</p>
              </div>

              <div className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm",
                detail.userId?.identityUploadBlockedAt ? "border-amber-300 bg-amber-50 text-amber-900" : "border-border bg-muted/20"
              )}>
                <span>
                  {isDe ? "Abgelehnte Versuche" : "Rejected attempts"}: <strong>{detail.userId?.identityRejectionCount ?? 0} / {detail.maxRejections}</strong>
                  {detail.userId?.identityUploadBlockedAt && ` · ${isDe ? "Uploads gesperrt" : "Uploads blocked"}`}
                </span>
                {detail.userId?.identityUploadBlockedAt && (
                  <Button size="sm" variant="outline" onClick={() => void unblockUploads()}>
                    {isDe ? "Uploads entsperren" : "Unblock uploads"}
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {isDe
                  ? "Prüfen Sie jedes Foto: gültiges, akzeptiertes Schweizer Dokument, Name passt zum Konto, gut lesbar. Die Identität gilt als bestätigt, wenn alle Fotos genehmigt sind."
                  : "Check each photo: valid, accepted Swiss document, name matches the account, clearly readable. Identity is confirmed once every photo is approved."}
              </p>

              <div className={cn("grid gap-4", detail.items.length > 1 && "sm:grid-cols-2")}>
                {detail.items.map((item) => (
                  <DocumentReviewCard key={`${item.side}-${item.uploadedAt}`} item={item} isDe={isDe} onDecide={decideItem} />
                ))}
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                {isDe
                  ? "Private, verschlüsselte Dateien. Links laufen nach 5 Minuten ab; jedes Bild wird nach seinem Entscheid gelöscht."
                  : "Private, encrypted files. Links expire after 5 minutes; each image is deleted once it has been decided."}
                {pendingInDetail > 0 && (
                  <button type="button" onClick={() => void openDetail(detail._id)} className="ml-1 font-semibold text-primary underline">
                    {isDe ? "Neu laden" : "Reload"}
                  </button>
                )}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
