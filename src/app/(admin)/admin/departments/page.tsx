import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listPrograms, listDepartmentsWithPrograms } from "@/features/curriculum/server";
import { ProgramsAdminClient } from "../programs/_components/programs-client";

export default async function AdminDepartmentsPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [programs, departments] = await Promise.all([
    listPrograms(ctx.tenantId),
    listDepartmentsWithPrograms(ctx.tenantId),
  ]);

  return (
    <ProgramsAdminClient
      initialPrograms={programs}
      initialDepartments={departments}
      initialTab="departments"
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
    />
  );
}
