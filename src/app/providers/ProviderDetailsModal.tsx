"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Ban,
  Package,
  FileCheck,
  LogIn,
  ShoppingBag,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { DataState } from "@/components/common/DataState";
import { AccountStatusBadge, AccountStatusControl, IdentityBadge, VerificationBadges } from "@/components/people/PersonBadges";
import {
  avatarFor,
  formatDate,
  formatDateTime,
  formatMoney,
  initials,
  useApi,
  type PersonDetail,
  type PersonListItem,
} from "@/lib/admin-api";
import { useAuthStore } from "@/store/auth-store";

interface ProviderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  provider: PersonListItem | null;
  onToggleBlock?: (provider: PersonListItem) => void;
  onStatusChange?: (status: string) => void;
  isUpdating?: boolean;
}

type Listing = PersonDetail["services"][number];

export default function ProviderDetailsModal({
  open,
  onClose,
  provider,
  onToggleBlock,
  onStatusChange,
  isUpdating,
}: ProviderDetailsModalProps) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const isSelf = useAuthStore((state) => state.adminId) === provider?.id;
  const [activeTab, setActiveTab] = useState<"services" | "products" | "info">("services");
  const { data, error, isLoading, reload } = useApi<PersonDetail>(open && provider ? `/admin/people/${provider.id}` : null);

  if (!provider) return null;

  const detail = data?.id === provider.id ? data : null;
  const isBlocked = provider.status === "BLOCKED";

  const tabButton = (key: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === key
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );

  const infoTile = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground break-words">{value}</div>
      </div>
    </div>
  );

  const detailState = (
    <DataState
      isLoading={!detail && (isLoading || !error)}
      error={detail ? "" : error}
      onRetry={() => void reload()}
      emptyTitle=""
    />
  );

  const listingList = (items: Listing[], emptyText: string, EmptyIcon: typeof Briefcase) =>
    items.length === 0 ? (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <EmptyIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="h-14 w-14 flex-shrink-0 rounded-md border border-border object-cover" />
              ) : (
                <div className="h-14 w-14 flex-shrink-0 rounded-md border border-border bg-muted flex items-center justify-center">
                  <EmptyIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-base">{item.title || "—"}</span>
                  {item.category && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">{item.category}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-primary" />
                  {isDe ? "Erstellt am" : "Created"} {formatDate(item.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
              <span className="text-lg font-bold text-foreground">{formatMoney(item.price, item.currency)}</span>
              <Badge variant={item.status === "ACTIVE" ? "default" : "outline"} className="text-xs capitalize">
                {item.status ? item.status.toLowerCase() : "—"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} modal={false}>
      <DialogContent className="max-w-3.5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={avatarFor(provider)} alt={provider.name} />
                <AvatarFallback className="text-lg font-bold">{initials(provider.name)}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl font-bold text-foreground">{provider.name}</DialogTitle>
                  <AccountStatusBadge status={provider.status} />
                </div>

                <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1 flex-wrap">
                  {provider.profession && <span className="font-medium text-foreground">{provider.profession} •</span>}
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {provider.location || (isDe ? "Kein Ort angegeben" : "No location")}
                </p>
                <VerificationBadges verification={provider.verification} role="seller" className="mt-2" />
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs">
              <div className="text-center px-2">
                <p className="text-muted-foreground">{isDe ? "Dienste" : "Services"}</p>
                <p className="text-foreground font-bold text-sm">{provider.stats.services}</p>
              </div>
              <div className="h-7 w-px bg-border" />
              <div className="text-center px-2">
                <p className="text-muted-foreground">{isDe ? "Produkte" : "Products"}</p>
                <p className="text-foreground font-bold text-sm">{provider.stats.products}</p>
              </div>
              <div className="h-7 w-px bg-border" />
              <div className="text-center px-2">
                <p className="text-muted-foreground">{isDe ? "Seit" : "Joined"}</p>
                <p className="text-foreground font-bold text-sm">{formatDate(provider.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/60 flex-wrap">
            {tabButton("services", `${isDe ? "Angebotene Dienste" : "Services Offered"} (${provider.stats.services})`)}
            {tabButton("products", `${isDe ? "Produkte" : "Products Listed"} (${provider.stats.products})`)}
            {tabButton("info", isDe ? "Profil & Identität" : "Profile & Identity")}
          </div>
        </DialogHeader>

        <div className="p-6">
          {activeTab === "services" &&
            (!detail ? (
              detailState
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {isDe ? "Veröffentlichte Dienste & Preise" : "Published Services & Pricing"}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {detail.services.filter((s) => s.status === "ACTIVE").length} {isDe ? "aktiv" : "active"}
                  </span>
                </div>
                {listingList(detail.services, isDe ? "Noch keine Dienste veröffentlicht." : "No services listed yet.", Briefcase)}
              </div>
            ))}

          {activeTab === "products" &&
            (!detail ? (
              detailState
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{isDe ? "Marktplatz-Produkte" : "Marketplace Products"}</h4>
                  <span className="text-xs text-muted-foreground">
                    {detail.products.filter((p) => p.status === "ACTIVE").length} {isDe ? "aktiv" : "active"}
                  </span>
                </div>
                {listingList(detail.products, isDe ? "Noch keine Produkte eingestellt." : "No products listed yet.", Package)}
              </div>
            ))}

          {activeTab === "info" && (
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-foreground">{isDe ? "Profil" : "Professional Profile"}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoTile(<Mail className="h-5 w-5" />, isDe ? "E-Mail" : "Contact Email", provider.email)}
                {infoTile(<Phone className="h-5 w-5" />, isDe ? "Telefon" : "Contact Phone", provider.phone || "—")}
                {infoTile(<MapPin className="h-5 w-5" />, isDe ? "Ort" : "Location", provider.location || "—")}
                {infoTile(<Briefcase className="h-5 w-5" />, isDe ? "Beruf" : "Profession", provider.profession || "—")}
                {infoTile(<Calendar className="h-5 w-5" />, isDe ? "Registriert" : "Joined Platform", formatDate(provider.createdAt))}
                {infoTile(<LogIn className="h-5 w-5" />, isDe ? "Letzte Anmeldung" : "Last Login", formatDateTime(provider.lastLoginAt))}
              </div>

              {detail?.bio && (
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</h5>
                  <p className="text-sm text-foreground whitespace-pre-line">{detail.bio}</p>
                </div>
              )}

              {/* Seller verification */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isDe ? "Anbieter-Verifizierung" : "Provider Verification"}
                </h5>
                <VerificationBadges verification={provider.verification} role="seller" />
                <p className="text-xs text-muted-foreground">
                  {isDe
                    ? "Zum Verkaufen sind eine bestätigte E-Mail, eine bestätigte Schweizer Mobilnummer und eine genehmigte Identitätsprüfung erforderlich."
                    : "Selling requires a verified email, a verified Swiss mobile number and an approved identity check."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-muted/30 rounded border border-border/50">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <FileCheck className="h-3 w-3" />
                      {isDe ? "Identitätsprüfung" : "Identity Check"}
                    </p>
                    <div className="mt-1">
                      <IdentityBadge status={detail?.identity?.status ?? provider.verification.identity} />
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded border border-border/50">
                    <p className="text-muted-foreground">{isDe ? "Dokument" : "Document Type"}</p>
                    <p className="font-semibold text-foreground text-sm mt-0.5">{detail?.identity?.documentType || "—"}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded border border-border/50">
                    <p className="text-muted-foreground">{isDe ? "Eingereicht / Geprüft" : "Submitted / Reviewed"}</p>
                    <p className="font-semibold text-foreground text-sm mt-0.5">
                      {formatDate(detail?.identity?.submittedAt)} / {formatDate(detail?.identity?.reviewedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buyer activity of the same account */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {isDe ? "Aktivität als Käufer" : "Activity as a Buyer"}
                </h5>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    {provider.stats.bookings} {isDe ? "Buchungen" : "bookings"} · {provider.stats.orders} {isDe ? "Bestellungen" : "orders"}
                  </span>
                  <span className="font-bold text-primary">{formatMoney(provider.stats.spent)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex flex-wrap items-end justify-between gap-3 pt-6 mt-6 border-t border-border">
            {onStatusChange && !isSelf && (
              <AccountStatusControl status={provider.status} disabled={isUpdating} onChange={onStatusChange} />
            )}
            {onToggleBlock && (
              <Button
                variant={isBlocked ? "default" : "destructive"}
                size="sm"
                onClick={() => onToggleBlock(provider)}
                disabled={isUpdating}
                className="flex items-center gap-1.5 text-xs"
              >
                <Ban className="h-3.5 w-3.5" />
                {isBlocked ? (isDe ? "Anbieter entsperren" : "Unblock Provider") : isDe ? "Anbieter sperren" : "Block Provider"}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
              {isDe ? "Schließen" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
