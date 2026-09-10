"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Building, Car } from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import type { BookingDto, BookingResourceDto } from "@/features/booking";

interface Props {
  bookings: BookingDto[];
  resources: BookingResourceDto[];
  onSelectBooking?: (b: BookingDto) => void;
}

export function CalendarView({ bookings, resources, onSelectBooking }: Props) {
  const locale = useLocale();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [typeFilter, setTypeFilter] = useState<"ALL" | "ROOM" | "VEHICLE">("ALL");

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const today = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setSelectedDate(d);
  };

  // Filtered resources
  const displayResources = useMemo(() => {
    if (typeFilter === "ALL") return resources;
    return resources.filter((r) => r.type === typeFilter);
  }, [resources, typeFilter]);

  // Bookings for selected date range (00:00 - 23:59)
  const dayBookings = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return bookings.filter((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart <= endOfDay && bEnd >= startOfDay && b.status !== "CANCELLED" && b.status !== "REJECTED";
    });
  }, [bookings, selectedDate]);

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 rounded-lg border border-border text-foreground transition-colors"
          >
            วันนี้
          </button>
          <div className="flex items-center">
            <button
              onClick={prevDay}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextDay}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="font-bold text-base text-foreground ml-2">
            {formatDate(selectedDate, locale)}
          </span>
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTypeFilter("ALL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              typeFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setTypeFilter("ROOM")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              typeFilter === "ROOM"
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building className="w-3 h-3" />
            ห้องประชุม
          </button>
          <button
            onClick={() => setTypeFilter("VEHICLE")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              typeFilter === "VEHICLE"
                ? "bg-amber-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Car className="w-3 h-3" />
            ยานพาหนะ
          </button>
        </div>
      </div>

      {/* Resource Schedule Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayResources.map((res) => {
          const resBookings = dayBookings.filter((b) => b.resourceId === res.id);
          return (
            <div
              key={res.id}
              className="bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-sm"
            >
              {/* Card Header */}
              <div
                className="p-3 border-b border-border flex items-center justify-between"
                style={{ borderTop: `4px solid ${res.color}` }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    {res.type === "ROOM" ? (
                      <Building className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <h3 className="font-bold text-sm text-foreground">{res.nameTh}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {res.location} • ความจุ {res.capacity} {res.type === "ROOM" ? "ที่นั่ง" : "คน"}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  resBookings.length === 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {resBookings.length === 0 ? "ว่างวันนี้" : `${resBookings.length} คิว`}
                </span>
              </div>

              {/* Bookings List for this resource */}
              <div className="p-3 flex-1 space-y-2">
                {resBookings.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground/60 border border-dashed border-border/60 rounded-lg">
                    ไม่มีรายการจองในวันนี้
                  </div>
                ) : (
                  resBookings.map((b) => {
                    const startH = new Date(b.startTime).toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" });
                    const endH = new Date(b.endTime).toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div
                        key={b.id}
                        onClick={() => onSelectBooking?.(b)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-md ${
                          b.status === "APPROVED"
                            ? "bg-primary/5 border-primary/30"
                            : "bg-amber-500/5 border-amber-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-foreground">
                          <span className="line-clamp-1">{b.title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ml-1 ${
                            b.status === "APPROVED" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                          }`}>
                            {b.status === "APPROVED" ? "อนุมัติแล้ว" : "รออนุมัติ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-[11px]">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{startH} - {endH} น.</span>
                          <span>•</span>
                          <User className="w-3 h-3" />
                          <span className="truncate">{b.userName || b.userEmail}</span>
                        </div>
                        {b.destination && (
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5 text-[11px]">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span className="truncate">{b.destination}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
