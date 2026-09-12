import { requirePermission, hasPermission } from "@/features/identity/server";
import { prisma } from "@/shared/lib/infra/prisma";
import {
  DOCUMENTS_P,
  listDocuments,
  getDocumentStats,
} from "@/features/documents/server";
import { DocumentsClient } from "../_components/documents-client";

export default async function AdminDocumentsRegistryPage() {
  const ctx = await requirePermission(DOCUMENTS_P.documentRead);

  const [documents, stats, departments, userTenants] = await Promise.all([
    listDocuments(ctx.tenantId),
    getDocumentStats(ctx.tenantId, ctx.userId),
    prisma.department.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, nameTh: true, nameEn: true },
    }),
    prisma.userTenant.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  const users = userTenants.map((ut) => ({
    id: ut.user.id,
    name: ut.user.name,
  }));

  return (
    <DocumentsClient
      initialDocuments={documents}
      initialStats={stats}
      departments={departments}
      users={users}
      currentUserId={ctx.userId}
      initialTab="registry"
      canCreate={hasPermission(ctx, DOCUMENTS_P.documentCreate)}
      canEndorse={hasPermission(ctx, DOCUMENTS_P.documentEndorse)}
      canApprove={hasPermission(ctx, DOCUMENTS_P.documentApprove)}
      canManage={hasPermission(ctx, DOCUMENTS_P.documentManage)}
    />
  );
}
