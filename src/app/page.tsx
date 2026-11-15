"use client";

import RecentUser from "@/components/RecentUser";
import { UserRatio } from "@/components/UserRatio";
import { Calendar } from "@/components/ui/calendar";
import { CountingNumber } from "@/components/ui/CountingNumber";
import { DataState } from "@/components/common/DataState";
import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { useApi, type Overview } from "@/lib/admin-api";
import {
  Briefcase,
  CalendarCheck,
  Users,
  Wallet,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  Activity,
  Clock,
  LifeBuoy,
  UserPlus,
  Calendar as CalendarIcon
} from "lucide-react";

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { language, t } = useTranslation();
  const isDe = language === "DE";
  const { data: overview, error, isLoading, reload } = useApi<Overview>("/admin/overview");

  if (!overview) {
    return (
      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty
        emptyTitle={isDe ? "Keine Dashboard-Daten verfügbar" : "No dashboard data available"}
        onRetry={() => void reload()}
      />
    );
  }

  const { users, bookings, revenue, orders, currency } = overview;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 4 Primary Business Metric Cards - Human-Crafted Bento Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Marketplace Gross Volume */}
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {orders.paid} {isDe ? "bezahlte Bestellungen" : "paid orders"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              {t.dashboard.marketplaceGrossVolume}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              <CountingNumber
                end={revenue.total}
                duration={1000}
                decimals={2}
                prefix={`${currency} `}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isDe
                ? "Bestellungen, Abos & abgeschlossene Buchungen"
                : "Orders, subscriptions & completed bookings"}
            </p>
          </div>
        </div>

        {/* Metric 2: Registered Users (Customers & Providers) */}
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <UserPlus className="w-3 h-3" />
              +{users.newLast30Days} {isDe ? "in 30 Tagen" : "in 30 days"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              {t.dashboard.activeBuyersSellers}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              <CountingNumber
                end={users.total}
                duration={1000}
                decimals={0}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {users.emailVerified} {isDe ? "mit bestätigter E-Mail" : "with verified email"}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Bookings */}
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <CalendarCheck className="w-3 h-3" />
              {bookings.today} {isDe ? "heute" : "today"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              {t.dashboard.totalBookings}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              <CountingNumber
                end={bookings.total}
                duration={1000}
                decimals={0}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {isDe
                ? `${bookings.completed} abgeschlossen · ${bookings.pending} offen`
                : `${bookings.completed} completed · ${bookings.pending} pending`}
            </p>
          </div>
        </div>

        {/* Metric 4: Service Providers */}
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              {users.identityPending} {isDe ? "ID-Prüfungen offen" : "ID checks pending"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              {t.dashboard.activeProviders}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              <CountingNumber
                end={users.providers}
                duration={1000}
                decimals={0}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {users.identityApproved} {isDe ? "Nutzer mit geprüfter ID" : "users with approved ID"}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Operations & Service Dispatch Hub */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {isDe ? "Live-Daten" : "Live data"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <LifeBuoy className="w-3 h-3" />
                  {overview.openSupportTickets} {isDe ? "offene Support-Tickets" : "open support tickets"}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                {t.dashboard.operationsTitle}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">
                {t.dashboard.operationsSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 lg:pt-0">
            <Link
              href="/bookings"
              className="px-4 py-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-2xs hover:border-primary/40"
            >
              <ClipboardList className="w-4 h-4 text-primary" />
              <span>{t.dashboard.manageBookings}</span>
            </Link>
            <Link
              href="/providers"
              className="px-4 py-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-2xs hover:border-primary/40"
            >
              <Briefcase className="w-4 h-4 text-primary" />
              <span>{t.dashboard.viewProviders}</span>
            </Link>
            <Link
              href="/earnings"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs shadow-primary/20"
            >
              <Wallet className="w-4 h-4" />
              <span>{t.dashboard.financialReports}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics & Calendar Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto]">
        {/* User Ratio Chart Column */}
        <div className="h-[380px] sm:h-[420px] w-full">
          <UserRatio monthly={overview.monthly} users={users} />
        </div>

        {/* Operational Schedule & Calendar Column */}
        <div className="flex justify-center lg:justify-start">
          <div className="h-[380px] sm:h-[420px] w-full sm:w-[340px]">
            <div className="bg-card h-full w-full overflow-hidden rounded-2xl border border-border/80 p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {isDe ? "Einsatzplan & Termine" : "Operations Calendar"}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {bookings.today} {isDe ? "Heute" : "Today"}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center py-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="bg-transparent rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {bookings.pending} {isDe ? "Buchungen offen" : "bookings pending"}
                </span>
                <Link href="/bookings" className="font-semibold text-primary cursor-pointer hover:underline">
                  {isDe ? "Details" : "View Details"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Platform Users & Activity Table */}
      <div className="pt-2">
        <RecentUser users={overview.recentUsers} />
      </div>
    </div>
  );
};

export default Dashboard;
