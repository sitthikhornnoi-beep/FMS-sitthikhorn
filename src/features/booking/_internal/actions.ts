"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { BOOKING_P } from "../permissions";
import {
  createBookingResourceSchema,
  updateBookingResourceSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  assignDriverSchema,
} from "./validations";
import {
  createBookingResource,
  updateBookingResource,
  deleteBookingResource,
  createBooking,
  updateBookingStatus,
  assignDriver,
  cancelBooking,
  type BookingResourceDto,
  type BookingDto,
} from "./services";

export async function createBookingAction(input: unknown): Promise<ActionResult<BookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingCreate);
    const parsed = createBookingSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createBooking(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
    return result;
  });
}

export async function updateBookingStatusAction(input: unknown): Promise<ActionResult<BookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingApprove);
    const parsed = updateBookingStatusSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateBookingStatus(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
    return result;
  });
}

export async function assignDriverAction(input: unknown): Promise<ActionResult<BookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingApprove);
    const parsed = assignDriverSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await assignDriver(ctx.tenantId, parsed);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
    return result;
  });
}

export async function cancelBookingAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingCreate);
    await cancelBooking(ctx.tenantId, ctx.userId, id);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
  });
}

export async function createBookingResourceAction(input: unknown): Promise<ActionResult<BookingResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = createBookingResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createBookingResource(ctx.tenantId, parsed);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
    return result;
  });
}

export async function updateBookingResourceAction(input: unknown): Promise<ActionResult<BookingResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = updateBookingResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateBookingResource(ctx.tenantId, parsed);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
    return result;
  });
}

export async function deleteBookingResourceAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    await deleteBookingResource(ctx.tenantId, id);
    revalidatePath("/admin/booking");
    revalidatePath("/booking");
  });
}
