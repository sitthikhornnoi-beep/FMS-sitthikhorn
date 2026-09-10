"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto } from "@/features/personnel";
import { createDepartmentAction, deleteDepartmentAction } from "@/features/personnel/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentDto[];
  onDepartmentCreated: (dept: DepartmentDto) => void;
  onDepartmentDeleted: (id: string) => void;
}

export function DeptDialog({
  open,
  onOpenChange,
  departments,
  onDepartmentCreated,
  onDepartmentDeleted,
}: Props) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [type, setType] = useState<"ACADEMIC" | "SUPPORT" | "EXECUTIVE">("ACADEMIC");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameTh.trim() || !nameEn.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const res = await createDepartmentAction({
        code: code.trim().toUpperCase(),
        nameTh: nameTh.trim(),
        nameEn: nameEn.trim(),
        type,
        displayOrder: departments.length + 1,
        isActive: true,
      });

      if (res.ok) {
        toast.success(t("personnel.deptSaveSuccess"));
        onDepartmentCreated(res.data);
        setCode("");
        setNameTh("");
        setNameEn("");
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการสร้างภาควิชา");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบภาควิชานี้หรือไม่?")) return;
    try {
      const res = await deleteDepartmentAction(id);
      if (res.ok) {
        toast.success("ลบภาควิชาเรียบร้อยแล้ว");
        onDepartmentDeleted(id);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบภาควิชา");
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <LiyonDialogHeader
        title={t("personnel.deptManage")}
        description="เพิ่มหรือจัดการโครงสร้างภาควิชาและสายงานสนับสนุนภายในคณะ"
      />

      <LiyonDialogBody className="space-y-6">
        {/* Form create */}
        <form onSubmit={handleCreate} className="p-4 bg-muted/40 rounded-xl border border-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-primary" />
            {t("personnel.dept.create")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">{t("personnel.dept.code")} *</label>
              <input
                type="text"
                required
                placeholder="เช่น CS, IT, SE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t("personnel.dept.type")} *</label>
              <LiyonSelect value={type} onChange={(e) => setType(e.target.value as "ACADEMIC" | "SUPPORT" | "EXECUTIVE")}>
                <option value="ACADEMIC">{t("personnel.dept.type.ACADEMIC")}</option>
                <option value="SUPPORT">{t("personnel.dept.type.SUPPORT")}</option>
                <option value="EXECUTIVE">{t("personnel.dept.type.EXECUTIVE")}</option>
              </LiyonSelect>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("personnel.dept.nameTh")} *</label>
            <input
              type="text"
              required
              placeholder="ชื่อภาควิชาภาษาไทย"
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t("personnel.dept.nameEn")} *</label>
            <input
              type="text"
              required
              placeholder="Department Name in English"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกภาควิชา"}
            </Button>
          </div>
        </form>

        {/* Existing List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            ภาควิชา/หน่วยงานทั้งหมด ({departments.length})
          </h4>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-56 overflow-y-auto">
            {departments.map((d) => (
              <div key={d.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-[11px] text-foreground">
                      {d.code}
                    </span>
                    <span className="font-medium text-foreground">{d.nameTh}</span>
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">{d.nameEn}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {d.staffCount ?? 0} คน
                  </span>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("personnel.close")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
