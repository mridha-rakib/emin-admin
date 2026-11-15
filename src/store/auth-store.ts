"use client";

import { create } from "zustand";

type AdminUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type AuthState = {
  token: string | null;
  adminId: string;
  adminName: string;
  adminEmail: string;
  setSession: (input: { accessToken: string; user?: AdminUser }) => void;
  logout: () => void;
};

const read = (key: string) =>
  typeof window === "undefined" ? null : window.localStorage.getItem(key);

const write = (key: string, value?: string | null) => {
  if (typeof window === "undefined") return;
  if (value === undefined || value === null || value === "") {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
};

const adminName = (user?: AdminUser) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

export const useAuthStore = create<AuthState>((set) => ({
  token: read("auth_token"),
  adminId: read("admin_id") ?? "",
  adminName: read("admin_name") ?? "",
  adminEmail: read("admin_email") ?? "",

  setSession: ({ accessToken, user }) => {
    const id = user?._id ?? user?.id ?? "";
    const name = adminName(user);
    const email = user?.email ?? "";

    write("auth_token", accessToken);
    write("admin_id", id);
    write("admin_name", name);
    write("admin_email", email);

    set({ token: accessToken, adminId: id, adminName: name, adminEmail: email });
  },

  logout: () => {
    ["auth_token", "admin_id", "admin_name", "admin_email"].forEach((key) => write(key));
    set({ token: null, adminId: "", adminName: "", adminEmail: "" });
  },
}));
