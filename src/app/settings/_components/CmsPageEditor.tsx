"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { DataState } from "@/components/common/DataState";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDateTime, type Page } from "@/lib/admin-api";

type PageStatus = "DRAFT" | "PUBLISHED";

type CmsPage = {
  _id: string;
  title: string;
  slug: string;
  content?: { body?: unknown; html?: unknown } | null;
  status?: PageStatus;
  updatedAt?: string;
};

async function findPageBySlug(slug: string) {
  for (let page = 1; ; page += 1) {
    const result = await apiRequest<Page<CmsPage>>(`/pages?limit=100&page=${page}`);
    const match = result.items.find((item) => item.slug === slug);
    if (match) return match;
    if (result.items.length === 0 || page >= result.meta.pages) return null;
  }
}

const bodyOf = (page: CmsPage | null) => {
  const body = page?.content?.body ?? page?.content?.html;
  return typeof body === "string" ? body : "";
};

/** Loads the CMS page with `slug` from /pages and saves it back (POST on first save, PATCH afterwards). */
export default function CmsPageEditor({
  slug,
  title,
  heading,
  placeholder,
  initialContent = "",
}: {
  slug: string;
  /** Title stored on the page record. */
  title: string;
  /** Localized heading shown in the dashboard. */
  heading: string;
  placeholder: string;
  /** Shown in the editor until the page is saved for the first time. */
  initialContent?: string;
}) {
  const router = useRouter();
  const { language } = useTranslation();
  const isDe = language === "DE";

  const [page, setPage] = useState<CmsPage | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<PageStatus>("PUBLISHED");
  const [editorKey, setEditorKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const found = await findPageBySlug(slug);
      setPage(found);
      setContent(found ? bodyOf(found) : initialContent);
      setStatus(found?.status ?? "PUBLISHED");
      setEditorKey((key) => key + 1);
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      setLoadError(error instanceof Error ? error.message : "Could not load the page.");
    } finally {
      setIsLoading(false);
    }
  }, [initialContent, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setIsSaving(true);
    setNotice(null);
    try {
      const payload = { title, slug, content: { body: content }, status };
      const saved = page
        ? await apiRequest<CmsPage>(`/pages/${page._id}`, { method: "PATCH", body: JSON.stringify({ payload }) })
        : await apiRequest<CmsPage>("/pages", { method: "POST", body: JSON.stringify({ payload }) });
      if (saved) setPage(saved);
      setNotice({ type: "success", text: isDe ? "Änderungen gespeichert." : "Changes saved." });
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : isDe ? "Speichern fehlgeschlagen." : "Could not save the page.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:opacity-80">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">{heading}</h2>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-card space-y-3 p-6">
        {isLoading || loadError ? (
          <DataState isLoading={isLoading} error={loadError} emptyTitle="" onRetry={load} />
        ) : (
          <>
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs">
              <span>
                {page
                  ? `${isDe ? "Zuletzt gespeichert" : "Last saved"}: ${formatDateTime(page.updatedAt)}`
                  : isDe
                    ? "Diese Seite wurde noch nicht gespeichert. Schreiben Sie den Inhalt und klicken Sie auf „Änderungen speichern“."
                    : "This page has not been saved yet. Write the content and click “Save changes” to publish it."}
              </span>
              <label className="flex items-center gap-2">
                <span className="font-medium">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PageStatus)}
                  className="border-input bg-background text-foreground h-8 rounded-md border px-2 text-xs"
                >
                  <option value="PUBLISHED">{isDe ? "Veröffentlicht" : "Published"}</option>
                  <option value="DRAFT">{isDe ? "Entwurf" : "Draft"}</option>
                </select>
              </label>
            </div>
            <TiptapEditor key={editorKey} content={content} onChange={setContent} placeholder={placeholder} />
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-sidebar flex flex-col items-center justify-center gap-3 p-4 sm:flex-row">
        {notice && (
          <span
            className={`flex items-center gap-1.5 text-sm font-medium ${
              notice.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            }`}
          >
            {notice.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {notice.text}
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={isLoading || Boolean(loadError) || isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
        >
          {isSaving ? (isDe ? "Speichern…" : "Saving…") : isDe ? "Änderungen speichern" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
