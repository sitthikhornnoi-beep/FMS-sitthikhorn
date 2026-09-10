"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Building,
  Car,
  Users,
  MapPin,
  CheckCircle2,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { useAppSession } from "@/hooks/use-session";
import type { BookingDto, BookingResourceDto } from "@/features/booking";

interface Props {
  initialBookings: BookingDto[];
  resources: BookingResourceDto[];
}

export function PublicBookingView({ initialBookings, resources }: Props) {
  const locale = useLocale();
  const t = useT();
  const { status, user } = useAppSession();
  const isLoggedIn = status === "authenticated" && !!user;

  const [filterType, setFilterType] = useState<"ALL" | "ROOM" | "VEHICLE">("ALL");

  const filteredResources = useMemo(() => {
    if (filterType === "ALL") return resources;
    return resources.filter((r) => r.type === filterType);
  }, [resources, filterType]);

  const approvedBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      if (b.status !== "APPROVED") return false;
      if (filterType !== "ALL" && b.resource?.type !== filterType) return false;
      return true;
    });
  }, [initialBookings, filterType]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>{locale === "th" ? "บริการทรัพยากรส่วนกลาง" : "Central Resources"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("booking.publicTitle")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          {t("booking.publicSubtitle")}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/admin/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>เข้าสู่ระบบจัดการและส่งคำขอจอง</span>
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=/admin/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบสำหรับบุคลากรเพื่อขอจอง</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === "ALL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          ทั้งหมด ({resources.length})
        </button>
        <button
          onClick={() => setFilterType("ROOM")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === "ROOM"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          ห้องประชุม ({resources.filter((r) => r.type === "ROOM").length})
        </button>
        <button
          onClick={() => setFilterType("VEHICLE")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === "VEHICLE"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          ยานพาหนะ ({resources.filter((r) => r.type === "VEHICLE").length})
        </button>
      </div>

      {/* Grid of Resources */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span>ทรัพยากรส่วนกลางที่เปิดให้บริการ</span>
          <span className="text-xs text-muted-foreground font-normal">
            ({filteredResources.length} รายการ)
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-44 relative bg-muted flex items-center justify-center">
                {res.imageUrl ? (
                  <Image
                    src={res.imageUrl}
                    alt={res.nameTh}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : res.type === "ROOM" ? (
                  <Building className="w-12 h-12 text-muted-foreground/30" />
                ) : (
                  <Car className="w-12 h-12 text-muted-foreground/30" />
                )}
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-sm"
                  style={{ backgroundColor: res.color }}
                >
                  {res.type === "ROOM" ? `ความจุ ${res.capacity} ที่นั่ง` : `ความจุ ${res.capacity} ผู้โดยสาร`}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">{res.nameTh}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{res.location}</p>

                  {res.facilities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {res.facilities.map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">การอนุมัติ:</span>
                  <span className="font-semibold text-foreground">
                    {res.requiresApproval ? "ต้องขออนุมัติล่วงหน้า" : "จองและใช้งานได้ทันที"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Approved Schedule */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>ตารางการใช้งานที่ได้รับอนุมัติแล้ว</span>
          <span className="text-xs text-muted-foreground font-normal">
            ({approvedBookings.length} คิว)
          </span>
        </h2>

        {approvedBookings.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
            ไม่มีรายการใช้งานที่ได้รับอนุมัติในช่วงเวลานี้ ทรัพยากรว่างพร้อมสำหรับการขอใช้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedBookings.map((b) => {
              const start = new Date(b.startTime);
              const end = new Date(b.endTime);
              const timeStr = `${start.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", { hour: "2-digit", minute: "2-digit" })} น.`;

              return (
                <div
                  key={b.id}
                  className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-start gap-3.5"
                >
                  <div
                    className="w-3 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: b.resource?.color || "#3b82f6" }}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        [{b.resource?.type === "ROOM" ? "ห้องประชุม" : "ยานพาหนะ"}] {b.resource?.nameTh}
                      </span>
                      <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        อนุมัติแล้ว
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-foreground">{b.title}</h4>

                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(start, locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {b.attendeeCount} คน
                      </span>
                      {b.destination && (
                        <span className="flex items-center gap-1 text-primary">
                          <MapPin className="w-3.5 h-3.5" />
                          {b.destination}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
