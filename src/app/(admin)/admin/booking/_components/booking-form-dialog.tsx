"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { BookingResourceDto, BookingDto } from "@/features/booking";
import { createBookingAction } from "@/features/booking/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: BookingResourceDto[];
  onSaved: (booking: BookingDto) => void;
}

export function BookingFormDialog({ open, onOpenChange, resources, onSaved }: Props) {
  if (!open) return null;
  return (
    <BookingFormDialogInner
      open={open}
      onOpenChange={onOpenChange}
      resources={resources}
      onSaved={onSaved}
    />
  );
}

function BookingFormDialogInner({ open, onOpenChange, resources, onSaved }: Props) {
  const t = useT();
  const [loading, setLoading] = useState(false);

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  defaultStart.setHours(9, 0, 0, 0);

  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(12, 0, 0, 0);

  const [resourceTypeFilter, setResourceTypeFilter] = useState<"ALL" | "ROOM" | "VEHICLE">("ALL");
  const [resourceId, setResourceId] = useState(resources[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(defaultStart.toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(defaultEnd.toISOString().slice(0, 16));
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [destination, setDestination] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [notes, setNotes] = useState("");

  const filteredResources = useMemo(() => {
    if (resourceTypeFilter === "ALL") return resources;
    return resources.filter((r) => r.type === resourceTypeFilter);
  }, [resources, resourceTypeFilter]);

  const selectedResource = useMemo(() => {
    return resources.find((r) => r.id === resourceId);
  }, [resources, resourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId) {
      toast.error("กรุณาเลือกห้องประชุมหรือยานพาหนะ");
      return;
    }
    if (!title.trim()) {
      toast.error("กรุณาระบุหัวข้อการประชุมหรือภารกิจ");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น");
      return;
    }

    setLoading(true);
    try {
      const res = await createBookingAction({
        resourceId,
        title: title.trim(),
        description: description.trim() || null,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        attendeeCount: Number(attendeeCount) || 1,
        destination: selectedResource?.type === "VEHICLE" ? destination.trim() || null : null,
        driverName: selectedResource?.type === "VEHICLE" ? driverName.trim() || null : null,
        driverPhone: selectedResource?.type === "VEHICLE" ? driverPhone.trim() || null : null,
        notes: notes.trim() || null,
      });

      if (res.ok) {
        toast.success(t("booking.saveSuccess"));
        onSaved(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งคำขอจอง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <form onSubmit={handleSubmit}>
        <LiyonDialogHeader
          title={t("booking.create")}
          description="ส่งคำขอจองห้องประชุมหรือยานพาหนะส่วนกลางของคณะ"
        />

        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Resource Filter & Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                ประเภททรัพยากร
              </label>
              <LiyonSelect
                value={resourceTypeFilter}
                onChange={(e) => {
                  const type = e.target.value as "ALL" | "ROOM" | "VEHICLE";
                  setResourceTypeFilter(type);
                  const first = type === "ALL" ? resources[0] : resources.find((r) => r.type === type);
                  if (first) setResourceId(first.id);
                }}
              >
                <option value="ALL">ทั้งหมด (ห้องและรถยนต์)</option>
                <option value="ROOM">{t("booking.field.type.ROOM")}</option>
                <option value="VEHICLE">{t("booking.field.type.VEHICLE")}</option>
              </LiyonSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("booking.field.resource")} *
              </label>
              <LiyonSelect
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              >
                {filteredResources.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.type === "ROOM" ? "ห้อง" : "รถ"}] {r.nameTh} ({r.location || r.code})
                  </option>
                ))}
              </LiyonSelect>
            </div>
          </div>

          {/* Title / Purpose */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("booking.field.title")} *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น การประชุมคณะกรรมการประจำคณะฯ, เดินทางไปราชการตรวจประเมิน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("booking.field.startTime")} *
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("booking.field.endTime")} *
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Attendee Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("booking.field.attendeeCount")} *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={attendeeCount}
                onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {selectedResource?.type === "VEHICLE" && (
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  {t("booking.field.destination")}
                </label>
                <input
                  type="text"
                  placeholder="เช่น มหาวิทยาลัยขอนแก่น, ศูนย์ประชุมนานาชาติ"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>

          {/* Vehicle Specific Fields */}
          {selectedResource?.type === "VEHICLE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted/40 rounded-xl border border-border">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  {t("booking.field.driverName")} (ถ้ามีผู้ขับขี่ที่ต้องการเจาะจง)
                </label>
                <input
                  type="text"
                  placeholder="ชื่อพนักงานขับรถ"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">
                  {t("booking.field.driverPhone")}
                </label>
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

          {/* Description & Agenda */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("booking.field.description")}
            </label>
            <textarea
              rows={2}
              placeholder="รายละเอียดวาระการประชุม หรือ กำหนดการเดินทาง..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("booking.field.notes")}
            </label>
            <input
              type="text"
              placeholder="ความต้องการพิเศษ เช่น ขอจัดโต๊ะแบบ U-Shape, ขออาหารว่าง"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "ส่งคำขอจอง"}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
