"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Building,
  User,
  AlertCircle,
  Award,
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
import type { StaffProfileDto, DepartmentDto, StaffPublicationDto } from "@/features/personnel";
import { deleteStaffProfileAction } from "@/features/personnel/actions";
import { StaffFormDialog } from "./staff-form-dialog";
import { DeptDialog } from "./dept-dialog";
import { PublicationDialog } from "./publication-dialog";

interface Props {
  initialStaff: StaffProfileDto[];
  initialDepartments: DepartmentDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function PersonnelAdminClient({
  initialStaff,
  initialDepartments,
  canManage,
  canCreate,
}: Props) {
  const t = useT();
  const locale = useLocale();

  const [staffList, setStaffList] = useState<StaffProfileDto[]>(initialStaff);
  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStaffType, setFilterStaffType] = useState("");

  // Dialogs
  const [staffFormOpen, setStaffFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfileDto | null>(null);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [pubDialogOpen, setPubDialogOpen] = useState(false);
  const [selectedStaffForPub, setSelectedStaffForPub] = useState<StaffProfileDto | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<StaffProfileDto | null>(null);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      if (filterDept && s.departmentId !== filterDept) return false;
      if (filterStaffType && s.staffType !== filterStaffType) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName =
          s.fullNameTh.toLowerCase().includes(q) ||
          s.fullNameEn.toLowerCase().includes(q);
        const matchPos =
          (s.positionTh && s.positionTh.toLowerCase().includes(q)) ||
          (s.positionEn && s.positionEn.toLowerCase().includes(q));
        const matchEmail = s.email && s.email.toLowerCase().includes(q);
        const matchRoom = s.roomNumber && s.roomNumber.toLowerCase().includes(q);
        if (!matchName && !matchPos && !matchEmail && !matchRoom) return false;
      }
      return true;
    });
  }, [staffList, filterDept, filterStaffType, search]);

  const handleStaffSaved = (saved: StaffProfileDto) => {
    setStaffList((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteStaff = (staff: StaffProfileDto) => {
    startTransition(async () => {
      const res = await deleteStaffProfileAction(staff.id);
      if (res.ok) {
        toast.success(t("personnel.deleteSuccess"));
        setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
        setDeleteConfirmStaff(null);
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handlePubAdded = (staffId: string, pub: StaffPublicationDto) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const pubs = s.publications || [];
        return { ...s, publications: [pub, ...pubs] };
      })
    );
    if (selectedStaffForPub && selectedStaffForPub.id === staffId) {
      setSelectedStaffForPub((prev) => (prev ? { ...prev, publications: [pub, ...(prev.publications || [])] } : null));
    }
  };

  const handlePubDeleted = (staffId: string, pubId: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        return { ...s, publications: (s.publications || []).filter((p) => p.id !== pubId) };
      })
    );
    if (selectedStaffForPub && selectedStaffForPub.id === staffId) {
      setSelectedStaffForPub((prev) =>
        prev ? { ...prev, publications: (prev.publications || []).filter((p) => p.id !== pubId) } : null
      );
    }
  };

  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: "บุคลากร / Personnel",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-border bg-muted shrink-0 flex items-center justify-center">
            {row.avatarUrl ? (
              <Image src={row.avatarUrl} alt={row.fullNameTh} fill className="object-cover" unoptimized />
            ) : (
              <User className="w-5 h-5 text-muted-foreground/50" />
            )}
          </div>
          <div>
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>{row.fullNameTh}</span>
              {row.isExecutive && (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                  {t("personnel.field.staffType.EXECUTIVE")}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{row.fullNameEn}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "ภาควิชา / สังกัด",
      render: (row) => (
        <div>
          <div className="font-medium text-foreground text-xs">
            {row.department ? (locale === "th" ? row.department.nameTh : row.department.nameEn) : "-"}
          </div>
          {row.roomNumber && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              ห้อง {row.roomNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "ตำแหน่งและสายงาน",
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-foreground">
            {row.positionTh || "-"}
          </div>
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-1 ${
            row.staffType === "ACADEMIC"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            {row.staffType === "ACADEMIC" ? t("personnel.field.staffType.ACADEMIC") : t("personnel.field.staffType.SUPPORT")}
          </span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "ข้อมูลติดต่อ",
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-foreground">{row.email || "-"}</div>
          <div className="text-muted-foreground text-[11px]">{row.phone || "-"}</div>
        </div>
      ),
    },
    {
      key: "publications",
      header: "ผลงานวิจัย",
      render: (row) => (
        <button
          onClick={() => {
            setSelectedStaffForPub(row);
            setPubDialogOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>{row.publications?.length || 0} เรื่อง</span>
        </button>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? "ปฏิบัติงาน" : "ระงับชั่วคราว"}
        </StatusPill>
      ),
    },
  ];

  const academicCount = staffList.filter((s) => s.staffType === "ACADEMIC").length;
  const supportCount = staffList.filter((s) => s.staffType === "SUPPORT").length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("personnel.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("personnel.desc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              onClick={() => setDeptDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              <span>{t("personnel.deptManage")}</span>
            </Button>
          )}

          {canCreate && (
            <Button
              onClick={() => {
                setEditingStaff(null);
                setStaffFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t("personnel.create")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            บุคลากรทั้งหมด
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{staffList.length}</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            สายวิชาการ (อาจารย์)
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{academicCount}</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <User className="w-4 h-4 text-emerald-500" />
            สายสนับสนุน
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{supportCount}</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Building className="w-4 h-4 text-amber-500" />
            ภาควิชา / หน่วยงาน
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{departments.length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("personnel.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <LiyonSelect
            value={filterStaffType}
            onChange={(e) => setFilterStaffType(e.target.value)}
            className="text-xs"
          >
            <option value="">ทุกสายงาน</option>
            <option value="ACADEMIC">{t("personnel.field.staffType.ACADEMIC")}</option>
            <option value="SUPPORT">{t("personnel.field.staffType.SUPPORT")}</option>
          </LiyonSelect>

          <LiyonSelect
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-xs"
          >
            <option value="">{t("personnel.allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameTh}
              </option>
            ))}
          </LiyonSelect>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        state="data"
        headHeading="ทำเนียบคณาจารย์และบุคลากร"
        headMeta={`(${filteredStaff.length} คน)`}
        rows={filteredStaff}
        columns={columns}
        getRowId={(r) => r.id}
        empty={{
          icon: <User aria-hidden="true" className="w-8 h-8 opacity-40" />,
          title: t("personnel.noStaff"),
        }}
        error={{
          icon: <AlertCircle aria-hidden="true" className="w-8 h-8 opacity-40" />,
          title: "เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร",
        }}
        renderRowMenu={
          canManage
            ? (row: StaffProfileDto) => (
                <>
                  <RowMenuItem
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onSelect={() => {
                      setEditingStaff(row);
                      setStaffFormOpen(true);
                    }}
                  >
                    {t("personnel.edit")}
                  </RowMenuItem>

                  <RowMenuItem
                    icon={<Award className="w-3.5 h-3.5" />}
                    onSelect={() => {
                      setSelectedStaffForPub(row);
                      setPubDialogOpen(true);
                    }}
                  >
                    จัดการผลงานวิชาการ
                  </RowMenuItem>

                  <RowMenuItem
                    danger
                    icon={<Trash2 className="w-3.5 h-3.5 text-destructive" />}
                    onSelect={() => setDeleteConfirmStaff(row)}
                  >
                    {t("personnel.delete")}
                  </RowMenuItem>
                </>
              )
            : undefined
        }
      />

      {/* Dialog: Create/Edit Staff Profile */}
      <StaffFormDialog
        open={staffFormOpen}
        onOpenChange={setStaffFormOpen}
        staff={editingStaff}
        departments={departments}
        onSaved={handleStaffSaved}
      />

      {/* Dialog: Manage Departments */}
      <DeptDialog
        open={deptDialogOpen}
        onOpenChange={setDeptDialogOpen}
        departments={departments}
        onDepartmentCreated={(d) => setDepartments((prev) => [...prev, d])}
        onDepartmentDeleted={(id) => {
          setDepartments((prev) => prev.filter((d) => d.id !== id));
          setStaffList((prev) =>
            prev.map((s) => (s.departmentId === id ? { ...s, departmentId: null, department: null } : s))
          );
        }}
      />

      {/* Dialog: Manage Publications */}
      <PublicationDialog
        open={pubDialogOpen}
        onOpenChange={setPubDialogOpen}
        staff={selectedStaffForPub}
        onPublicationAdded={handlePubAdded}
        onPublicationDeleted={handlePubDeleted}
      />

      {/* Dialog: Delete Confirmation */}
      {deleteConfirmStaff && (
        <LiyonDialog
          open={!!deleteConfirmStaff}
          onOpenChange={(open) => !open && setDeleteConfirmStaff(null)}
          danger
        >
          <LiyonDialogHeader
            title={t("personnel.delete")}
            description={t("personnel.deleteConfirm")}
          />
          <LiyonDialogBody>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                กำลังลบ: <strong>{deleteConfirmStaff.fullNameTh}</strong> ข้อมูลผลงานวิจัยทั้งหมดของบุคลากรท่านนี้จะถูกลบไปด้วย
              </span>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmStaff(null)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteStaff(deleteConfirmStaff)}
              disabled={isPending}
            >
              {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </LiyonDialogFooter>
        </LiyonDialog>
      )}
    </div>
  );
}
