"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Trash2,
  Tag,
  PackageSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDate, formatMoney, toNumber, useApi, type Page } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type ApiProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "SOLD" | "ARCHIVED";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

type RawProduct = {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  condition?: "NEW" | "LIKE_NEW" | "USED" | "REFURBISHED";
  listingType?: string;
  price?: unknown;
  buyNowPrice?: unknown;
  minNegotiablePrice?: unknown;
  currency?: string;
  quantity?: number;
  color?: string;
  tags?: string[];
  sellerName?: string;
  sellerEmail?: string;
  allowNegotiation?: boolean;
  shippingTerms?: string;
  returnPolicy?: string;
  images?: Array<{ url?: string; isPrimary?: boolean; sortOrder?: number } | string>;
  status?: ApiProductStatus;
  approvalStatus?: ApprovalStatus;
  createdAt?: string;
};

type ModerationState = "Live" | "Hidden" | "Sold";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  condition: string;
  color: string;
  price: number;
  minNegotiablePrice: number;
  currency: string;
  quantity: number;
  image: string;
  sellerName: string;
  sellerEmail: string;
  allowNegotiation: boolean;
  shippingTerms: string;
  returnPolicy: string;
  status: ApiProductStatus;
  approvalStatus: ApprovalStatus;
  moderation: ModerationState;
  createdAt?: string;
};

const conditionLabel = (condition: RawProduct["condition"], isDe: boolean) => {
  switch (condition) {
    case "NEW":
      return isDe ? "Neu" : "Brand New";
    case "LIKE_NEW":
      return isDe ? "Wie neu" : "Like New";
    case "USED":
      return isDe ? "Gebraucht" : "Used";
    case "REFURBISHED":
      return isDe ? "Generalüberholt" : "Refurbished";
    default:
      return "—";
  }
};

const primaryImage = (images: RawProduct["images"]) => {
  if (!images?.length) return "";
  const sorted = [...images].sort((a, b) => {
    const pa = typeof a === "string" ? 0 : a.isPrimary ? -1 : a.sortOrder ?? 0;
    const pb = typeof b === "string" ? 0 : b.isPrimary ? -1 : b.sortOrder ?? 0;
    return pa - pb;
  });
  const first = sorted[0];
  return (typeof first === "string" ? first : first?.url) ?? "";
};

const moderationOf = (status: ApiProductStatus, approval: ApprovalStatus): ModerationState => {
  if (status === "SOLD") return "Sold";
  if (status === "ACTIVE" && approval === "APPROVED") return "Live";
  return "Hidden";
};

const toProductRow = (item: RawProduct, isDe: boolean): ProductRow => {
  const status = item.status ?? "DRAFT";
  const approvalStatus = item.approvalStatus ?? "PENDING";
  const price = toNumber(item.price ?? item.buyNowPrice);
  return {
    id: item._id,
    name: item.title || (isDe ? "Unbenanntes Angebot" : "Untitled listing"),
    description: item.description ?? "",
    category: item.category || "—",
    subcategory: item.subcategory ?? "",
    condition: conditionLabel(item.condition, isDe),
    color: item.color ?? "",
    price,
    minNegotiablePrice: toNumber(item.minNegotiablePrice, price),
    currency: item.currency || "CHF",
    quantity: item.quantity ?? 0,
    image: primaryImage(item.images),
    sellerName: item.sellerName || "—",
    sellerEmail: item.sellerEmail ?? "",
    allowNegotiation: item.allowNegotiation ?? false,
    shippingTerms: item.shippingTerms ?? "",
    returnPolicy: item.returnPolicy ?? "",
    status,
    approvalStatus,
    moderation: moderationOf(status, approvalStatus),
    createdAt: item.createdAt,
  };
};

