"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

type DeleteFAQModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  faqQuestion: string;
};

export default function DeleteFAQModal({ open, onClose, onConfirm, faqQuestion }: DeleteFAQModalProps) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleClose = () => {
    setDeleteError("");
    onClose();
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : isDe ? "Löschen fehlgeschlagen." : "Could not delete the FAQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="bg-background sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">{isDe ? "FAQ löschen" : "Delete FAQ"}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground text-center text-sm">
            {isDe ? "Möchten Sie diese FAQ wirklich löschen?" : "Are you sure you want to delete this FAQ?"}
          </p>
          <p className="text-foreground mt-3 text-center font-medium">&ldquo;{faqQuestion}&rdquo;</p>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            {isDe ? "Diese Aktion kann nicht rückgängig gemacht werden." : "This action cannot be undone."}
          </p>
          {deleteError && <p className="text-destructive mt-3 text-center text-sm">{deleteError}</p>}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isDeleting}>
            {isDe ? "Abbrechen" : "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1"
          >
            {isDeleting ? (isDe ? "Löschen…" : "Deleting…") : isDe ? "Löschen" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
