"use client";

import { useCallback, useState } from "react";
import { useApi, type Page } from "@/lib/admin-api";
import { MessageSquare, Bell, User, Moon, Sun, Menu } from "lucide-react";
import { LanguageFlag } from "./LanguageFlag";
import { useSidebar } from "../ui/sidebar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import NotificationMenu, { type AppNotification } from "./NotificationMenu";
import { useTranslation } from "@/context/LanguageContext";

const Navbar = () => {
  const { setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const { toggleSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: latestNotifications, reload: reloadNotifications } = useApi<Page<AppNotification>>("/notifications?page=1&limit=50");
  const hasUnread = (latestNotifications?.items ?? []).some((item) => !item.readAt);
  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
    void reloadNotifications();
  }, [reloadNotifications]);

  return (
    <>
      {/* Main navbar - Sticky top-0 across full inset width */}
      <header className="sticky top-0 z-40 flex h-16 md:h-18 w-full shrink-0 items-center justify-between border-b border-border/80 bg-background/85 backdrop-blur-md px-4 sm:px-6 md:px-8 transition-all">
        <div className="flex h-full w-full items-center justify-between">
          {/* Left Section */}
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border/70 hover:border-primary/40 hover:bg-muted/60 text-foreground transition-colors shadow-2xs"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <div className="flex min-w-0 flex-col">
              <h1 className="truncate text-base sm:text-lg font-extrabold tracking-tight text-foreground">
                {t.header.welcome}
              </h1>
              <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                {t.header.haveANiceDay}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button 
                  title={t.header.language}
                  className="flex h-9 sm:h-10 px-2.5 sm:px-3.5 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all shadow-2xs hover:border-primary/40"
                >
                  <LanguageFlag language={language} />
                  <span className="text-xs font-bold">{language}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="z-[60] min-w-[150px] rounded-xl bg-card shadow-xl border border-border p-1.5 animate-in fade-in zoom-in-95">
                <DropdownMenuItem 
                  onClick={() => setLanguage("EN")}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg transition-colors ${
                    language === "EN" 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <LanguageFlag language="EN" />
                  <span>{t.header.english}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("DE")}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg transition-colors ${
                    language === "DE" 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <LanguageFlag language="DE" />
                  <span>{t.header.german}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all shadow-2xs hover:border-primary/40 relative"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" strokeWidth={2} />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>
              <NotificationMenu
                open={showNotifications}
                onClose={closeNotifications}
              />
            </div>

            {/* Profile Avatar Button */}
            <Link
              href="/profile"
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-foreground transition-all shadow-2xs hover:border-primary/40"
              aria-label="Profile"
            >
              <User className="h-4.5 w-4.5 text-foreground" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
