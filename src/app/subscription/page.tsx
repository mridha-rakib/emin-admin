"use client";

import { ManageSubscriptionModal, type PlanFormValues, type SubscriptionPlan } from "./ManageSubscriptionModal";
import { Check, Crown, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { apiRequest, downloadInvoicePdf, SessionExpiredError } from "@/lib/api";
import { formatDate, formatMoney, toNumber, useApi, type Page, type PersonListItem } from "@/lib/admin-api";
import { DataState } from "@/components/common/DataState";

type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "VOID";

interface RawUserSubscription {
  _id: string;
  userId: string;
  planId?: string;
  planName: string;
  billingCycle?: "monthly" | "yearly";
  amount: unknown;
  currency?: string;
  status?: SubscriptionStatus;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
}

interface RawInvoice {
  _id: string;
  invoiceNumber: string;
  userId: string;
  amount: unknown;
  currency?: string;
  status?: InvoiceStatus;
  paidAt?: string;
  createdAt?: string;
}

const SUBSCRIPTION_STATUS_STYLES: Record<SubscriptionStatus, { badge: string; dot: string }> = {
  ACTIVE: { badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", dot: "bg-green-600" },
  PAST_DUE: { badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", dot: "bg-amber-600" },
  CANCELLED: { badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", dot: "bg-red-600" },
  EXPIRED: { badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", dot: "bg-gray-500" },
};

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  VOID: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const Subscription = () => {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [planError, setPlanError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const plansApi = useApi<Page<SubscriptionPlan>>("/subscription-plans?page=1&limit=100");
  const subscriptionsApi = useApi<Page<RawUserSubscription>>("/subscriptions?page=1&limit=100");
  const invoicesApi = useApi<Page<RawInvoice>>("/invoices?page=1&limit=100");
  const { data: people } = useApi<{ items: PersonListItem[] }>("/admin/people");

  const plans = useMemo(
    () => [...(plansApi.data?.items ?? [])].sort((a, b) => toNumber(a.monthlyPrice) - toNumber(b.monthlyPrice)),
    [plansApi.data],
  );

  const personById = useMemo(() => new Map((people?.items ?? []).map((p) => [p.id, p])), [people]);

  const users = useMemo(
    () =>
      (subscriptionsApi.data?.items ?? []).map((sub) => {
        const person = personById.get(String(sub.userId));
        return {
          id: sub._id,
          name: person?.name || "—",
          email: person?.email || "",
          plan: sub.planName,
          billingCycle: sub.billingCycle ?? "monthly",
          amount: toNumber(sub.amount),
          currency: sub.currency || "CHF",
          startDate: sub.startsAt ?? sub.createdAt,
          nextBilling: sub.endsAt,
          status: (sub.status ?? "ACTIVE") as SubscriptionStatus,
        };
      }),
    [subscriptionsApi.data, personById],
  );

  const invoices = useMemo(
    () =>
      (invoicesApi.data?.items ?? []).map((invoice) => ({
        id: invoice._id,
        number: invoice.invoiceNumber,
        customer: personById.get(String(invoice.userId))?.name || "—",
        amount: toNumber(invoice.amount),
        currency: invoice.currency || "CHF",
        status: (invoice.status ?? "PENDING") as InvoiceStatus,
        date: invoice.paidAt ?? invoice.createdAt,
      })),
    [invoicesApi.data, personById],
  );

  const activeSubscribers = users.filter((u) => u.status === "ACTIVE").length;

  const openCreate = () => {
    setEditingPlan(null);
    setPlanError("");
    setIsModalOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanError("");
    setIsModalOpen(true);
  };

  const handleSave = async (values: PlanFormValues) => {
    if (editingPlan) {
      const updated = await apiRequest<SubscriptionPlan>(`/subscription-plans/${editingPlan._id}`, {
        method: "PATCH",
        body: JSON.stringify({ payload: { ...values, yearlyPrice: values.yearlyPrice ?? null } }),
      });
      plansApi.setData((prev) =>
        prev ? { ...prev, items: prev.items.map((p) => (p._id === editingPlan._id ? updated ?? p : p)) } : prev,
      );
    } else {
      const { yearlyPrice, ...rest } = values;
      const created = await apiRequest<SubscriptionPlan>("/subscription-plans", {
        method: "POST",
        body: JSON.stringify({ payload: yearlyPrice ? { ...rest, yearlyPrice } : rest }),
      });
      plansApi.setData((prev) =>
        prev
          ? { ...prev, items: [...prev.items, created], meta: { ...prev.meta, total: prev.meta.total + 1 } }
          : { items: [created], meta: { page: 1, limit: 100, total: 1, pages: 1 } },
      );
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    const confirmed = window.confirm(
      isDe
        ? `Tarif "${plan.name}" wirklich löschen? Bestehende Abonnements behalten ihren Tarifnamen.`
        : `Delete plan "${plan.name}"? Existing subscriptions keep their plan name.`,
    );
    if (!confirmed) return;
    setDeletingId(plan._id);
    setPlanError("");
    try {
      await apiRequest(`/subscription-plans/${plan._id}`, { method: "DELETE" });
      plansApi.setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((p) => p._id !== plan._id), meta: { ...prev.meta, total: Math.max(prev.meta.total - 1, 0) } } : prev,
      );
    } catch (deleteError) {
      if (deleteError instanceof SessionExpiredError) return;
      setPlanError(deleteError instanceof Error ? deleteError.message : isDe ? "Tarif konnte nicht gelöscht werden." : "Could not delete plan.");
    } finally {
      setDeletingId(null);
    }
  };

  const subscriptionStatusLabel = (status: SubscriptionStatus) =>
    status === "ACTIVE"
      ? t.subscription.active
      : status === "CANCELLED"
      ? t.subscription.cancelled
      : status === "PAST_DUE"
      ? isDe ? "Überfällig" : "Past due"
      : isDe ? "Abgelaufen" : "Expired";

  const invoiceStatusLabel = (status: InvoiceStatus) =>
    status === "PAID"
      ? isDe ? "Bezahlt" : "Paid"
      : status === "FAILED"
      ? isDe ? "Fehlgeschlagen" : "Failed"
      : status === "VOID"
      ? isDe ? "Storniert" : "Void"
      : isDe ? "Offen" : "Pending";

  const totalPages = Math.max(Math.ceil(users.length / itemsPerPage), 1);
  const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="m-2 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0D2357] dark:text-white">{t.subscription.title}</h1>
          {!subscriptionsApi.isLoading && !subscriptionsApi.error && (
            <p className="mt-1 text-sm text-[#0D2357]/70 dark:text-white/70">
              {activeSubscribers} {isDe ? "aktive Abonnenten" : "active subscribers"}
            </p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg border border-[#F4B057] bg-[#F4B057] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#F4B057]/90 cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {isDe ? "Neuer Tarif" : "New plan"}
        </button>
      </div>

      {planError && <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">{planError}</p>}

      {plansApi.isLoading || plansApi.error || plans.length === 0 ? (
        <DataState
          className="mx-auto max-w-4xl"
          isLoading={plansApi.isLoading}
          error={plansApi.error}
          isEmpty={!plansApi.isLoading && !plansApi.error && plans.length === 0}
          emptyTitle={isDe ? "Noch keine Tarife" : "No plans yet"}
          emptyDescription={isDe ? "Erstellen Sie den ersten Abonnement-Tarif über „Neuer Tarif“." : "Create the first subscription plan with “New plan”."}
          onRetry={() => void plansApi.reload()}
        />
      ) : (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-10 pb-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const monthly = toNumber(plan.monthlyPrice);
            const yearly = plan.yearlyPrice != null ? toNumber(plan.yearlyPrice) : null;
            const currency = plan.currency || "CHF";
            const yearlySaving = yearly != null ? monthly * 12 - yearly : 0;
            const isActive = plan.active !== false;
            return (
              <div
                key={plan._id}
                className={`dark:bg-sidebar relative rounded-2xl bg-white p-6 transition-all ${
                  yearlySaving > 0
                    ? "border-2 border-[#F4B057] shadow-lg hover:shadow-xl"
                    : "border border-[#E2E8F0] shadow-sm hover:shadow-md dark:border-[#F4B057]"
                } ${isActive ? "" : "opacity-70"}`}
              >
                {yearlySaving > 0 && (
                  <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-[#F4B057] px-3 py-1 text-xs font-bold text-white shadow-sm">
                    <Crown className="h-3.5 w-3.5" />
                    {t.subscription.bestValue}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold text-[#0D2357] dark:text-white">{plan.name}</h2>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEdit(plan)}
                        title={isDe ? "Bearbeiten" : "Edit"}
                        className="rounded-md p-1.5 text-[#0D2357]/70 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-[#F4B057]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(plan)}
                        disabled={deletingId === plan._id}
                        title={isDe ? "Löschen" : "Delete"}
                        className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {!isActive && (
                    <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {isDe ? "Inaktiv" : "Inactive"}
                    </span>
                  )}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#0D2357] dark:text-white">{formatMoney(monthly, currency)}</span>
                    <span className="text-sm font-semibold text-[#0D2357]/70 dark:text-white/70">/ {t.subscription.month}</span>
                  </div>
                  {yearly != null && (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#0D2357]/80 dark:text-white/80">
                        {formatMoney(yearly, currency)} / {t.subscription.year}
                      </span>
                      {yearlySaving > 0 && (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {isDe ? "Spart" : "Save"} {formatMoney(yearlySaving, currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {(plan.features ?? []).length > 0 ? (
                  <ul className="space-y-3">
                    {(plan.features ?? []).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-[#0D2357] dark:text-white">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#0D2357]/60 dark:text-white/60">
                    {isDe ? "Keine Funktionen hinterlegt." : "No features listed."}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(plan)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#F4B057] px-3 py-2 text-sm font-medium text-[#0D2357] transition-colors hover:bg-[#F4B057]/10 dark:text-white"
                >
                  <Pencil className="h-4 w-4" />
                  {isDe ? "Funktionen bearbeiten" : "Edit features"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscribed Users Table */}
      <h1 className="my-8 text-2xl font-bold text-[#0D2357] dark:text-white">{t.subscription.subscribedUsers}</h1>
      {subscriptionsApi.isLoading || subscriptionsApi.error || users.length === 0 ? (
        <DataState
          isLoading={subscriptionsApi.isLoading}
          error={subscriptionsApi.error}
          isEmpty={!subscriptionsApi.isLoading && !subscriptionsApi.error && users.length === 0}
          emptyTitle={isDe ? "Noch keine Abonnenten" : "No subscribers yet"}
          emptyDescription={isDe ? "Sobald Nutzer einen Tarif abschließen, erscheinen sie hier." : "Users appear here once they subscribe to a plan."}
          onRetry={() => void subscriptionsApi.reload()}
        />
      ) : (
      <div className="dark:bg-sidebar rounded-lg border border-[#E2E8F0] bg-white shadow-sm dark:border-[#F4B057]">
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#F4B057]">
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.userName}
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.email}
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.plan}
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.amount}
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.startDate}
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.nextBilling}
                  </th>
                  <th className="pb-3 text-center text-sm font-medium text-[#0D2357] dark:text-white">
                    {t.subscription.status}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#E2E8F0] last:border-0 dark:border-[#F4B057]/30 hover:bg-gray-50/50 dark:hover:bg-[#F4B057]/5 transition-colors"
                  >
                    <td className="py-3 text-sm font-medium text-[#0D2357] dark:text-white">{user.name}</td>
                    <td className="py-3 text-sm text-[#0D2357]/80 dark:text-white/80">{user.email || "—"}</td>
                    <td className="py-3 text-sm font-medium text-[#0D2357] dark:text-white">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {user.plan} · {user.billingCycle === "yearly" ? t.subscription.year : t.subscription.month}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-[#0D2357]/80 dark:text-white/80">{formatMoney(user.amount, user.currency)}</td>
                    <td className="py-3 text-sm text-[#0D2357]/80 dark:text-white/80">{formatDate(user.startDate)}</td>
                    <td className="py-3 text-sm text-[#0D2357]/80 dark:text-white/80">{formatDate(user.nextBilling)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${SUBSCRIPTION_STATUS_STYLES[user.status]?.badge ?? SUBSCRIPTION_STATUS_STYLES.EXPIRED.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${SUBSCRIPTION_STATUS_STYLES[user.status]?.dot ?? SUBSCRIPTION_STATUS_STYLES.EXPIRED.dot}`} />
                        {subscriptionStatusLabel(user.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:items-center dark:border-[#F4B057]/30">
            <div className="text-sm text-[#0D2357] dark:text-white">
              {t.common.showing} {Math.min((currentPage - 1) * itemsPerPage + 1, users.length)} {t.common.to}{" "}
              {Math.min(currentPage * itemsPerPage, users.length)} {t.common.of} {users.length} {t.subscription.usersText}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="dark:bg-sidebar flex h-8 w-8 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#0D2357] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F4B057] dark:text-white dark:hover:bg-[#F4B057]/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors ${
                    currentPage === page
                      ? "border-[#F4B057] bg-[#F4B057] text-white"
                      : "dark:bg-sidebar border-[#E2E8F0] bg-white text-[#0D2357] hover:bg-gray-50 dark:border-[#F4B057] dark:text-white dark:hover:bg-[#F4B057]/10"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="dark:bg-sidebar flex h-8 w-8 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#0D2357] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F4B057] dark:text-white dark:hover:bg-[#F4B057]/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Invoices */}
      <h2 className="my-8 text-2xl font-bold text-[#0D2357] dark:text-white">{isDe ? "Rechnungen" : "Invoices"}</h2>
      {invoicesApi.isLoading || invoicesApi.error || invoices.length === 0 ? (
        <DataState
          isLoading={invoicesApi.isLoading}
          error={invoicesApi.error}
          isEmpty={!invoicesApi.isLoading && !invoicesApi.error && invoices.length === 0}
          emptyTitle={isDe ? "Noch keine Rechnungen" : "No invoices yet"}
          emptyDescription={isDe ? "Abonnement-Rechnungen erscheinen hier, sobald sie erstellt werden." : "Subscription invoices appear here once they are issued."}
          onRetry={() => void invoicesApi.reload()}
        />
      ) : (
        <div className="dark:bg-sidebar rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6 dark:border-[#F4B057]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#F4B057]">
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">{isDe ? "Rechnungsnr." : "Invoice #"}</th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">{t.subscription.user}</th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">{t.subscription.amount}</th>
                  <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">{isDe ? "Datum" : "Date"}</th>
                  <th className="pb-3 text-center text-sm font-medium text-[#0D2357] dark:text-white">{t.subscription.status}</th>
                  <th className="pb-3 text-right text-sm font-medium text-[#0D2357] dark:text-white">{isDe ? "PDF" : "PDF"}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-[#E2E8F0] last:border-0 dark:border-[#F4B057]/30">
                    <td className="py-3 font-mono text-xs text-[#0D2357] dark:text-white">{invoice.number}</td>
                    <td className="py-3 text-sm text-[#0D2357] dark:text-white">{invoice.customer}</td>
                    <td className="py-3 text-sm font-semibold text-[#0D2357] dark:text-white">{formatMoney(invoice.amount, invoice.currency)}</td>
                    <td className="py-3 text-sm text-[#0D2357]/80 dark:text-white/80">{formatDate(invoice.date)}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${INVOICE_STATUS_STYLES[invoice.status] ?? INVOICE_STATUS_STYLES.VOID}`}>
                        {invoiceStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDownloadError("");
                          void downloadInvoicePdf(invoice.id, invoice.number).catch((error) => {
                            setDownloadError(error instanceof Error ? error.message : isDe ? "Die Rechnung konnte nicht heruntergeladen werden." : "The invoice could not be downloaded.");
                          });
                        }}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        {isDe ? "Herunterladen" : "Download"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {downloadError && <p className="mt-3 text-sm text-red-600">{downloadError}</p>}
        </div>
      )}

      <ManageSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={editingPlan}
        onSave={handleSave}
      />
    </div>
  );
};

export default Subscription;
