"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createProgramSchema,
  updateProgramSchema,
  updateProgramStructureSchema,
  createCurriculumDeptSchema,
  updateCurriculumDeptSchema,
} from "./validations";
import {
  createProgram,
  updateProgram,
  updateProgramStructure,
  deleteProgram,
  createCurriculumDepartment,
  updateCurriculumDepartment,
  deleteCurriculumDepartment,
  type ProgramDto,
  type DepartmentWithProgramsDto,
} from "./services";

export async function createProgramAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumCreate);
    const parsed = createProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createProgram(ctx.tenantId, parsed);
    revalidatePath("/programs");
    revalidatePath(`/programs/${result.slug}`);
    revalidatePath("/admin/programs");
    revalidatePath("/");
    return result;
  });
}

export async function updateProgramAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateProgram(ctx.tenantId, parsed);
    revalidatePath("/programs");
    revalidatePath(`/programs/${result.slug}`);
    revalidatePath("/admin/programs");
    revalidatePath("/");
    return result;
  });
}

export async function updateProgramStructureAction(input: unknown): Promise<ActionResult<ProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateProgramStructureSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateProgramStructure(ctx.tenantId, parsed);
    revalidatePath("/programs");
    revalidatePath(`/programs/${result.slug}`);
    revalidatePath("/admin/programs");
    return result;
  });
}

export async function deleteProgramAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteProgram(ctx.tenantId, id);
    revalidatePath("/programs");
    revalidatePath("/admin/programs");
    revalidatePath("/");
  });
}

export async function createCurriculumDepartmentAction(input: unknown): Promise<ActionResult<DepartmentWithProgramsDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumDeptSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCurriculumDepartment(ctx.tenantId, parsed);
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/personnel");
    revalidatePath("/");
    return result;
  });
}

export async function updateCurriculumDepartmentAction(input: unknown): Promise<ActionResult<DepartmentWithProgramsDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumDeptSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCurriculumDepartment(ctx.tenantId, parsed);
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/personnel");
    revalidatePath("/");
    return result;
  });
}

export async function deleteCurriculumDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCurriculumDepartment(ctx.tenantId, id);
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    revalidatePath("/personnel");
    revalidatePath("/");
  });
}

