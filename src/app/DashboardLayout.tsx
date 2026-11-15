"use client";

import { usePathname, useRouter } from "next/navigation";
import AppSidebar from "@/components/common/AppSidebar";
import Navbar from "@/components/common/Navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/auth-store";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isHydrated = useSyncExternalStore(subscribeToHydration, getClientHydrationSnapshot, getServerHydrationSnapshot);
  const [defaultOpen, setDefaultOpen] = useState(true);

  // Check if current route is an auth route
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-otp");

  const mustSignIn = isHydrated && !token && !isAuthRoute;

  useEffect(() => {
    // Get sidebar state from cookie
    const sidebarState = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1];
    setDefaultOpen(sidebarState === "true");
  }, []);

  useEffect(() => {
    if (mustSignIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [mustSignIn, pathname, router]);

  // If auth route, render children without sidebar/navbar
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Until the session is known (and while redirecting), render nothing so pages never call the API without a token.
  if (!isHydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Otherwise, render with sidebar and navbar
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="transition-all min-h-screen">
        <Navbar />
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 pb-14 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
