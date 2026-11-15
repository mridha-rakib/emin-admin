"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Shield, MapPin, LogIn, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { AccountStatusBadge, AccountStatusControl, VerificationBadges } from "@/components/people/PersonBadges";
import { avatarFor, formatDate, formatDateTime, formatMoney, initials, type PersonListItem, type VerificationSummary } from "@/lib/admin-api";
import { useAuthStore } from "@/store/auth-store";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedDate?: string;
  joinedAt?: string;
  createdAt?: string;
  lastLoginAt?: string;
  userType?: string;
  status?: string;
  location?: string;
  isAdmin?: boolean;
  isProvider?: boolean;
  verification?: VerificationSummary;
  stats?: PersonListItem["stats"];
}

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onBlock?: () => void;
  onUnblock?: () => void;
  onStatusChange?: (status: string) => void;
  isUpdating?: boolean;
}

export default function UserDetailsModal({ open, onClose, user, onBlock, onUnblock, onStatusChange, isUpdating }: UserDetailsModalProps) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const isSelf = useAuthStore((state) => state.adminId) === user?.id;
  if (!user) return null;

  const joinedDate = user.createdAt ? formatDate(user.createdAt) : user.joinedDate || user.joinedAt;
  const userType =
    user.userType ??
    (user.isAdmin
      ? "Administrator"
      : user.isProvider === undefined
        ? undefined
        : user.isProvider
          ? isDe ? "Anbieter (Dienste/Produkte)" : "Provider (services/products)"
          : isDe ? "Kunde" : "Customer");
  const isBlocked = user.status === "BLOCKED";

  const row = (icon: ReactNode, label: string, value: ReactNode) => (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="text-foreground truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} modal={false}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t.users.detailsModal.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* User Avatar and Name */}
          <div className="border-border flex items-center gap-4 border-b pb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarFor(user)} alt={user.name} />
              <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-foreground text-lg font-semibold">{user.name}</h3>
                {user.status && <AccountStatusBadge status={user.status} />}
              </div>
              <p className="text-muted-foreground truncate text-xs font-mono">ID: {user.id}</p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            {row(<Mail className="h-5 w-5" />, t.users.detailsModal.email, user.email)}
            {row(<Phone className="h-5 w-5" />, t.users.detailsModal.phone, user.phone || "—")}
            {user.location !== undefined && row(<MapPin className="h-5 w-5" />, isDe ? "Ort" : "Location", user.location || "—")}
            {userType && row(<Shield className="h-5 w-5" />, t.users.detailsModal.userType, userType)}
            {joinedDate && row(<Calendar className="h-5 w-5" />, t.users.detailsModal.joinedDate, joinedDate)}
            {user.createdAt !== undefined &&
              row(<LogIn className="h-5 w-5" />, isDe ? "Letzte Anmeldung" : "Last login", formatDateTime(user.lastLoginAt))}
            {user.verification &&
              row(
                <ShieldCheck className="h-5 w-5" />,
                isDe ? "Verifizierung" : "Verification",
                <VerificationBadges
                  verification={user.verification}
                  role={user.isProvider ? "seller" : "buyer"}
                  className="mt-1 whitespace-normal"
                />,
              )}
          </div>

          {user.stats && (
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 text-center text-xs sm:grid-cols-3">
              {[
                { label: isDe ? "Dienste" : "Services", value: user.stats.services },
                { label: isDe ? "Produkte" : "Products", value: user.stats.products },
                { label: isDe ? "Buchungen" : "Bookings", value: user.stats.bookings },
                { label: isDe ? "Bestellungen" : "Orders", value: user.stats.orders },
                { label: isDe ? "Ausgaben" : "Spent", value: formatMoney(user.stats.spent) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted-foreground">{label}</p>
                  <p className="text-foreground text-sm font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-end gap-2 pt-4">
            {onStatusChange && user.status && !isSelf && (
              <AccountStatusControl status={user.status} disabled={isUpdating} onChange={onStatusChange} />
            )}
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {t.users.detailsModal.close}
            </Button>
            {isBlocked
              ? onUnblock && (
                  <Button variant="default" className="flex-1" onClick={onUnblock} disabled={isUpdating}>
                    {t.users.unblockUser}
                  </Button>
                )
              : onBlock &&
                !user.isAdmin && (
                  <Button variant="default" className="flex-1" onClick={onBlock} disabled={isUpdating}>
                    {t.users.detailsModal.blockUser}
                  </Button>
                )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
