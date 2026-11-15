"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import UserDetailsModal from "@/app/users/UserDetailsModal";
import BlockUserModal from "@/app/admins/BlockUserModal";
import { DataState } from "@/components/common/DataState";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { avatarFor, formatDate, initials, type PersonDetail, type PersonSummary } from "@/lib/admin-api";

const PAGE_SIZE = 5;

const STATUS_STYLES: Record<PersonSummary["status"], string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  SUSPENDED: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  BLOCKED: "bg-destructive/10 text-destructive border border-destructive/20",
  DELETED: "bg-muted text-muted-foreground border border-border",
};

const statusLabel = (status: PersonSummary["status"], isDe: boolean) => {
  if (!isDe) return status.charAt(0) + status.slice(1).toLowerCase();
  return { ACTIVE: "Aktiv", PENDING: "Ausstehend", SUSPENDED: "Gesperrt", BLOCKED: "Blockiert", DELETED: "Gelöscht" }[status];
};

const shortId = (id: string) => `#${id.slice(-6).toUpperCase()}`;

export default function RecentUser({ users: initialUsers }: { users: PersonSummary[] }) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<PersonSummary | null>(null);
  const [blockUser, setBlockUser] = useState<PersonSummary | null>(null);
  const [blockError, setBlockError] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

  const handleBlockConfirm = async () => {
    if (!blockUser) return;
    setBlockError("");
    try {
      const updated = await apiRequest<PersonDetail>(`/admin/people/${blockUser.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "BLOCKED" }),
      });
      setUsers((prev) => prev.map((u) => (u.id === blockUser.id ? { ...u, status: updated.status } : u)));
    } catch (blockFailure) {
      if (!(blockFailure instanceof SessionExpiredError)) {
        setBlockError(blockFailure instanceof Error ? blockFailure.message : "Could not block user.");
      }
    } finally {
      setBlockUser(null);
    }
  };

  const modalUser = (user: PersonSummary) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "—",
    avatar: avatarFor(user),
    joinedDate: formatDate(user.createdAt),
    userType: statusLabel(user.status, isDe),
  });

  const statusBadge = (user: PersonSummary, size: "sm" | "md") => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${
        size === "md" ? "px-2.5 py-1 text-[11px] tracking-wide" : "px-2 py-0.5 text-[10px]"
      } ${STATUS_STYLES[user.status] ?? STATUS_STYLES.PENDING}`}
    >
      {statusLabel(user.status, isDe)}
    </span>
  );

  const actionButtons = (user: PersonSummary) => (
    <>
      <button
        type="button"
        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        title={t.recentUsers.viewDetails}
        onClick={() => setSelectedUser(user)}
      >
        <Eye className="h-4 w-4" />
      </button>
      {user.status !== "BLOCKED" && (
        <button
          type="button"
          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          title={t.recentUsers.blockUser}
          onClick={() => setBlockUser(user)}
        >
          <Ban className="h-4 w-4" />
        </button>
      )}
    </>
  );

  return (
    <div className="bg-card border border-border/80 overflow-hidden rounded-2xl shadow-xs">
      {/* Header */}
      <div className="border-border border-b px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-base sm:text-lg font-extrabold tracking-tight">
            {t.recentUsers.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {users.length} {t.nav.users}
          </p>
        </div>
        <Link href="/users" className="text-xs font-semibold text-primary hover:underline">
          {isDe ? "Alle anzeigen" : "View all"}
        </Link>
      </div>

      {blockError && (
        <p className="border-b border-destructive/30 bg-destructive/5 px-5 py-2 text-xs font-medium text-destructive">
          {blockError}
        </p>
      )}

      {users.length === 0 ? (
        <DataState
          isEmpty
          className="m-4"
          emptyTitle={isDe ? "Noch keine Nutzer" : "No users yet"}
          emptyDescription={isDe ? "Neue Registrierungen erscheinen hier." : "New sign-ups will appear here."}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-muted-foreground px-6 py-3.5 text-left text-xs font-bold tracking-wider uppercase">
                    {t.recentUsers.sId}
                  </th>
                  <th className="text-muted-foreground px-6 py-3.5 text-left text-xs font-bold tracking-wider uppercase">
                    {t.recentUsers.fullName}
                  </th>
                  <th className="text-muted-foreground px-6 py-3.5 text-left text-xs font-bold tracking-wider uppercase">
                    {t.recentUsers.email}
                  </th>
                  <th className="text-muted-foreground px-6 py-3.5 text-left text-xs font-bold tracking-wider uppercase">
                    {t.recentUsers.phoneNo}
                  </th>
                  <th className="text-muted-foreground px-6 py-3.5 text-left text-xs font-bold tracking-wider uppercase">
                    Status
                  </th>
                  <th className="text-muted-foreground px-6 py-3.5 text-left text-xs font-bold tracking-wider uppercase">
                    {t.recentUsers.joinedDate}
                  </th>
                  <th className="text-muted-foreground px-6 py-3.5 text-right text-xs font-bold tracking-wider uppercase">
                    {t.recentUsers.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {pageUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="text-muted-foreground px-6 py-4 text-xs font-semibold whitespace-nowrap" title={user.id}>
                      {shortId(user.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border shadow-2xs">
                          <AvatarImage src={avatarFor(user)} alt={user.name} />
                          <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-foreground text-sm font-semibold group-hover:text-primary transition-colors">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-xs font-medium whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-xs font-medium whitespace-nowrap">
                      {user.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap">{statusBadge(user, "md")}</td>
                    <td className="text-muted-foreground px-6 py-4 text-xs font-medium whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">{actionButtons(user)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 p-4 md:hidden">
            {pageUsers.map((user) => (
              <div key={user.id} className="bg-card border border-border/70 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 border border-border shadow-2xs">
                      <AvatarImage src={avatarFor(user)} alt={user.name} />
                      <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground truncate text-sm font-bold">{user.name}</h3>
                      <p className="text-muted-foreground text-xs font-medium">{shortId(user.id)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">{actionButtons(user)}</div>
                </div>
                <div className="space-y-2 text-xs border-t border-border/60 pt-2.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{t.recentUsers.email}:</span>
                    <span className="text-foreground font-medium truncate">{user.email}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{t.recentUsers.phoneNo}:</span>
                    <span className="text-foreground font-medium">{user.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    {statusBadge(user, "sm")}
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{t.recentUsers.joinedDate}:</span>
                    <span className="text-foreground font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="border-border border-t px-5 py-3.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {t.admins?.showing || "Showing"} {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, users.length)} of {users.length}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg cursor-pointer"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 rounded-lg text-xs font-bold cursor-pointer ${
                      currentPage === page ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg cursor-pointer"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* View User Modal */}
      <UserDetailsModal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser ? modalUser(selectedUser) : null}
        onBlock={
          selectedUser && selectedUser.status !== "BLOCKED"
            ? () => {
                setBlockUser(selectedUser);
                setSelectedUser(null);
              }
            : undefined
        }
      />

      {/* Block User Confirmation Modal */}
      <BlockUserModal
        open={!!blockUser}
        onClose={() => setBlockUser(null)}
        user={blockUser ? { id: blockUser.id, name: blockUser.name, email: blockUser.email, avatar: avatarFor(blockUser) } : null}
        onConfirm={() => void handleBlockConfirm()}
      />
    </div>
  );
}
