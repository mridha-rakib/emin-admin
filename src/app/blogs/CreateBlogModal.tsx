"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { useTranslation } from "@/context/LanguageContext";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  status: BlogStatus;
  content: string;
};

export type EditableBlog = BlogFormValues & { id: string };

type CreateBlogModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (blog: BlogFormValues) => Promise<void>;
  /** When set, the modal edits this post instead of creating a new one. */
  blog?: EditableBlog | null;
};

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const isEmptyHtml = (html: string) => !html.replace(/<[^>]*>/g, "").trim() && !/<img/i.test(html);

export default function CreateBlogModal({ open, onClose, onConfirm, blog }: CreateBlogModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <DialogContent className="bg-background max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-[800px]">
        {open && <BlogForm key={blog?.id ?? "new"} blog={blog ?? null} onClose={onClose} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}

function BlogForm({
  blog,
  onClose,
  onConfirm,
}: {
  blog: EditableBlog | null;
  onClose: () => void;
  onConfirm: (blog: BlogFormValues) => Promise<void>;
}) {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const isEdit = Boolean(blog);

  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(blog?.coverImage ?? "");
  const [tags, setTags] = useState((blog?.tags ?? []).join(", "));
  const [status, setStatus] = useState<BlogStatus>(blog?.status ?? "DRAFT");
  const [content, setContent] = useState(blog?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<{ title?: string; slug?: string; content?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = t.blogs.createModal.errors.titleRequired;
    if (!slugify(slug || title)) newErrors.slug = isDe ? "Slug ist erforderlich" : "Slug is required";
    if (isEmptyHtml(content)) newErrors.content = t.blogs.createModal.errors.contentRequired;
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
        title: title.trim(),
        slug: slugify(slug || title),
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status,
        content,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : isDe ? "Speichern fehlgeschlagen." : "Could not save the blog post.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectClass =
    "border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-[3px]";

  return (
    <>
      <DialogHeader className="bg-primary text-primary-foreground sticky top-0 z-10 rounded-t-lg p-6">
        <DialogTitle className="text-xl font-semibold">
          {isEdit ? (isDe ? "Blogbeitrag bearbeiten" : "Edit Blog Post") : t.blogs.createModal.title}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-foreground text-sm font-medium">
            {t.blogs.createModal.blogTitle}
          </label>
          <Input
            id="title"
            type="text"
            placeholder={t.blogs.createModal.blogTitlePlaceholder}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
        </div>

        {/* Slug and Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="slug" className="text-foreground text-sm font-medium">
              {isDe ? "URL-Slug" : "URL Slug"}
            </label>
            <Input
              id="slug"
              type="text"
              placeholder="modern-home-renovation-trends"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
                if (errors.slug) setErrors({ ...errors, slug: undefined });
              }}
              onBlur={() => setSlug(slugify(slug || title))}
              className={errors.slug ? "border-destructive" : ""}
            />
            {errors.slug && <p className="text-destructive text-xs">{errors.slug}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-foreground text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogStatus)}
              className={selectClass}
            >
              <option value="DRAFT">{isDe ? "Entwurf" : "Draft"}</option>
              <option value="PUBLISHED">{isDe ? "Veröffentlicht" : "Published"}</option>
              <option value="ARCHIVED">{isDe ? "Archiviert" : "Archived"}</option>
            </select>
          </div>
        </div>

        {/* Tags and Cover image */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="tags" className="text-foreground text-sm font-medium">
              {isDe ? "Schlagwörter (kommagetrennt)" : "Tags (comma separated)"}
            </label>
            <Input
              id="tags"
              type="text"
              placeholder={isDe ? "z. B. Wohnen, Renovierung" : "e.g. Home, Renovation"}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-foreground text-sm font-medium">
              {isDe ? "Titelbild-URL (optional)" : "Cover image URL (optional)"}
            </label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://…"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-foreground text-sm font-medium">
            {isDe ? "Kurzbeschreibung (optional)" : "Excerpt (optional)"}
          </label>
          <textarea
            id="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={isDe ? "Kurze Zusammenfassung für Übersichten" : "Short summary shown in listings"}
            className="border-input bg-background w-full resize-none rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <label className="text-foreground text-sm font-medium">{t.blogs.createModal.content}</label>
          <TiptapEditor
            content={content}
            onChange={(newContent: string) => {
              setContent(newContent);
              if (errors.content) setErrors({ ...errors, content: undefined });
            }}
          />
          {errors.content && <p className="text-destructive text-xs">{errors.content}</p>}
        </div>

        {submitError && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm">
            {submitError}
          </p>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            {t.blogs.createModal.cancel}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
          >
            {isSaving
              ? isDe
                ? "Speichern…"
                : "Saving…"
              : isEdit
                ? isDe
                  ? "Änderungen speichern"
                  : "Save changes"
                : t.blogs.createModal.submit}
          </Button>
        </div>
      </form>
    </>
  );
}
