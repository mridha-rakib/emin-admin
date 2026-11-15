"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, SessionExpiredError } from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Types returned by the backend /admin/* endpoints                    */
/* ------------------------------------------------------------------ */

export type IdentityStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

export type VerificationSummary = {
  email: boolean;
  phone: boolean;
  identity: IdentityStatus;
  canBuy: boolean;
  canSell: boolean;
};

export type PersonSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "BLOCKED" | "DELETED";
  location: string;
  profession: string;
  createdAt?: string;
  lastLoginAt?: string;
  isAdmin: boolean;
  verification: VerificationSummary;
};

export type PersonListItem = PersonSummary & {
  isProvider: boolean;
  stats: { services: number; products: number; bookings: number; orders: number; spent: number };
};

export type PersonDetail = PersonSummary & {
  bio: string;
  services: Array<{ id: string; title: string; category?: string; price: number; currency: string; status: string; image: string; createdAt?: string }>;
  products: Array<{ id: string; title: string; category?: string; price: number; currency: string; status: string; image: string; createdAt?: string }>;
  bookings: Array<{ id: string; serviceTitle: string; amount: number; currency: string; status: string; scheduledAt?: string; createdAt?: string }>;
  orders: Array<{ id: string; orderNumber: string; total: number; currency: string; paymentStatus: string; orderStatus: string; createdAt?: string }>;
  identity: { status: IdentityStatus; documentType: string; submittedAt?: string; reviewedAt?: string } | null;
};

export type Overview = {
  currency: string;
  users: {
    total: number;
    newLast30Days: number;
    emailVerified: number;
    phoneVerified: number;
    identityApproved: number;
    identityPending: number;
    blocked: number;
    providers: number;
    customers: number;
  };
  services: { total: number; active: number };
  products: { total: number; active: number; sold: number };
  bookings: { total: number; pending: number; confirmed: number; completed: number; cancelled: number; today: number };
  orders: { total: number; paid: number };
  feedPosts: number;
  openSupportTickets: number;
  revenue: { total: number; orders: number; subscriptions: number; bookings: number };
  monthly: Array<{ month: string; signups: number; revenue: number }>;
  recentUsers: PersonSummary[];
};

export type Earnings = {
  currency: string;
  totals: { total: number; orders: number; subscriptions: number; bookings: number };
  monthly: Array<{ month: string; orders: number; subscriptions: number; bookings: number; total: number }>;
  transactions: Array<{
    id: string;
    type: "ORDER" | "SUBSCRIPTION" | "BOOKING";
    reference: string;
    customer: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
  }>;
};

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/** Converts numbers, numeric strings and Mongo Decimal128 JSON ({ $numberDecimal }) to a number. */
export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    const parsed = Number((value as { $numberDecimal: string }).$numberDecimal);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const formatMoney = (amount: number, currency = "CHF") =>
  `${currency} ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export const formatDateTime = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";

export const avatarFor = (person: { avatar?: string; name?: string }) =>
  person.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name || "User")}`;

export const monthLabel = (month: string, isDe: boolean) => {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString(isDe ? "de-CH" : "en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
};

/* ------------------------------------------------------------------ */
/* Data loading                                                        */
/* ------------------------------------------------------------------ */

/**
 * Loads `path` from the backend and exposes { data, error, isLoading, reload, setData }.
 * Session problems are handled by apiRequest (redirect to login), so they never surface as page errors.
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(path));

  const reload = useCallback(async () => {
    if (!path) return;
    setIsLoading(true);
    setError("");
    try {
      setData(await apiRequest<T>(path));
    } catch (loadError) {
      if (loadError instanceof SessionExpiredError) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load data.");
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, isLoading, reload, setData };
}

/** Generic paginated list endpoints (`/blogs`, `/bookings`, …) return { items, meta }. */
export type Page<T> = { items: T[]; meta: { page: number; limit: number; total: number; pages: number } };
