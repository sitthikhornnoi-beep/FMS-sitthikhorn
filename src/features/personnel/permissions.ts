import type { PermissionDef } from "@/shared/lib/permission-def";

export const PERSONNEL_P = {
  personnelRead: "personnel:read",
  personnelCreate: "personnel:create",
  personnelManage: "personnel:manage",
} as const;

export const PERSONNEL_PERMISSIONS: readonly PermissionDef[] = [
  { code: PERSONNEL_P.personnelRead, module: "personnel", action: "read", description: "ดูรายชื่อและข้อมูลบุคลากรในระบบหลังบ้าน" },
  { code: PERSONNEL_P.personnelCreate, module: "personnel", action: "create", description: "เพิ่มข้อมูลบุคลากรใหม่" },
  { code: PERSONNEL_P.personnelManage, module: "personnel", action: "manage", description: "จัดการ แก้ไข ลบ ข้อมูลบุคลากรและภาควิชา" },
];
