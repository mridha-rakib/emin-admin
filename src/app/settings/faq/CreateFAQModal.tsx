"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { useTranslation } from "@/context/LanguageContext";

export type FAQFormValues = { question: string; answer: string; category: string; active: boolean };

type CreateFAQModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (faq: FAQFormValues) => Promise<void>;
};

export const isEmptyHtml = (html: string) => !html.replace(/<[^>]*>/g, "").trim() && !/<img/i.test(html);

export default function CreateFAQModal({ open, onClose, onConfirm }: CreateFAQModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <DialogContent className="bg-background max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-[800px]">
        {open && <FAQForm onClose={onClose} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}

/** Shared by the create and edit modals; pass `initial` to edit an existing FAQ. */
export function FAQForm({
  initial,
  onClose,
  onConfirm,
}: {
  initial?: FAQFormValues;
  onClose: () => void;
  onConfirm: (faq: FAQFormValues) => Promise<void>;
}) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const isEdit = Boolean(initial);
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<{ question?: string; answer?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!question.trim()) newErrors.question = isDe ? "Frage ist erforderlich" : "Question is required";
    if (isEmptyHtml(answer)) newErrors.answer = isDe ? "Antwort ist erforderlich" : "Answer is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    setSubmitError("");
    try {
      await onConfirm({ question: question.trim(), answer, category: category.trim(), active });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : isDe ? "Speichern fehlgeschlagen." : "Could not save the FAQ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DialogHeader className="bg-primary text-primary-foreground sticky top-0 z-10 rounded-t-lg p-6">
        <DialogTitle className="text-xl font-semibold">
          {isEdit ? (isDe ? "FAQ bearbeiten" : "Edit FAQ") : isDe ? "FAQ erstellen" : "Create FAQ"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Question */}
        <div className="space-y-2">
          <label htmlFor="question" className="text-foreground text-sm font-medium">
            {isDe ? "Frage" : "Question"}
          </label>
          <Input
            id="question"
            type="text"
            placeholder={isDe ? "Frage eingeben" : "Enter the question"}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (errors.question) setErrors({ ...errors, question: undefined });
            }}
            className={errors.question ? "border-destructive" : ""}
          />
          {errors.question && <p className="text-destructive text-xs">{errors.question}</p>}
        </div>

        {/* Category and visibility */}
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="faq-category" className="text-foreground text-sm font-medium">
              {isDe ? "Kategorie (optional)" : "Category (optional)"}
            </label>
            <Input
              id="faq-category"
              type="text"
              placeholder={isDe ? "z. B. Zahlungen" : "e.g. Payments"}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <label className="text-foreground flex h-9 cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-primary h-4 w-4"
            />
            {isDe ? "Auf der Website anzeigen" : "Visible on the website"}
          </label>
        </div>

        {/* Answer Editor */}
        <div className="space-y-2">
          <label className="text-foreground text-sm font-medium">{isDe ? "Antwort" : "Answer"}</label>
          <TiptapEditor
            content={answer}
            onChange={(newContent: string) => {
              setAnswer(newContent);
              if (errors.answer) setErrors({ ...errors, answer: undefined });
            }}
            placeholder={isDe ? "Antwort schreiben…" : "Write the answer..."}
          />
          {errors.answer && <p className="text-destructive text-xs">{errors.answer}</p>}
        </div>

        {submitError && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
            {submitError}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            {isDe ? "Abbrechen" : "Cancel"}
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
            {isSaving
              ? isDe
                ? "Speichern…"
                : "Saving…"
              : isEdit
                ? isDe
                  ? "FAQ aktualisieren"
                  : "Update FAQ"
                : isDe
                  ? "FAQ erstellen"
                  : "Create FAQ"}
          </Button>
        </div>
      </form>
    </>
  );
}
