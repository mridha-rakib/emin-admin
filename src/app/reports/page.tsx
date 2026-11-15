"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useTranslation } from "@/context/LanguageContext";
import { DataState } from "@/components/common/DataState";
import { API_URL, apiRequest, SessionExpiredError } from "@/lib/api";
import { formatDate, useApi, type Page, type PersonListItem } from "@/lib/admin-api";
import { useAuthStore } from "@/store/auth-store";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type SupportMessage = {
  _id?: string;
  senderId?: string;
  senderRole?: "user" | "admin" | "guest";
  senderName?: string;
  message: string;
  createdAt?: string;
};

type SupportTicket = {
  _id: string;
  ticketNumber: string;
  userId?: string;
  guestEmail?: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: SupportMessage[];
  createdAt?: string;
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  WAITING_FOR_CUSTOMER: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "text-muted-foreground",
  NORMAL: "text-foreground",
  HIGH: "text-orange-600",
  URGENT: "text-red-600 font-semibold",
};

export default function AdminReportsPage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const adminId = useAuthStore((state) => state.adminId);
  const adminName = useAuthStore((state) => state.adminName);
  const { data, error, isLoading, reload, setData } = useApi<Page<SupportTicket>>("/support-tickets?page=1&limit=100");
  const { data: people } = useApi<{ items: PersonListItem[] }>("/admin/people");
  const [updatingId, setUpdatingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);

  const peopleById = useMemo(() => new Map((people?.items ?? []).map((person) => [person.id, person])), [people]);

  const statusLabel = (status: TicketStatus) =>
    ({
      OPEN: t.reports.status.pending,
      IN_PROGRESS: t.reports.status.reviewed,
      WAITING_FOR_CUSTOMER: isDe ? "Wartet auf Kunde" : "Waiting for customer",
      RESOLVED: t.reports.status.resolved,
      CLOSED: isDe ? "Geschlossen" : "Closed",
    })[status] ?? status;

  const priorityLabel = (priority: TicketPriority) =>
    isDe
      ? ({ LOW: "Niedrig", NORMAL: "Normal", HIGH: "Hoch", URGENT: "Dringend" }[priority] ?? priority)
      : priority.charAt(0) + priority.slice(1).toLowerCase();

  const updateStatus = async (id: string, status: TicketStatus) => {
    setUpdatingId(id);
    setActionError("");
    try {
      const updated = await apiRequest<SupportTicket>(`/support-tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ payload: { status } }),
      });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((ticket) => (ticket._id === id ? { ...ticket, ...updated } : ticket)) } : prev
      );
    } catch (updateError) {
      if (!(updateError instanceof SessionExpiredError)) {
        setActionError(updateError instanceof Error ? updateError.message : "Could not update ticket.");
      }
    } finally {
      setUpdatingId("");
    }
  };

  useEffect(() => {
    const socket = io(API_URL, { transports: ["websocket", "polling"], withCredentials: true });
    socket.on("connect", () => {
      setLive(true);
      socket.emit("joinSupportDesk");
    });
    socket.on("disconnect", () => setLive(false));
    socket.on("supportTicket", (ticket: SupportTicket) => {
      setData((prev) => {
        if (!prev || prev.items.some((item) => item._id === ticket._id)) return prev;
        return { ...prev, items: [ticket, ...prev.items], meta: { ...prev.meta, total: prev.meta.total + 1 } };
      });
    });
    socket.on("supportMessage", (payload: { ticketId?: string; status?: TicketStatus; message?: SupportMessage }) => {
      const ticketId = payload.ticketId ? String(payload.ticketId) : "";
      const incoming = payload.message;
      if (!ticketId || !incoming) return;
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((ticket) =>
                ticket._id === ticketId
                  ? {
                      ...ticket,
                      status: payload.status ?? ticket.status,
                      messages: ticket.messages.some((item) => item._id && item._id === incoming._id)
                        ? ticket.messages
                        : [...ticket.messages, incoming],
                    }
                  : ticket
              ),
            }
          : prev
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [setData]);

  const tickets = data?.items ?? [];
  const active = tickets.find((ticket) => ticket._id === activeId);

  const replaceTicket = (ticket: SupportTicket) => {
    setData((prev) =>
      prev ? { ...prev, items: prev.items.map((item) => (item._id === ticket._id ? { ...item, ...ticket } : item)) } : prev
    );
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!active || !text) return;
    setSending(true);
    setActionError("");
    try {
      const result = await apiRequest<{ ticket: SupportTicket; emailSent: boolean }>(`/support-tickets/${active._id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: text,
          senderRole: "admin",
          ...(adminId ? { senderId: adminId } : {}),
          senderName: adminName || "Odaboo Support",
        }),
      });
      replaceTicket(result.ticket);
      setDraft("");
      if (!result.ticket.userId && result.ticket.guestEmail && !result.emailSent) {
        setActionError(isDe ? "Die Antwort wurde gespeichert, aber die E-Mail konnte nicht gesendet werden." : "The reply was saved, but the email could not be sent.");
      }
    } catch (replyError) {
      if (!(replyError instanceof SessionExpiredError)) {
        setActionError(replyError instanceof Error ? replyError.message : "Could not send the reply.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Top header */}
      <div className="bg-primary text-white mb-0 rounded-t-lg p-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t.reports.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium opacity-90">{live ? (isDe ? "Live" : "Live") : (isDe ? "Verbindung..." : "Connecting...")}</span>
          {data && (
            <span className="text-xs font-medium opacity-90">
              {data.meta.total} {isDe ? "Tickets" : "tickets"}
            </span>
          )}
        </div>
      </div>

      {actionError && (
        <p className="border-x border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">{actionError}</p>
      )}

      {!data || tickets.length === 0 ? (
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty
          className="rounded-t-none"
          emptyTitle={isDe ? "Keine Meldungen" : "No reports"}
          emptyDescription={
            isDe
              ? "Support-Tickets und Beschwerden von Nutzern erscheinen hier."
              : "Support tickets and complaints submitted by users will appear here."
          }
          onRetry={() => void reload()}
        />
      ) : (
        <div>
        {active && (
          <div className="bg-card border-border border-x p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{active.subject}</h2>
                <p className="text-muted-foreground text-xs">
                  {active.userId
                    ? (isDe ? "Die Antwort erscheint live in den Nachrichten des Kunden." : "The reply appears live in the customer's messages.")
                    : (isDe ? `Die Antwort wird an ${active.guestEmail || "die E-Mail"} gesendet.` : `The reply is emailed to ${active.guestEmail || "the guest"}.`)}
                </p>
              </div>
              <button type="button" onClick={() => setActiveId("")} className="text-muted-foreground text-xs hover:underline">
                {isDe ? "Schließen" : "Close"}
              </button>
            </div>
            <div className="mb-4 max-h-72 space-y-2 overflow-y-auto">
              {active.messages.map((item, index) => {
                const fromAdmin = item.senderRole === "admin";
                return (
                  <div key={item._id || index} className={`max-w-xl rounded-xl px-3 py-2 text-sm ${fromAdmin ? "ml-auto bg-primary text-white" : "bg-muted"}`}>
                    <p className="mb-1 text-[11px] font-semibold opacity-80">{item.senderName || (fromAdmin ? "Support" : "Customer")}</p>
                    <p className="whitespace-pre-wrap">{item.message}</p>
                  </div>
                );
              })}
            </div>
            <form onSubmit={(event) => void sendReply(event)} className="flex gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                maxLength={2000}
                placeholder={isDe ? "Antwort schreiben..." : "Write a reply..."}
                className="border-border min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <button type="submit" disabled={sending || !draft.trim()} className="bg-primary h-fit rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {sending ? (isDe ? "Senden..." : "Sending...") : (isDe ? "Senden" : "Send")}
              </button>
            </form>
          </div>
        )}
        <div className="bg-card border-border overflow-x-auto rounded-b-lg border shadow-sm">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  Ticket
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.reports.tableHeaders.user}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.reports.tableHeaders.reason}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {isDe ? "Kategorie" : "Category"}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {isDe ? "Priorität" : "Priority"}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.reports.tableHeaders.date}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.reports.tableHeaders.status}
                </th>
                <th className="text-muted-foreground px-6 py-4 text-left text-xs font-medium tracking-wider uppercase">
                  {t.reports.tableHeaders.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {tickets.map((ticket) => {
                const person = peopleById.get(String(ticket.userId));
                const isClosed = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
                return (
                  <tr key={ticket._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{ticket.ticketNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {person ? (
                        <div>
                          <p className="text-sm font-medium">{person.name}</p>
                          <p className="text-muted-foreground text-xs">{person.email}</p>
                        </div>
                      ) : ticket.guestEmail ? (
                        <div>
                          <p className="text-sm font-medium">{isDe ? "Gast" : "Guest"}</p>
                          <p className="text-muted-foreground text-xs">{ticket.guestEmail}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">{String(ticket.userId || "")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-sm" title={ticket.subject}>{ticket.subject}</p>
                      {ticket.messages?.[0]?.message && (
                        <p className="text-muted-foreground truncate text-xs" title={ticket.messages[0].message}>
                          {ticket.messages[0].message}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{ticket.category}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${PRIORITY_STYLES[ticket.priority] ?? ""}`}>
                      {priorityLabel(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(ticket.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[ticket.status] ?? STATUS_STYLES.OPEN}`}>
                        {statusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="space-x-2 px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setActiveId(ticket._id)}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {isDe ? "Antworten" : "Reply"}
                      </button>
                      {ticket.status === "OPEN" && (
                        <button
                          onClick={() => void updateStatus(ticket._id, "IN_PROGRESS")}
                          disabled={updatingId === ticket._id}
                          className="text-primary hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {t.reports.actions.markReviewed}
                        </button>
                      )}
                      {!isClosed && (
                        <button
                          onClick={() => void updateStatus(ticket._id, "RESOLVED")}
                          disabled={updatingId === ticket._id}
                          className="text-green-600 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {t.reports.actions.resolve}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
}
