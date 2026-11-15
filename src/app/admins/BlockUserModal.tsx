"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { avatarFor, initials } from "@/lib/admin-api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface BlockUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string;
}

export default function BlockUserModal({ open, onClose, user, onConfirm, isSubmitting, error }: BlockUserModalProps) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isSubmitting && onClose()} modal={false}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive text-xl font-semibold">
            {isDe ? "Konto sperren" : "Block account"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 flex items-center gap-4 rounded-lg p-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={avatarFor(user)} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate font-semibold">{user.name}</h3>
              <p className="text-muted-foreground truncate text-sm">{user.email}</p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            {isDe
              ? "Gesperrte Personen können sich nicht mehr anmelden und ihr Konto nicht mehr nutzen, bis Sie sie wieder entsperren."
              : "Blocked people can no longer sign in or use their account until you unblock them."}
          </p>

          {error && <p className="text-destructive bg-destructive/5 rounded-md px-3 py-2 text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              {t.admins.blockModal.cancel}
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => void onConfirm()} disabled={isSubmitting}>
              {isSubmitting ? (isDe ? "Wird gesperrt…" : "Blocking…") : isDe ? "Konto sperren" : "Block account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
