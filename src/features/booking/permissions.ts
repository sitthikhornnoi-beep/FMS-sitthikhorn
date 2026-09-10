import type { PermissionDef } from "@/shared/lib/permission-def";

export const BOOKING_P = {
  bookingRead: "booking:read",
  bookingCreate: "booking:create",
  bookingApprove: "booking:approve",
  bookingManage: "booking:manage",
} as const;

export const BOOKING_PERMISSIONS: readonly PermissionDef[] = [
  { code: BOOKING_P.bookingRead, module: "booking", action: "read", description: "ดูรายการและปฏิทินการจองห้องประชุมและยานพาหนะ" },
  { code: BOOKING_P.bookingCreate, module: "booking", action: "create", description: "ส่งคำขอจองห้องประชุมและยานพาหนะ" },
  { code: BOOKING_P.bookingApprove, module: "booking", action: "approve", description: "อนุมัติ ปฏิเสธคำขอจอง และมอบหมายพนักงานขับรถ" },
  { code: BOOKING_P.bookingManage, module: "booking", action: "manage", description: "จัดการข้อมูลห้องประชุม ยานพาหนะ และการจองทั้งหมด" },
];
