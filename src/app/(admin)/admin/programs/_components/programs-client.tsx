"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  Search,
  ExternalLink,
  Layers,
  Award,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { ProgramDto, DegreeLevelType } from "@/features/curriculum";
import { deleteProgramAction } from "@/features/curriculum/actions";
import { ProgramFormDialog } from "./program-form-dialog";
import { ProgramStructureDialog } from "./program-structure-dialog";

interface DepartmentOption {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface Props {
  initialPrograms: ProgramDto[];
  departments: DepartmentOption[];
  canManage: boolean;
  canCreate: boolean;
}

export function ProgramsAdminClient({
  initialPrograms,
  departments,
  canManage,
  canCreate,
}: Props) {
  const t = useT();
  const locale = useLocale();

  const [programs, setPrograms] = useState<ProgramDto[]>(initialPrograms);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [filterDept, setFilterDept] = useState<string>("");

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramDto | null>(null);
  const [structureOpen, setStructureOpen] = useState(false);
  const [selectedProgramForStructure, setSelectedProgramForStructure] = useState<ProgramDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProgramDto | null>(null);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (filterLevel !== "ALL" && p.degreeLevel !== filterLevel) return false;
      if (filterDept && p.departmentId !== filterDept) return false;
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchCode = p.code.toLowerCase().includes(term);
        const matchNameTh = p.nameTh.toLowerCase().includes(term);
        const matchNameEn = p.nameEn.toLowerCase().includes(term);
        const matchDegree = p.degreeTh.toLowerCase().includes(term);
        if (!matchCode && !matchNameTh && !matchNameEn && !matchDegree) return false;
      }
      return true;
    });
  }, [programs, filterLevel, filterDept, search]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: programs.length,
      bachelor: programs.filter((p) => p.degreeLevel === "BACHELOR").length,
      master: programs.filter((p) => p.degreeLevel === "MASTER").length,
      doctorate: programs.filter((p) => p.degreeLevel === "DOCTORATE").length,
      active: programs.filter((p) => p.isActive).length,
    };
  }, [programs]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (p: ProgramDto) => {
    setEditingProgram(p);
    setFormOpen(true);
  };

  const handleOpenStructure = (p: ProgramDto) => {
    setSelectedProgramForStructure(p);
    setStructureOpen(true);
  };

  const handleSaved = (saved: ProgramDto) => {
    setPrograms((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    startTransition(async () => {
      const res = await deleteProgramAction(deleteConfirm.id);
      if (res.ok) {
        toast.success("ลบหลักสูตรเรียบร้อยแล้ว");
        setPrograms((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getDegreeLevelBadge = (level: DegreeLevelType) => {
    switch (level) {
      case "BACHELOR":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">ปริญญาตรี</span>;
      case "MASTER":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">ปริญญาโท</span>;
      case "DOCTORATE":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">ปริญญาเอก</span>;
    }
  };

  // DataTable columns
  const columns: DataTableColumn<ProgramDto>[] = [
    {
      key: "code",
      header: "รหัส / ปี",
      render: (p) => (
        <div>
          <span className="font-mono text-xs font-bold text-foreground">{p.code}</span>
          <div className="text-[11px] text-muted-foreground">ปี {p.curriculumYear}</div>
        </div>
      ),
    },
    {
      key: "name",
      header: "ชื่อหลักสูตร / ปริญญา",
      render: (p) => (
        <div className="max-w-md py-1">
          <div className="font-semibold text-xs text-foreground leading-snug">
            {locale === "th" ? p.nameTh : p.nameEn}
          </div>
          <div className="text-[11px] text-primary font-medium mt-0.5">
            {p.degreeShortTh} • {p.degreeShortEn}
          </div>
          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
            {p.degreeTh}
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "ระดับ",
      render: (p) => getDegreeLevelBadge(p.degreeLevel),
    },
    {
      key: "department",
      header: "ภาควิชา",
      render: (p) => (
        <span className="text-xs text-foreground">
          {p.departmentCode ? `${p.departmentCode} - ${p.departmentNameTh}` : "กลางคณะ"}
        </span>
      ),
    },
    {
      key: "credits",
      header: "หน่วยกิต / ระยะเวลา",
      render: (p) => (
        <div className="text-xs">
          <span className="font-mono font-semibold text-foreground">{p.totalCredits}</span> นก.
          <div className="text-[11px] text-muted-foreground">{p.studyDuration}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      render: (p) => (
        <StatusPill tone={p.isActive ? "ok" : "off"}>
          {p.isActive ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("curriculum.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("curriculum.subtitle")}
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>{t("curriculum.btn.create")}</span>
          </Button>
        )}
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">หลักสูตรทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground">หลักสูตร</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">ระดับปริญญาตรี</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600">{stats.bachelor}</span>
            <span className="text-xs text-muted-foreground">หลักสูตร</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">ระดับบัณฑิตศึกษา (โท-เอก)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-600">{stats.master + stats.doctorate}</span>
            <span className="text-xs text-muted-foreground">หลักสูตร</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">เปิดรับสมัครอยู่</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{stats.active}</span>
            <span className="text-xs text-muted-foreground">เปิดรับสมัคร</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border">
        {/* Degree Level Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "ALL", label: t("curriculum.filter.allLevels") },
            { id: "BACHELOR", label: t("curriculum.level.bachelor") },
            { id: "MASTER", label: t("curriculum.level.master") },
            { id: "DOCTORATE", label: t("curriculum.level.doctorate") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterLevel(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterLevel === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Department Filter & Search */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-48">
            <LiyonSelect
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="text-xs"
            >
              <option value="">{t("curriculum.filter.allDepartments")}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </div>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาหลักสูตร, รหัส, ปริญญา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <DataTable
          state="data"
          headHeading="รายชื่อหลักสูตรทั้งหมด"
          headMeta={`(${filteredPrograms.length} หลักสูตร)`}
          rows={filteredPrograms}
          columns={columns}
          getRowId={(p) => p.id}
          empty={{
            icon: <BookOpen className="w-8 h-8 opacity-40" />,
            title: "ไม่พบข้อมูลหลักสูตรที่ตรงกับเงื่อนไขการค้นหา",
          }}
          error={{
            icon: <BookOpen className="w-8 h-8 opacity-40" />,
            title: "เกิดข้อผิดพลาดในการโหลดหลักสูตร",
          }}
          renderRowMenu={(p) => (
            <>
              <RowMenuItem onSelect={() => window.open(`/programs/${p.slug}`, "_blank")}>
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  ดูตัวอย่างหน้าเว็บจริง
                </span>
              </RowMenuItem>
              {canManage && (
                <>
                  <RowMenuItem onSelect={() => handleOpenStructure(p)}>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      จัดการโครงสร้าง & แผนการเรียน
                    </span>
                  </RowMenuItem>
                  <RowMenuItem onSelect={() => handleOpenEdit(p)}>
                    <span className="flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                      แก้ไขรายละเอียดหลักสูตร
                    </span>
                  </RowMenuItem>
                  <RowMenuItem danger onSelect={() => setDeleteConfirm(p)}>
                    <span className="flex items-center gap-1.5 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                      ลบหลักสูตร
                    </span>
                  </RowMenuItem>
                </>
              )}
            </>
          )}
        />
      </div>

      {/* Program Create / Edit Dialog */}
      <ProgramFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        program={editingProgram}
        departments={departments}
        onSaved={handleSaved}
      />

      {/* Program Structure & Plan Dialog */}
      <ProgramStructureDialog
        open={structureOpen}
        onOpenChange={setStructureOpen}
        program={selectedProgramForStructure}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <LiyonDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-md">
            <LiyonDialogHeader
              title="ยืนยันการลบหลักสูตร"
              description="การกระทำนี้ไม่สามารถเรียกคืนได้"
            />
            <LiyonDialogBody>
              <p className="text-xs text-foreground leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร{" "}
                <span className="font-bold text-foreground">
                  &quot;{deleteConfirm.code} - {deleteConfirm.nameTh}&quot;
                </span>{" "}
                ออกจากระบบ?
              </p>
            </LiyonDialogBody>
            <LiyonDialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "กำลังลบ..." : "ลบหลักสูตร"}
              </Button>
            </LiyonDialogFooter>
          </div>
        </LiyonDialog>
      )}
    </div>
  );
}
