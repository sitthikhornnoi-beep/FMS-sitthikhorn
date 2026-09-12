"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  Loader2,
  Trash2,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/shared/lib/i18n/client";
import { parseCsv, generateCsv } from "@/shared/lib/csv";
import { importUsersCsvAction } from "@/features/identity/actions";
import type { ImportUserRow, ImportUsersResult } from "@/features/identity";

interface RolePick {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface ParsedUserRowPreview {
  rowNum: number;
  raw: Record<string, string>;
  name: string;
  email: string;
  roleCodes: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  isValid: boolean;
  error?: string;
}

export function UsersImportClient({ roles }: { roles: RolePick[] }) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRowPreview[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<"skip" | "update">("skip");
  const [defaultRoleId, setDefaultRoleId] = useState<string>(
    roles.find((r) => r.code === "STAFF")?.id || roles[0]?.id || ""
  );
  const [sendPasswordEmail, setSendPasswordEmail] = useState(true);

  const [isPending, startTransition] = useTransition();
  const [importResult, setImportResult] = useState<ImportUsersResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ดาวน์โหลดเทมเพลต CSV
  const handleDownloadTemplate = () => {
    const templateColumns = [
      { key: "name", label: "ชื่อ-นามสกุล" },
      { key: "email", label: "อีเมล" },
      { key: "roles", label: "รหัสบทบาท" },
      { key: "status", label: "สถานะการใช้งาน" },
      { key: "mustChangePassword", label: "ต้องเปลี่ยนรหัสผ่าน" },
    ];

    const sampleRoles = roles.filter((r) => r.code !== "SUPER_ADMIN").slice(0, 2);
    const sampleRole1 = sampleRoles[0]?.code || "STAFF";
    const sampleRole2 = sampleRoles[1]?.code || "TEACHER";

    const sampleData = [
      {
        name: "ดร.สมชาย ใจดี",
        email: "somchai.j@example.ac.th",
        roles: sampleRole1,
        status: "เปิดใช้งาน",
        mustChangePassword: "ใช่",
      },
      {
        name: "นางสาวสมหญิง รักเรียน",
        email: "somying.r@example.ac.th",
        roles: sampleRole2,
        status: "เปิดใช้งาน",
        mustChangePassword: "ใช่",
      },
      {
        name: "นายวิชัย พัฒนา",
        email: "wichai.p@example.ac.th",
        roles: `${sampleRole1},${sampleRole2}`,
        status: "เปิดใช้งาน",
        mustChangePassword: "ไม่",
      },
    ];

    const csvContent = generateCsv(templateColumns, sampleData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลดเทมเพลต CSV เรียบร้อย");
  };

  // แมปหัวคอลัมน์ภาษาไทยและอังกฤษ
  const findColumnValue = (row: Record<string, string>, keys: string[]): string => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== "") return row[k].trim();
      const match = Object.keys(row).find((header) => header.trim().toLowerCase() === k.toLowerCase());
      if (match && row[match] !== undefined && row[match] !== "") return row[match].trim();
    }
    return "";
  };

  // ประมวลผลไฟล์ CSV
  const processFile = (uploadedFile: File) => {
    if (!uploadedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ .csv เท่านั้น");
      return;
    }

    setFile(uploadedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || "";
        const { rows } = parseCsv(text);

        if (rows.length === 0) {
          toast.error("ไฟล์ CSV ไม่มีข้อมูล");
          setParsedRows([]);
          return;
        }

        const validRoleCodes = new Set(roles.map((r) => r.code.toUpperCase()));

        const previewList: ParsedUserRowPreview[] = rows.map((raw, idx) => {
          const rowNum = idx + 1;
          const name = findColumnValue(raw, ["ชื่อ-นามสกุล", "ชื่อ", "name", "fullname", "full_name"]);
          const email = findColumnValue(raw, ["อีเมล", "email", "mail", "e-mail"]);
          const rolesRaw = findColumnValue(raw, ["รหัสบทบาท", "บทบาท", "roles", "role", "role_codes"]);
          const statusRaw = findColumnValue(raw, ["สถานะการใช้งาน", "สถานะ", "status", "is_active", "isactive"]);
          const changePassRaw = findColumnValue(raw, [
            "ต้องเปลี่ยนรหัสผ่าน",
            "must_change_password",
            "mustchangepassword",
            "change_password",
          ]);

          const roleCodes = rolesRaw
            ? rolesRaw
                .split(/[,;|]/)
                .map((r) => r.trim().toUpperCase())
                .filter(Boolean)
            : [];

          const isActive = !(
            statusRaw === "ระงับการใช้งาน" ||
            statusRaw === "ปิด" ||
            statusRaw === "false" ||
            statusRaw === "0" ||
            statusRaw === "inactive"
          );

          const mustChangePassword = !(
            changePassRaw === "ไม่" ||
            changePassRaw === "false" ||
            changePassRaw === "0" ||
            changePassRaw === "no"
          );

          // ตรวจสอบความถูกต้องเบื้องต้น
          const errors: string[] = [];
          if (!name) errors.push("ไม่ระบุชื่อ");
          if (!email) {
            errors.push("ไม่ระบุอีเมล");
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("รูปแบบอีเมลไม่ถูกต้อง");
          }

          // ตรวจสอบบทบาทที่ไม่รู้จัก
          for (const c of roleCodes) {
            if (!validRoleCodes.has(c)) {
              errors.push(`ไม่พบบทบาท '${c}'`);
            }
          }

          return {
            rowNum,
            raw,
            name,
            email,
            roleCodes,
            isActive,
            mustChangePassword,
            isValid: errors.length === 0,
            error: errors.length > 0 ? errors.join(", ") : undefined,
          };
        });

        setParsedRows(previewList);
        toast.success(`อ่านข้อมูลสำเร็จ ${previewList.length} รายการ`);
      } catch {
        toast.error("ไม่สามารถอ่านไฟล์ CSV ได้ กรุณาตรวจสอบรูปแบบไฟล์");
      }
    };
    reader.readAsText(uploadedFile, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // สถิติข้อมูล
  const totalRows = parsedRows.length;
  const validRows = parsedRows.filter((r) => r.isValid).length;
  const errorRows = parsedRows.filter((r) => !r.isValid).length;

  // ส่งคำขอนำเข้า
  const handleSubmitImport = () => {
    if (validRows === 0) {
      toast.error("ไม่มีข้อมูลแถวที่ถูกต้องสำหรับนำเข้า");
      return;
    }

    startTransition(async () => {
      try {
        const rowsPayload: ImportUserRow[] = parsedRows
          .filter((r) => r.isValid)
          .map((r) => ({
            email: r.email,
            name: r.name,
            roleCodes: r.roleCodes,
            isActive: r.isActive,
            mustChangePassword: r.mustChangePassword,
          }));

        const res = await importUsersCsvAction({
          rows: rowsPayload,
          options: {
            duplicateAction,
            defaultRoleId: defaultRoleId || undefined,
            sendPasswordEmail,
          },
        });

        if (!res.ok) {
          toast.error(res.error.message || "การนำเข้าข้อมูลล้มเหลว");
          return;
        }

        setImportResult(res.data);
        toast.success(
          `นำเข้าข้อมูลเสร็จสิ้น: สร้างใหม่ ${res.data.created} คน, อัปเดต ${res.data.updated} คน, ข้าม ${res.data.skipped} คน`
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/users"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("users.import.backToUsers")}</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>{t("users.import.title")}</span>
          </h1>
          <p className="text-xs text-muted-foreground">{t("users.import.subtitle")}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-xs text-xs"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>{t("users.import.downloadTemplate")}</span>
        </Button>
      </div>

      {/* Roles Legend & Guide Card */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>{t("users.import.rolesLegend")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/80 bg-background/90 text-xs font-medium text-foreground shadow-2xs"
            >
              <code className="font-bold text-primary">{r.code}</code>
              <span className="text-muted-foreground">({r.nameTh})</span>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>สามารถระบุหลายบทบาทพร้อมกันได้โดยคั่นด้วยเครื่องหมายจุลภาค เช่น <code>TEACHER,STAFF</code></span>
        </p>
      </div>

      {/* Grid: Upload & Import Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              dragOver
                ? "border-primary bg-primary/10 shadow-md"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processFile(e.target.files[0]);
                }
              }}
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="font-semibold text-sm text-foreground">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  ขนาด {(file.size / 1024).toFixed(1)} KB &bull; ตรวจพบ {totalRows} แถว
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>เปลี่ยนไฟล์</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="font-semibold text-sm text-foreground">{t("users.import.dropzoneTitle")}</div>
                <div className="text-xs text-muted-foreground">{t("users.import.dropzoneHint")}</div>
              </div>
            )}
          </div>
        </div>

        {/* Options Card (1 col) */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <span>{t("users.import.step3")}</span>
          </h3>

          {/* Duplicate Action */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              {t("users.import.dupAction")}
            </label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="duplicateAction"
                  value="skip"
                  checked={duplicateAction === "skip"}
                  onChange={() => setDuplicateAction("skip")}
                  className="text-primary focus:ring-primary/20"
                />
                <span>{t("users.import.dupSkip")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="duplicateAction"
                  value="update"
                  checked={duplicateAction === "update"}
                  onChange={() => setDuplicateAction("update")}
                  className="text-primary focus:ring-primary/20"
                />
                <span>{t("users.import.dupUpdate")}</span>
              </label>
            </div>
          </div>

          {/* Default Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              {t("users.import.defaultRole")}
            </label>
            <select
              value={defaultRoleId}
              onChange={(e) => setDefaultRoleId(e.target.value)}
              className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameTh} ({r.code})
                </option>
              ))}
            </select>
          </div>

          {/* Send Email Checkbox */}
          <div className="pt-2 border-t border-border/60">
            <label className="flex items-start gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={sendPasswordEmail}
                onChange={(e) => setSendPasswordEmail(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-foreground leading-snug">{t("users.import.sendEmail")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Table & Execution */}
      {parsedRows.length > 0 && !importResult && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">{t("users.import.step4")}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>ทั้งหมด: <strong className="text-foreground">{totalRows}</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-600 font-medium">ถูกต้อง: {validRows}</span>
                {errorRows > 0 && (
                  <>
                    <span>&bull;</span>
                    <span className="text-destructive font-medium">พบข้อผิดพลาด: {errorRows}</span>
                  </>
                )}
              </div>
            </div>

            <Button
              type="button"
              disabled={validRows === 0 || isPending}
              onClick={handleSubmitImport}
              className="inline-flex items-center gap-2 text-xs shadow-xs shrink-0 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("users.import.importing")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("users.import.btnSubmit", { n: validRows })}</span>
                </>
              )}
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 text-muted-foreground sticky top-0 backdrop-blur-xs border-b border-border/60 z-10">
                <tr>
                  <th className="p-3 w-12 text-center">แถว</th>
                  <th className="p-3">ชื่อ-นามสกุล</th>
                  <th className="p-3">อีเมล</th>
                  <th className="p-3">บทบาท</th>
                  <th className="p-3 w-28 text-center">สถานะแถว</th>
                  <th className="p-3">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {parsedRows.map((row) => (
                  <tr
                    key={row.rowNum}
                    className={`hover:bg-muted/30 transition-colors ${
                      !row.isValid ? "bg-destructive/5" : ""
                    }`}
                  >
                    <td className="p-3 text-center text-muted-foreground font-mono">{row.rowNum}</td>
                    <td className="p-3 font-semibold text-foreground">{row.name || "-"}</td>
                    <td className="p-3 font-mono text-muted-foreground">{row.email || "-"}</td>
                    <td className="p-3">
                      {row.roleCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.roleCodes.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono border border-border/60"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          ค่าเริ่มต้น ({roles.find((r) => r.id === defaultRoleId)?.code})
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ผ่าน</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive">
                          <XCircle className="w-3 h-3" />
                          <span>ไม่ผ่าน</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-destructive">
                      {row.error || <span className="text-muted-foreground">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result Card after completion */}
      {importResult && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{t("users.import.success")}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("users.import.summary", {
                  created: importResult.created,
                  updated: importResult.updated,
                  skipped: importResult.skipped,
                  failed: importResult.failed,
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs cursor-pointer"
              >
                นำเข้าไฟล์อื่นเพิ่ม
              </Button>
              <Link href="/users">
                <Button type="button" size="sm" className="text-xs cursor-pointer">
                  ไปยังหน้ารายชื่อผู้ใช้
                </Button>
              </Link>
            </div>
          </div>

          {/* Detailed outcome list */}
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 text-muted-foreground sticky top-0 backdrop-blur-xs border-b border-border/60">
                <tr>
                  <th className="p-3 w-12 text-center">แถว</th>
                  <th className="p-3">ชื่อ-นามสกุล</th>
                  <th className="p-3">อีเมล</th>
                  <th className="p-3 w-28 text-center">ผลลัพธ์</th>
                  <th className="p-3">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {importResult.details.map((d) => (
                  <tr key={d.row} className="hover:bg-muted/30">
                    <td className="p-3 text-center text-muted-foreground font-mono">{d.row}</td>
                    <td className="p-3 font-semibold text-foreground">{d.name}</td>
                    <td className="p-3 font-mono text-muted-foreground">{d.email}</td>
                    <td className="p-3 text-center">
                      {d.status === "created" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600">
                          สร้างใหม่
                        </span>
                      )}
                      {d.status === "updated" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600">
                          อัปเดตแล้ว
                        </span>
                      )}
                      {d.status === "skipped" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600">
                          ข้าม
                        </span>
                      )}
                      {d.status === "error" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive">
                          ล้มเหลว
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-muted-foreground">{d.message || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
