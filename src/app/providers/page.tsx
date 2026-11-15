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
  Briefcase,
  Package,
  Layers,
  ShieldCheck,
  Filter,
  AlertCircle,
} from "lucide-react";
import ProviderDetailsModal from "./ProviderDetailsModal";
import FeaturedServicesPanel from "./FeaturedServicesPanel";
import BlockUserModal from "../admins/BlockUserModal";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { avatarFor, formatDate, initials, useApi, type PersonListItem } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";
import { AccountStatusBadge, VerificationBadges } from "@/components/people/PersonBadges";

type PeopleResponse = { items: PersonListItem[]; total: number };
type OfferFilter = "All" | "Services" | "Products";
type StatusFilter = "All" | "Verified" | "ACTIVE" | "BLOCKED";

export default function ProvidersPage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload } = useApi<PeopleResponse>("/admin/people?type=providers");
  const providers = useMemo(() => data?.items ?? [], [data]);

  const [offerFilter, setOfferFilter] = useState<OfferFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [providerToBlock, setProviderToBlock] = useState<PersonListItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const selectedProvider = providers.find((p) => p.id === selectedId) ?? null;

  const filteredProviders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return providers.filter((prov) => {
      const matchesOffer =
        offerFilter === "All" ||
        (offerFilter === "Services" && prov.stats.services > 0) ||
        (offerFilter === "Products" && prov.stats.products > 0);

      const matchesStatus =
        statusFilter === "All" || (statusFilter === "Verified" ? prov.verification.canSell : prov.status === statusFilter);

      const matchesSearch =
        !term ||
        prov.name.toLowerCase().includes(term) ||
        prov.profession.toLowerCase().includes(term) ||
        prov.email.toLowerCase().includes(term) ||
        prov.phone.includes(term) ||
        prov.location.toLowerCase().includes(term);

      return matchesOffer && matchesStatus && matchesSearch;
    });
  }, [providers, offerFilter, statusFilter, searchTerm]);

  const metrics = useMemo(() => {
    const total = providers.length;
    const verified = providers.filter((p) => p.verification.canSell).length;
    const serviceProviders = providers.filter((p) => p.stats.services > 0).length;
    const sellers = providers.filter((p) => p.stats.products > 0).length;
    const totalServices = providers.reduce((sum, p) => sum + p.stats.services, 0);
    const totalProducts = providers.reduce((sum, p) => sum + p.stats.products, 0);
    return { total, verified, serviceProviders, sellers, totalServices, totalProducts };
  }, [providers]);

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage) || 1;
  const page = Math.min(currentPage, totalPages);
  const paginatedProviders = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProviders.slice(start, start + itemsPerPage);
  }, [filteredProviders, page]);

  const updateStatus = async (provider: PersonListItem, status: string) => {
    setUpdatingId(provider.id);
    setActionError("");
    try {
      await apiRequest(`/admin/people/${provider.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
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

  const handleToggleBlock = (provider: PersonListItem) => {
    if (provider.status === "BLOCKED") {
      void updateStatus(provider, "ACTIVE");
    } else {
      setActionError("");
      setProviderToBlock(provider);
    }
  };

  const handleConfirmBlock = async () => {
    if (!providerToBlock) return;
    if (await updateStatus(providerToBlock, "BLOCKED")) setProviderToBlock(null);
  };

  const offerTabs: Array<{ key: OfferFilter; label: string; count: number; icon: typeof Briefcase; activeClass: string }> = [
    { key: "All", label: t.providers.allTab, count: metrics.total, icon: Layers, activeClass: "bg-primary text-primary-foreground" },
    {
      key: "Services",
      label: isDe ? "Dienstleister" : "Service Providers",
      count: metrics.serviceProviders,
      icon: Briefcase,
      activeClass: "bg-purple-600 text-white",
    },
    {
      key: "Products",
      label: isDe ? "Verkäufer" : "Product Sellers",
      count: metrics.sellers,
      icon: Package,
      activeClass: "bg-blue-600 text-white",
    },
  ];

  const statusFilters: Array<{ key: StatusFilter; label: string }> = [
    { key: "All", label: isDe ? "Alle" : "All" },
    { key: "Verified", label: t.providers.verified },
    { key: "ACTIVE", label: t.common.active },
    { key: "BLOCKED", label: isDe ? "Gesperrt" : "Blocked" },
  ];

  const showListState = (isLoading && !data) || Boolean(error) || providers.length === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.providers.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isDe
              ? "Personen, die Dienstleistungen oder Produkte anbieten – mit Angeboten, Verifizierung und Kontostatus."
              : "People offering services or products – with their listings, verification and account status."}
          </p>
        </div>
      </div>

      <FeaturedServicesPanel />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.providers.allTab}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{metrics.total}</h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span className="text-emerald-500 font-semibold">
              {metrics.verified} {isDe ? "voll verifiziert" : "fully verified"}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isDe ? "Dienstleister" : "Service Providers"}
              </p>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{metrics.serviceProviders}</h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span>
              {metrics.totalServices} {isDe ? "Dienste insgesamt" : "services in total"}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isDe ? "Verkäufer" : "Product Sellers"}
              </p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.sellers}</h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span>
              {metrics.totalProducts} {isDe ? "Produkte insgesamt" : "products in total"}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isDe ? "Verkaufsberechtigt" : "Sell-ready"}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.verified}
                <span className="text-sm font-medium text-muted-foreground ml-1.5">
                  ({Math.round((metrics.verified / (metrics.total || 1)) * 100)}%)
                </span>
              </h3>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <span>{isDe ? "E-Mail + Telefon + ID genehmigt" : "Email + phone + ID approved"}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs (All / Services / Products) */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        {offerTabs.map(({ key, label, count, icon: Icon, activeClass }) => (
          <button
            key={key}
            onClick={() => {
              setOfferFilter(key);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              offerFilter === key
                ? `${activeClass} shadow-sm`
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label} ({count})
          </button>
        ))}
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}

      {/* Search & Secondary Filter Bar */}
      <div className="bg-card border border-border rounded-t-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-88">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isDe ? "Name, Beruf, E-Mail, Telefon oder Ort suchen..." : "Search name, profession, email, phone, location..."}
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
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Status:</span>
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
          isEmpty={providers.length === 0}
          onRetry={() => void reload()}
          emptyTitle={isDe ? "Noch keine Anbieter" : "No providers yet"}
          emptyDescription={
            isDe
              ? "Personen erscheinen hier, sobald sie ihren ersten Dienst oder ihr erstes Produkt veröffentlichen."
              : "People appear here as soon as they publish their first service or product."
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
                      { label: isDe ? "Anbieter" : "Provider", align: "text-left" },
                      { label: isDe ? "Angebot" : "Offers", align: "text-left" },
                      { label: isDe ? "Kontakt" : "Contact", align: "text-left" },
                      { label: isDe ? "Dienste" : "Services", align: "text-center" },
                      { label: isDe ? "Produkte" : "Products", align: "text-center" },
                      { label: isDe ? "Verifizierung" : "Verification", align: "text-left" },
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
                  {paginatedProviders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">
                        {t.providers.noProvidersFound}
                      </td>
                    </tr>
                  ) : (
                    paginatedProviders.map((prov, idx) => {
                      const itemIndex = (page - 1) * itemsPerPage + idx + 1;
                      const isBlocked = prov.status === "BLOCKED";
                      return (
                        <tr key={prov.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap font-mono">{itemIndex}</td>

                          {/* Provider info */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-border">
                                <AvatarImage src={avatarFor(prov)} alt={prov.name} />
                                <AvatarFallback>{initials(prov.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{prov.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {prov.profession || `${isDe ? "Seit" : "Joined"} ${formatDate(prov.createdAt)}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* What they offer */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {prov.stats.services > 0 && (
                                <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 flex items-center gap-1 font-medium">
                                  <Briefcase className="h-3 w-3" />
                                  {isDe ? "Dienste" : "Services"}
                                </Badge>
                              )}
                              {prov.stats.products > 0 && (
                                <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1 font-medium">
                                  <Package className="h-3 w-3" />
                                  {isDe ? "Produkte" : "Products"}
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-foreground">{prov.email}</p>
                            <p className="text-xs text-muted-foreground">{prov.phone || "—"}</p>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Badge variant="outline" className="font-semibold">
                              {prov.stats.services}
                            </Badge>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-bold text-foreground">{prov.stats.products}</span>
                          </td>

                          {/* Verification Status */}
                          <td className="px-6 py-4">
                            <VerificationBadges verification={prov.verification} role="seller" className="max-w-[240px]" />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <AccountStatusBadge status={prov.status} />
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => setSelectedId(prov.id)}
                                title={isDe ? "Angebote & Details anzeigen" : "View Listings & Details"}
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
                                onClick={() => handleToggleBlock(prov)}
                                disabled={updatingId === prov.id}
                                title={
                                  isBlocked ? (isDe ? "Anbieter entsperren" : "Unblock Provider") : isDe ? "Anbieter sperren" : "Block Provider"
                                }
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

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {paginatedProviders.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
                {t.providers.noProvidersFound}
              </div>
            ) : (
              paginatedProviders.map((prov) => (
                <div key={prov.id} className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={avatarFor(prov)} alt={prov.name} />
                        <AvatarFallback>{initials(prov.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{prov.name}</h3>
                        <p className="text-xs text-muted-foreground">{prov.email}</p>
                        <p className="text-xs text-muted-foreground">{prov.phone || "—"}</p>
                      </div>
                    </div>
                    <AccountStatusBadge status={prov.status} />
                  </div>

                  <VerificationBadges verification={prov.verification} role="seller" />

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-muted-foreground">{isDe ? "Dienste" : "Services"}: </span>
                      <span className="font-bold text-foreground">{prov.stats.services}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{isDe ? "Produkte" : "Products"}: </span>
                      <span className="font-bold text-foreground">{prov.stats.products}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1 text-primary"
                      onClick={() => setSelectedId(prov.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isDe ? "Angebote & Details" : "Listings & Details"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleToggleBlock(prov)}
                      disabled={updatingId === prov.id}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
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
            {filteredProviders.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}
          </span>{" "}
          {isDe ? "bis" : "to"}{" "}
          <span className="font-medium text-foreground">{Math.min(page * itemsPerPage, filteredProviders.length)}</span>{" "}
          {isDe ? "von" : "of"} <span className="font-medium text-foreground">{filteredProviders.length}</span>{" "}
          {isDe ? "Anbietern" : "providers"}
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

      {/* Provider Details Modal */}
      <ProviderDetailsModal
        open={Boolean(selectedProvider)}
        onClose={() => setSelectedId(null)}
        provider={selectedProvider}
        onToggleBlock={handleToggleBlock}
        onStatusChange={(status) => selectedProvider && status !== selectedProvider.status && void updateStatus(selectedProvider, status)}
        isUpdating={updatingId === selectedProvider?.id}
      />

      {/* Block Confirmation Modal */}
      <BlockUserModal
        open={Boolean(providerToBlock)}
        onClose={() => setProviderToBlock(null)}
        user={providerToBlock}
        onConfirm={handleConfirmBlock}
        isSubmitting={Boolean(providerToBlock) && updatingId === providerToBlock?.id}
        error={actionError}
      />
    </div>
  );
}
