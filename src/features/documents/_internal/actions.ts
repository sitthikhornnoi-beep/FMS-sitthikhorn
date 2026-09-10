"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { DOCUMENTS_P } from "../permissions";
import {
  createDocumentSchema,
  updateDocumentSchema,
  submitDocumentSchema,
  routeDocumentSchema,
} from "./validations";
import {
  createDocument,
  updateDocument,
  submitDocument,
  routeDocument,
  cancelDocument,
  deleteDocument,
  type DocumentDto,
  type DocumentDetailDto,
} from "./services";

export async function createDocumentAction(input: unknown): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.documentCreate);
    const parsed = createDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/documents");
    revalidatePath("/documents");
    return result;
  });
}

export async function updateDocumentAction(input: unknown): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.documentCreate);
    const parsed = updateDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/documents");
    revalidatePath("/documents");
    return result;
  });
}

export async function submitDocumentAction(input: unknown): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.documentCreate);
    const parsed = submitDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await submitDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/documents");
    revalidatePath("/documents");
    return result;
  });
}

export async function routeDocumentAction(input: unknown): Promise<ActionResult<DocumentDetailDto>> {
  return runAction(async () => {
    const parsed = routeDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    
    // ตรวจสอบสิทธิ์ตามประเภทการกระทำ (Approve vs Endorse/Forward)
    if (parsed.action === "APPROVE" || parsed.action === "REJECT") {
      const ctx = await requirePermission(DOCUMENTS_P.documentApprove);
      const result = await routeDocument(ctx.tenantId, ctx.userId, parsed);
      revalidatePath("/admin/documents");
      revalidatePath("/documents");
      return result;
    }

    const ctx = await requirePermission(DOCUMENTS_P.documentEndorse);
    const result = await routeDocument(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/documents");
    revalidatePath("/documents");
    return result;
  });
}

export async function cancelDocumentAction(id: string): Promise<ActionResult<DocumentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.documentCreate);
    const result = await cancelDocument(ctx.tenantId, ctx.userId, id);
    revalidatePath("/admin/documents");
    revalidatePath("/documents");
    return result;
  });
}

export async function deleteDocumentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.documentCreate);
    await deleteDocument(ctx.tenantId, ctx.userId, id);
    revalidatePath("/admin/documents");
    revalidatePath("/documents");
  });
}

export async function trackDocumentAction(docNumber: string): Promise<ActionResult<DocumentDetailDto | null>> {
  return runAction(async () => {
    const { trackDocumentByNumber } = await import("./services");
    const result = await trackDocumentByNumber(docNumber);
    return result;
  });
}

