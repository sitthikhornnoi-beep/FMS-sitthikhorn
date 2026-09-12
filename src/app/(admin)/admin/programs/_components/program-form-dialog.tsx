"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Download, Upload, FileCode2, CheckCircle2, X } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import {
  exportProgramToJson,
  parseProgramJson,
  type ProgramDto,
  type DegreeLevelType,
  type DepartmentWithProgramsDto,
  type PloInput,
  type CourseGroupInput,
  type SemesterPlanInput,
} from "@/features/curriculum";
import { createProgramAction, updateProgramAction } from "@/features/curriculum/actions";
import { DeptFormModal } from "./dept-form-modal";

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
  onDepartmentCreated?: (dept: DepartmentWithProgramsDto) => void;
}

export function ProgramFormDialog({ open, onOpenChange, program, departments, onSaved, onDepartmentCreated }: Props) {
  if (!open) return null;
  return (
    <ProgramFormDialogInner
      key={program?.id ?? "create"}
      open={open}
      onOpenChange={onOpenChange}
      program={program}
      departments={departments}
      onSaved={onSaved}
      onDepartmentCreated={onDepartmentCreated}
    />
  );
}


function ProgramFormDialogInner({ open, onOpenChange, program, departments, onSaved, onDepartmentCreated }: Props) {
  const t = useT();
  const isEditing = !!program;

  const [loading, setLoading] = useState(false);
  const [deptList, setDeptList] = useState<DepartmentOption[]>(departments);
  const [quickDeptOpen, setQuickDeptOpen] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const [extraStructure, setExtraStructure] = useState<{
    careerPaths?: string[];
    plos?: PloInput[];
    studyPlan?: SemesterPlanInput[];
    courseStructure?: CourseGroupInput[];
  }>({});
  const [importedNotice, setImportedNotice] = useState<{ fileName: string; detail: string } | null>(null);

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

  const handleExportJson = () => {
    try {
      const selectedDept = deptList.find((d) => d.id === formData.departmentId);
      const jsonString = exportProgramToJson({
        code: formData.code,
        nameTh: formData.nameTh,
        nameEn: formData.nameEn,
        degreeTh: formData.degreeTh,
        degreeEn: formData.degreeEn,
        degreeShortTh: formData.degreeShortTh,
        degreeShortEn: formData.degreeShortEn,
        degreeLevel: formData.degreeLevel,
        departmentCode: selectedDept?.code ?? null,
        departmentNameTh: selectedDept?.nameTh ?? null,
        slug: formData.slug,
        curriculumYear: Number(formData.curriculumYear) || new Date().getFullYear() + 543,
        totalCredits: Number(formData.totalCredits) || 120,
        studyDuration: formData.studyDuration,
        tuitionFee: formData.tuitionFee || null,
        descriptionTh: formData.descriptionTh || null,
        descriptionEn: formData.descriptionEn || null,
        philosophyTh: formData.philosophyTh || null,
        philosophyEn: formData.philosophyEn || null,
        pdfUrl: formData.pdfUrl || null,
        imageUrl: formData.imageUrl || null,
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
        careerPaths: extraStructure.careerPaths ?? program?.careerPaths ?? [],
        plos: extraStructure.plos ?? program?.plos ?? [],
        studyPlan: extraStructure.studyPlan ?? program?.studyPlan ?? [],
        courseStructure: extraStructure.courseStructure ?? program?.courseStructure ?? [],
      });

      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeCode = (formData.code || formData.slug || "program").replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, "_");
      a.href = url;
      a.download = `program-${safeCode}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("curriculum.json.exportSuccess"));
    } catch {
      toast.error("ไม่สามารถส่งออกข้อมูล JSON ได้");
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseProgramJson(text);
        if (!result.success || !result.data) {
          toast.error(result.error || t("curriculum.json.importError"));
          return;
        }

        const data = result.data;
        let matchedDeptId = formData.departmentId;
        if (data.departmentCode) {
          const found = deptList.find((d) => d.code === data.departmentCode);
          if (found) matchedDeptId = found.id;
        }

        setFormData((prev) => ({
          code: data.code || prev.code,
          departmentId: matchedDeptId,
          degreeLevel: (data.degreeLevel as DegreeLevelType) || prev.degreeLevel,
          nameTh: data.nameTh || prev.nameTh,
          nameEn: data.nameEn !== undefined ? data.nameEn : prev.nameEn,
          degreeTh: data.degreeTh !== undefined ? data.degreeTh : prev.degreeTh,
          degreeEn: data.degreeEn !== undefined ? data.degreeEn : prev.degreeEn,
          degreeShortTh: data.degreeShortTh !== undefined ? data.degreeShortTh : prev.degreeShortTh,
          degreeShortEn: data.degreeShortEn !== undefined ? data.degreeShortEn : prev.degreeShortEn,
          slug: data.slug || prev.slug,
          curriculumYear: data.curriculumYear ?? prev.curriculumYear,
          totalCredits: data.totalCredits ?? prev.totalCredits,
          studyDuration: data.studyDuration || prev.studyDuration,
          tuitionFee: data.tuitionFee !== undefined && data.tuitionFee !== null ? data.tuitionFee : prev.tuitionFee,
          descriptionTh: data.descriptionTh !== undefined && data.descriptionTh !== null ? data.descriptionTh : prev.descriptionTh,
          descriptionEn: data.descriptionEn !== undefined && data.descriptionEn !== null ? data.descriptionEn : prev.descriptionEn,
          philosophyTh: data.philosophyTh !== undefined && data.philosophyTh !== null ? data.philosophyTh : prev.philosophyTh,
          philosophyEn: data.philosophyEn !== undefined && data.philosophyEn !== null ? data.philosophyEn : prev.philosophyEn,
          pdfUrl: data.pdfUrl !== undefined && data.pdfUrl !== null ? data.pdfUrl : prev.pdfUrl,
          imageUrl: data.imageUrl !== undefined && data.imageUrl !== null ? data.imageUrl : prev.imageUrl,
          displayOrder: data.displayOrder ?? prev.displayOrder,
          isActive: data.isActive ?? prev.isActive,
        }));

        const hasExtras =
          (data.careerPaths && data.careerPaths.length > 0) ||
          (data.plos && data.plos.length > 0) ||
          (data.studyPlan && data.studyPlan.length > 0) ||
          (data.courseStructure && data.courseStructure.length > 0);

        if (hasExtras) {
          setExtraStructure({
            careerPaths: data.careerPaths,
            plos: data.plos,
            studyPlan: data.studyPlan,
            courseStructure: data.courseStructure,
          });
        }

        const summaryParts: string[] = [];
        if (result.summary?.hasCourseStructure) summaryParts.push(`โครงสร้างวิชา ${result.summary.hasCourseStructure} กลุ่ม`);
        if (result.summary?.hasPlos) summaryParts.push(`PLO ${result.summary.hasPlos} ข้อ`);
        if (result.summary?.hasStudyPlan) summaryParts.push(`แผนการเรียน ${result.summary.hasStudyPlan} ภาค`);
        if (result.summary?.hasCareerPaths) summaryParts.push(`อาชีพ ${result.summary.hasCareerPaths} รายการ`);

        setImportedNotice({
          fileName: file.name,
          detail: summaryParts.length > 0 ? `พบข้อมูลเพิ่มเติม: ${summaryParts.join(", ")}` : "นำเข้าข้อมูลหลักสูตรเรียบร้อย",
        });

        toast.success(t("curriculum.json.importSuccess"));
      } catch {
        toast.error(t("curriculum.json.importError"));
      } finally {
        if (jsonFileInputRef.current) jsonFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
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
          careerPaths: extraStructure.careerPaths ?? program.careerPaths,
          plos: extraStructure.plos ?? program.plos,
          studyPlan: extraStructure.studyPlan ?? program.studyPlan,
          courseStructure: extraStructure.courseStructure ?? program.courseStructure,
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
          careerPaths: extraStructure.careerPaths ?? [],
          plos: extraStructure.plos ?? [],
          studyPlan: extraStructure.studyPlan ?? [],
          courseStructure: extraStructure.courseStructure ?? [],
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
    <>
      <LiyonDialog open={open} onOpenChange={onOpenChange}>
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
        <LiyonDialogHeader
          title={isEditing ? t("curriculum.btn.edit") : t("curriculum.btn.create")}
          description="กำหนดรายละเอียดหลักสูตร ชื่อปริญญา ปีหลักสูตร และข้อกำหนดทางการศึกษา"
        />

        <LiyonDialogBody className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {/* JSON Import / Export Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <FileCode2 className="h-4 w-4 text-primary shrink-0" />
              <span>จัดการข้อมูลหลักสูตรด้วย JSON</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={jsonFileInputRef}
                accept=".json,application/json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => jsonFileInputRef.current?.click()}
                className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer hover:bg-background"
              >
                <Upload className="h-3.5 w-3.5 text-primary" />
                {t("curriculum.btn.importJson")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer hover:bg-background"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                {t("curriculum.btn.exportJson")}
              </Button>
            </div>
          </div>

          {/* Imported JSON Notification Banner */}
          {importedNotice && (
            <div className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold">นำเข้าข้อมูลจากไฟล์: {importedNotice.fileName}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{importedNotice.detail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportedNotice(null)}
                className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-100 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-foreground">
                  {t("curriculum.field.department")}
                </label>
                <button
                  type="button"
                  onClick={() => setQuickDeptOpen(true)}
                  className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                >
                  {t("curriculum.dept.quickAdd")}
                </button>
              </div>
              <LiyonSelect
                value={formData.departmentId}
                onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                className="text-sm"
              >
                <option value="">ไม่มี / หลักสูตรกลางคณะ</option>
                {deptList.map((d) => (
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

        <LiyonDialogFooter className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => jsonFileInputRef.current?.click()}
              className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              {t("curriculum.btn.importJson")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleExportJson}
              className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              {t("curriculum.btn.exportJson")}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "บันทึกหลักสูตร"}
            </Button>
          </div>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>

    <DeptFormModal
      open={quickDeptOpen}
      onOpenChange={setQuickDeptOpen}
      department={null}
      onSaved={(newDept) => {
        setDeptList((prev) => [
          ...prev,
          { id: newDept.id, code: newDept.code, nameTh: newDept.nameTh, nameEn: newDept.nameEn },
        ]);
        setFormData((prev) => ({ ...prev, departmentId: newDept.id }));
        onDepartmentCreated?.(newDept);
      }}
    />
  </>
  );
}

