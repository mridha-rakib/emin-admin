"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateCategoryModal, { type CategoryFormValues } from "./CreateCategoryModal";
import EditCategoryModal, { type EditableCategory, type EditCategoryValues } from "./EditCategoryModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDate, type Page } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type CategoryRecord = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  sortOrder?: number;
  createdAt?: string;
  nameDe?: string;
  image?: string;
  priceCHF?: number | null;
  professionalCount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  featured?: boolean;
};

type CategoryRow = CategoryRecord & { children: CategoryRecord[] };

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "category";

const errorText = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

async function fetchAllCategories() {
  const all: CategoryRecord[] = [];
  for (let page = 1; ; page += 1) {
    const result = await apiRequest<Page<CategoryRecord>>(`/categories?limit=100&page=${page}`);
    all.push(...result.items);
    if (result.items.length === 0 || page >= result.meta.pages) return all;
  }
}

// Inline DeleteCategoryModal
function DeleteCategoryModal({
  open,
  onClose,
  onConfirm,
  categoryName,
  subCategoryCount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName?: string;
  subCategoryCount: number;
}) {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleConfirm = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await onConfirm();
    } catch (error) {
      setDeleteError(errorText(error, isDe ? "Löschen fehlgeschlagen." : "Could not delete the category."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDeleteError("");
          onClose();
        }
      }}
      modal={false}
    >
      <DialogContent className="bg-background sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.category.deleteModal.title}</DialogTitle>
          <DialogDescription>
            {t.category.deleteModal.desc.replace("{name}", categoryName || "")}
            {subCategoryCount > 0 &&
              (isDe
                ? ` Die ${subCategoryCount} Unterkategorie(n) werden ebenfalls gelöscht.`
                : ` Its ${subCategoryCount} subcategor${subCategoryCount === 1 ? "y" : "ies"} will be deleted too.`)}
          </DialogDescription>
        </DialogHeader>
        {deleteError && <p className="text-destructive text-sm">{deleteError}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t.category.deleteModal.cancel}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? (isDe ? "Löschen…" : "Deleting…") : t.category.deleteModal.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InactiveBadge() {
  const { language } = useTranslation();
  return (
    <span className="bg-muted text-muted-foreground ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
      {language === "DE" ? "Inaktiv" : "Inactive"}
    </span>
  );
}

