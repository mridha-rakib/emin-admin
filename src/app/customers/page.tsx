"use client";

import React, { useState, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CalendarCheck,
  DollarSign,
  MapPin,
  ShieldCheck,
  Filter,
  AlertCircle,
} from "lucide-react";
import CustomerDetailsModal from "./CustomerDetailsModal";
import BlockUserModal from "../admins/BlockUserModal";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { avatarFor, formatDate, formatMoney, initials, useApi, type PersonListItem } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";
import { AccountStatusBadge, VerificationBadges } from "@/components/people/PersonBadges";

type PeopleResponse = { items: PersonListItem[]; total: number };
type StatusFilter = "All" | "ACTIVE" | "PENDING" | "BLOCKED";

export default function CustomersPage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload } = useApi<PeopleResponse>("/admin/people?type=customers");
  const customers = useMemo(() => data?.items ?? [], [data]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customerToBlock, setCustomerToBlock] = useState<PersonListItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const selectedCustomer = customers.find((c) => c.id === selectedId) ?? null;

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return customers.filter((cust) => {
      const matchesSearch =
        !term ||
        cust.name.toLowerCase().includes(term) ||
        cust.email.toLowerCase().includes(term) ||
        cust.phone.includes(term) ||
        cust.location.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "All" || cust.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const page = Math.min(currentPage, totalPages);
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, page]);

  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === "ACTIVE").length;
    const totalBookings = customers.reduce((sum, c) => sum + c.stats.bookings, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.stats.orders, 0);
    const totalSpent = customers.reduce((sum, c) => sum + c.stats.spent, 0);
    const buyReady = customers.filter((c) => c.verification.canBuy).length;
    return { total, active, totalBookings, totalOrders, totalSpent, buyReady };
  }, [customers]);

  const updateStatus = async (customer: PersonListItem, status: string) => {
    setUpdatingId(customer.id);
    setActionError("");
    try {
      await apiRequest(`/admin/people/${customer.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await reload();
      return true;
    } catch (updateError) {
      if (!(updateError instanceof SessionExpiredError)) {
        setActionError(updateError instanceof Error ? updateError.message : "Could not update the account status.");
      }
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBlock = (customer: PersonListItem) => {
    if (customer.status === "BLOCKED") {
      void updateStatus(customer, "ACTIVE");
    } else {
      setActionError("");
      setCustomerToBlock(customer);
    }
  };

  const handleConfirmBlock = async () => {
    if (!customerToBlock) return;
    if (await updateStatus(customerToBlock, "BLOCKED")) setCustomerToBlock(null);
  };

  const statusFilters: Array<{ key: StatusFilter; label: string }> = [
    { key: "All", label: t.customers.allTab },
    { key: "ACTIVE", label: t.customers.activeTab },
    { key: "PENDING", label: isDe ? "Ausstehend" : "Pending" },
    { key: "BLOCKED", label: t.customers.blockedTab },
  ];

  const showListState = (isLoading && !data) || Boolean(error) || customers.length === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.customers.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isDe
              ? "Registrierte Käufer ohne eigene Angebote – mit Buchungen, Bestellungen, Verifizierung und Kontostatus."
              : "Registered buyers without listings of their own – bookings, orders, verification and account status."}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customers.allTab}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{metrics.total}</h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span className="text-emerald-500 font-semibold">
              {metrics.active} {t.common.active}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customers.totalBookings}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{metrics.totalBookings}</h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span>
              {metrics.totalOrders} {isDe ? "Produktbestellungen" : "product orders"}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customers.totalSpent}</p>
              <h3 className="text-2xl font-bold text-primary mt-1">{formatMoney(metrics.totalSpent)}</h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span>{isDe ? "Buchungen + Bestellungen" : "Bookings + orders"}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isDe ? "Kaufberechtigt" : "Buy-ready"}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {metrics.buyReady}
                <span className="text-sm font-medium text-muted-foreground ml-1.5">
                  ({Math.round((metrics.buyReady / (metrics.total || 1)) * 100)}%)
                </span>
              </h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span>{isDe ? "E-Mail + Schweizer Telefon bestätigt" : "Email + Swiss phone verified"}</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-t-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.customers.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">{t.common.status}:</span>
          {statusFilters.map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={statusFilter === key ? "default" : "outline"}
              onClick={() => {
                setStatusFilter(key);
                setCurrentPage(1);
              }}
              className="text-xs h-8 px-3"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {showListState ? (
        <DataState
          isLoading={isLoading && !data}
          error={error}
          isEmpty={customers.length === 0}
          onRetry={() => void reload()}
          emptyTitle={isDe ? "Noch keine Kunden" : "No customers yet"}
          emptyDescription={
            isDe
              ? "Kunden erscheinen hier, sobald sich Personen auf dem Marktplatz registrieren."
              : "Customers appear here as soon as people register on the marketplace."
          }
          className="rounded-none border-t-0"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="bg-card border border-border border-t-0 hidden md:block overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    {[
                      { label: "No", align: "text-left" },
                      { label: isDe ? "Kunde" : "Customer", align: "text-left" },
                      { label: isDe ? "Kontakt" : "Contact", align: "text-left" },
                      { label: isDe ? "Ort" : "Location", align: "text-left" },
                      { label: isDe ? "Verifizierung" : "Verification", align: "text-left" },
                      { label: isDe ? "Aktivität" : "Activity", align: "text-center" },
                      { label: isDe ? "Ausgaben" : "Total Spent", align: "text-left" },
                      { label: "Status", align: "text-left" },
                      { label: isDe ? "Aktionen" : "Actions", align: "text-right" },
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className={`px-6 py-3.5 ${align} text-xs font-semibold text-muted-foreground uppercase tracking-wider`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                        {t.customers.noCustomersFound}
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((cust, idx) => {
                      const itemIndex = (page - 1) * itemsPerPage + idx + 1;
                      const isBlocked = cust.status === "BLOCKED";
                      return (
                        <tr key={cust.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap font-mono">{itemIndex}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={avatarFor(cust)} alt={cust.name} />
                                <AvatarFallback>{initials(cust.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{cust.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {isDe ? "Seit" : "Joined"} {formatDate(cust.createdAt)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-foreground">{cust.email}</p>
                            <p className="text-xs text-muted-foreground">{cust.phone || "—"}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{cust.location || "—"}</td>
                          <td className="px-6 py-4">
                            <VerificationBadges verification={cust.verification} className="max-w-[220px]" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="outline" className="font-semibold">
                                {cust.stats.bookings} {isDe ? "Buchungen" : "Bookings"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {cust.stats.orders} {isDe ? "Bestellungen" : "Orders"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                            {formatMoney(cust.stats.spent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <AccountStatusBadge status={cust.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => setSelectedId(cust.id)}
                                title={isDe ? "Details & Buchungen anzeigen" : "View Customer Details & Bookings"}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  isBlocked
                                    ? "text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                                    : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                }`}
                                onClick={() => handleToggleBlock(cust)}
                                disabled={updatingId === cust.id}
                                title={isBlocked ? t.customers.unblockCustomer : t.customers.blockCustomer}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="space-y-3 md:hidden">
            {paginatedCustomers.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
                {t.customers.noCustomersFound}
              </div>
            ) : (
              paginatedCustomers.map((cust) => (
                <div key={cust.id} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={avatarFor(cust)} alt={cust.name} />
                        <AvatarFallback>{initials(cust.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{cust.name}</h3>
                        <p className="text-xs text-muted-foreground">{cust.email}</p>
                        <p className="text-xs text-muted-foreground">{cust.phone || "—"}</p>
                      </div>
                    </div>
                    <AccountStatusBadge status={cust.status} />
                  </div>

                  <VerificationBadges verification={cust.verification} role="buyer" />

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-muted-foreground">{isDe ? "Buchungen" : "Bookings"}: </span>
                      <span className="font-bold text-foreground">
                        {cust.stats.bookings} · {cust.stats.orders} {isDe ? "Bestellungen" : "orders"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{isDe ? "Ausgaben" : "Spent"}: </span>
                      <span className="font-bold text-primary">{formatMoney(cust.stats.spent)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {cust.location || "—"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center gap-1 text-primary"
                        onClick={() => setSelectedId(cust.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {isDe ? "Details" : "Details & Bookings"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleToggleBlock(cust)}
                        disabled={updatingId === cust.id}
                        title={cust.status === "BLOCKED" ? t.customers.unblockCustomer : t.customers.blockCustomer}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination Footer */}
      <div className="bg-card border border-border rounded-b-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {isDe ? "Zeige" : "Showing"}{" "}
          <span className="font-medium text-foreground">
            {filteredCustomers.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}
          </span>{" "}
          {isDe ? "bis" : "to"}{" "}
          <span className="font-medium text-foreground">{Math.min(page * itemsPerPage, filteredCustomers.length)}</span>{" "}
          {isDe ? "von" : "of"} <span className="font-medium text-foreground">{filteredCustomers.length}</span>{" "}
          {isDe ? "Kunden" : "customers"}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="h-8 px-2.5"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t.common.previous}
          </Button>

          <span className="text-xs font-semibold px-2">
            {isDe ? "Seite" : "Page"} {page} {isDe ? "von" : "of"} {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="h-8 px-2.5"
          >
            {t.common.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedId(null)}
        customer={selectedCustomer}
        onToggleBlock={handleToggleBlock}
        onStatusChange={(status) => selectedCustomer && status !== selectedCustomer.status && void updateStatus(selectedCustomer, status)}
        isUpdating={updatingId === selectedCustomer?.id}
      />

      {/* Block Confirmation Modal */}
      <BlockUserModal
        open={Boolean(customerToBlock)}
        onClose={() => setCustomerToBlock(null)}
        user={customerToBlock}
        onConfirm={handleConfirmBlock}
        isSubmitting={Boolean(customerToBlock) && updatingId === customerToBlock?.id}
        error={actionError}
      />
    </div>
  );
}
