"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CreateFAQModal, { type FAQFormValues } from "./CreateFAQModal";
import EditFAQModal, { type EditableFAQ } from "./EditFAQModal";
import DeleteFAQModal from "./DeleteFAQModal";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest } from "@/lib/api";
import { useApi, type Page } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type FAQ = {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  active?: boolean;
  createdAt?: string;
};

export default function FAQPage() {
  const router = useRouter();
  const { language } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload } = useApi<Page<FAQ>>("/faqs?limit=100");

  const faqs = useMemo(
    () =>
      [...(data?.items ?? [])].sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
      ),
    [data],
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const flash = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateFAQ = async (faq: FAQFormValues) => {
    const sortOrder = faqs.reduce((max, item) => Math.max(max, item.sortOrder ?? 0), -1) + 1;
    await apiRequest("/faqs", {
      method: "POST",
      body: JSON.stringify({ payload: { ...faq, sortOrder } }),
    });
    flash("success", isDe ? "FAQ erstellt." : "FAQ created.");
    await reload();
  };

  const handleEditFAQ = async ({ id, ...faq }: EditableFAQ) => {
    await apiRequest(`/faqs/${id}`, { method: "PATCH", body: JSON.stringify({ payload: faq }) });
    flash("success", isDe ? "FAQ aktualisiert." : "FAQ updated.");
    await reload();
  };

  const handleDeleteFAQ = async () => {
    if (!selectedFaq) return;
    await apiRequest(`/faqs/${selectedFaq._id}`, { method: "DELETE" });
    flash("success", isDe ? "FAQ gelöscht." : "FAQ deleted.");
    await reload();
  };

  const openEditModal = (faq: FAQ) => {
    setSelectedFaq(faq);
    setEditModalOpen(true);
  };

  const openDeleteModal = (faq: FAQ) => {
    setSelectedFaq(faq);
    setDeleteModalOpen(true);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">{isDe ? "FAQs verwalten" : "Manage FAQs"}</h2>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isDe ? "FAQ hinzufügen" : "Add FAQ"}
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={`px-4 py-2 text-sm font-medium ${
            notice.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* FAQ List */}
      <div className="bg-card p-6">
        {(isLoading && !data) || error || faqs.length === 0 ? (
          <DataState
            isLoading={isLoading && !data}
            error={error}
            isEmpty={faqs.length === 0}
            emptyTitle={isDe ? "Noch keine FAQs" : "No FAQs yet"}
            emptyDescription={
              isDe
                ? "Klicken Sie auf „FAQ hinzufügen“, um den ersten Eintrag zu erstellen."
                : "Click “Add FAQ” to create your first FAQ item."
            }
            onRetry={reload}
          />
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq._id} className="border-border hover:bg-muted/30 rounded-lg border p-4 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-foreground text-base font-semibold">{faq.question}</h3>
                      {faq.category && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {faq.category}
                        </span>
                      )}
                      {faq.active === false && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                          {isDe ? "Ausgeblendet" : "Hidden"}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-muted-foreground prose prose-sm max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditModal(faq)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary hover:text-primary-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => openDeleteModal(faq)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFAQModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onConfirm={handleCreateFAQ} />
      <EditFAQModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedFaq(null);
        }}
        onConfirm={handleEditFAQ}
        faq={
          selectedFaq
            ? {
                id: selectedFaq._id,
                question: selectedFaq.question,
                answer: selectedFaq.answer,
                category: selectedFaq.category ?? "",
                active: selectedFaq.active !== false,
              }
            : null
        }
      />
      <DeleteFAQModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedFaq(null);
        }}
        onConfirm={handleDeleteFAQ}
        faqQuestion={selectedFaq?.question || ""}
      />
    </div>
  );
}
