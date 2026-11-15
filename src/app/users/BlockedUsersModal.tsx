"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { DataState } from "@/components/common/DataState";
import { avatarFor, formatDate, initials } from "@/lib/admin-api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt?: string;
}

interface BlockedUsersModalProps {
  open: boolean;
  onClose: () => void;
  blockedUsers: User[];
  onUnblock: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  busyId?: string | null;
}

export default function BlockedUsersModal({
  open,
  onClose,
  blockedUsers,
  onUnblock,
  onDelete,
  isLoading,
  error,
  onRetry,
  busyId,
}: BlockedUsersModalProps) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (userToDelete && onDelete) {
      onDelete(userToDelete);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} modal={false}>
        <DialogContent className="max-h-[80vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {t.users.blockedModal.title.replace("{count}", String(blockedUsers.length))}
            </DialogTitle>
          </DialogHeader>

          {isLoading || error ? (
            <DataState isLoading={isLoading} error={error} onRetry={onRetry} emptyTitle="" />
          ) : blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <UserCheck className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mb-2 text-lg font-semibold">{t.users.blockedModal.noBlocked}</h3>
              <p className="text-muted-foreground max-w-sm text-sm">{t.users.blockedModal.noBlockedDesc}</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border-border bg-card hover:bg-muted/30 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={avatarFor(user)} alt={user.name} />
                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-foreground truncate font-semibold">{user.name}</h4>
                        <p className="text-muted-foreground truncate text-sm">{user.email}</p>
                        <p className="text-muted-foreground text-xs">
                          {user.phone || "—"}
                          {user.createdAt && ` • ${isDe ? "Seit" : "Joined"} ${formatDate(user.createdAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => onUnblock(user.id)} disabled={busyId === user.id}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        {t.users.blockedModal.unblock}
                      </Button>
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setUserToDelete(user.id)}
                          disabled={busyId === user.id}
                          title={t.users.blockedModal.deletePermanently}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-border flex justify-end border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              {t.users.blockedModal.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)} modal={false}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive h-6 w-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle>{t.users.blockedModal.confirmDeleteTitle}</DialogTitle>
                <DialogDescription>{t.users.blockedModal.confirmDeleteDesc}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              {t.users.blockedModal.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t.users.blockedModal.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
