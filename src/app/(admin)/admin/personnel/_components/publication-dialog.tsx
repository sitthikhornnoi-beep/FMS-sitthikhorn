"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { StaffProfileDto, StaffPublicationDto } from "@/features/personnel";
import { addStaffPublicationAction, deleteStaffPublicationAction } from "@/features/personnel/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffProfileDto | null;
  onPublicationAdded: (staffId: string, pub: StaffPublicationDto) => void;
  onPublicationDeleted: (staffId: string, pubId: string) => void;
}

export function PublicationDialog({
  open,
  onOpenChange,
  staff,
  onPublicationAdded,
  onPublicationDeleted,
}: Props) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [journalName, setJournalName] = useState("");
  const [doiUrl, setDoiUrl] = useState("");
  const [authors, setAuthors] = useState("");

  if (!staff) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อผลงาน");
      return;
    }

    setLoading(true);
    try {
      const res = await addStaffPublicationAction({
        staffId: staff.id,
        title: title.trim(),
        year: Number(year),
        journalName: journalName.trim() || null,
        doiUrl: doiUrl.trim() || null,
        authors: authors.trim() || null,
      });

      if (res.ok) {
        toast.success("เพิ่มผลงานทางวิชาการเรียบร้อยแล้ว");
        onPublicationAdded(staff.id, res.data);
        setTitle("");
        setJournalName("");
        setDoiUrl("");
        setAuthors("");
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มผลงาน");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pubId: string) => {
    if (!confirm("ยืนยันการลบผลงานนี้หรือไม่?")) return;
    try {
      const res = await deleteStaffPublicationAction(pubId);
      if (res.ok) {
        toast.success("ลบผลงานเรียบร้อยแล้ว");
        onPublicationDeleted(staff.id, pubId);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogHeader
        title={`ผลงานทางวิชาการ: ${staff.fullNameTh}`}
        description="เพิ่มและจัดการผลงานตีพิมพ์ วารสารวิชาการ และงานวิจัย"
      />

      <LiyonDialogBody className="space-y-6">
        {/* Form Add */}
        <form onSubmit={handleAdd} className="p-4 bg-muted/30 rounded-xl border border-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-primary" />
            เพิ่มผลงานตีพิมพ์ใหม่
          </h4>
          <div>
            <label className="block text-xs font-medium mb-1">ชื่อผลงาน / บทความวิจัย *</label>
            <input
              type="text"
              required
              placeholder="e.g. Scalable Microservices Architecture for Distributed Systems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">วารสาร / การประชุมวิชาการ</label>
              <input
                type="text"
                placeholder="e.g. IEEE Transactions on Cloud Computing"
                value={journalName}
                onChange={(e) => setJournalName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">ปีที่ตีพิมพ์ (พ.ศ. หรือ ค.ศ.) *</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">ผู้แต่ง / คณะผู้วิจัย</label>
              <input
                type="text"
                placeholder="e.g. Kiatbawornpanich, S., Smith, J."
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">DOI URL หรือ ลิงก์บทความ</label>
              <input
                type="url"
                placeholder="https://doi.org/10.xxxx/..."
                value={doiUrl}
                onChange={(e) => setDoiUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกผลงาน"}
            </Button>
          </div>
        </form>

        {/* Existing List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            รายการผลงาน ({staff.publications?.length || 0})
          </h4>
          {!staff.publications || staff.publications.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
              ยังไม่มีผลงานทางวิชาการที่บันทึกไว้
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {staff.publications.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-muted/20 border border-border rounded-xl text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 flex-1">
                    <p className="font-semibold text-foreground">{p.title}</p>
                    <p className="text-muted-foreground">
                      {p.journalName && <span>{p.journalName}, </span>}
                      <span className="font-medium">{p.year}</span>
                      {p.authors && <span> — {p.authors}</span>}
                    </p>
                    {p.doiUrl && (
                      <a
                        href={p.doiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] pt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        ลิงก์ผลงาน
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
