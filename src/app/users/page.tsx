"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, Ban, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlockedUsersModal from "./BlockedUsersModal";
import UserDetailsModal from "./UserDetailsModal";
import BlockUserModal from "../admins/BlockUserModal";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { avatarFor, formatDate, initials, useApi, type PersonListItem } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";
import { AccountStatusBadge, VerificationBadges } from "@/components/people/PersonBadges";

type PeopleResponse = { items: PersonListItem[]; total: number };

function UsersTable({
  users,
  onViewUser,
  onBlockUser,
  startIndex,
  busyId,
}: {
  users: PersonListItem[];
  onViewUser: (user: PersonListItem) => void;
  onBlockUser: (user: PersonListItem) => void;
  startIndex: number;
  busyId: string | null;
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
                  t.users.tableHeaders.no,
                  t.users.tableHeaders.userName,
                  t.users.tableHeaders.phoneNumber,
                  t.users.tableHeaders.joinedDate,
                  t.users.tableHeaders.email,
                  isDe ? "Verifizierung" : "Verification",
                  "Status",
                  t.users.tableHeaders.action,
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
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{startIndex + idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarFor(u)} alt={u.name} />
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-foreground text-sm font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{u.phone || "—"}</td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4">
                    <VerificationBadges verification={u.verification} className="max-w-[220px]" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AccountStatusBadge status={u.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => onBlockUser(u)}
                        disabled={busyId === u.id}
                        title={t.users.actions.blockUser}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                        onClick={() => onViewUser(u)}
                        title={t.users.actions.viewDetails}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="space-y-3 p-4 md:hidden">
        {users.map((u, idx) => (
          <div key={u.id} className="bg-card border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={avatarFor(u)} alt={u.name} />
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground truncate font-semibold">{u.name}</h3>
                  <p className="text-muted-foreground text-xs">#{startIndex + idx + 1}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  onClick={() => onBlockUser(u)}
                  disabled={busyId === u.id}
                  title={t.users.actions.blockUser}
                >
                  <Ban className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                  onClick={() => onViewUser(u)}
                  title={t.users.actions.viewDetails}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AccountStatusBadge status={u.status} />
              <VerificationBadges verification={u.verification} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.users.tableHeaders.email}:</span>
                <span className="text-foreground ml-2 truncate">{u.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.users.tableHeaders.phoneNumber}:</span>
                <span className="text-foreground">{u.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.users.tableHeaders.joinedDate}:</span>
                <span className="text-foreground">{formatDate(u.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function UsersPage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const people = useApi<PeopleResponse>("/admin/people?type=all");
  const blocked = useApi<PeopleResponse>("/admin/people?type=all&status=BLOCKED");

  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"clients" | "providers">("providers");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [blockUser, setBlockUser] = React.useState<PersonListItem | null>(null);
  const [showBlockedUsers, setShowBlockedUsers] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const everyone = React.useMemo(() => people.data?.items ?? [], [people.data]);
  const blockedUsers = blocked.data?.items ?? [];
  const visible = React.useMemo(() => everyone.filter((u) => u.status !== "BLOCKED"), [everyone]);
  const counts = {
    clients: visible.filter((u) => !u.isProvider).length,
    providers: visible.filter((u) => u.isProvider).length,
  };

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return visible.filter(
      (u) =>
        (activeTab === "providers" ? u.isProvider : !u.isProvider) &&
        (!term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.phone.includes(term)),
    );
  }, [visible, activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  const selectedUser = everyone.find((u) => u.id === selectedId) ?? null;

  const reloadAll = () => Promise.all([people.reload(), blocked.reload()]);

  async function runAction(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setActionError("");
    try {
      await action();
      await reloadAll();
      return true;
    } catch (actionFailure) {
      if (!(actionFailure instanceof SessionExpiredError)) {
        setActionError(actionFailure instanceof Error ? actionFailure.message : "Action failed.");
      }
      return false;
    } finally {
      setBusyId(null);
    }
  }

  const setStatus = (id: string, status: string) =>
    runAction(id, () => apiRequest(`/admin/people/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }));

  async function handleBlockConfirm() {
    if (blockUser && (await setStatus(blockUser.id, "BLOCKED"))) setBlockUser(null);
  }

  const handleUnblock = (id: string) => void setStatus(id, "ACTIVE");

  const handleDelete = (id: string) => void runAction(id, () => apiRequest(`/users/${id}`, { method: "DELETE" }));

  return (
    <div className="bg-background min-h-screen">
      {/* Top header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{t.users.title}</h2>
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t.users.searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background text-foreground border-primary-foreground/20 w-full pl-9"
              />
            </div>
            <Button
              variant="secondary"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 whitespace-nowrap"
              onClick={() => setShowBlockedUsers(true)}
            >
              {t.users.blocked} ({blockedUsers.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs and controls */}
      <div className="bg-card border-border border-b p-4">
        <div className="flex items-center gap-2 overflow-x-auto sm:gap-3">
          <Button
            variant={activeTab === "clients" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("clients");
              setCurrentPage(1);
            }}
            className="px-4 whitespace-nowrap sm:px-6"
          >
            {t.users.clients} ({counts.clients})
          </Button>
          <Button
            variant={activeTab === "providers" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("providers");
              setCurrentPage(1);
            }}
            className="px-4 whitespace-nowrap sm:px-6"
          >
            {t.users.providers} ({counts.providers})
          </Button>
        </div>
        {actionError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {actionError}
          </div>
        )}
      </div>

      {/* Table area */}
      <div>
        {(people.isLoading && !people.data) || people.error || filtered.length === 0 ? (
          <DataState
            isLoading={people.isLoading && !people.data}
            error={people.error}
            isEmpty={filtered.length === 0}
            onRetry={() => void people.reload()}
            emptyTitle={
              query.trim()
                ? t.users.noUsersFound
                : activeTab === "providers"
                  ? isDe ? "Noch keine Anbieter" : "No providers yet"
                  : isDe ? "Noch keine Kunden" : "No clients yet"
            }
            emptyDescription={
              query.trim()
                ? undefined
                : activeTab === "providers"
                  ? isDe
                    ? "Anbieter sind Personen mit mindestens einem Dienst oder Produkt."
                    : "Providers are people with at least one service or product."
                  : isDe
                    ? "Kunden erscheinen hier, sobald sie sich registrieren."
                    : "Clients appear here as soon as they register."
            }
            className="rounded-t-none border-t-0"
          />
        ) : (
          <UsersTable
            users={paginatedUsers}
            onViewUser={(u) => setSelectedId(u.id)}
            onBlockUser={(u) => {
              setActionError("");
              setBlockUser(u);
            }}
            startIndex={startIndex}
            busyId={busyId}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-card border-border rounded-b-lg border-t p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-muted-foreground text-sm">
              {t.users.showing} {startIndex + 1} {t.users.to} {Math.min(endIndex, filtered.length)} {t.users.of} {filtered.length}{" "}
              {t.users.usersCount}
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

      {/* View User Modal */}
      <UserDetailsModal
        open={!!selectedUser}
        onClose={() => setSelectedId(null)}
        user={selectedUser}
        isUpdating={busyId === selectedUser?.id}
        onBlock={() => {
          if (selectedUser) {
            setActionError("");
            setBlockUser(selectedUser);
            setSelectedId(null);
          }
        }}
        onUnblock={() => selectedUser && handleUnblock(selectedUser.id)}
        onStatusChange={(status) => selectedUser && status !== selectedUser.status && void setStatus(selectedUser.id, status)}
      />

      {/* Block User Modal */}
      <BlockUserModal
        open={!!blockUser}
        onClose={() => setBlockUser(null)}
        user={blockUser}
        onConfirm={handleBlockConfirm}
        isSubmitting={Boolean(blockUser) && busyId === blockUser?.id}
        error={actionError}
      />

      {/* Blocked Users Modal */}
      <BlockedUsersModal
        open={showBlockedUsers}
        onClose={() => setShowBlockedUsers(false)}
        blockedUsers={blockedUsers}
        isLoading={blocked.isLoading && !blocked.data}
        error={blocked.error}
        onRetry={() => void blocked.reload()}
        busyId={busyId}
        onUnblock={handleUnblock}
        onDelete={handleDelete}
      />
    </div>
  );
}
