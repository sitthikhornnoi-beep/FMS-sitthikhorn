"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentWithProgramsDto, DepartmentType } from "@/features/curriculum";
import {
  createCurriculumDepartmentAction,
  updateCurriculumDepartmentAction,
} from "@/features/curriculum/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentWithProgramsDto | null;
  onSaved: (dept: DepartmentWithProgramsDto) => void;
}

export function DeptFormModal({ open, onOpenChange, department, onSaved }: Props) {
  if (!open) return null;
  return (
    <DeptFormModalInner
      key={department?.id ?? "new-dept"}
      open={open}
      onOpenChange={onOpenChange}
      department={department}
      onSaved={onSaved}
    />
  );
}

function DeptFormModalInner({ open, onOpenChange, department, onSaved }: Props) {
  const t = useT();
  const isEditing = !!department;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: department?.code || "",
    nameTh: department?.nameTh || "",
    nameEn: department?.nameEn || "",
    type: (department?.type || "ACADEMIC") as DepartmentType,
    descriptionTh: department?.descriptionTh || "",
    descriptionEn: department?.descriptionEn || "",
    displayOrder: department?.displayOrder || 0,
    isActive: department?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.nameTh.trim() || !formData.nameEn.trim()) {
      toast.error("กรุณากรอกรหัสภาควิชา และชื่อทั้งภาษาไทยและอังกฤษให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const res = await updateCurriculumDepartmentAction({
          id: department.id,
          code: formData.code.trim().toUpperCase(),
          nameTh: formData.nameTh.trim(),
          nameEn: formData.nameEn.trim(),
          type: formData.type,
          descriptionTh: formData.descriptionTh.trim() || null,
          descriptionEn: formData.descriptionEn.trim() || null,
          displayOrder: Number(formData.displayOrder),
          isActive: formData.isActive,
        });

        if (res.ok) {
          toast.success("บันทึกการแก้ไขภาควิชาสำเร็จ");
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createCurriculumDepartmentAction({
          code: formData.code.trim().toUpperCase(),
          nameTh: formData.nameTh.trim(),
          nameEn: formData.nameEn.trim(),
          type: formData.type,
          descriptionTh: formData.descriptionTh.trim() || null,
          descriptionEn: formData.descriptionEn.trim() || null,
          displayOrder: Number(formData.displayOrder),
          isActive: formData.isActive,
        });

        if (res.ok) {
          toast.success("สร้างภาควิชา/ส่วนงานใหม่สำเร็จ");
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <LiyonDialogHeader
          title={isEditing ? t("curriculum.dept.edit") : t("curriculum.dept.create")}
          description={t("curriculum.dept.desc")}
        />

        <LiyonDialogBody className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {/* Code & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.code")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น D-PA, D-BA, D-AC"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full text-sm uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.type")} *
              </label>
              <LiyonSelect
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as DepartmentType }))}
                className="text-sm"
              >
                <option value="ACADEMIC">{t("curriculum.dept.type.academic")}</option>
                <option value="SUPPORT">{t("curriculum.dept.type.support")}</option>
                <option value="EXECUTIVE">{t("curriculum.dept.type.executive")}</option>
              </LiyonSelect>
            </div>
          </div>

          {/* Names */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.nameTh")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ภาควิชารัฐประศาสนศาสตร์"
                value={formData.nameTh}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameTh: e.target.value }))}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.nameEn")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Department of Public Administration"
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                className="w-full text-sm"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.descriptionTh")}
              </label>
              <textarea
                rows={2}
                placeholder="คำอธิบาย หรือวิสัยทัศน์ของภาควิชา (ภาษาไทย)"
                value={formData.descriptionTh}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptionTh: e.target.value }))}
                className="w-full text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.descriptionEn")}
              </label>
              <textarea
                rows={2}
                placeholder="Department description or vision in English"
                value={formData.descriptionEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                className="w-full text-sm resize-none"
              />
            </div>
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.dept.displayOrder")}
              </label>
              <input
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                className="w-full text-sm"
              />
            </div>

            <div className="pt-4">
              <LiyonSwitchRow
                id="dept-active"
                label={t("curriculum.dept.status")}
                description={formData.isActive ? "เปิดใช้งาน" : "ปิดการใช้งานชั่วคราว"}
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading} className="inline-flex items-center gap-1.5">
            <Save className="w-4 h-4" />
            <span>{loading ? t("common.saving") : t("common.save")}</span>
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
