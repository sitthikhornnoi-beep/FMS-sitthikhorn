"use client";

import { useState } from "react";
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
import type { BookingResourceDto } from "@/features/booking";
import { createBookingResourceAction, updateBookingResourceAction } from "@/features/booking/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: BookingResourceDto | null;
  defaultType?: "ROOM" | "VEHICLE";
  onSaved: (saved: BookingResourceDto) => void;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  defaultType = "ROOM",
  onSaved,
}: Props) {
  if (!open) return null;
  return (
    <ResourceFormDialogInner
      key={resource?.id ?? `create-${defaultType}`}
      open={open}
      onOpenChange={onOpenChange}
      resource={resource}
      defaultType={defaultType}
      onSaved={onSaved}
    />
  );
}

function ResourceFormDialogInner({
  open,
  onOpenChange,
  resource,
  defaultType,
  onSaved,
}: Props) {
  const t = useT();
  const isEditing = !!resource;
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"ROOM" | "VEHICLE">(
    (resource?.type as "ROOM" | "VEHICLE") || defaultType
  );
  const [code, setCode] = useState(resource?.code || "");
  const [nameTh, setNameTh] = useState(resource?.nameTh || "");
  const [nameEn, setNameEn] = useState(resource?.nameEn || "");
  const [capacity, setCapacity] = useState(resource?.capacity || 10);
  const [location, setLocation] = useState(resource?.location || "");
  const [facilitiesText, setFacilitiesText] = useState(
    resource?.facilities ? resource.facilities.join(", ") : ""
  );
  const [imageUrl, setImageUrl] = useState(resource?.imageUrl || "");
  const [color, setColor] = useState(resource?.color || (type === "ROOM" ? "#3b82f6" : "#f59e0b"));
  const [requiresApproval, setRequiresApproval] = useState(resource?.requiresApproval ?? true);
  const [displayOrder, setDisplayOrder] = useState(resource?.displayOrder || 0);
  const [isActive, setIsActive] = useState(resource?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameTh.trim()) {
      toast.error("กรุณากรอกรหัสและชื่อทรัพยากร");
      return;
    }

    const facilities = facilitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      if (isEditing && resource) {
        const res = await updateBookingResourceAction({
          id: resource.id,
          type,
          code: code.trim().toUpperCase(),
          nameTh: nameTh.trim(),
          nameEn: nameEn.trim() || nameTh.trim(),
          capacity: Number(capacity) || 1,
          location: location.trim() || null,
          facilities,
          imageUrl: imageUrl.trim() || null,
          color,
          requiresApproval,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        });

        if (res.ok) {
          toast.success(t("booking.resourceSaveSuccess"));
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createBookingResourceAction({
          type,
          code: code.trim().toUpperCase(),
          nameTh: nameTh.trim(),
          nameEn: nameEn.trim() || nameTh.trim(),
          capacity: Number(capacity) || 1,
          location: location.trim() || null,
          facilities,
          imageUrl: imageUrl.trim() || null,
          color,
          requiresApproval,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        });

        if (res.ok) {
          toast.success(t("booking.resourceSaveSuccess"));
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <form onSubmit={handleSubmit}>
        <LiyonDialogHeader
          title={
            isEditing
              ? t("booking.resource.edit")
              : type === "ROOM"
              ? t("booking.resource.createRoom")
              : t("booking.resource.createVehicle")
          }
          description="จัดการข้อมูลความจุ อุปกรณ์ประจำห้อง หรือยานพาหนะ"
        />

        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("booking.field.type")} *
              </label>
              <LiyonSelect
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as "ROOM" | "VEHICLE";
                  setType(newType);
                  if (!resource) {
                    setColor(newType === "ROOM" ? "#3b82f6" : "#f59e0b");
                  }
                }}
              >
                <option value="ROOM">{t("booking.field.type.ROOM")}</option>
                <option value="VEHICLE">{t("booking.field.type.VEHICLE")}</option>
              </LiyonSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                รหัสประจำทรัพยากร *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ROOM-401, VAN-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {type === "ROOM" ? "ความจุ (ที่นั่ง)" : "จำนวนผู้โดยสาร"} *
              </label>
              <input
                type="number"
                min={1}
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                ชื่อภาษาไทย *
              </label>
              <input
                type="text"
                required
                placeholder={type === "ROOM" ? "เช่น ห้องประชุมสภาคณะ" : "เช่น รถตู้ปรับอากาศ VIP"}
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                ชื่อภาษาอังกฤษ
              </label>
              <input
                type="text"
                placeholder={type === "ROOM" ? "e.g. Executive Boardroom" : "e.g. Passenger Van"}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Location / License Plate / Color / Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {type === "ROOM" ? "สถานที่ตั้ง (อาคาร/ชั้น)" : "ป้ายทะเบียนรถ / รุ่นรถ"}
              </label>
              <input
                type="text"
                placeholder={type === "ROOM" ? "อาคาร ICT ชั้น 4" : "ทะเบียน นข-4589 ขอนแก่น"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("booking.field.color")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-9 p-0.5 rounded border border-border cursor-pointer bg-background"
                />
                <span className="font-mono text-xs">{color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                ลำดับการแสดงผล
              </label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("booking.field.facilities")}
            </label>
            <input
              type="text"
              placeholder={
                type === "ROOM"
                  ? "โปรเจกเตอร์ 4K, Zoom Rooms, ไมโครโฟนไร้สาย"
                  : "พนักงานขับรถ, GPS, ประกันภัยชั้น 1"
              }
              value={facilitiesText}
              onChange={(e) => setFacilitiesText(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              รูปภาพทรัพยากร (URL)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg"
            />
          </div>

          {/* Settings */}
          <div className="pt-2 border-t border-border flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{t("booking.field.requiresApproval")}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>เปิดใช้งานทรัพยากรนี้</span>
            </label>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "บันทึกทรัพยากร"}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
