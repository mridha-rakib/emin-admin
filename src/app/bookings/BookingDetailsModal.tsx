"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { formatDate, formatMoney } from "@/lib/admin-api";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface BookingRecord {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  providerName: string;
  providerEmail?: string;
  serviceTitle: string;
  category: string;
  amount: number;
  currency: string;
  duration?: string;
  scheduledAt?: string;
  timeSlot?: string;
  address: string;
  notes?: string;
  status: BookingStatus;
  createdAt?: string;
}

interface BookingDetailsModalProps {
  booking: BookingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, newStatus: BookingStatus) => void;
  isUpdating?: boolean;
  error?: string;
}

export const formatBookingTime = (booking: Pick<BookingRecord, "scheduledAt" | "timeSlot">) =>
  booking.timeSlot ||
  (booking.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })
    : "—");

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating = false,
  error,
}) => {
  const { language, t } = useTranslation();
  const isDe = language === "DE";

  if (!booking) return null;

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {t.common.confirmed}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/30 dark:text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {t.common.completed}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-500/30 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {t.common.cancelled}
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30 dark:text-amber-400">
            <Clock3 className="w-3.5 h-3.5 mr-1" />
            {t.common.pending}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              {t.bookings.bookingDetailsTitle}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{booking.reference}</span>
              {getStatusBadge(booking.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Service & Pricing Card */}
          <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {booking.category}
                </span>
                <h3 className="text-base font-bold text-foreground mt-1">{booking.serviceTitle}</h3>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-foreground flex items-center justify-end">
                  {formatMoney(booking.amount, booking.currency)}
                </div>
                {booking.duration && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {booking.duration}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Provider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="rounded-xl border p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-blue-500" />
                {t.bookings.customer}
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{booking.customerName}</div>
                {booking.customerEmail && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" /> {booking.customerEmail}
                  </div>
                )}
                {booking.customerPhone && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {booking.customerPhone}
                  </div>
                )}
              </div>
            </div>

            {/* Provider Box */}
            <div className="rounded-xl border p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                {t.bookings.provider}
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{booking.providerName}</div>
                {booking.providerEmail && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" /> {booking.providerEmail}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 pb-2 border-b">
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {t.bookings.date}
                </span>
                <p className="text-sm font-semibold text-foreground mt-0.5">{formatDate(booking.scheduledAt)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {t.bookings.time}
                </span>
                <p className="text-sm font-semibold text-foreground mt-0.5">{formatBookingTime(booking)}</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {t.bookings.address}
              </span>
              <p className="text-sm font-medium text-foreground mt-0.5">{booking.address || "—"}</p>
            </div>

            {booking.notes && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  {t.bookings.notes}
                </span>
                <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2.5 rounded-lg italic">
                  &ldquo;{booking.notes}&rdquo;
                </p>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground pt-2 border-t">
              {isDe ? "Erstellt am" : "Created on"} {formatDate(booking.createdAt)}
            </p>
          </div>

          {/* Admin Status Actions */}
          <div className="border-t pt-4 space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              {t.bookings.changeStatus}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={booking.status === "pending" ? "default" : "outline"}
                size="sm"
                disabled={isUpdating || booking.status === "pending"}
                onClick={() => onStatusChange(booking.id, "pending")}
                className="text-xs"
              >
                {t.common.pending}
              </Button>
              <Button
                variant={booking.status === "confirmed" ? "default" : "outline"}
                size="sm"
                disabled={isUpdating || booking.status === "confirmed"}
                onClick={() => onStatusChange(booking.id, "confirmed")}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t.common.confirmed}
              </Button>
              <Button
                variant={booking.status === "completed" ? "default" : "outline"}
                size="sm"
                disabled={isUpdating || booking.status === "completed"}
                onClick={() => onStatusChange(booking.id, "completed")}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t.common.completed}
              </Button>
              <Button
                variant={booking.status === "cancelled" ? "destructive" : "outline"}
                size="sm"
                disabled={isUpdating || booking.status === "cancelled"}
                onClick={() => onStatusChange(booking.id, "cancelled")}
                className="text-xs"
              >
                {t.common.cancelled}
              </Button>
            </div>
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
