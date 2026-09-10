import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listPrograms } from "@/features/curriculum/server";
import { listDepartments } from "@/features/personnel/server";
import { ProgramsAdminClient } from "./_components/programs-client";

export default async function AdminProgramsPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [programs, departments] = await Promise.all([
    listPrograms(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <ProgramsAdminClient
      initialPrograms={programs}
      departments={departments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
      canCreate={hasPermission(ctx, CURRICULUM_P.curriculumCreate)}
    />
  );
}
