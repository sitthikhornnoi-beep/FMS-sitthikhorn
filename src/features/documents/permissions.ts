import type { PermissionDef } from "@/shared/lib/permission-def";

export const DOCUMENTS_P = {
  documentRead: "document:read",
  documentCreate: "document:create",
  documentEndorse: "document:endorse",
  documentApprove: "document:approve",
  documentManage: "document:manage",
} as const;

export const DOCUMENTS_PERMISSIONS: readonly PermissionDef[] = [
  { code: DOCUMENTS_P.documentRead, module: "document", action: "read", description: "ดูรายการและค้นหาเอกสารสารบรรณที่เกี่ยวข้อง" },
  { code: DOCUMENTS_P.documentCreate, module: "document", action: "create", description: "สร้าง ร่าง และยื่นเสนอเอกสารสารบรรณ" },
  { code: DOCUMENTS_P.documentEndorse, module: "document", action: "endorse", description: "เกษียนหนังสือ ให้ความเห็น และส่งต่อเรื่อง" },
  { code: DOCUMENTS_P.documentApprove, module: "document", action: "approve", description: "ลงนามอนุมัติ ไม่อนุมัติ หรือสั่งการเอกสาร" },
  { code: DOCUMENTS_P.documentManage, module: "document", action: "manage", description: "บริหารจัดการสารบรรณส่วนกลาง ออกเลขทะเบียน และดูสถิติทั้งหมด" },
];
