"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { CategoryDetailsFields, emptyCategoryDetails, type CategoryDetails } from "./CategoryDetailsFields";

export type CategoryFormValues = { name: string; description: string; subCategories: string[] } & CategoryDetails;

type CreateCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (category: CategoryFormValues) => Promise<void>;
};

export default function CreateCategoryModal({ open, onClose, onConfirm }: CreateCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <DialogContent className="bg-background max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-[560px]">
        {open && <CreateCategoryForm onClose={onClose} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}

function CreateCategoryForm({ onClose, onConfirm }: Omit<CreateCategoryModalProps, "open">) {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>([""]);
  const [details, setDetails] = useState<CategoryDetails>(emptyCategoryDetails);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = t.category.createModal.errors.nameRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    setSubmitError("");
    try {
      await onConfirm({
        name: name.trim(),
        description: description.trim(),
        subCategories: subCategories.map((sub) => sub.trim()).filter(Boolean),
        ...details,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : isDe ? "Speichern fehlgeschlagen." : "Could not create the category.");
    } finally {
      setIsSaving(false);
    }
  };

  const addSubCategory = () => setSubCategories([...subCategories, ""]);
  const removeSubCategory = (index: number) => setSubCategories(subCategories.filter((_, i) => i !== index));
  const handleSubCategoryChange = (index: number, value: string) =>
    setSubCategories(subCategories.map((sub, i) => (i === index ? value : sub)));

  return (
    <>
      <DialogHeader className="bg-primary text-primary-foreground rounded-t-lg p-6">
        <DialogTitle className="text-xl font-semibold">{t.category.createModal.title}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Category Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-foreground text-sm font-medium">
            {t.category.createModal.categoryName}
          </label>
          <Input
            id="name"
            type="text"
            placeholder={t.category.createModal.categoryNamePlaceholder}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-foreground text-sm font-medium">
            {isDe ? "Beschreibung (optional)" : "Description (optional)"}
          </label>
          <Input
            id="description"
            type="text"
            placeholder={isDe ? "Kurze Beschreibung der Kategorie" : "Short description of the category"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <CategoryDetailsFields value={details} onChange={setDetails} isDe={isDe} />

        {/* Sub Categories */}
        <div className="space-y-2">
          <label className="text-foreground text-sm font-medium">{t.category.createModal.subCategories}</label>
          <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
            {subCategories.map((sub, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`${t.category.createModal.subCategoryPlaceholder} ${index + 1}`}
                  value={sub}
                  onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                />
                {subCategories.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubCategory(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSubCategory} className="mt-2 w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> {t.category.createModal.addSubCategory}
          </Button>
        </div>

        {submitError && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
            {submitError}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            {t.category.createModal.cancel}
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
            {isSaving ? (isDe ? "Speichern…" : "Saving…") : t.category.createModal.submit}
          </Button>
        </div>
      </form>
    </>
  );
}
