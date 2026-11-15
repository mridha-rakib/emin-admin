import { useAuthStore } from "@/store/auth-store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4003";

export type ApiPage<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
};

/** Clears the session and sends the admin to the login page, remembering where they were. */
export function redirectToLogin() {
  if (typeof window === "undefined") return;
  useAuthStore.getState().logout();
  if (window.location.pathname.startsWith("/login")) return;
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/admin/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-otp",
  "/auth/resend-verification",
];

export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has ended. Please sign in again.");
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  const isPublicAuthCall = PUBLIC_AUTH_PATHS.some((publicPath) => path.startsWith(publicPath));

  if (!token && !isPublicAuthCall) {
    redirectToLogin();
    throw new SessionExpiredError();
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  const lostAccess =
    response.status === 401 ||
    (response.status === 403 && typeof data?.message === "string" && /administrator access/i.test(data.message));
  if (lostAccess && !isPublicAuthCall) {
    redirectToLogin();
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}

export async function downloadInvoicePdf(id: string, filename: string) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  const response = await fetch(`${API_URL}/invoices/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("The invoice could not be downloaded.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
