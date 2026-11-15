"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  CalendarCheck,
  CreditCard,
  Ban,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShoppingBag,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { DataState } from "@/components/common/DataState";
import { AccountStatusBadge, AccountStatusControl, IdentityBadge, VerificationBadges } from "@/components/people/PersonBadges";
import { useAuthStore } from "@/store/auth-store";
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

interface CustomerDetailsModalProps {
  open: boolean;
  onClose: () => void;
  customer: PersonListItem | null;
  onToggleBlock?: (customer: PersonListItem) => void;
  onStatusChange?: (status: string) => void;
  isUpdating?: boolean;
}

const statusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "paid":
    case "delivered":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1 font-medium capitalize">
          <CheckCircle2 className="h-3 w-3" />
          {status.toLowerCase()}
        </Badge>
      );
    case "confirmed":
    case "shipped":
      return (
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1 font-medium capitalize">
          <CalendarCheck className="h-3 w-3" />
          {status.toLowerCase()}
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1 font-medium capitalize">
          <Clock className="h-3 w-3" />
          {status.toLowerCase()}
        </Badge>
      );
    case "cancelled":
    case "failed":
    case "refunded":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 flex items-center gap-1 font-medium capitalize">
          <XCircle className="h-3 w-3" />
          {status.toLowerCase()}
        </Badge>
      );
    default:
      return <Badge variant="outline" className="capitalize">{status ? status.toLowerCase() : "—"}</Badge>;
  }
};

