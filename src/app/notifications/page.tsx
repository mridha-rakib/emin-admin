"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/common/DataState";
import { markNotificationsRead, type AppNotification } from "@/components/common/NotificationMenu";
import { useTranslation } from "@/context/LanguageContext";
import { SessionExpiredError } from "@/lib/api";
import { initials, useApi, type Page } from "@/lib/admin-api";

import { formatDistanceToNow } from "date-fns";

const ITEMS_PER_PAGE = 10;

const Notifications = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading, reload, setData } = useApi<Page<AppNotification>>(
    `/notifications?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
  );
  const [isMarking, setIsMarking] = useState(false);
  const [actionError, setActionError] = useState("");

  const notifications = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.pages ?? 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n._id);

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    setIsMarking(true);
    setActionError("");
    try {
      const updated = await markNotificationsRead(ids);
      const byId = new Map(updated.map((n) => [n._id, n]));
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((n) => (byId.has(n._id) ? { ...n, readAt: byId.get(n._id)?.readAt } : n)) } : prev
      );
    } catch (markError) {
      if (!(markError instanceof SessionExpiredError)) {
        setActionError(markError instanceof Error ? markError.message : "Could not update notifications.");
      }
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="max-h-[86vh] overflow-y-auto px-4 pb-4 sm:px-0">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-semibold sm:text-2xl">{t.notifications.title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void markRead(unreadIds)}
          disabled={isMarking || unreadIds.length === 0}
          className="w-full border border-transparent sm:w-auto dark:border-[#746450]"
        >
          {t.notifications.markAllRead}
        </Button>
      </div>

      {actionError && <p className="mb-3 text-sm text-destructive">{actionError}</p>}

      {!data || notifications.length === 0 ? (
        isLoading || error ? (
          <DataState
            isLoading={isLoading}
            error={error}
            emptyTitle={t.notifications.noNotifications}
            onRetry={() => void reload()}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
              <span className="text-3xl sm:text-4xl">🔔</span>
            </div>
            <p className="text-muted-foreground text-center text-sm sm:text-base">
              {t.notifications.noNotifications}
            </p>
          </div>
        )
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-card text-card-foreground relative rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md dark:border-[#746450] ${
                  notification.readAt ? "opacity-70" : ""
                }`}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="bg-muted-foreground/10 text-muted-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm sm:h-12 sm:w-12">
                    {initials(notification.title || "N")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold sm:text-base sm:whitespace-normal">
                        {!notification.readAt && (
                          <span className="bg-primary mr-2 inline-block h-2 w-2 rounded-full align-middle" />
                        )}
                        {notification.title}
                      </h3>
                      {!notification.readAt && (
                        <button
                          type="button"
                          onClick={() => void markRead([notification._id])}
                          disabled={isMarking}
                          className="text-primary shrink-0 text-xs hover:underline disabled:opacity-50"
                        >
                          {t.notifications.mark}
                        </button>
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm sm:line-clamp-none">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2 text-xs">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      {notification.type && ` · ${notification.type}`}
                      {notification.channel && ` · ${notification.channel}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-card border-border mt-4 rounded-lg border p-4">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-muted-foreground text-sm">
                  {t.common.showing} {startIndex + 1} {t.common.to} {Math.min(startIndex + ITEMS_PER_PAGE, total)} {t.common.of}{" "}
                  {total} {t.notifications.title.toLowerCase()}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">{t.common.previous}</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8"
                  >
                    <span className="mr-1 hidden sm:inline">{t.common.next}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
