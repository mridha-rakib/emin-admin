"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserDetailsModal from "../users/UserDetailsModal";
import { useTranslation } from "@/context/LanguageContext";
import { avatarFor, formatDate, formatDateTime, initials, useApi, type PersonSummary } from "@/lib/admin-api";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { DataState } from "@/components/common/DataState";
import { AccountStatusBadge } from "@/components/people/PersonBadges";

function AdminsTable({
  admins,
  onViewAdmin,
  startIndex,
}: {
  admins: PersonSummary[];
  onViewAdmin: (admin: PersonSummary) => void;
  startIndex: number;
}) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  return (
    <>
      {/* Desktop Table View */}
      <div className="bg-card border-border hidden overflow-hidden rounded-b-lg border shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                {[
                  t.admins.tableHeaders.no,
                  t.admins.tableHeaders.adminName,
                  t.admins.tableHeaders.role,
                  t.admins.tableHeaders.phoneNumber,
                  t.admins.tableHeaders.joinedDate,
                  isDe ? "Letzte Anmeldung" : "Last login",
                  t.admins.tableHeaders.email,
                  "Status",
                  t.admins.tableHeaders.action,
                ].map((label) => (
                  <th
                    key={label}
                    className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {admins.map((a, idx) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{startIndex + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarFor(a)} alt={a.name} />
                        <AvatarFallback>{initials(a.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-foreground text-sm font-medium">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs font-medium">Administrator</span>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{a.phone || "—"}</td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{formatDate(a.createdAt)}</td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{formatDateTime(a.lastLoginAt)}</td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{a.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AccountStatusBadge status={a.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                      onClick={() => onViewAdmin(a)}
                      title={t.admins.actions.viewDetails}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="space-y-3 p-4 md:hidden">
        {admins.map((a, idx) => (
          <div key={a.id} className="bg-card border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={avatarFor(a)} alt={a.name} />
                  <AvatarFallback>{initials(a.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground truncate font-semibold">{a.name}</h3>
                  <p className="text-muted-foreground text-xs">#{startIndex + idx + 1}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8 flex-shrink-0"
                onClick={() => onViewAdmin(a)}
                title={t.admins.actions.viewDetails}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admins.tableHeaders.role}:</span>
                <span className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs font-medium">Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admins.tableHeaders.email}:</span>
                <span className="text-foreground ml-2 truncate">{a.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admins.tableHeaders.phoneNumber}:</span>
                <span className="text-foreground">{a.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admins.tableHeaders.joinedDate}:</span>
                <span className="text-foreground">{formatDate(a.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDe ? "Letzte Anmeldung" : "Last login"}:</span>
                <span className="text-foreground">{formatDateTime(a.lastLoginAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminsPage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload } = useApi<{ items: PersonSummary[] }>("/admin/admins");
  const admins = React.useMemo(() => data?.items ?? [], [data]);
  const adminId = useAuthStore((state) => state.adminId);

  const [query, setQuery] = React.useState("");
  const [selectedAdmin, setSelectedAdmin] = React.useState<PersonSummary | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filtered = admins.filter((a) => {
    const term = query.trim().toLowerCase();
    return !term || a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdmins = filtered.slice(startIndex, endIndex);

  const setStatus = async (status: string) => {
    if (!selectedAdmin || status === selectedAdmin.status) return;
    setBusy(true);
    setActionError("");
    try {
      await apiRequest(`/admin/people/${selectedAdmin.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setSelectedAdmin({ ...selectedAdmin, status: status as PersonSummary["status"] });
      await reload();
    } catch (statusError) {
      if (!(statusError instanceof SessionExpiredError)) {
        setActionError(statusError instanceof Error ? statusError.message : "Could not update the account status.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Top header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{t.admins.title}</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={isDe ? "Admin nach Name oder E-Mail suchen..." : "Search admin by name or email..."}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-background text-foreground border-primary-foreground/20 w-full pl-9"
            />
          </div>
        </div>
      </div>

      {/* Read-only note */}
      <div className="bg-card border-border flex items-start gap-3 border-x border-b p-4 text-sm">
        <Info className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
        <p className="text-muted-foreground">
          {isDe ? (
            <>
              Administratoren werden über die Einstellung <code className="bg-muted rounded px-1 font-mono text-xs">ADMIN_EMAIL</code> auf
              dem Server verwaltet (kommagetrennte E-Mail-Adressen). Hier werden alle registrierten Konten mit einer dieser Adressen
              angezeigt. Öffnen Sie einen Administrator, um den Kontostatus zu ändern. Den eigenen Status können Sie nicht ändern.
            </>
          ) : (
            <>
              Administrators are managed via the <code className="bg-muted rounded px-1 font-mono text-xs">ADMIN_EMAIL</code> setting on the
              server (comma-separated email addresses). This list shows every registered account using one of those addresses.
              Open an administrator to change their account status. You cannot change your own status.
            </>
          )}
        </p>
      </div>

      {/* Table area */}
      <div>
        {(isLoading && !data) || error || filtered.length === 0 ? (
          <DataState
            isLoading={isLoading && !data}
            error={error}
            isEmpty={filtered.length === 0}
            onRetry={() => void reload()}
            emptyTitle={query.trim() ? t.admins.noAdminsFound : isDe ? "Keine Administratoren gefunden" : "No administrators found"}
            emptyDescription={
              query.trim()
                ? undefined
                : isDe
                  ? "Kein registriertes Konto entspricht einer Adresse aus ADMIN_EMAIL."
                  : "No registered account matches an address listed in ADMIN_EMAIL."
            }
            className="rounded-t-none border-t-0"
          />
        ) : (
          <AdminsTable admins={paginatedAdmins} onViewAdmin={setSelectedAdmin} startIndex={startIndex} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-card border-border rounded-b-lg border-t p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-muted-foreground text-sm">
              {t.admins.showing} {startIndex + 1} {t.admins.to} {Math.min(endIndex, filtered.length)} {t.admins.of} {filtered.length}{" "}
              {t.admins.adminsCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">{t.common.previous}</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={page === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="h-8"
              >
                <span className="mr-1 hidden sm:inline">{t.common.next}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Admin Modal (read-only) */}
      <UserDetailsModal
        open={!!selectedAdmin}
        onClose={() => setSelectedAdmin(null)}
        user={selectedAdmin}
        isUpdating={busy}
        onStatusChange={selectedAdmin && selectedAdmin.id !== adminId ? (status) => void setStatus(status) : undefined}
      />
      {actionError && <p className="px-4 pb-4 text-sm font-medium text-destructive">{actionError}</p>}
    </div>
  );
}
