"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { CategoryDetailsFields, type CategoryDetails } from "./CategoryDetailsFields";

/** A subcategory row; `id` is set for subcategories that already exist in the backend. */
export type SubCategoryInput = { id?: string; name: string };

export type EditableCategory = {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  subCategories: SubCategoryInput[];
} & CategoryDetails;

export type EditCategoryValues = Omit<EditableCategory, "id">;

type EditCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (category: EditCategoryValues) => Promise<void>;
  category: EditableCategory | null;
};

export default function EditCategoryModal({ open, onClose, onConfirm, category }: EditCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <DialogContent className="bg-background max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-[560px]">
        {open && category && (
          <EditCategoryForm key={category.id} category={category} onClose={onClose} onConfirm={onConfirm} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditCategoryForm({
  category,
  onClose,
  onConfirm,
}: {
  category: EditableCategory;
  onClose: () => void;
  onConfirm: (category: EditCategoryValues) => Promise<void>;
}) {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [status, setStatus] = useState(category.status);
  const [subCategories, setSubCategories] = useState<SubCategoryInput[]>(
    category.subCategories.length > 0 ? category.subCategories : [{ name: "" }],
  );
  const [details, setDetails] = useState<CategoryDetails>({
    nameDe: category.nameDe,
    image: category.image,
    priceCHF: category.priceCHF,
    professionalCount: category.professionalCount,
    rating: category.rating,
    reviewCount: category.reviewCount,
    featured: category.featured,
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = t.category.editModal.errors.nameRequired;
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
        status,
        subCategories: subCategories
          .map((sub) => ({ ...sub, name: sub.name.trim() }))
          .filter((sub) => sub.name !== ""),
        ...details,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : isDe ? "Speichern fehlgeschlagen." : "Could not save the category.");
    } finally {
      setIsSaving(false);
    }
  };

  const addSubCategory = () => setSubCategories([...subCategories, { name: "" }]);
  const removeSubCategory = (index: number) => setSubCategories(subCategories.filter((_, i) => i !== index));
  const handleSubCategoryChange = (index: number, value: string) =>
    setSubCategories(subCategories.map((sub, i) => (i === index ? { ...sub, name: value } : sub)));

  return (
    <>
      <DialogHeader className="bg-primary text-primary-foreground rounded-t-lg p-6">
        <DialogTitle className="text-xl font-semibold">{t.category.editModal.title}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Category Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-foreground text-sm font-medium">
            {t.category.editModal.categoryName}
          </label>
          <Input
            id="name"
            type="text"
            placeholder={t.category.editModal.categoryNamePlaceholder}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>

        {/* Description and Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="description" className="text-foreground text-sm font-medium">
              {isDe ? "Beschreibung" : "Description"}
            </label>
            <Input
              id="description"
              type="text"
              placeholder={isDe ? "Kurze Beschreibung der Kategorie" : "Short description of the category"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-foreground text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EditableCategory["status"])}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="ACTIVE">{isDe ? "Aktiv" : "Active"}</option>
              <option value="INACTIVE">{isDe ? "Inaktiv" : "Inactive"}</option>
            </select>
          </div>
          </div>

          <CategoryDetailsFields value={details} onChange={setDetails} isDe={isDe} />

          {/* Sub Categories */}
        <div className="space-y-2">
          <label className="text-foreground text-sm font-medium">{t.category.editModal.subCategories}</label>
          <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
            {subCategories.map((sub, index) => (
              <div key={sub.id ?? `new-${index}`} className="flex items-center gap-2">
                <Input
                  placeholder={`${t.category.editModal.subCategoryPlaceholder} ${index + 1}`}
                  value={sub.name}
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
            <Plus className="mr-2 h-4 w-4" /> {t.category.editModal.addSubCategory}
          </Button>
          {category.subCategories.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {isDe
                ? "Entfernte Unterkategorien werden beim Speichern gelöscht."
                : "Removed subcategories are deleted when you save."}
            </p>
          )}
        </div>

        {submitError && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
            {submitError}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            {t.category.editModal.cancel}
          </Button>
          <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
            {isSaving ? (isDe ? "Speichern…" : "Saving…") : t.category.editModal.save}
          </Button>
        </div>
      </form>
    </>
  );
}
