"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, SessionExpiredError } from "@/lib/api";
import { useApi, type Page } from "@/lib/admin-api";

export type AppNotification = {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  readAt?: string | null;
  createdAt: string;
};

/** Marks the given notifications as read on the backend and returns the updated documents. */
export async function markNotificationsRead(ids: string[]) {
  const readAt = new Date().toISOString();
  const updated = await Promise.all(
    ids.map((id) =>
      apiRequest<AppNotification | null>(`/notifications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ payload: { readAt } }),
      })
    )
  );
  return updated.filter((n): n is AppNotification => Boolean(n));
}

const RECENT_LIMIT = 5;

export default function NotificationMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const ref = useRef<HTMLDivElement | null>(null);
  const { data, error, isLoading, setData } = useApi<Page<AppNotification>>(
    open ? `/notifications?page=1&limit=${RECENT_LIMIT}` : null
  );
  const [isMarking, setIsMarking] = useState(false);
  const items = data?.items ?? [];
  const unreadIds = items.filter((it) => !it.readAt).map((it) => it._id);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    setIsMarking(true);
    try {
      const updated = await markNotificationsRead(ids);
      const byId = new Map(updated.map((n) => [n._id, n]));
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((n) => (byId.has(n._id) ? { ...n, readAt: byId.get(n._id)?.readAt } : n)) } : prev
      );
    } catch (markError) {
      if (!(markError instanceof SessionExpiredError)) console.error(markError);
    } finally {
      setIsMarking(false);
    }
  };

  if (!open) return null;

  return (
    <div ref={ref} className="absolute right-0 z-50 mt-2 w-[320px]">
      <div className="bg-card border-border rounded-lg border p-2 shadow-md">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-sm font-medium">{t.notifications.title}</div>
          <button
            onClick={() => void markRead(unreadIds)}
            disabled={isMarking || unreadIds.length === 0}
            className="text-muted-foreground rounded-sm border border-transparent px-2 py-1 text-xs hover:underline disabled:opacity-50 disabled:no-underline dark:border-[#F4B057]"
          >
            {t.notifications.readAll}
          </button>
        </div>

        <div className="mt-1 divide-y">
          {isLoading && !data ? (
            <p className="text-muted-foreground px-3 py-4 text-center text-xs">{isDe ? "Wird geladen…" : "Loading…"}</p>
          ) : error ? (
            <p className="text-destructive px-3 py-4 text-center text-xs">{error}</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground px-3 py-4 text-center text-xs">{t.notifications.noNotifications}</p>
          ) : (
            items.map((it) => (
              <div
                key={it._id}
                className={`flex items-start gap-2 px-3 py-2 ${it.readAt ? "opacity-60" : ""}`}
              >
                <div className="text-muted-foreground pt-1">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{it.title}</div>
                  <div className="text-muted-foreground line-clamp-2 text-xs">{it.body}</div>
                  <div className="text-muted-foreground mt-0.5 text-[10px]">
                    {formatDistanceToNow(new Date(it.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="pl-2">
                  {!it.readAt && (
                    <button
                      onClick={() => void markRead([it._id])}
                      disabled={isMarking}
                      className="text-primary text-xs hover:underline disabled:opacity-50"
                    >
                      {t.notifications.mark}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-2">
          <Link
            href="/notifications"
            onClick={onClose}
            className="bg-primary block rounded-md px-3 py-2 text-center text-sm text-white"
          >
            {t.notifications.allNotifications}
          </Link>
        </div>
      </div>
    </div>
  );
}
