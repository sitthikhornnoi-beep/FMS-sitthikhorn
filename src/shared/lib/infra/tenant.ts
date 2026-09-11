import { cache } from "react";
import { prisma } from "./prisma";

/**
 * คืนค่า tenantId หลักที่เปิดใช้งานของระบบ (สำหรับใช้งานใน public portal หรือ queries ที่ยังไม่มี session)
 * ใช้ React cache เพื่อ memoize ผลลัพธ์ต่อ request
 */
export const getDefaultTenantId = cache(async (): Promise<string> => {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return tenant?.id ?? "";
});
