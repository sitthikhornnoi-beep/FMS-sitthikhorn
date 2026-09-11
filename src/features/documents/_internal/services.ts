import { prisma } from "@/shared/lib/infra/prisma";
import { getDefaultTenantId } from "@/shared/lib/infra/tenant";
import type { Prisma } from "@/generated/prisma";
import type {
  DocType,
  DocUrgency,
  DocConfidentiality,
  DocStatus,
  RoutingAction,
  AttachmentItem,
  CreateDocumentInput,
  UpdateDocumentInput,
  SubmitDocumentInput,
  RouteDocumentInput,
} from "./validations";
import { getCurrentDocYear, getNextDocumentNumber } from "./numbering";

export interface DocumentRoutingDto {
  id: string;
  documentId: string;
  stepOrder: number;
  actorId: string;
  actorName: string;
  targetUserId: string | null;
  targetUserName: string | null;
  action: RoutingAction;
  comment: string | null;
  signatureUrl: string | null;
  createdAt: string;
}

export interface DocumentDto {
  id: string;
  tenantId: string;
  docType: DocType;
  urgency: DocUrgency;
  confidentiality: DocConfidentiality;
  status: DocStatus;
  docNumber: string | null;
  sequenceNumber: number | null;
  docYear: number;
  title: string;
  content: string | null;
  originalDocNumber: string | null;
  senderOrganization: string | null;
  attachments: AttachmentItem[];
  submitterId: string;
  submitterName: string;
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetailDto extends DocumentDto {
  routings: DocumentRoutingDto[];
}

export interface DocumentStatsDto {
  inboxCount: number;
  mySubmissionsCount: number;
  registryCount: number;
  archiveCount: number;
}

type RawDocPayload = Prisma.DocumentGetPayload<{
  include: {
    submitter: { select: { id: true; name: true } };
    currentAssignee: { select: { id: true; name: true } };
    department: { select: { id: true; nameTh: true; nameEn: true } };
  };
}>;

function mapToDto(doc: RawDocPayload): DocumentDto {
  const rawAttachments = doc.attachments as unknown as AttachmentItem[] | null;
  return {
    id: doc.id,
    tenantId: doc.tenantId,
    docType: doc.docType as DocType,
    urgency: doc.urgency as DocUrgency,
    confidentiality: doc.confidentiality as DocConfidentiality,
    status: doc.status as DocStatus,
    docNumber: doc.docNumber,
    sequenceNumber: doc.sequenceNumber,
    docYear: doc.docYear,
    title: doc.title,
    content: doc.content,
    originalDocNumber: doc.originalDocNumber,
    senderOrganization: doc.senderOrganization,
    attachments: Array.isArray(rawAttachments) ? rawAttachments : [],
    submitterId: doc.submitterId,
    submitterName: doc.submitter?.name ?? "-",
    currentAssigneeId: doc.currentAssigneeId,
    currentAssigneeName: doc.currentAssignee?.name ?? null,
    departmentId: doc.departmentId,
    departmentName: doc.department?.nameTh ?? null,
    approvedAt: doc.approvedAt?.toISOString() ?? null,
    completedAt: doc.completedAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export { getDefaultTenantId };

export async function trackDocumentByNumber(
  docNumber: string
): Promise<DocumentDetailDto | null> {
  const trimmed = docNumber.trim();
  if (!trimmed) return null;

  const doc = await prisma.document.findFirst({
    where: {
      docNumber: { equals: trimmed, mode: "insensitive" },
      confidentiality: "NORMAL", // Only allow public tracking of non-confidential documents
    },
    include: {
      submitter: { select: { id: true, name: true } },
      currentAssignee: { select: { id: true, name: true } },
      department: { select: { id: true, nameTh: true, nameEn: true } },
      routings: {
        orderBy: { stepOrder: "asc" },
        include: {
          actor: { select: { id: true, name: true } },
          targetUser: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!doc) return null;

  const base = mapToDto(doc);
  const routings: DocumentRoutingDto[] = doc.routings.map((r) => ({
    id: r.id,
    documentId: r.documentId,
    stepOrder: r.stepOrder,
    actorId: r.actorId,
    actorName: r.actor.name,
    targetUserId: r.targetUserId,
    targetUserName: r.targetUser?.name ?? null,
    action: r.action as RoutingAction,
    comment: r.comment,
    signatureUrl: r.signatureUrl,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    ...base,
    routings,
  };
}

export async function listDocuments(
  tenantId?: string,
  options?: {
    tab?: "inbox" | "mySubmissions" | "registry" | "archive";
    userId?: string;
    docType?: DocType;
    status?: DocStatus;
    search?: string;
    departmentId?: string;
    isPublic?: boolean;
  }
): Promise<DocumentDto[]> {
  const effectiveTenantId = tenantId || (await getDefaultTenantId());
  const where: Prisma.DocumentWhereInput = { tenantId: effectiveTenantId };

  if (options?.isPublic) {
    where.docType = { in: ["COMMAND", "ANNOUNCEMENT"] };
    where.status = "APPROVED";
    where.confidentiality = "NORMAL";
  } else if (options?.tab === "inbox") {
    where.status = { in: ["SUBMITTED", "IN_REVIEW"] };
    if (options.userId) {
      where.currentAssigneeId = options.userId;
    }
  } else if (options?.tab === "mySubmissions") {
    if (options.userId) {
      where.submitterId = options.userId;
    }
  } else if (options?.tab === "archive") {
    where.status = { in: ["APPROVED", "REJECTED", "CANCELLED"] };
  } else if (options?.tab === "registry") {
    where.status = { not: "DRAFT" };
  }

  if (options?.docType) {
    where.docType = options.docType;
  }

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.departmentId) {
    where.departmentId = options.departmentId;
  }

  if (options?.search) {
    const q = options.search.trim();
    where.OR = [
      { docNumber: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { originalDocNumber: { contains: q, mode: "insensitive" } },
      { submitter: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const docs = await prisma.document.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: {
      submitter: { select: { id: true, name: true } },
      currentAssignee: { select: { id: true, name: true } },
      department: { select: { id: true, nameTh: true, nameEn: true } },
    },
  });

  return docs.map(mapToDto);
}

export async function getDocumentById(tenantId: string, id: string): Promise<DocumentDetailDto | null> {
  const doc = await prisma.document.findFirst({
    where: { id, tenantId },
    include: {
      submitter: { select: { id: true, name: true } },
      currentAssignee: { select: { id: true, name: true } },
      department: { select: { id: true, nameTh: true, nameEn: true } },
      routings: {
        orderBy: { stepOrder: "asc" },
        include: {
          actor: { select: { id: true, name: true } },
          targetUser: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!doc) return null;

  const base = mapToDto(doc);
  const routings: DocumentRoutingDto[] = doc.routings.map((r) => ({
    id: r.id,
    documentId: r.documentId,
    stepOrder: r.stepOrder,
    actorId: r.actorId,
    actorName: r.actor.name,
    targetUserId: r.targetUserId,
    targetUserName: r.targetUser?.name ?? null,
    action: r.action as RoutingAction,
    comment: r.comment,
    signatureUrl: r.signatureUrl,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    ...base,
    routings,
  };
}

export async function createDocument(
  tenantId: string,
  submitterId: string,
  input: CreateDocumentInput
): Promise<DocumentDto> {
  return prisma.$transaction(async (tx) => {
    const docYear = getCurrentDocYear();
    let docNumber: string | null = null;
    let sequenceNumber: number | null = null;
    const status: DocStatus = input.isSubmitNow ? "SUBMITTED" : "DRAFT";

    if (input.isSubmitNow) {
      const generated = await getNextDocumentNumber(tx, tenantId, input.docType, docYear);
      docNumber = generated.docNumber;
      sequenceNumber = generated.sequenceNumber;
    }

    const created = await tx.document.create({
      data: {
        tenantId,
        submitterId,
        docType: input.docType,
        urgency: input.urgency,
        confidentiality: input.confidentiality,
        status,
        docNumber,
        sequenceNumber,
        docYear,
        title: input.title,
        content: input.content ?? null,
        originalDocNumber: input.originalDocNumber ?? null,
        senderOrganization: input.senderOrganization ?? null,
        departmentId: input.departmentId ?? null,
        currentAssigneeId: input.isSubmitNow ? (input.targetUserId ?? null) : null,
        attachments: (input.attachments ?? []) as unknown as Prisma.InputJsonValue,
      },
      include: {
        submitter: { select: { id: true, name: true } },
        currentAssignee: { select: { id: true, name: true } },
        department: { select: { id: true, nameTh: true, nameEn: true } },
      },
    });

    if (input.isSubmitNow) {
      await tx.documentRouting.create({
        data: {
          tenantId,
          documentId: created.id,
          stepOrder: 1,
          actorId: submitterId,
          targetUserId: input.targetUserId ?? null,
          action: "SUBMIT",
          comment: "ยื่นเสนอเรื่องเริ่มต้น",
        },
      });
    }

    return mapToDto(created);
  });
}

export async function updateDocument(
  tenantId: string,
  userId: string,
  input: UpdateDocumentInput
): Promise<DocumentDto> {
  const existing = await prisma.document.findFirst({
    where: { id: input.id, tenantId },
  });

  if (!existing) throw new Error("ไม่พบเอกสารที่ระบุ");
  if (existing.status !== "DRAFT" && existing.submitterId !== userId) {
    throw new Error("สามารถแก้ไขได้เฉพาะเอกสารฉบับร่างของคุณเท่านั้น");
  }

  const updated = await prisma.document.update({
    where: { id: input.id },
    data: {
      docType: input.docType,
      urgency: input.urgency,
      confidentiality: input.confidentiality,
      title: input.title,
      content: input.content ?? null,
      originalDocNumber: input.originalDocNumber ?? null,
      senderOrganization: input.senderOrganization ?? null,
      departmentId: input.departmentId ?? null,
      attachments: (input.attachments ?? []) as unknown as Prisma.InputJsonValue,
    },
    include: {
      submitter: { select: { id: true, name: true } },
      currentAssignee: { select: { id: true, name: true } },
      department: { select: { id: true, nameTh: true, nameEn: true } },
    },
  });

  return mapToDto(updated);
}

export async function submitDocument(
  tenantId: string,
  userId: string,
  input: SubmitDocumentInput
): Promise<DocumentDto> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.document.findFirst({
      where: { id: input.id, tenantId },
    });

    if (!existing) throw new Error("ไม่พบเอกสารที่ระบุ");
    if (existing.status !== "DRAFT") throw new Error("เอกสารถูกยื่นเสนอเรื่องไปแล้ว");

    let docNumber = existing.docNumber;
    let sequenceNumber = existing.sequenceNumber;

    if (!docNumber) {
      const generated = await getNextDocumentNumber(tx, tenantId, existing.docType as DocType, existing.docYear);
      docNumber = generated.docNumber;
      sequenceNumber = generated.sequenceNumber;
    }

    const updated = await tx.document.update({
      where: { id: input.id },
      data: {
        status: "SUBMITTED",
        docNumber,
        sequenceNumber,
        currentAssigneeId: input.targetUserId ?? null,
      },
      include: {
        submitter: { select: { id: true, name: true } },
        currentAssignee: { select: { id: true, name: true } },
        department: { select: { id: true, nameTh: true, nameEn: true } },
      },
    });

    const lastStep = await tx.documentRouting.findFirst({
      where: { documentId: input.id },
      orderBy: { stepOrder: "desc" },
    });
    const nextStepOrder = (lastStep?.stepOrder ?? 0) + 1;

    await tx.documentRouting.create({
      data: {
        tenantId,
        documentId: input.id,
        stepOrder: nextStepOrder,
        actorId: userId,
        targetUserId: input.targetUserId ?? null,
        action: "SUBMIT",
        comment: input.comment ?? "ยื่นเสนอเรื่อง",
      },
    });

    return mapToDto(updated);
  });
}

export async function routeDocument(
  tenantId: string,
  actorId: string,
  input: RouteDocumentInput
): Promise<DocumentDetailDto> {
  return prisma.$transaction(async (tx) => {
    const doc = await tx.document.findFirst({
      where: { id: input.documentId, tenantId },
    });

    if (!doc) throw new Error("ไม่พบเอกสารที่ระบุ");
    if (["APPROVED", "REJECTED", "CANCELLED"].includes(doc.status)) {
      throw new Error("ไม่สามารถดำเนินการกับเอกสารที่เสร็จสิ้นหรือยกเลิกแล้ว");
    }

    let nextStatus: DocStatus = doc.status as DocStatus;
    let nextAssigneeId: string | null = doc.currentAssigneeId;
    let approvedAt: Date | null = doc.approvedAt;
    let completedAt: Date | null = doc.completedAt;

    switch (input.action) {
      case "FORWARD":
      case "ENDORSE":
        nextStatus = "IN_REVIEW";
        nextAssigneeId = input.targetUserId ?? null;
        break;
      case "RETURN_FOR_EDIT":
        nextStatus = "DRAFT";
        nextAssigneeId = doc.submitterId;
        break;
      case "APPROVE":
        nextStatus = "APPROVED";
        nextAssigneeId = null;
        approvedAt = new Date();
        completedAt = new Date();
        break;
      case "REJECT":
        nextStatus = "REJECTED";
        nextAssigneeId = null;
        completedAt = new Date();
        break;
      default:
        break;
    }

    await tx.document.update({
      where: { id: input.documentId },
      data: {
        status: nextStatus,
        currentAssigneeId: nextAssigneeId,
        approvedAt,
        completedAt,
      },
    });

    const lastStep = await tx.documentRouting.findFirst({
      where: { documentId: input.documentId },
      orderBy: { stepOrder: "desc" },
    });
    const nextStepOrder = (lastStep?.stepOrder ?? 0) + 1;

    await tx.documentRouting.create({
      data: {
        tenantId,
        documentId: input.documentId,
        stepOrder: nextStepOrder,
        actorId,
        targetUserId: input.targetUserId ?? null,
        action: input.action,
        comment: input.comment ?? null,
        signatureUrl: input.signatureUrl ?? null,
      },
    });

    const result = await getDocumentById(tenantId, input.documentId);
    if (!result) throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลเอกสาร");
    return result;
  });
}

export async function cancelDocument(
  tenantId: string,
  userId: string,
  id: string
): Promise<DocumentDto> {
  const existing = await prisma.document.findFirst({
    where: { id, tenantId },
  });

  if (!existing) throw new Error("ไม่พบเอกสารที่ระบุ");
  if (existing.submitterId !== userId) {
    throw new Error("เฉพาะผู้เสนอเรื่องเท่านั้นที่สามารถขอยกเลิกได้");
  }
  if (!["DRAFT", "SUBMITTED"].includes(existing.status)) {
    throw new Error("เอกสารอยู่ในขั้นตอนพิจารณาแล้ว ไม่สามารถยกเลิกได้");
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      status: "CANCELLED",
      currentAssigneeId: null,
      completedAt: new Date(),
    },
    include: {
      submitter: { select: { id: true, name: true } },
      currentAssignee: { select: { id: true, name: true } },
      department: { select: { id: true, nameTh: true, nameEn: true } },
    },
  });

  return mapToDto(updated);
}

export async function deleteDocument(
  tenantId: string,
  userId: string,
  id: string
): Promise<void> {
  const existing = await prisma.document.findFirst({
    where: { id, tenantId },
  });

  if (!existing) throw new Error("ไม่พบเอกสารที่ระบุ");
  if (existing.submitterId !== userId && existing.status !== "DRAFT") {
    throw new Error("สามารถลบได้เฉพาะเอกสารร่างของคุณเท่านั้น");
  }

  await prisma.document.delete({
    where: { id },
  });
}

export async function getDocumentStats(
  tenantId: string,
  userId?: string
): Promise<DocumentStatsDto> {
  const [inboxCount, mySubmissionsCount, registryCount, archiveCount] = await Promise.all([
    prisma.document.count({
      where: {
        tenantId,
        status: { in: ["SUBMITTED", "IN_REVIEW"] },
        ...(userId ? { currentAssigneeId: userId } : {}),
      },
    }),
    prisma.document.count({
      where: {
        tenantId,
        ...(userId ? { submitterId: userId } : {}),
      },
    }),
    prisma.document.count({
      where: {
        tenantId,
        status: { not: "DRAFT" },
      },
    }),
    prisma.document.count({
      where: {
        tenantId,
        status: { in: ["APPROVED", "REJECTED", "CANCELLED"] },
      },
    }),
  ]);

  return {
    inboxCount,
    mySubmissionsCount,
    registryCount,
    archiveCount,
  };
}