export default function CustomerDetailsModal({
  open,
  onClose,
  customer,
  onToggleBlock,
  onStatusChange,
  isUpdating,
}: CustomerDetailsModalProps) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const isSelf = useAuthStore((state) => state.adminId) === customer?.id;
  const [activeTab, setActiveTab] = useState<"bookings" | "orders" | "profile">("bookings");
  const { data, error, isLoading, reload } = useApi<PersonDetail>(open && customer ? `/admin/people/${customer.id}` : null);

  if (!customer) return null;

  const detail = data?.id === customer.id ? data : null;
  const isBlocked = customer.status === "BLOCKED";

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} modal={false}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={avatarFor(customer)} alt={customer.name} />
                <AvatarFallback className="text-lg font-bold">{initials(customer.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl font-bold">{customer.name}</DialogTitle>
                  <AccountStatusBadge status={customer.status} />
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {customer.location || (isDe ? "Kein Ort angegeben" : "No location")} • {isDe ? "Seit" : "Since"} {formatDate(customer.createdAt)}
                </p>
                <VerificationBadges verification={customer.verification} role="buyer" className="mt-2" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-lg border border-border/50 text-xs">
              <div className="text-center px-2">
                <p className="text-muted-foreground">{isDe ? "Buchungen" : "Bookings"}</p>
                <p className="text-foreground font-bold text-sm">{customer.stats.bookings}</p>
              </div>
              <div className="h-7 w-px bg-border" />
              <div className="text-center px-2">
                <p className="text-muted-foreground">{isDe ? "Bestellungen" : "Orders"}</p>
                <p className="text-foreground font-bold text-sm">{customer.stats.orders}</p>
              </div>
              <div className="h-7 w-px bg-border" />
              <div className="text-center px-2">
                <p className="text-muted-foreground">{isDe ? "Ausgaben" : "Total Spent"}</p>
                <p className="text-primary font-bold text-sm">{formatMoney(customer.stats.spent)}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/60 flex-wrap">
            {tabButton("bookings", `${isDe ? "Buchungen" : "Service Bookings"} (${customer.stats.bookings})`)}
            {tabButton("orders", `${isDe ? "Bestellungen" : "Product Orders"} (${customer.stats.orders})`)}
            {tabButton("profile", isDe ? "Profil & Verifizierung" : "Profile & Verification")}
          </div>
        </DialogHeader>

        <div className="p-6">
          {activeTab === "bookings" &&
            (!detail ? (
              detailState
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {isDe ? "Gebuchte Dienstleistungen" : "Booked Services & Appointment History"}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {isDe ? `${detail.bookings.length} Einträge` : `Showing ${detail.bookings.length} records`}
                  </span>
                </div>

                {detail.bookings.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isDe ? "Noch keine Buchungen." : "No bookings recorded yet."}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detail.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors bg-card/60"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-foreground text-base">{booking.serviceTitle || "—"}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {isDe ? "Buchungs-ID" : "Booking ID"}: <span className="font-mono">{booking.id}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-foreground">{formatMoney(booking.amount, booking.currency)}</span>
                            {statusBadge(booking.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {isDe ? "Termin" : "Appointment"}: <strong className="text-foreground">{formatDateTime(booking.scheduledAt)}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>
                              {isDe ? "Gebucht am" : "Booked on"} {formatDateTime(booking.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {activeTab === "orders" &&
            (!detail ? (
              detailState
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{isDe ? "Produktbestellungen" : "Marketplace Product Orders"}</h4>
                  <span className="text-xs text-muted-foreground">
                    {isDe ? `${detail.orders.length} Einträge` : `Showing ${detail.orders.length} records`}
                  </span>
                </div>

                {detail.orders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{isDe ? "Noch keine Bestellungen." : "No orders placed yet."}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detail.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="font-semibold text-foreground text-base">#{order.orderNumber || order.id}</span>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" />
                            {formatDateTime(order.createdAt)}
                            {order.orderStatus && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="capitalize">{order.orderStatus.toLowerCase()}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-foreground">{formatMoney(order.total, order.currency)}</span>
                          {statusBadge(order.paymentStatus)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-foreground">{isDe ? "Persönliche Angaben" : "Personal Information"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoTile(<Mail className="h-5 w-5" />, isDe ? "E-Mail-Adresse" : "Email Address", customer.email)}
                {infoTile(<Phone className="h-5 w-5" />, isDe ? "Telefonnummer" : "Phone Number", customer.phone || "—")}
                {infoTile(<MapPin className="h-5 w-5" />, isDe ? "Ort" : "Location", customer.location || "—")}
                {infoTile(<Calendar className="h-5 w-5" />, isDe ? "Konto erstellt" : "Account Created", formatDate(customer.createdAt))}
                {infoTile(<LogIn className="h-5 w-5" />, isDe ? "Letzte Anmeldung" : "Last Login", formatDateTime(customer.lastLoginAt))}
                {infoTile(
                  <ShieldCheck className="h-5 w-5" />,
                  isDe ? "Identitätsprüfung" : "Identity Check",
                  <div className="flex flex-col gap-1">
                    <IdentityBadge status={customer.verification.identity} />
                    {detail?.identity?.submittedAt && (
                      <span className="text-xs text-muted-foreground">
                        {detail.identity.documentType ? `${detail.identity.documentType} • ` : ""}
                        {isDe ? "Eingereicht" : "Submitted"} {formatDate(detail.identity.submittedAt)}
                      </span>
                    )}
                  </div>,
                )}
              </div>

              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isDe ? "Kaufberechtigung" : "Buyer Verification"}
                </h5>
                <VerificationBadges verification={customer.verification} role="buyer" />
                <p className="text-xs text-muted-foreground">
                  {isDe
                    ? "Für Käufe sind eine bestätigte E-Mail-Adresse und eine bestätigte Schweizer Mobilnummer erforderlich."
                    : "Buying requires a verified email address and a verified Swiss mobile number."}
                </p>
              </div>

              {detail?.bio && (
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</h5>
                  <p className="text-sm text-foreground whitespace-pre-line">{detail.bio}</p>
                </div>
              )}

              <div className="p-4 rounded-lg border border-border bg-card">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {isDe ? "Finanzübersicht" : "Financial Summary"}
                </h5>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {isDe ? "Gesamt (Buchungen + Bestellungen)" : "Lifetime spent (bookings + orders)"}:
                    </span>
                  </div>
                  <span className="text-base font-bold text-primary">{formatMoney(customer.stats.spent)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex flex-wrap items-end justify-between gap-3 pt-6 mt-6 border-t border-border">
            {onStatusChange && !isSelf && (
              <AccountStatusControl status={customer.status} disabled={isUpdating} onChange={onStatusChange} />
            )}
            {onToggleBlock && (
              <Button
                variant={isBlocked ? "default" : "destructive"}
                size="sm"
                onClick={() => onToggleBlock(customer)}
                disabled={isUpdating}
                className="flex items-center gap-1.5"
              >
                <Ban className="h-4 w-4" />
                {isBlocked ? (isDe ? "Kunde entsperren" : "Unblock Customer") : isDe ? "Kunde sperren" : "Block Customer"}
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
