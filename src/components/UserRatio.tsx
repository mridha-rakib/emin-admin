"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DataState } from "@/components/common/DataState";
import { useTranslation } from "@/context/LanguageContext";
import { monthLabel, type Overview } from "@/lib/admin-api";

export function UserRatio({ monthly, users }: { monthly: Overview["monthly"]; users: Overview["users"] }) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";

  const chartData = useMemo(
    () => monthly.map((row) => ({ month: monthLabel(row.month, isDe), signups: row.signups })),
    [monthly, isDe]
  );
  const hasSignups = monthly.some((row) => row.signups > 0);

  const chartConfig = useMemo(
    () =>
      ({
        signups: {
          label: isDe ? "Neue Nutzer" : "New users",
          color: "var(--chart-2)",
        },
      }) satisfies ChartConfig,
    [isDe]
  );

  const range = chartData.length ? `${chartData[0].month} – ${chartData[chartData.length - 1].month}` : "";

  return (
    <Card className="h-full rounded-2xl border border-border/80 shadow-xs bg-card">
      <CardHeader className="p-4 sm:p-6 pb-2">
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg font-extrabold tracking-tight">{t.charts.userRatio}</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {isDe ? "Neuanmeldungen pro Monat" : "Sign-ups per month"} · {range}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-2xs">
              {users.customers} {isDe ? "Kunden" : "Customers"}
            </span>
            <span className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-2xs">
              {users.providers} {isDe ? "Anbieter" : "Providers"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-2 sm:p-4 md:p-6">
        {hasSignups ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              barCategoryGap="20%"
              barGap={2}
              margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="text-xs sm:text-sm"
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="signups" fill="#1eb9c7" radius={[8, 8, 2, 2]} className="hover:opacity-85 transition-opacity" />
            </BarChart>
          </ChartContainer>
        ) : (
          <DataState
            isEmpty
            emptyTitle={isDe ? "Keine Neuanmeldungen" : "No sign-ups yet"}
            emptyDescription={
              isDe
                ? "In den letzten 12 Monaten hat sich niemand registriert."
                : "Nobody has registered in the last 12 months."
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
