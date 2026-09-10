"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { PERSONNEL_P } from "../permissions";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createStaffProfileSchema,
  updateStaffProfileSchema,
  createStaffPublicationSchema,
} from "./validations";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listDepartments,
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  addStaffPublication,
  deleteStaffPublication,
  type DepartmentDto,
  type StaffProfileDto,
  type StaffPublicationDto,
} from "./services";

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    revalidatePath("/");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    revalidatePath("/");
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    await deleteDepartment(ctx.tenantId, id);
    revalidatePath("/personnel");
    revalidatePath("/");
  });
}

export async function getDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelRead);
    return listDepartments(ctx.tenantId);
  });
}

export async function createStaffProfileAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelCreate);
    const parsed = createStaffProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    revalidatePath("/");
    return result;
  });
}

export async function updateStaffProfileAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const parsed = updateStaffProfileSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaffProfile(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    revalidatePath("/");
    return result;
  });
}

export async function deleteStaffProfileAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    await deleteStaffProfile(ctx.tenantId, id);
    revalidatePath("/personnel");
    revalidatePath("/");
  });
}

export async function addStaffPublicationAction(input: unknown): Promise<ActionResult<StaffPublicationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const parsed = createStaffPublicationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await addStaffPublication(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    return result;
  });
}

export async function deleteStaffPublicationAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    await deleteStaffPublication(ctx.tenantId, id);
    revalidatePath("/personnel");
  });
}
