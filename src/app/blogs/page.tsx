"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import CreateBlogModal, { type BlogFormValues, type BlogStatus, type EditableBlog } from "./CreateBlogModal";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest } from "@/lib/api";
import { formatDate, useApi, type Page } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";
import { useAuthStore } from "@/store/auth-store";

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  authorId?: string | null;
  tags?: string[];
  status: BlogStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_STYLES: Record<BlogStatus, string> = {
  DRAFT: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: BlogStatus }) {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const labels: Record<BlogStatus, string> = {
    DRAFT: isDe ? "Entwurf" : "Draft",
    PUBLISHED: isDe ? "Veröffentlicht" : "Published",
    ARCHIVED: isDe ? "Archiviert" : "Archived",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT}`}>
      {labels[status] ?? status}
    </span>
  );
}

function TagList({ tags }: { tags?: string[] }) {
  if (!tags?.length) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <span key={tag} className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          {tag}
        </span>
      ))}
      {tags.length > 3 && <span className="text-muted-foreground py-0.5 text-xs">+{tags.length - 3}</span>}
    </div>
  );
}

function BlogsTable({
  blogs,
  onView,
  onEdit,
  onDelete,
  startIndex,
}: {
  blogs: BlogPost[];
  onView: (blog: BlogPost) => void;
  onEdit: (blog: BlogPost) => void;
  onDelete: (blog: BlogPost) => void;
  startIndex: number;
}) {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const editLabel = isDe ? "Blog bearbeiten" : "Edit Blog";
  return (
    <>
      {/* Desktop Table View */}
      <div className="bg-card border-border hidden overflow-hidden rounded-b-lg border shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.blogs.tableHeaders.no}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.blogs.tableHeaders.title}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {isDe ? "Schlagwörter" : "Tags"}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.blogs.tableHeaders.createdDate}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.blogs.tableHeaders.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {blogs.map((blog, idx) => (
                <tr key={blog._id} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground line-clamp-1 text-sm font-medium">{blog.title}</span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">/{blog.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={blog.status} />
                  </td>
                  <td className="px-6 py-4">
                    <TagList tags={blog.tags} />
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm whitespace-nowrap">
                    {formatDate(blog.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                        onClick={() => onView(blog)}
                        title={t.blogs.actions.viewBlog}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                        onClick={() => onEdit(blog)}
                        title={editLabel}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => onDelete(blog)}
                        title={t.blogs.actions.deleteBlog}
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
        {blogs.map((blog, idx) => (
          <div key={blog._id} className="bg-card border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground line-clamp-2 font-semibold">{blog.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">#{startIndex + idx + 1}</p>
              </div>
              <div className="ml-2 flex flex-shrink-0 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                  onClick={() => onView(blog)}
                  title={t.blogs.actions.viewBlog}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                  onClick={() => onEdit(blog)}
                  title={editLabel}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  onClick={() => onDelete(blog)}
                  title={t.blogs.actions.deleteBlog}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={blog.status} />
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{isDe ? "Schlagwörter:" : "Tags:"}</span>
                <TagList tags={blog.tags} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDe ? "Erstellt:" : "Created:"}</span>
                <span className="text-foreground">{formatDate(blog.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const toEditable = (blog: BlogPost): EditableBlog => ({
  id: blog._id,
  title: blog.title ?? "",
  slug: blog.slug ?? "",
  excerpt: blog.excerpt ?? "",
  coverImage: blog.coverImage ?? "",
  tags: blog.tags ?? [],
  status: blog.status ?? "DRAFT",
  content: blog.content ?? "",
});

export default function BlogsPage() {
  const { t, language } = useTranslation();
  const isDe = language === "DE";
  const adminId = useAuthStore((state) => state.adminId);
  const adminName = useAuthStore((state) => state.adminName);
  const { data, error, isLoading, reload } = useApi<Page<BlogPost>>("/blogs?limit=100");
  const blogs = useMemo(() => data?.items ?? [], [data]);

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const itemsPerPage = 5;

  const needle = query.trim().toLowerCase();
  const filtered = blogs.filter(
    (blog) =>
      !needle ||
      blog.title?.toLowerCase().includes(needle) ||
      blog.slug?.toLowerCase().includes(needle) ||
      blog.status?.toLowerCase().includes(needle) ||
      (blog.tags ?? []).some((tag) => tag.toLowerCase().includes(needle)),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlogs = filtered.slice(startIndex, endIndex);

  const flash = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const uniqueSlug = (base: string, ignoreId?: string) => {
    const taken = new Set(blogs.filter((blog) => blog._id !== ignoreId).map((blog) => blog.slug));
    let candidate = base;
    for (let n = 2; taken.has(candidate); n += 1) candidate = `${base}-${n}`;
    return candidate;
  };

  const handleSaveBlog = async (values: BlogFormValues) => {
    const existing = editingBlog;
    const payload: Record<string, unknown> = {
      ...values,
      slug: uniqueSlug(values.slug, existing?._id),
    };
    if (values.status === "PUBLISHED" && !existing?.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }
    if (existing) {
      await apiRequest(`/blogs/${existing._id}`, { method: "PATCH", body: JSON.stringify({ payload }) });
    } else {
      if (/^[a-f0-9]{24}$/i.test(adminId)) payload.authorId = adminId;
      await apiRequest("/blogs", { method: "POST", body: JSON.stringify({ payload }) });
    }
    flash("success", existing ? (isDe ? "Blogbeitrag aktualisiert." : "Blog post updated.") : isDe ? "Blogbeitrag erstellt." : "Blog post created.");
    await reload();
  };

  const handleDeleteBlog = async (blog: BlogPost) => {
    if (!confirm(t.blogs.deleteConfirm)) return;
    try {
      await apiRequest(`/blogs/${blog._id}`, { method: "DELETE" });
      flash("success", isDe ? "Blogbeitrag gelöscht." : "Blog post deleted.");
      await reload();
    } catch (deleteError) {
      flash("error", deleteError instanceof Error ? deleteError.message : isDe ? "Löschen fehlgeschlagen." : "Could not delete the blog post.");
    }
  };

  const authorLabel = (blog: BlogPost) =>
    blog.authorId && blog.authorId === adminId ? adminName || (isDe ? "Administrator" : "Admin") : "";

  return (
    <div className="bg-background min-h-screen">
      {/* Top header */}
      <div className="bg-primary text-primary-foreground rounded-t-lg p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{t.blogs.title}</h2>
          </div>
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={isDe ? "Blogs nach Titel oder Schlagwort suchen…" : "Search blogs by title or tag..."}
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
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.blogs.createBlog}
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
        {isLoading || error || filtered.length === 0 ? (
          <DataState
            className="rounded-t-none"
            isLoading={isLoading && !data}
            error={error}
            isEmpty={filtered.length === 0}
            emptyTitle={blogs.length === 0 ? (isDe ? "Noch keine Blogbeiträge" : "No blog posts yet") : t.blogs.noBlogsFound}
            emptyDescription={
              blogs.length === 0
                ? isDe
                  ? "Klicken Sie auf „Blog erstellen“, um den ersten Beitrag zu veröffentlichen."
                  : "Click “Create Blog” to write the first post."
                : undefined
            }
            onRetry={reload}
          />
        ) : (
          <BlogsTable
            blogs={paginatedBlogs}
            onView={setSelectedBlog}
            onEdit={setEditingBlog}
            onDelete={handleDeleteBlog}
            startIndex={startIndex}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-card border-border rounded-b-lg border-t p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-muted-foreground text-sm">
              {t.blogs.showing} {startIndex + 1} {t.blogs.to} {Math.min(endIndex, filtered.length)} {t.blogs.of} {filtered.length}{" "}
              {t.blogs.blogsCount}
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

      {/* Create / Edit Blog Modal */}
      <CreateBlogModal
        open={showCreateModal || Boolean(editingBlog)}
        blog={editingBlog ? toEditable(editingBlog) : null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingBlog(null);
        }}
        onConfirm={handleSaveBlog}
      />

      {/* View Blog Modal (Simple preview) */}
      {selectedBlog && (
        <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)} modal={false}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedBlog.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                {authorLabel(selectedBlog) && (
                  <>
                    <span>
                      {t.blogs.by} {authorLabel(selectedBlog)}
                    </span>
                    <span>•</span>
                  </>
                )}
                <StatusBadge status={selectedBlog.status} />
                <span>•</span>
                <span>{formatDate(selectedBlog.publishedAt ?? selectedBlog.createdAt)}</span>
                <span>•</span>
                <span>/{selectedBlog.slug}</span>
              </div>
              {(selectedBlog.tags ?? []).length > 0 && <TagList tags={selectedBlog.tags} />}
              {selectedBlog.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedBlog.coverImage} alt={selectedBlog.title} className="max-h-72 w-full rounded-lg object-cover" />
              )}
              {selectedBlog.excerpt && <p className="text-muted-foreground text-sm italic">{selectedBlog.excerpt}</p>}
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
