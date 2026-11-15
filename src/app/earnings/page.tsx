"use client";

import { EarningChart } from "@/components/EarningChart";
import { CountingNumber } from "@/components/ui/CountingNumber";
import { DataState } from "@/components/common/DataState";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { formatDate, formatMoney, useApi, type Earnings as EarningsData } from "@/lib/admin-api";

type PayoutRow = {
  id: string;
  payeeName: string;
  role: string;
  brand: string;
  last4: string;
  amount: number;
  currency: string;
  status: string;
  detail: string;
  title: string;
  sourceType: string;
};

type Transaction = EarningsData["transactions"][number];

const SUCCESS_STATUSES = ["PAID", "COMPLETED"];
const FAILED_STATUSES = ["FAILED", "CANCELLED", "CANCELED", "REFUNDED", "VOID", "REJECTED"];

const statusClass = (status: string) => {
  const normalized = (status ?? "").toUpperCase();
  if (SUCCESS_STATUSES.includes(normalized)) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (FAILED_STATUSES.includes(normalized)) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
};

const statusText = (status: string) => {
  const words = (status || "—").replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const typeLabel = (type: Transaction["type"], isDe: boolean) =>
  ({
    ORDER: isDe ? "Bestellung" : "Order",
    SUBSCRIPTION: isDe ? "Abonnement" : "Subscription",
    BOOKING: isDe ? "Buchung" : "Booking",
  })[type];

const currentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const Earnings = () => {
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading, reload } = useApi<EarningsData>("/admin/earnings");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const itemsPerPage = 6;

  const transactions = useMemo(() => data?.transactions ?? [], [data]);
  const availableYears = useMemo(
    () =>
      Array.from(new Set(transactions.map((tx) => new Date(tx.date).getFullYear()).filter(Number.isFinite))).sort(
        (a, b) => b - a
      ),
    [transactions]
  );

  if (!data) {
    return (
      <div className="py-6">
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty
          emptyTitle={isDe ? "Keine Einnahmedaten verfügbar" : "No earnings data available"}
          onRetry={() => void reload()}
        />
      </div>
    );
  }

  const currency = data.currency || "CHF";
  const filteredTransactions =
    selectedYear === "all"
      ? transactions
      : transactions.filter((transaction) => new Date(transaction.date).getFullYear() === selectedYear);

  const currentMonthRevenue = data.monthly.find((row) => row.month === currentMonthKey())?.total ?? 0;
  const last12MonthsRevenue = data.monthly.reduce((sum, row) => sum + row.total, 0);

  const handleYearChange = (value: string) => {
    setSelectedYear(value === "all" ? "all" : Number(value));
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const stats = [
    { value: last12MonthsRevenue, label: isDe ? "Umsatz letzte 12 Monate" : "Revenue (last 12 months)" },
    { value: currentMonthRevenue, label: t.earnings.currentMonthRevenue },
    { value: data.totals.total, label: t.earnings.totalRevenue },
  ];

  const streams = [
    { label: isDe ? "Bestellungen" : "Orders", value: data.totals.orders },
    { label: isDe ? "Abonnements" : "Subscriptions", value: data.totals.subscriptions },
    { label: isDe ? "Buchungen" : "Bookings", value: data.totals.bookings },
  ];

  return (
    <div className="py-6">
      {/* stat */}
      <div
        className="dark:bg-sidebar mb-4 flex w-full items-center justify-center rounded-lg border border-[#E2E8F0] bg-white shadow-sm max-md:py-4 dark:border-[#F4B057]"
        style={{ minHeight: "110px" }}
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="contents">
            {index > 0 && <div className="mx-4 h-16 w-px bg-[#F4B057]" />}
            <div className="flex flex-1 flex-col items-center justify-center px-2">
              <p className="ipad:text-3xl mb-2 text-2xl font-bold text-[#0D2357] max-md:text-xl lg:text-4xl dark:text-white">
                <CountingNumber
                  end={stat.value}
                  duration={1000}
                  decimals={2}
                  prefix={`${currency} `}
                  className="ipad:text-3xl mb-2 text-2xl font-bold text-[#0D2357] max-md:text-xl lg:text-4xl dark:text-white"
                />
              </p>
              <span className="text-center text-sm font-medium text-[#0D2357] lg:text-lg dark:text-white">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* revenue streams */}
      <div className="mb-4 flex flex-wrap gap-2">
        {streams.map((stream) => (
          <span
            key={stream.label}
            className="dark:bg-sidebar rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#0D2357] dark:border-[#F4B057] dark:text-white"
          >
            {stream.label}: {formatMoney(stream.value, currency)}
          </span>
        ))}
      </div>

      <HeldPayouts />

      {/* chart */}
      <div className="h-[350px] w-full sm:h-[400px]">
        <EarningChart monthly={data.monthly} currency={currency} />
      </div>

      {/* table  */}
      <h1 className="mt-12 mb-5 ml-2 text-2xl font-bold text-[#0D2357] dark:text-white">
        {t.earnings.title}
      </h1>

      <div className="dark:bg-sidebar rounded-lg border border-[#E2E8F0] bg-white shadow-sm dark:border-[#F4B057]">
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h1 className="text-xl text-[#0D2357] dark:text-white">{t.earnings.subtitle}</h1>
            <div className="flex items-center gap-2">
              <label
                htmlFor="year-filter"
                className="text-sm font-medium text-[#0D2357] dark:text-white"
              >
                {t.earnings.yearLabel}:
              </label>
              <select
                id="year-filter"
                value={String(selectedYear)}
                onChange={(e) => handleYearChange(e.target.value)}
                className="dark:bg-sidebar rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#0D2357] transition-colors hover:border-[#F4B057] focus:border-[#F4B057] focus:outline-none dark:border-[#F4B057] dark:text-white"
              >
                <option value="all">{isDe ? "Alle" : "All"}</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <DataState
              isEmpty
              emptyTitle={isDe ? "Noch keine Transaktionen" : "No transactions yet"}
              emptyDescription={
                isDe
                  ? "Bestellungen, Abo-Rechnungen und Buchungen erscheinen hier, sobald sie anfallen."
                  : "Orders, subscription invoices and bookings will appear here as they happen."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#F4B057]">
                      <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                        {t.earnings.transactionId}
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                        {t.earnings.date}
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                        {isDe ? "Kunde" : "Customer"}
                      </th>
                      <th className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">
                        {t.earnings.type}
                      </th>
                      <th className="pb-3 text-right text-sm font-medium text-[#0D2357] dark:text-white">
                        {t.earnings.amount}
                      </th>
                      <th className="pb-3 text-center text-sm font-medium text-[#0D2357] dark:text-white">
                        {t.earnings.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr
                        key={`${transaction.type}-${transaction.id}`}
                        className="border-b border-[#E2E8F0] last:border-0 dark:border-[#F4B057]/30"
                      >
                        <td className="py-3 text-sm text-[#0D2357] dark:text-white">
                          {transaction.reference || transaction.id}
                        </td>
                        <td className="py-3 text-sm text-[#0D2357] dark:text-white">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-3 text-sm text-[#0D2357] dark:text-white">
                          {transaction.customer || "—"}
                        </td>
                        <td className="py-3 text-sm text-[#0D2357] dark:text-white">
                          {typeLabel(transaction.type, isDe)}
                        </td>
                        <td
                          className={`py-3 text-right text-sm font-medium ${
                            transaction.amount < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {formatMoney(Math.abs(transaction.amount), transaction.currency || currency)}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass(transaction.status)}`}
                          >
                            {statusText(transaction.status)}
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
                  {t.common.showing} {startIndex + 1} {t.common.to}{" "}
                  {Math.min(endIndex, filteredTransactions.length)} {t.common.of} {filteredTransactions.length}{" "}
                  {t.common.results}
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
                    disabled={currentPage === totalPages}
                    className="dark:bg-sidebar flex h-8 w-8 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#0D2357] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#F4B057] dark:text-white dark:hover:bg-[#F4B057]/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;

function HeldPayouts() {
  const { language } = useTranslation();
  const isDe = language === "DE";
  const { data, error, isLoading } = useApi<{ items: PayoutRow[] }>("/admin/payouts");
  const items = data?.items ?? [];

  return (
    <div className="mb-8 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm dark:border-[#F4B057] dark:bg-sidebar sm:p-6">
      <h2 className="text-xl font-bold text-[#0D2357] dark:text-white">
        {isDe ? "Gehaltene Auszahlungen" : "Held payouts"}
      </h2>
      <p className="mt-1 text-sm text-[#0D2357]/70 dark:text-white/70">
        {isDe
          ? "Das Geld bleibt auf dem Plattformkonto, bis der Auftrag abgeschlossen ist. Es werden nur die letzten 4 Kartenziffern angezeigt."
          : "Money stays on the platform account until the job is marked completed. Only the last 4 card digits are shown."}
      </p>
      {isLoading && <p className="mt-4 text-sm">Loading payouts…</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {!isLoading && items.length === 0 && (
        <p className="mt-4 text-sm text-[#0D2357]/70 dark:text-white/70">
          {isDe ? "Noch keine gehaltenen Zahlungen." : "No held payments yet."}
        </p>
      )}
      {items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#F4B057]">
                {["Payee", "Card", "Job", "Amount", "Status", "Detail"].map((heading) => (
                  <th key={heading} className="pb-3 text-left text-sm font-medium text-[#0D2357] dark:text-white">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#E2E8F0] last:border-0 dark:border-[#F4B057]/30">
                  <td className="py-3 text-sm text-[#0D2357] dark:text-white">{item.payeeName}<br /><span className="text-xs opacity-70">{item.role}</span></td>
                  <td className="py-3 text-sm text-[#0D2357] dark:text-white">{item.last4 ? `${(item.brand || "Card").toUpperCase()} •••• ${item.last4}` : "No card"}</td>
                  <td className="py-3 text-sm text-[#0D2357] dark:text-white">{item.title || item.sourceType}</td>
                  <td className="py-3 text-sm text-[#0D2357] dark:text-white">{formatMoney(item.amount, item.currency || "CHF")}</td>
                  <td className="py-3 text-sm text-[#0D2357] dark:text-white">{item.status}</td>
                  <td className="max-w-xs py-3 text-xs leading-relaxed text-[#0D2357] dark:text-white">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
