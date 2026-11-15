"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DataState } from "@/components/common/DataState";
import { useTranslation } from "@/context/LanguageContext";
import { formatMoney, monthLabel, type Earnings } from "@/lib/admin-api";

export function EarningChart({ monthly, currency = "CHF" }: { monthly: Earnings["monthly"]; currency?: string }) {
  const { language, t } = useTranslation();
  const isDe = language === "DE";

  const chartData = useMemo(
    () => monthly.map((row) => ({ month: monthLabel(row.month, isDe), total: row.total })),
    [monthly, isDe]
  );
  const periodTotal = monthly.reduce((sum, row) => sum + row.total, 0);

  const chartConfig = useMemo(
    () =>
      ({
        total: {
          label: t.charts.earnings,
          color: "var(--chart-1)",
        },
      }) satisfies ChartConfig,
    [t]
  );

  return (
    <Card className="h-full rounded-2xl border border-border/80 shadow-xs bg-card">
      <CardHeader className="p-4 sm:p-6 pb-2">
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-base sm:text-lg font-extrabold tracking-tight">{t.charts.earningsOverview}</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.charts.earningsDesc}
            </CardDescription>
          </div>
          <div className="flex w-full items-start gap-2 pr-5 text-sm sm:w-auto">
            <div className="leading-none font-medium">
              {isDe ? "Letzte 12 Monate" : "Last 12 months"}: {formatMoney(periodTotal, currency)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-2 sm:p-4 md:p-6">
        {periodTotal > 0 ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="total"
                type="linear"
                fill="var(--color-primary)"
                fillOpacity={0.4}
                stroke="var(--color-primary)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <DataState
            isEmpty
            emptyTitle={isDe ? "Noch keine Einnahmen" : "No earnings yet"}
            emptyDescription={
              isDe
                ? "Bezahlte Bestellungen, Abos und abgeschlossene Buchungen der letzten 12 Monate erscheinen hier."
                : "Paid orders, subscriptions and completed bookings from the last 12 months will appear here."
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
