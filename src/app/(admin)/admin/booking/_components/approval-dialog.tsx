"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Car, User } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { BookingDto } from "@/features/booking";
import { updateBookingStatusAction, assignDriverAction } from "@/features/booking/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDto | null;
  mode: "APPROVE" | "REJECT" | "DRIVER";
  onUpdated: (updated: BookingDto) => void;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  booking,
  mode,
  onUpdated,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [driverName, setDriverName] = useState(booking?.driverName || "");
  const [driverPhone, setDriverPhone] = useState(booking?.driverPhone || "");

  if (!booking) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await updateBookingStatusAction({
        id: booking.id,
        status: "APPROVED",
        driverName: driverName.trim() || undefined,
        driverPhone: driverPhone.trim() || undefined,
      });

      if (res.ok) {
        toast.success(t("booking.approveSuccess"));
        onUpdated(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอนุมัติ");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await updateBookingStatusAction({
        id: booking.id,
        status: "REJECTED",
        rejectReason: rejectReason.trim() || null,
      });

      if (res.ok) {
        toast.success(t("booking.rejectSuccess"));
        onUpdated(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการปฏิเสธคำขอ");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!driverName.trim()) {
      toast.error("กรุณาระบุชื่อพนักงานขับรถ");
      return;
    }

    setLoading(true);
    try {
      const res = await assignDriverAction({
        id: booking.id,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim() || null,
      });

      if (res.ok) {
        toast.success("มอบหมายพนักงานขับรถเรียบร้อยแล้ว");
        onUpdated(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการมอบหมาย");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <LiyonDialogHeader
        title={
          mode === "APPROVE"
            ? t("booking.approve")
            : mode === "REJECT"
            ? t("booking.reject")
            : t("booking.assignDriver")
        }
        description={`คำขอ: ${booking.title}`}
      />

      <LiyonDialogBody className="space-y-4">
        {/* Booking Brief */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              [{booking.resource?.type === "ROOM" ? "ห้องประชุม" : "ยานพาหนะ"}] {booking.resource?.nameTh}
            </span>
            <span className="text-muted-foreground">{booking.attendeeCount} คน</span>
          </div>
          <div className="text-muted-foreground">
            ช่วงเวลา: {formatDate(new Date(booking.startTime), locale)} - {formatDate(new Date(booking.endTime), locale)}
          </div>
          {booking.destination && (
            <div className="text-muted-foreground">
              ปลายทาง: <span className="text-foreground">{booking.destination}</span>
            </div>
          )}
          <div className="text-muted-foreground">
            ผู้ขอจอง: <span className="text-foreground">{booking.userName || booking.userEmail}</span>
          </div>
        </div>

        {/* Mode: APPROVE */}
        {mode === "APPROVE" && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>ยืนยันการอนุมัติคำขอนี้ ทรัพยากรจะถูกล็อกตามช่วงเวลาที่กำหนด</span>
            </div>

            {booking.resource?.type === "VEHICLE" && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-primary" />
                  มอบหมายพนักงานขับรถ (ถ้ามี)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ชื่อคนขับรถ"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="เบอร์โทรติดต่อ"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode: REJECT */}
        {mode === "REJECT" && (
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>ปฏิเสธคำขอจองนี้ ผู้ขอจองจะได้รับแจ้งเหตุผล</span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                เหตุผลในการไม่อนุมัติ (ระบุเพื่อแจ้งผู้ขอจอง)
              </label>
              <textarea
                rows={3}
                placeholder="เช่น ห้องอยู่ระหว่างการปรับปรุงระบบเครื่องเสียง หรือ รถติดภารกิจด่วนของผู้บริหาร..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Mode: DRIVER ONLY */}
        {mode === "DRIVER" && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              ข้อมูลพนักงานขับรถ
            </h4>
            <div>
              <label className="block text-xs font-medium mb-1">ชื่อพนักงานขับรถ *</label>
              <input
                type="text"
                required
                placeholder="เช่น นายสมศักดิ์ ขับดีเลิศ"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="text"
                placeholder="08x-xxx-xxxx"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        )}
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          ยกเลิก
        </Button>
        {mode === "APPROVE" && (
          <Button onClick={handleApprove} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {loading ? "กำลังอนุมัติ..." : "ยืนยันการอนุมัติ"}
          </Button>
        )}
        {mode === "REJECT" && (
          <Button onClick={handleReject} disabled={loading} variant="destructive">
            <XCircle className="w-4 h-4 mr-1.5" />
            {loading ? "กำลังบันทึก..." : "ยืนยันการปฏิเสธ"}
          </Button>
        )}
        {mode === "DRIVER" && (
          <Button onClick={handleAssignDriver} disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูลคนขับรถ"}
          </Button>
        )}
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