function CategoryTable({
  categories,
  onDelete,
  onEdit,
  startIndex,
}: {
  categories: CategoryRow[];
  onDelete: (category: CategoryRow) => void;
  onEdit: (category: CategoryRow) => void;
  startIndex: number;
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* Desktop Table View */}
      <div className="bg-card border-border hidden overflow-hidden rounded-b-lg border shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.category.tableHeaders.no}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.category.tableHeaders.categoryName}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.category.tableHeaders.subCategories}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.category.tableHeaders.createdDate}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.category.tableHeaders.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {categories.map((cat, idx) => (
                <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{startIndex + idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className="text-foreground text-sm font-medium whitespace-nowrap">{cat.name}</span>
                    {cat.featured && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Featured</span>
                    )}
                    {cat.status === "INACTIVE" && <InactiveBadge />}
                    {cat.description && (
                      <p className="text-muted-foreground line-clamp-1 max-w-xs text-xs">{cat.description}</p>
                    )}
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {cat.children.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                      {cat.children.slice(0, 3).map((sub) => (
                        <span key={sub._id} className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs">
                          {sub.name}
                        </span>
                      ))}
                      {cat.children.length > 3 && (
                        <span className="text-muted-foreground py-0.5 text-xs">
                          +{cat.children.length - 3} {t.category.more}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">{formatDate(cat.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                        onClick={() => onEdit(cat)}
                        title={t.category.actions.editCategory}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => onDelete(cat)}
                        title={t.category.actions.deleteCategory}
                      >
                        <Trash2 className="h-4 w-4" />
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
        {categories.map((cat, idx) => (
          <div key={cat._id} className="bg-card border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground truncate font-semibold">
                  {cat.name}
                  {cat.status === "INACTIVE" && <InactiveBadge />}
                </h3>
                <p className="text-muted-foreground text-xs">#{startIndex + idx + 1}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                  onClick={() => onEdit(cat)}
                  title={t.category.actions.editCategory}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  onClick={() => onDelete(cat)}
                  title={t.category.actions.deleteCategory}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">{t.category.tableHeaders.subCategories}:</span>
                <div className="flex flex-wrap gap-1">
                  {cat.children.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                  {cat.children.map((sub) => (
                    <span key={sub._id} className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">{t.category.tableHeaders.createdDate}:</span>
                <span className="text-foreground">{formatDate(cat.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CategoryPage() {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const [records, setRecords] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<CategoryRow | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const itemsPerPage = 10;

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      setRecords(await fetchAllCategories());
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      setLoadError(errorText(error, "Could not load categories."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const rows = useMemo<CategoryRow[]>(() => {
    const ids = new Set(records.map((record) => record._id));
    const byOrder = (a: CategoryRecord, b: CategoryRecord) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name);
    return records
      .filter((record) => !record.parentId || !ids.has(record.parentId))
      .map((record) => ({
        ...record,
        children: records.filter((child) => child.parentId === record._id).sort(byOrder),
      }));
  }, [records]);

  const needle = query.trim().toLowerCase();
  const filtered = rows.filter(
    (row) =>
      !needle ||
      row.name.toLowerCase().includes(needle) ||
      row.children.some((child) => child.name.toLowerCase().includes(needle)),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filtered.slice(startIndex, endIndex);

  const flash = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  /** Slugs are unique across all categories, so suffix a counter when needed. */
  const makeSlugFactory = () => {
    const taken = new Set(records.map((record) => record.slug));
    return (base: string) => {
      let candidate = base;
      for (let n = 2; taken.has(candidate); n += 1) candidate = `${base}-${n}`;
      taken.add(candidate);
      return candidate;
    };
  };

  const createSubCategories = async (parent: { _id: string; slug: string }, names: string[], nextSlug: (base: string) => string, firstOrder = 0) => {
    for (const [index, name] of names.entries()) {
      await apiRequest("/categories", {
        method: "POST",
        body: JSON.stringify({
          payload: {
            name,
            slug: nextSlug(`${parent.slug}-${slugify(name)}`),
            parentId: parent._id,
            status: "ACTIVE",
            sortOrder: firstOrder + index,
          },
        }),
      });
    }
  };

  const handleCreateCategory = async (values: CategoryFormValues) => {
    const nextSlug = makeSlugFactory();
    try {
      const parent = await apiRequest<CategoryRecord>("/categories", {
        method: "POST",
        body: JSON.stringify({
          payload: {
            name: values.name,
            slug: nextSlug(slugify(values.name)),
            ...(values.description ? { description: values.description } : {}),
            status: "ACTIVE",
            parentId: null,
            nameDe: values.nameDe.trim(),
            image: values.image.trim(),
            featured: values.featured,
            ...(values.priceCHF !== "" ? { priceCHF: Number(values.priceCHF) } : {}),
            ...(values.professionalCount !== "" ? { professionalCount: Number(values.professionalCount) } : {}),
            ...(values.rating !== "" ? { rating: Number(values.rating) } : {}),
            ...(values.reviewCount !== "" ? { reviewCount: Number(values.reviewCount) } : {}),
          },
        }),
      });
      await createSubCategories(parent, values.subCategories, nextSlug);
      flash("success", isDe ? "Kategorie erstellt." : "Category created.");
    } finally {
      await reload();
    }
  };

  const handleUpdateCategory = async (values: EditCategoryValues) => {
    const category = editingCategory;
    if (!category) return;
    const nextSlug = makeSlugFactory();
    try {
      const parentChanges: Record<string, unknown> = {};
      if (values.name !== category.name) parentChanges.name = values.name;
      if (values.description !== (category.description ?? "")) parentChanges.description = values.description;
      if (values.status !== (category.status ?? "ACTIVE")) parentChanges.status = values.status;
      parentChanges.nameDe = values.nameDe.trim();
      parentChanges.image = values.image.trim();
      parentChanges.featured = values.featured;
      parentChanges.priceCHF = values.priceCHF === "" ? null : Number(values.priceCHF);
      parentChanges.professionalCount = values.professionalCount === "" ? null : Number(values.professionalCount);
      parentChanges.rating = values.rating === "" ? null : Number(values.rating);
      parentChanges.reviewCount = values.reviewCount === "" ? null : Number(values.reviewCount);
      if (Object.keys(parentChanges).length > 0) {
        await apiRequest(`/categories/${category._id}`, { method: "PATCH", body: JSON.stringify({ payload: parentChanges }) });
      }

      const keptIds = new Set(values.subCategories.map((sub) => sub.id).filter(Boolean));
      for (const child of category.children) {
        if (!keptIds.has(child._id)) await apiRequest(`/categories/${child._id}`, { method: "DELETE" });
      }
      for (const sub of values.subCategories) {
        const original = sub.id ? category.children.find((child) => child._id === sub.id) : undefined;
        if (original && original.name !== sub.name) {
          await apiRequest(`/categories/${original._id}`, { method: "PATCH", body: JSON.stringify({ payload: { name: sub.name } }) });
        }
      }
      const maxOrder = Math.max(-1, ...category.children.map((child) => child.sortOrder ?? 0));
      await createSubCategories(
        category,
        values.subCategories.filter((sub) => !sub.id).map((sub) => sub.name),
        nextSlug,
        maxOrder + 1,
      );
      flash("success", isDe ? "Kategorie gespeichert." : "Category saved.");
    } finally {
      await reload();
    }
  };

  const handleDeleteConfirm = async () => {
    const category = deleteCategory;
    if (!category) return;
    try {
      for (const child of category.children) {
        await apiRequest(`/categories/${child._id}`, { method: "DELETE" });
      }
      await apiRequest(`/categories/${category._id}`, { method: "DELETE" });
      setDeleteCategory(null);
      flash("success", isDe ? "Kategorie gelöscht." : "Category deleted.");
    } finally {
      await reload();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Top header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{t.category.title}</h2>
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t.category.searchPlaceholder}
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
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> {t.category.addCategory}
            </Button>
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`border-x px-4 py-2 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Table area */}
      <div>
        {(isLoading && records.length === 0) || loadError || filtered.length === 0 ? (
          <DataState
            className="rounded-t-none"
            isLoading={isLoading && records.length === 0}
            error={loadError}
            isEmpty={filtered.length === 0}
            emptyTitle={rows.length === 0 ? (isDe ? "Noch keine Kategorien" : "No categories yet") : t.category.noCategoriesFound}
            emptyDescription={
              rows.length === 0
                ? isDe
                  ? "Klicken Sie auf „Kategorie hinzufügen“, um die erste Kategorie anzulegen."
                  : "Click “Add Category” to create the first category."
                : undefined
            }
            onRetry={reload}
          />
        ) : (
          <CategoryTable
            categories={paginatedCategories}
            onDelete={setDeleteCategory}
            onEdit={setEditingCategory}
            startIndex={startIndex}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-card border-border rounded-b-lg border-t p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-muted-foreground text-sm">
              {t.category.showing} {startIndex + 1} {t.category.to} {Math.min(endIndex, filtered.length)} {t.category.of}{" "}
              {filtered.length} {t.category.categoriesCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">{t.common.previous}</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={safePage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="h-8"
              >
                <span className="mr-1 hidden sm:inline">{t.common.next}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      <CreateCategoryModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateCategory}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        open={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onConfirm={handleUpdateCategory}
        category={
          editingCategory
            ? ({
                id: editingCategory._id,
                name: editingCategory.name,
                description: editingCategory.description ?? "",
                status: editingCategory.status ?? "ACTIVE",
                nameDe: editingCategory.nameDe ?? "",
                image: editingCategory.image ?? "",
                priceCHF: editingCategory.priceCHF == null ? "" : String(editingCategory.priceCHF),
                professionalCount: editingCategory.professionalCount == null ? "" : String(editingCategory.professionalCount),
                rating: editingCategory.rating == null ? "" : String(editingCategory.rating),
                reviewCount: editingCategory.reviewCount == null ? "" : String(editingCategory.reviewCount),
                featured: Boolean(editingCategory.featured),
                subCategories: editingCategory.children.map((child) => ({ id: child._id, name: child.name })),
              } satisfies EditableCategory)
            : null
        }
      />

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDeleteConfirm}
        categoryName={deleteCategory?.name}
        subCategoryCount={deleteCategory?.children.length ?? 0}
      />
    </div>
  );
}
