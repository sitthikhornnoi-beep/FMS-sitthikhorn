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
import type { ProgramDto, DegreeLevelType } from "@/features/curriculum";
import { createProgramAction, updateProgramAction } from "@/features/curriculum/actions";

interface DepartmentOption {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramDto | null;
  departments: DepartmentOption[];
  onSaved: (program: ProgramDto) => void;
}

export function ProgramFormDialog({ open, onOpenChange, program, departments, onSaved }: Props) {
  if (!open) return null;
  return (
    <ProgramFormDialogInner
      key={program?.id ?? "create"}
      open={open}
      onOpenChange={onOpenChange}
      program={program}
      departments={departments}
      onSaved={onSaved}
    />
  );
}

function ProgramFormDialogInner({ open, onOpenChange, program, departments, onSaved }: Props) {
  const t = useT();
  const isEditing = !!program;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: program?.code || "",
    departmentId: program?.departmentId || "",
    degreeLevel: (program?.degreeLevel || "BACHELOR") as DegreeLevelType,
    nameTh: program?.nameTh || "",
    nameEn: program?.nameEn || "",
    degreeTh: program?.degreeTh || "",
    degreeEn: program?.degreeEn || "",
    degreeShortTh: program?.degreeShortTh || "",
    degreeShortEn: program?.degreeShortEn || "",
    slug: program?.slug || "",
    curriculumYear: program?.curriculumYear || new Date().getFullYear() + 543,
    totalCredits: program?.totalCredits || 120,
    studyDuration: program?.studyDuration || "4 ปี",
    tuitionFee: program?.tuitionFee || "",
    descriptionTh: program?.descriptionTh || "",
    descriptionEn: program?.descriptionEn || "",
    philosophyTh: program?.philosophyTh || "",
    philosophyEn: program?.philosophyEn || "",
    pdfUrl: program?.pdfUrl || "",
    imageUrl: program?.imageUrl || "",
    displayOrder: program?.displayOrder || 0,
    isActive: program?.isActive ?? true,
  });

  const generateSlugFromName = (enName: string) => {
    return enName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameEnBlur = () => {
    if (!isEditing && !formData.slug && formData.nameEn) {
      setFormData((prev) => ({ ...prev, slug: generateSlugFromName(prev.nameEn) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.nameTh.trim() || !formData.slug.trim()) {
      toast.error("กรุณากรอกรหัสหลักสูตร, ชื่อหลักสูตร และ Slug ให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        departmentId: formData.departmentId || null,
        degreeLevel: formData.degreeLevel,
        code: formData.code.trim(),
        nameTh: formData.nameTh.trim(),
        nameEn: formData.nameEn.trim() || formData.nameTh.trim(),
        degreeTh: formData.degreeTh.trim() || formData.nameTh.trim(),
        degreeEn: formData.degreeEn.trim() || formData.nameEn.trim(),
        degreeShortTh: formData.degreeShortTh.trim() || formData.code.trim(),
        degreeShortEn: formData.degreeShortEn.trim() || formData.code.trim(),
        slug: formData.slug.trim(),
        curriculumYear: Number(formData.curriculumYear),
        totalCredits: Number(formData.totalCredits),
        studyDuration: formData.studyDuration.trim() || "4 ปี",
        tuitionFee: formData.tuitionFee.trim() || null,
        descriptionTh: formData.descriptionTh.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        philosophyTh: formData.philosophyTh.trim() || null,
        philosophyEn: formData.philosophyEn.trim() || null,
        pdfUrl: formData.pdfUrl.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive,
      };

      if (isEditing) {
        const res = await updateProgramAction({
          ...payload,
          id: program.id,
          careerPaths: program.careerPaths,
          plos: program.plos,
          studyPlan: program.studyPlan,
          courseStructure: program.courseStructure,
        });
        if (res.ok) {
          toast.success("บันทึกการแก้ไขหลักสูตรสำเร็จ");
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createProgramAction({
          ...payload,
          careerPaths: [],
          plos: [],
          studyPlan: [],
          courseStructure: [],
        });
        if (res.ok) {
          toast.success("สร้างหลักสูตรใหม่สำเร็จ");
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <LiyonDialogHeader
          title={isEditing ? t("curriculum.btn.edit") : t("curriculum.btn.create")}
          description="กำหนดรายละเอียดหลักสูตร ชื่อปริญญา ปีหลักสูตร และข้อกำหนดทางการศึกษา"
        />

        <LiyonDialogBody className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {/* Degree Level & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                ระดับการศึกษา *
              </label>
              <LiyonSelect
                value={formData.degreeLevel}
                onChange={(e) => setFormData((prev) => ({ ...prev, degreeLevel: e.target.value as DegreeLevelType }))}
                className="text-sm"
              >
                <option value="BACHELOR">ปริญญาตรี (Bachelor&apos;s Degree)</option>
                <option value="MASTER">ปริญญาโท (Master&apos;s Degree)</option>
                <option value="DOCTORATE">ปริญญาเอก (Doctorate Degree)</option>
              </LiyonSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.department")}
              </label>
              <LiyonSelect
                value={formData.departmentId}
                onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                className="text-sm"
              >
                <option value="">ไม่มี / หลักสูตรกลางคณะ</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </div>
          </div>

          {/* Program Code & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.code")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น CS-2567, IT-2565"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.slug")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น computer-science"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
              />
            </div>
          </div>

          {/* Program Name TH & EN */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.nameTh")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์"
                value={formData.nameTh}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameTh: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.nameEn")}
              </label>
              <input
                type="text"
                placeholder="เช่น Bachelor of Science Program in Computer Science"
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                onBlur={handleNameEnBlur}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Full Degree Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.degreeTh")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)"
                value={formData.degreeTh}
                onChange={(e) => setFormData((prev) => ({ ...prev, degreeTh: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.degreeEn")}
              </label>
              <input
                type="text"
                placeholder="เช่น Bachelor of Science (Computer Science)"
                value={formData.degreeEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, degreeEn: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Short Degree Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.degreeShortTh")} *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น วท.บ. (วิทยาการคอมพิวเตอร์)"
                value={formData.degreeShortTh}
                onChange={(e) => setFormData((prev) => ({ ...prev, degreeShortTh: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.degreeShortEn")}
              </label>
              <input
                type="text"
                placeholder="เช่น B.Sc. (Computer Science)"
                value={formData.degreeShortEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, degreeShortEn: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Year, Credits, Duration, Tuition */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.curriculumYear")}
              </label>
              <input
                type="number"
                min={2500}
                max={2600}
                value={formData.curriculumYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, curriculumYear: parseInt(e.target.value, 10) || 2567 }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.totalCredits")}
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={formData.totalCredits}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalCredits: parseInt(e.target.value, 10) || 120 }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.studyDuration")}
              </label>
              <input
                type="text"
                placeholder="4 ปี"
                value={formData.studyDuration}
                onChange={(e) => setFormData((prev) => ({ ...prev, studyDuration: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                ลำดับแสดงผล
              </label>
              <input
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tuition Fee */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("curriculum.field.tuitionFee")}
            </label>
            <input
              type="text"
              placeholder="เช่น 22,000 บาท / ภาคการศึกษา"
              value={formData.tuitionFee}
              onChange={(e) => setFormData((prev) => ({ ...prev, tuitionFee: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description TH & EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.descriptionTh")}
              </label>
              <textarea
                rows={3}
                placeholder="คำอธิบายจุดเด่นหลักสูตร..."
                value={formData.descriptionTh}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptionTh: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.descriptionEn")}
              </label>
              <textarea
                rows={3}
                placeholder="Program description..."
                value={formData.descriptionEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Philosophy TH */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              {t("curriculum.field.philosophyTh")}
            </label>
            <textarea
              rows={2}
              placeholder="ปรัชญาและความสำคัญของหลักสูตร..."
              value={formData.philosophyTh}
              onChange={(e) => setFormData((prev) => ({ ...prev, philosophyTh: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* PDF URL & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.pdfUrl")}
              </label>
              <input
                type="url"
                placeholder="https://example.com/tqf2.pdf"
                value={formData.pdfUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, pdfUrl: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">
                {t("curriculum.field.imageUrl")}
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status Switch */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>เปิดรับสมัคร / แสดงบนเว็บไซต์สาธารณะ</span>
            </label>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "บันทึกหลักสูตร"}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