function ProductThumb({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`relative overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <PackageSearch className="w-5 h-5 text-muted-foreground/60" />
      )}
    </div>
  );
}

export default function ProductsModerationPage() {
  const { language } = useTranslation();
  const isDe = language === "DE";

  const { data, error, isLoading, reload, setData } = useApi<Page<RawProduct>>("/products?page=1&limit=100");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | ModerationState>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const products = useMemo(() => (data?.items ?? []).map((item) => toProductRow(item, isDe)), [data, isDe]);
  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  const runAction = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setActionError("");
    try {
      await action();
    } catch (err) {
      if (err instanceof SessionExpiredError) return;
      setActionError(err instanceof Error ? err.message : isDe ? "Aktion fehlgeschlagen." : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  /** Approve publishes the listing (ACTIVE + APPROVED); flag takes it off the marketplace (INACTIVE + REJECTED). */
  const setStatus = (id: string, status: ApiProductStatus) =>
    runAction(id, async () => {
      const approvalStatus: ApprovalStatus = status === "ACTIVE" ? "APPROVED" : "REJECTED";
      const updated = await apiRequest<RawProduct | null>(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ payload: { status, approvalStatus } }),
      });
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.map((p) => (p._id === id ? { ...p, ...(updated ?? {}), status: updated?.status ?? status } : p)) }
          : prev,
      );
    });

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    const confirmed = window.confirm(
      isDe
        ? `"${product?.name ?? ""}" wirklich löschen? Das Angebot wird für alle Nutzer entfernt.`
        : `Delete "${product?.name ?? ""}"? The listing will be removed for all users.`,
    );
    if (!confirmed) return;
    void runAction(id, async () => {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((p) => p._id !== id), meta: { ...prev.meta, total: Math.max(prev.meta.total - 1, 0) } } : prev,
      );
      if (selectedId === id) {
        setDetailsModalOpen(false);
        setSelectedId(null);
      }
    });
  };

  // Metrics
  const totalCount = data?.meta.total ?? products.length;
  const liveCount = products.filter((p) => p.moderation === "Live").length;
  const hiddenCount = products.filter((p) => p.moderation === "Hidden").length;
  const soldCount = products.filter((p) => p.moderation === "Sold").length;

  const filtered = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSeller = p.sellerName.toLowerCase().includes(q) || p.sellerEmail.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchSeller && !matchCat) return false;
    }
    return activeTab === "All" || p.moderation === activeTab;
  });

  const statusLabel = (status: ApiProductStatus) => {
    switch (status) {
      case "ACTIVE":
        return isDe ? "Aktiv" : "Active";
      case "INACTIVE":
        return isDe ? "Deaktiviert" : "Deactivated";
      case "SOLD":
        return isDe ? "Verkauft" : "Sold";
      case "ARCHIVED":
        return isDe ? "Archiviert" : "Archived";
      default:
        return isDe ? "Entwurf" : "Draft";
    }
  };

  const approvalLabel = (approval: ApprovalStatus) =>
    approval === "APPROVED"
      ? isDe ? "Geprüft" : "Approved"
      : approval === "REJECTED"
      ? isDe ? "Abgelehnt" : "Rejected"
      : isDe ? "Prüfung ausstehend" : "Approval pending";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isDe ? "Produkt-Moderation" : "Product Moderation"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isDe
              ? "Prüfen Sie von Verkäufern eingestellte Produkte, Zustandsangaben und Verkaufsstatus."
              : "Inspect seller uploaded listings, declared conditions and sale status, and keep the marketplace compliant."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isDe ? "Nur Verkäufer können Produkte einstellen" : "Listings are created by verified sellers"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">
            {isDe ? "Gesamtangebote" : "Total Listings"}
          </span>
          <span className="text-2xl font-bold text-foreground">{isLoading ? "—" : totalCount}</span>
        </div>

        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-emerald-500 block mb-1">
            {isDe ? "Freigegeben & Live" : "Approved & Live"}
          </span>
          <span className="text-2xl font-bold text-emerald-500">{isLoading ? "—" : liveCount}</span>
        </div>

        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-amber-500 block mb-1">
            {isDe ? "Ausgeblendet / In Prüfung" : "Hidden / Under Review"}
          </span>
          <span className="text-2xl font-bold text-amber-500">{isLoading ? "—" : hiddenCount}</span>
        </div>

        <div className="bg-card border border-border dark:border-[#F4B057]/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-purple-400 block mb-1">
            {isDe ? "Verkauft" : "Sold"}
          </span>
          <span className="text-2xl font-bold text-purple-400">{isLoading ? "—" : soldCount}</span>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar">
            {(["All", "Live", "Hidden", "Sold"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "All"
                  ? isDe ? "Alle" : "All"
                  : tab === "Live"
                  ? isDe ? "Live" : "Live"
                  : tab === "Hidden"
                  ? isDe ? "Ausgeblendet" : "Hidden"
                  : isDe ? "Verkauft" : "Sold"}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isDe ? "Suchen nach Produkt, Verkäufer..." : "Search product, seller..."}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-background border border-border text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {actionError && !detailsModalOpen && (
          <p className="text-xs font-medium text-destructive">{actionError}</p>
        )}

        {isLoading || error || products.length === 0 ? (
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error && products.length === 0}
            emptyTitle={isDe ? "Noch keine Produkte" : "No products yet"}
            emptyDescription={isDe ? "Sobald verifizierte Verkäufer Produkte einstellen, erscheinen sie hier." : "Listings appear here as soon as verified sellers publish products."}
            onRetry={() => void reload()}
          />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {isDe ? "Keine Produkte entsprechen dem Filter." : "No products match the current filter."}
          </div>
        ) : (
        /* Listings Table */
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">{isDe ? "Produkt & Foto" : "Product & Image"}</th>
                <th className="py-3 px-4">{isDe ? "Kategorie" : "Category"}</th>
                <th className="py-3 px-4">{isDe ? "Verkäufer" : "Seller"}</th>
                <th className="py-3 px-4">{isDe ? "Preise (Listen / Floor)" : "Price / Floor"}</th>
                <th className="py-3 px-4">{isDe ? "Zustand & Prüfung" : "Condition & Approval"}</th>
                <th className="py-3 px-4">{isDe ? "Status" : "Status"}</th>
                <th className="py-3 px-4 text-right">{isDe ? "Aktionen" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb src={item.image} alt={item.name} className="w-12 h-12 rounded-xl" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate max-w-[200px]">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {[item.condition, item.color].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {item.category}
                    {item.subcategory && <span className="block text-[10px] text-muted-foreground">{item.subcategory}</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-foreground block">{item.sellerName}</span>
                    {item.sellerEmail && <span className="text-[10px] text-muted-foreground">{item.sellerEmail}</span>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-foreground block">{formatMoney(item.price, item.currency)}</span>
                    {item.allowNegotiation && (
                      <span className="text-[10px] font-semibold text-emerald-500">
                        Min: {formatMoney(item.minNegotiablePrice, item.currency)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-bold text-foreground">{item.condition}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate block max-w-[140px]">
                      {approvalLabel(item.approvalStatus)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.moderation === "Live"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.moderation === "Sold"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.moderation === "Live" ? "Live" : statusLabel(item.status)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedId(item.id);
                          setActionError("");
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title={isDe ? "Details ansehen" : "Inspect details"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {item.status !== "ACTIVE" && item.status !== "SOLD" && (
                        <button
                          onClick={() => void setStatus(item.id, "ACTIVE")}
                          disabled={busyId === item.id}
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
                          title={isDe ? "Freigeben (aktivieren)" : "Approve (activate)"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      {item.status === "ACTIVE" && (
                        <button
                          onClick={() => void setStatus(item.id, "INACTIVE")}
                          disabled={busyId === item.id}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
                          title={isDe ? "Markieren / Deaktivieren" : "Flag (deactivate)"}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={busyId === item.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer disabled:opacity-50"
                        title={isDe ? "Löschen" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Inspect Product Modal */}
      {selectedProduct && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen} modal={false}>
          <DialogContent className="sm:max-w-[550px] bg-card border border-border text-foreground rounded-2xl p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isDe ? "Produktprüfung & Details" : "Listing Verification & Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                #{selectedProduct.id.slice(-6).toUpperCase()} • {selectedProduct.sellerName} • {formatDate(selectedProduct.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <ProductThumb src={selectedProduct.image} alt={selectedProduct.name} className="aspect-video w-full rounded-xl" />

              <div className="p-3 bg-muted/30 rounded-xl border border-border space-y-1.5">
                <div className="flex justify-between font-bold text-foreground">
                  <span>{selectedProduct.name}</span>
                  <span className="text-primary text-sm">{formatMoney(selectedProduct.price, selectedProduct.currency)}</span>
                </div>
                <p className="text-muted-foreground text-[11px] whitespace-pre-line">{selectedProduct.description || "—"}</p>
              </div>

              {/* Quality & Condition Details */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between text-foreground font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {isDe ? "Zustand & Prüfstatus" : "Condition & Approval"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                    {selectedProduct.condition}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {approvalLabel(selectedProduct.approvalStatus)} • {statusLabel(selectedProduct.status)} •{" "}
                  {isDe ? "Menge" : "Quantity"}: {selectedProduct.quantity}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-border text-[11px]">
                  <span className="text-foreground font-semibold">{isDe ? "Kategorie:" : "Category:"}</span>
                  <span className="text-muted-foreground">
                    {[selectedProduct.category, selectedProduct.subcategory, selectedProduct.color].filter(Boolean).join(" • ")}
                  </span>
                </div>
              </div>

              {/* Offer Terms */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border space-y-1">
                <span className="font-bold text-foreground block flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {isDe ? "Angebotsgrenzen & Versand:" : "Offer Floor & Shipping Terms:"}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  <strong>Min. Floor:</strong>{" "}
                  {selectedProduct.allowNegotiation
                    ? formatMoney(selectedProduct.minNegotiablePrice, selectedProduct.currency)
                    : isDe ? "Keine Verhandlung" : "No negotiation"}{" "}
                  | <strong>{isDe ? "Versand:" : "Shipping:"}</strong> {selectedProduct.shippingTerms || "—"}
                </p>
                {selectedProduct.returnPolicy && (
                  <p className="text-[11px] text-muted-foreground">
                    <strong>{isDe ? "Rückgabe:" : "Returns:"}</strong> {selectedProduct.returnPolicy}
                  </p>
                )}
              </div>

              {actionError && <p className="text-xs font-medium text-destructive">{actionError}</p>}
            </div>

            <DialogFooter className="mt-4 flex items-center justify-between">
              <Button
                variant="destructive"
                size="sm"
                disabled={busyId === selectedProduct.id}
                onClick={() => handleDelete(selectedProduct.id)}
              >
                {isDe ? "Löschen" : "Delete"}
              </Button>
              <div className="flex items-center gap-2">
                {selectedProduct.status === "SOLD" ? null : selectedProduct.status !== "ACTIVE" ? (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={busyId === selectedProduct.id}
                    onClick={() => void setStatus(selectedProduct.id, "ACTIVE")}
                  >
                    {isDe ? "Freigeben" : "Approve"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === selectedProduct.id}
                    onClick={() => void setStatus(selectedProduct.id, "INACTIVE")}
                  >
                    {isDe ? "Markieren / Deaktivieren" : "Flag / Deactivate"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
