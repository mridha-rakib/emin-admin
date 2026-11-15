"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Search,
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  Clock,
  User,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDate, formatMoney, toNumber, useApi, type Page } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";
import { BookingDetailsModal, BookingRecord, BookingStatus, formatBookingTime } from "./BookingDetailsModal";

type RawBooking = {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: string;
  providerId?: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceCategory?: string;
  scheduledAt?: string;
  location?: string;
  amount?: unknown;
  currency?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type RawService = { _id: string; providerName?: string; providerEmail?: string; duration?: string };
type RawSellerProfile = { _id: string; displayName?: string; businessName?: string };

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const metaText = (metadata: Record<string, unknown> | undefined, key: string) => {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
};

function toBookingRecord(
  raw: RawBooking,
  services: Map<string, RawService>,
  sellers: Map<string, RawSellerProfile>,
): BookingRecord {
  const service = raw.serviceId ? services.get(raw.serviceId) : undefined;
  const seller = raw.providerId ? sellers.get(raw.providerId) : undefined;
  const status = (raw.status ?? "pending").toLowerCase() as BookingStatus;
  return {
    id: raw._id,
    reference: `#${raw._id.slice(-6).toUpperCase()}`,
    customerName: raw.customerName || "â€”",
    customerEmail: raw.customerEmail ?? "",
    customerPhone: raw.customerPhone,
    providerName:
      service?.providerName ||
      seller?.displayName ||
      seller?.businessName ||
      metaText(raw.metadata, "providerName") ||
      "â€”",
    providerEmail: service?.providerEmail,
    serviceTitle: raw.serviceTitle || "â€”",
    category: raw.serviceCategory || "â€”",
    amount: toNumber(raw.amount),
    currency: raw.currency || "CHF",
    duration: service?.duration || metaText(raw.metadata, "duration"),
    scheduledAt: raw.scheduledAt,
    timeSlot: metaText(raw.metadata, "timeSlot") || metaText(raw.metadata, "time"),
    address: raw.location ?? "",
    notes: metaText(raw.metadata, "notes"),
    status: BOOKING_STATUSES.includes(status) ? status : "pending",
    createdAt: raw.createdAt,
  };
}

export default function BookingsManagementPage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload, setData } = useApi<Page<RawBooking>>("/bookings?page=1&limit=100");
  const { data: servicePage } = useApi<Page<RawService>>("/services?page=1&limit=100");
  const { data: sellerPage } = useApi<Page<RawSellerProfile>>("/seller-profiles?page=1&limit=100");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | BookingStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const bookings = useMemo(() => {
    const services = new Map((servicePage?.items ?? []).map((service) => [service._id, service]));
    const sellers = new Map((sellerPage?.items ?? []).map((seller) => [seller._id, seller]));
    return (data?.items ?? []).map((raw) => toBookingRecord(raw, services, sellers));
  }, [data, servicePage, sellerPage]);

  const selectedBooking = bookings.find((booking) => booking.id === selectedId) ?? null;

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    setIsUpdating(true);
    setUpdateError("");
    try {
      const updated = await apiRequest<RawBooking>(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ payload: { status: newStatus } }),
      });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((item) => (item._id === id ? { ...item, ...updated, status: updated?.status ?? newStatus } : item)) } : prev,
      );
    } catch (statusError) {
      if (statusError instanceof SessionExpiredError) return;
      setUpdateError(statusError instanceof Error ? statusError.message : isDe ? "Status konnte nicht geÃ¤ndert werden." : "Could not update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const matchesTab = activeTab === "all" || item.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerEmail.toLowerCase().includes(q) ||
        item.providerName.toLowerCase().includes(q) ||
        item.serviceTitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  const getStatusBadge = (status: BookingRecord["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t.common.confirmed}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t.common.completed}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {t.common.cancelled}
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
            <Clock3 className="w-3 h-3 mr-1" />
            {t.common.pending}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-amber-500" />
            {t.bookings.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.bookings.subtitle}
          </p>
        </div>

        {/* Quick counter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="px-3 py-1.5 rounded-xl border bg-card text-xs font-semibold">
            {t.common.all}: <span className="text-foreground font-bold">{stats.total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            {t.common.pending}: <span className="font-bold">{stats.pending}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {t.common.confirmed}: <span className="font-bold">{stats.confirmed}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs font-semibold">
            {t.common.completed}: <span className="font-bold">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border max-w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white dark:bg-gray-800 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.bookings.allTab}
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "pending"
                ? "bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.bookings.pendingTab} ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab("confirmed")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "confirmed"
                ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.bookings.confirmedTab} ({stats.confirmed})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "completed"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.bookings.completedTab} ({stats.completed})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "cancelled"
                ? "bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.bookings.cancelledTab}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.bookings.searchPlaceholder}
            className="pl-9 bg-card text-xs h-9 rounded-xl border"
          />
        </div>
      </div>

      {/* Bookings Table / Card View */}
      {isLoading || error || bookings.length === 0 ? (
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && bookings.length === 0}
          emptyTitle={isDe ? "Noch keine Buchungen" : "No bookings yet"}
          emptyDescription={isDe ? "Sobald Kunden Services buchen, erscheinen die Buchungen hier." : "Bookings will appear here as soon as customers book services."}
          onRetry={() => void reload()}
        />
      ) : (
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">{t.bookings.noBookingsFound}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isDe ? "Versuchen Sie einen anderen Statusfilter oder Suchbegriff." : "Try selecting a different status filter or search keyword."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">ID & {t.bookings.service}</th>
                  <th className="px-4 py-3.5">{t.bookings.customer}</th>
                  <th className="px-4 py-3.5">{t.bookings.provider}</th>
                  <th className="px-4 py-3.5">{t.bookings.date} & {t.bookings.time}</th>
                  <th className="px-4 py-3.5">{t.bookings.amount}</th>
                  <th className="px-4 py-3.5">{t.bookings.status}</th>
                  <th className="px-4 py-3.5 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBookings.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* ID & Service */}
                    <td className="px-4 py-4">
                      <div className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {item.reference}
                      </div>
                      <div className="font-semibold text-sm text-foreground mt-0.5 max-w-xs truncate">
                        {item.serviceTitle}
                      </div>
                      <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        {item.category}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        {item.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.customerEmail}</div>
                    </td>

                    {/* Provider */}
                    <td className="px-4 py-4">
                      <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                        {item.providerName}
                      </div>
                      {item.providerEmail && <div className="text-xs text-muted-foreground">{item.providerEmail}</div>}
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDate(item.scheduledAt)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatBookingTime(item)}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-sm text-foreground">
                        {formatMoney(item.amount, item.currency)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedId(item.id);
                          setUpdateError("");
                          setIsDetailsOpen(true);
                        }}
                        className="text-xs h-8 gap-1.5 rounded-lg hover:border-amber-500 hover:text-amber-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t.common.viewDetails}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onStatusChange={(id, status) => void handleStatusChange(id, status)}
        isUpdating={isUpdating}
        error={updateError}
      />
    </div>
  );
}
