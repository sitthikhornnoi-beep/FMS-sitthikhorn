"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentWithProgramsDto } from "@/features/curriculum";
import { deleteCurriculumDepartmentAction } from "@/features/curriculum/actions";
import { DeptFormModal } from "./dept-form-modal";

interface Props {
  departments: DepartmentWithProgramsDto[];
  canManage: boolean;
  onDepartmentSaved: (dept: DepartmentWithProgramsDto) => void;
  onDepartmentDeleted: (id: string) => void;
  onSelectDepartmentFilter?: (deptId: string) => void;
}

export function DepartmentsTab({
  departments,
  canManage,
  onDepartmentSaved,
  onDepartmentDeleted,
  onSelectDepartmentFilter,
}: Props) {
  const t = useT();
  const locale = useLocale();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentWithProgramsDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DepartmentWithProgramsDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setEditingDept(null);
    setFormOpen(true);
  };

  const handleEdit = (dept: DepartmentWithProgramsDto) => {
    setEditingDept(dept);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const res = await deleteCurriculumDepartmentAction(deleteConfirm.id);
      if (res.ok) {
        toast.success("ลบภาควิชา/ส่วนงานเรียบร้อยแล้ว");
        onDepartmentDeleted(deleteConfirm.id);
        setDeleteConfirm(null);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบภาควิชา");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ACADEMIC":
        return { label: t("curriculum.dept.type.academic"), color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" };
      case "SUPPORT":
        return { label: t("curriculum.dept.type.support"), color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" };
      case "EXECUTIVE":
        return { label: t("curriculum.dept.type.executive"), color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" };
      default:
        return { label: type, color: "bg-muted text-muted-foreground border-border" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground !mb-0">
              {t("curriculum.dept.title")}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
              {departments.length} ภาควิชา
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("curriculum.dept.desc")}
          </p>
        </div>

        {canManage && (
          <Button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t("curriculum.dept.create")}</span>
          </Button>
        )}
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-muted/10 space-y-3">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">ยังไม่มีข้อมูลภาควิชาหรือส่วนงาน</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            สร้างภาควิชาหรือสาขาวิชาเพื่อจัดกลุ่มและจัดเก็บหลักสูตรการศึกษาของคณะให้เป็นหมวดหมู่อย่างเป็นระบบ
          </p>
          {canManage && (
            <Button type="button" onClick={handleCreate} size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{t("curriculum.dept.create")}</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const typeInfo = getTypeLabel(dept.type);
            return (
              <div
                key={dept.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-border/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code, Type Badge, Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
                        {dept.code}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <StatusPill tone={dept.isActive ? "ok" : "off"}>
                      {dept.isActive ? "เปิดใช้งาน" : "ปิดชั่วคราว"}
                    </StatusPill>
                  </div>

                  {/* Department Names */}
                  <h4 className="font-bold text-foreground text-base leading-snug">
                    {dept.nameTh}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3 font-medium">
                    {dept.nameEn}
                  </p>

                  {/* Description if present */}
                  {(dept.descriptionTh || dept.descriptionEn) && (
                    <p className="text-xs text-muted-foreground/90 line-clamp-2 mb-4 bg-muted/20 p-2.5 rounded-lg border border-border/50">
                      {dept.descriptionTh || dept.descriptionEn}
                    </p>
                  )}

                  {/* Programs stored in this department */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        <span>{t("curriculum.dept.programCount")}</span>
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {dept.programCount} หลักสูตร
                      </span>
                    </div>

                    {dept.programs.length > 0 ? (
                      <div className="space-y-1.5 mt-2">
                        {dept.programs.map((prog) => (
                          <div
                            key={prog.id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-background border border-border shrink-0">
                                {prog.degreeShortTh || prog.code}
                              </span>
                              <span className="truncate text-foreground font-medium">
                                {locale === "en" ? prog.nameEn : prog.nameTh}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              พ.ศ. {prog.curriculumYear}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-1">
                        {t("curriculum.dept.noPrograms")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border gap-2">
                  {onSelectDepartmentFilter && dept.programCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => onSelectDepartmentFilter(dept.id)}
                      className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <span>ดูหลักสูตรในภาควิชานี้ ({dept.programCount})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div />
                  )}

                  {canManage && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(dept)}
                        className="h-8 text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t("common.edit")}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(dept)}
                        className="h-8 text-xs text-destructive hover:text-destructive cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t("common.delete")}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dept Form Modal */}
      <DeptFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editingDept}
        onSaved={onDepartmentSaved}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <LiyonDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <div className="w-full max-w-md">
            <LiyonDialogHeader
              title={t("curriculum.dept.deleteConfirmTitle")}
              description={t("curriculum.dept.deleteConfirmMsg")}
            />
            <LiyonDialogBody className="space-y-3">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                <p className="font-bold">
                  ภาควิชา: {deleteConfirm.code} - {deleteConfirm.nameTh}
                </p>
                {deleteConfirm.programCount > 0 && (
                  <p className="flex items-start gap-1.5 mt-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {t("curriculum.dept.deleteWarnPrograms")} ({deleteConfirm.programCount} หลักสูตร)
                    </span>
                  </p>
                )}
              </div>
            </LiyonDialogBody>
            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t("common.deleting") : t("common.confirm")}
              </Button>
            </LiyonDialogFooter>
          </div>
        </LiyonDialog>
      )}
    </div>
  );
}
