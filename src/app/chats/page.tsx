"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowLeft, Eye, Package } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { avatarFor, formatDateTime, useApi, type Page, type PersonListItem } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type IdRef = string | { _id: string };

interface RawConversation {
  _id: string;
  participants?: IdRef[];
  productId?: IdRef;
  orderId?: IdRef;
  lastMessage?: { text?: string; senderId?: IdRef; createdAt?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface RawMessage {
  _id: string;
  conversationId: IdRef;
  senderId: IdRef;
  text?: string;
  attachments?: Array<{ url: string; type: string; name?: string }>;
  createdAt?: string;
}

type RawProduct = { _id: string; title?: string };

type Participant = { id: string; name: string; avatar: string; email: string };

const idOf = (ref?: IdRef | null) => (ref ? (typeof ref === "string" ? ref : ref._id) : "");

export default function MessagePage() {
  const { language, t } = useTranslation();
  const isDe = language === "DE";

  const { data: conversationPage, error, isLoading, reload } = useApi<Page<RawConversation>>("/conversations?page=1&limit=100");
  const { data: people } = useApi<{ items: PersonListItem[] }>("/admin/people");
  const { data: productPage } = useApi<Page<RawProduct>>("/products?page=1&limit=100");

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const messagesPath = selectedConversationId
    ? `/messages?conversationId=${encodeURIComponent(selectedConversationId)}&page=1&limit=100`
    : null;
  const {
    data: messagePage,
    error: messagesError,
    isLoading: messagesLoading,
    reload: reloadMessages,
  } = useApi<Page<RawMessage>>(messagesPath);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const personFor = useMemo(() => {
    const persons = new Map((people?.items ?? []).map((p) => [p.id, p]));
    return (id: string): Participant => {
      const person = persons.get(id);
      const name = person?.name || t.chats.unknown;
      return { id, name, email: person?.email ?? "", avatar: avatarFor({ avatar: person?.avatar, name }) };
    };
  }, [people, t.chats.unknown]);

  const productTitles = useMemo(
    () => new Map((productPage?.items ?? []).map((p) => [p._id, p.title ?? ""])),
    [productPage],
  );

  const conversations = useMemo(
    () =>
      [...(conversationPage?.items ?? [])]
        .map((c) => ({
          id: c._id,
          participants: (c.participants ?? []).map((ref) => personFor(idOf(ref))),
          productTitle: productTitles.get(idOf(c.productId)) ?? "",
          lastMessage: c.lastMessage,
          lastActivity: c.lastMessage?.createdAt ?? c.updatedAt ?? c.createdAt,
        }))
        .sort((a, b) => new Date(b.lastActivity ?? 0).getTime() - new Date(a.lastActivity ?? 0).getTime()),
    [conversationPage, personFor, productTitles],
  );

  const messages = useMemo(
    () =>
      [...(messagePage?.items ?? [])].sort(
        (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
      ),
    [messagePage],
  );

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const id = setTimeout(() => {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(id);
  }, [selectedConversationId, messages]);

  const conversationTitle = (participants: Participant[]) =>
    participants.length ? participants.map((p) => p.name).join(" ↔ ") : t.chats.unknown;

  const filteredConvs = conversations.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.participants.some((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) ||
      c.productTitle.toLowerCase().includes(q) ||
      (c.lastMessage?.text ?? "").toLowerCase().includes(q)
    );
  });

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;
  const leftParticipantId = selectedConversation?.participants[0]?.id;

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true);
  };

  const handleBackToConversations = () => {
    setShowChat(false);
  };

  return (
    <div className="bg-sidebar min-h-[calc(100vh-104px)] w-full p-3">
      <div
        className="flex h-[calc(100vh-104px)] w-full flex-col gap-4 lg:flex-row"
        style={{ fontFamily: "Poppins" }}
      >
        {/* Left */}
        <div
          className={`bg-sidebar flex h-full w-full flex-col gap-4 lg:w-[450px] ${showChat ? "hidden lg:flex" : "flex"}`}
        >
          <div className="bg-card border-border flex items-center gap-2 rounded-md border p-2">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.chats.searchPlaceholder}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex h-full flex-1 flex-col gap-2 overflow-y-auto">
            {isLoading || error || conversations.length === 0 ? (
              <DataState
                isLoading={isLoading}
                error={error}
                isEmpty={!isLoading && !error && conversations.length === 0}
                emptyTitle={isDe ? "Noch keine Unterhaltungen" : "No conversations yet"}
                emptyDescription={
                  isDe
                    ? "Sobald Käufer und Verkäufer miteinander chatten, erscheinen die Unterhaltungen hier."
                    : "Conversations appear here as soon as buyers and sellers start chatting."
                }
                onRetry={() => void reload()}
              />
            ) : filteredConvs.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-xs">
                {isDe ? "Keine Unterhaltungen gefunden." : "No conversations match your search."}
              </p>
            ) : (
              filteredConvs.map((c) => {
                const [first, second] = c.participants;
                return (
                  <div
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all ${c.id === selectedConversationId ? "bg-[#B9D1F6]" : "border border-[#EAECEE] hover:bg-gray-50"}`}
                    onClick={() => handleConversationSelect(c.id)}
                  >
                    <div className="relative h-12 w-12 shrink-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                        {first && <img src={first.avatar} alt={first.name} className="h-full w-full object-cover" />}
                      </div>
                      {second && (
                        <div className="border-card absolute right-0 bottom-0 h-7 w-7 overflow-hidden rounded-full border-2 bg-gray-200">
                          <img src={second.avatar} alt={second.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-foreground truncate text-sm font-semibold">
                            {conversationTitle(c.participants)}
                          </h3>
                          {c.productTitle && (
                            <p className="text-muted-foreground flex items-center gap-1 truncate text-[11px]">
                              <Package className="h-3 w-3 shrink-0" /> {c.productTitle}
                            </p>
                          )}
                          <p className="text-muted-foreground truncate text-xs">
                            {c.lastMessage?.text || (isDe ? "Noch keine Nachrichten" : "No messages yet")}
                          </p>
                        </div>
                        <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                          {formatDateTime(c.lastActivity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat */}
        <div
          className={`border-border bg-sidebar flex h-full min-h-0 flex-1 flex-col border-t lg:border-t-0 lg:border-l ${!showChat && !selectedConversationId ? "hidden lg:flex" : "flex"}`}
        >
          <div className="border-border flex items-center gap-3 border-b p-4">
            <button
              onClick={handleBackToConversations}
              className="rounded-full p-2 hover:bg-gray-100 lg:hidden"
            >
              <ArrowLeft className="h-5 w-5 text-[#1A1A1A]" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-foreground truncate text-lg font-medium">
                {selectedConversation ? conversationTitle(selectedConversation.participants) : t.chats.noConversationSelected}
              </h2>
              {selectedConversation?.productTitle && (
                <p className="text-muted-foreground truncate text-xs">{selectedConversation.productTitle}</p>
              )}
            </div>
            {selectedConversation && (
              <span className="text-muted-foreground flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                <Eye className="h-3.5 w-3.5" />
                {isDe ? "Nur Lesen" : "Read-only"}
              </span>
            )}
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
            {!selectedConversation ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-lg text-gray-400">💬</div>
                  <p className="text-sm text-gray-500">{t.chats.selectToStart}</p>
                </div>
              </div>
            ) : messagesLoading || messagesError || messages.length === 0 ? (
              <DataState
                isLoading={messagesLoading}
                error={messagesError}
                isEmpty={!messagesLoading && !messagesError && messages.length === 0}
                emptyTitle={isDe ? "Keine Nachrichten" : "No messages"}
                emptyDescription={isDe ? "In dieser Unterhaltung wurden noch keine Nachrichten gesendet." : "No messages have been sent in this conversation yet."}
                onRetry={() => void reloadMessages()}
              />
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((message) => {
                  const sender = personFor(idOf(message.senderId));
                  const isLeft = !leftParticipantId || sender.id === leftParticipantId;
                  return (
                    <div key={message._id} className={`flex gap-3 ${isLeft ? "" : "justify-end"}`}>
                      {isLeft && (
                        <div className="bg-muted h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <img src={sender.avatar} alt={sender.name} className="h-full w-full object-cover" />
                        </div>
                      )}

                      <div className={`max-w-[90%] ${isLeft ? "items-start" : "items-end text-right"}`}>
                        <div className="text-muted-foreground mb-1 text-[11px] font-semibold">{sender.name}</div>
                        <div
                          className={`${isLeft ? "bg-primary/20" : "bg-card"} text-foreground inline-block rounded-[20px] px-4 py-3`}
                        >
                          {message.text}
                          {(message.attachments ?? []).map((attachment) => (
                            <a
                              key={attachment.url}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary mt-1 block text-xs underline"
                            >
                              {attachment.name || attachment.type}
                            </a>
                          ))}
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">{formatDateTime(message.createdAt)}</div>
                      </div>

                      {!isLeft && (
                        <div className="bg-muted h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <img src={sender.avatar} alt={sender.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
