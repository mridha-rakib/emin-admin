"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FAQForm, type FAQFormValues } from "./CreateFAQModal";

export type EditableFAQ = FAQFormValues & { id: string };

type EditFAQModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (faq: EditableFAQ) => Promise<void>;
  faq: EditableFAQ | null;
};

export default function EditFAQModal({ open, onClose, onConfirm, faq }: EditFAQModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <DialogContent className="bg-background max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-[800px]">
        {open && faq && (
          <FAQForm
            key={faq.id}
            initial={faq}
            onClose={onClose}
            onConfirm={(values) => onConfirm({ ...values, id: faq.id })}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
