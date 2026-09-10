import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  PERSONNEL_P,
  listStaffProfiles,
  listDepartments,
} from "@/features/personnel/server";
import { PersonnelAdminClient } from "./_components/personnel-client";

export default async function AdminPersonnelPage() {
  const ctx = await requirePermission(PERSONNEL_P.personnelRead);
  const [initialStaff, departments] = await Promise.all([
    listStaffProfiles(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <PersonnelAdminClient
      initialStaff={initialStaff}
      initialDepartments={departments}
      canManage={hasPermission(ctx, PERSONNEL_P.personnelManage)}
      canCreate={hasPermission(ctx, PERSONNEL_P.personnelCreate)}
    />
  );
}
