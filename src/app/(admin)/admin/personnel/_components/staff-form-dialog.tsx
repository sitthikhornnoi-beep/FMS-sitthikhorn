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
import type { StaffProfileDto, DepartmentDto } from "@/features/personnel";
import { createStaffProfileAction, updateStaffProfileAction } from "@/features/personnel/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffProfileDto | null;
  departments: DepartmentDto[];
  onSaved: (staff: StaffProfileDto) => void;
}

export function StaffFormDialog({ open, onOpenChange, staff, departments, onSaved }: Props) {
  if (!open) return null;
  return (
    <StaffFormDialogInner
      key={staff?.id ?? "create"}
      open={open}
      onOpenChange={onOpenChange}
      staff={staff}
      departments={departments}
      onSaved={onSaved}
    />
  );
}

function StaffFormDialogInner({ open, onOpenChange, staff, departments, onSaved }: Props) {
  const t = useT();
  const isEditing = !!staff;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: staff?.departmentId || "",
    academicTitleTh: staff?.academicTitleTh || "",
    academicTitleEn: staff?.academicTitleEn || "",
    firstNameTh: staff?.firstNameTh || "",
    lastNameTh: staff?.lastNameTh || "",
    firstNameEn: staff?.firstNameEn || "",
    lastNameEn: staff?.lastNameEn || "",
    positionTh: staff?.positionTh || "",
    positionEn: staff?.positionEn || "",
    staffType: staff?.staffType || "ACADEMIC",
    email: staff?.email || "",
    phone: staff?.phone || "",
    roomNumber: staff?.roomNumber || "",
    avatarUrl: staff?.avatarUrl || "",
    educationText: staff?.education ? staff.education.join("\n") : "",
    researchText: staff?.researchInterests ? staff.researchInterests.join(", ") : "",
    scopusUrl: staff?.scopusUrl || "",
    scholarUrl: staff?.scholarUrl || "",
    websiteUrl: staff?.websiteUrl || "",
    isExecutive: staff?.isExecutive ?? false,
    displayOrder: staff?.displayOrder ?? 0,
    isActive: staff?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstNameTh.trim() || !formData.lastNameTh.trim()) {
      toast.error("กรุณากรอกชื่อและนามสกุลภาษาไทย");
      return;
    }

    const education = formData.educationText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const researchInterests = formData.researchText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      if (isEditing && staff) {
        const res = await updateStaffProfileAction({
          id: staff.id,
          departmentId: formData.departmentId || null,
          academicTitleTh: formData.academicTitleTh || null,
          academicTitleEn: formData.academicTitleEn || null,
          firstNameTh: formData.firstNameTh,
          lastNameTh: formData.lastNameTh,
          firstNameEn: formData.firstNameEn || null,
          lastNameEn: formData.lastNameEn || null,
          positionTh: formData.positionTh || null,
          positionEn: formData.positionEn || null,
          staffType: formData.staffType as "ACADEMIC" | "SUPPORT" | "EXECUTIVE",
          email: formData.email || null,
          phone: formData.phone || null,
          roomNumber: formData.roomNumber || null,
          avatarUrl: formData.avatarUrl || null,
          education,
          researchInterests,
          scopusUrl: formData.scopusUrl || null,
          scholarUrl: formData.scholarUrl || null,
          websiteUrl: formData.websiteUrl || null,
          isExecutive: formData.isExecutive,
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.ok) {
          toast.success(t("personnel.saveSuccess"));
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createStaffProfileAction({
          departmentId: formData.departmentId || null,
          academicTitleTh: formData.academicTitleTh || null,
          academicTitleEn: formData.academicTitleEn || null,
          firstNameTh: formData.firstNameTh,
          lastNameTh: formData.lastNameTh,
          firstNameEn: formData.firstNameEn || null,
          lastNameEn: formData.lastNameEn || null,
          positionTh: formData.positionTh || null,
          positionEn: formData.positionEn || null,
          staffType: formData.staffType as "ACADEMIC" | "SUPPORT" | "EXECUTIVE",
          email: formData.email || null,
          phone: formData.phone || null,
          roomNumber: formData.roomNumber || null,
          avatarUrl: formData.avatarUrl || null,
          education,
          researchInterests,
          scopusUrl: formData.scopusUrl || null,
          scholarUrl: formData.scholarUrl || null,
          websiteUrl: formData.websiteUrl || null,
          isExecutive: formData.isExecutive,
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.ok) {
          toast.success(t("personnel.saveSuccess"));
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
          title={isEditing ? t("personnel.edit") : t("personnel.create")}
          description={isEditing ? "แก้ไขข้อมูลและประวัติการทำงานของบุคลากร" : "เพิ่มบุคลากรใหม่เข้าสู่ระบบ"}
        />

        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Staff Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.staffType")} *
              </label>
              <LiyonSelect
                value={formData.staffType}
                onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}
              >
                <option value="ACADEMIC">{t("personnel.field.staffType.ACADEMIC")}</option>
                <option value="SUPPORT">{t("personnel.field.staffType.SUPPORT")}</option>
              </LiyonSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.department")}
              </label>
              <LiyonSelect
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">{t("personnel.field.departmentSelect")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameTh} ({d.code})
                  </option>
                ))}
              </LiyonSelect>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={formData.isExecutive}
                  onChange={(e) => setFormData({ ...formData, isExecutive: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>{t("personnel.field.isExecutive")}</span>
              </label>
            </div>
          </div>

          {/* Thai Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.academicTitleTh")}
              </label>
              <input
                type="text"
                placeholder="เช่น ศ.ดร., ผศ., อ."
                value={formData.academicTitleTh}
                onChange={(e) => setFormData({ ...formData, academicTitleTh: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.firstNameTh")} *
              </label>
              <input
                type="text"
                required
                value={formData.firstNameTh}
                onChange={(e) => setFormData({ ...formData, firstNameTh: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.lastNameTh")} *
              </label>
              <input
                type="text"
                required
                value={formData.lastNameTh}
                onChange={(e) => setFormData({ ...formData, lastNameTh: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* English Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.academicTitleEn")}
              </label>
              <input
                type="text"
                placeholder="e.g. Prof. Dr., Asst. Prof."
                value={formData.academicTitleEn}
                onChange={(e) => setFormData({ ...formData, academicTitleEn: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.firstNameEn")}
              </label>
              <input
                type="text"
                value={formData.firstNameEn}
                onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.lastNameEn")}
              </label>
              <input
                type="text"
                value={formData.lastNameEn}
                onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Positions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.positionTh")}
              </label>
              <input
                type="text"
                placeholder="เช่น คณบดี, อาจารย์ประจำภาควิชา"
                value={formData.positionTh}
                onChange={(e) => setFormData({ ...formData, positionTh: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.positionEn")}
              </label>
              <input
                type="text"
                placeholder="e.g. Dean, Lecturer"
                value={formData.positionEn}
                onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.email")}
              </label>
              <input
                type="email"
                placeholder="staff@fms.ac.th"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.phone")}
              </label>
              <input
                type="text"
                placeholder="02-xxx-xxxx ต่อ 123"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.roomNumber")}
              </label>
              <input
                type="text"
                placeholder="ICT-401"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("personnel.field.avatarUrl")}
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("personnel.field.education")}
            </label>
            <textarea
              rows={3}
              placeholder="Ph.D. in Computer Science, Stanford University&#10;วศ.ม. จุฬาลงกรณ์มหาวิทยาลัย&#10;วศ.บ. เกษตรศาสตร์"
              value={formData.educationText}
              onChange={(e) => setFormData({ ...formData, educationText: e.target.value })}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 font-mono text-xs"
            />
          </div>

          {/* Research Interests */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("personnel.field.researchInterests")}
            </label>
            <input
              type="text"
              placeholder="Artificial Intelligence, Distributed Systems, Software Testing"
              value={formData.researchText}
              onChange={(e) => setFormData({ ...formData, researchText: e.target.value })}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Academic Profile Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.scopusUrl")}
              </label>
              <input
                type="url"
                placeholder="https://www.scopus.com/authid/..."
                value={formData.scopusUrl}
                onChange={(e) => setFormData({ ...formData, scopusUrl: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.scholarUrl")}
              </label>
              <input
                type="url"
                placeholder="https://scholar.google.com/citations?..."
                value={formData.scholarUrl}
                onChange={(e) => setFormData({ ...formData, scholarUrl: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("personnel.field.displayOrder")}
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>{t("personnel.field.isActive")}</span>
              </label>
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
