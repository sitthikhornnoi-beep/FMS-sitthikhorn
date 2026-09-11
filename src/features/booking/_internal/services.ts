import { prisma } from "@/shared/lib/infra/prisma";
import { getDefaultTenantId } from "@/shared/lib/infra/tenant";
import { Prisma, type BookingResource } from "@/generated/prisma";
import type {
  CreateBookingResourceInput,
  UpdateBookingResourceInput,
  CreateBookingInput,
  UpdateBookingStatusInput,
  AssignDriverInput,
} from "./validations";

export interface BookingResourceDto {
  id: string;
  tenantId: string;
  type: string;
  code: string;
  nameTh: string;
  nameEn: string;
  capacity: number;
  location: string | null;
  facilities: string[];
  imageUrl: string | null;
  color: string;
  requiresApproval: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface BookingDto {
  id: string;
  tenantId: string;
  resourceId: string;
  resource?: BookingResourceDto | null;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  attendeeCount: number;
  driverName: string | null;
  driverPhone: string | null;
  destination: string | null;
  approverId: string | null;
  approverName?: string | null;
  approvedAt: string | null;
  rejectReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export { getDefaultTenantId };

/** ตรวจสอบการจองซ้อนทับ (Double-booking check) */
export async function checkBookingConflict(
  tenantId: string,
  resourceId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const overlapping = await prisma.booking.findFirst({
    where: {
      tenantId,
      resourceId,
      status: { in: ["PENDING", "APPROVED"] },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  return overlapping !== null;
}

export async function listBookingResources(
  tenantId?: string,
  type?: string,
  activeOnly = false
): Promise<BookingResourceDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const resources = await prisma.bookingResource.findMany({
    where: {
      tenantId: tId,
      ...(type ? { type } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: [
      { type: "asc" },
      { displayOrder: "asc" },
      { nameTh: "asc" },
    ],
  });

  return resources.map(mapResourceToDto);
}

export async function getBookingResourceById(id: string, tenantId?: string): Promise<BookingResourceDto | null> {
  const tId = tenantId || (await getDefaultTenantId());
  const r = await prisma.bookingResource.findFirst({
    where: { id, tenantId: tId },
  });
  return r ? mapResourceToDto(r) : null;
}

export async function createBookingResource(
  tenantId: string,
  input: CreateBookingResourceInput
): Promise<BookingResourceDto> {
  const created = await prisma.bookingResource.create({
    data: {
      tenantId,
      type: input.type,
      code: input.code.toUpperCase(),
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      location: input.location || null,
      facilities: input.facilities && input.facilities.length > 0 ? (input.facilities as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      imageUrl: input.imageUrl || null,
      color: input.color,
      requiresApproval: input.requiresApproval,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });

  return mapResourceToDto(created);
}

export async function updateBookingResource(
  tenantId: string,
  input: UpdateBookingResourceInput
): Promise<BookingResourceDto> {
  const updated = await prisma.bookingResource.update({
    where: { id: input.id, tenantId },
    data: {
      type: input.type,
      code: input.code.toUpperCase(),
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      location: input.location || null,
      facilities: input.facilities && input.facilities.length > 0 ? (input.facilities as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      imageUrl: input.imageUrl || null,
      color: input.color,
      requiresApproval: input.requiresApproval,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });

  return mapResourceToDto(updated);
}

export async function deleteBookingResource(tenantId: string, id: string): Promise<void> {
  await prisma.bookingResource.delete({
    where: { id, tenantId },
  });
}

export async function listBookings(
  tenantId?: string,
  options?: {
    resourceId?: string;
    type?: string;
    status?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  }
): Promise<BookingDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const where: Prisma.BookingWhereInput = {
    tenantId: tId,
  };

  if (options?.resourceId) {
    where.resourceId = options.resourceId;
  }

  if (options?.type) {
    where.resource = { type: options.type };
  }

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.userId) {
    where.userId = options.userId;
  }

  if (options?.from || options?.to) {
    where.AND = [
      ...(options.from ? [{ endTime: { gte: options.from } }] : []),
      ...(options.to ? [{ startTime: { lte: options.to } }] : []),
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      resource: true,
      user: { select: { name: true, email: true } },
      approver: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return bookings.map(mapBookingToDto);
}

export async function getBookingById(id: string, tenantId?: string): Promise<BookingDto | null> {
  const tId = tenantId || (await getDefaultTenantId());
  const b = await prisma.booking.findFirst({
    where: { id, tenantId: tId },
    include: {
      resource: true,
      user: { select: { name: true, email: true } },
      approver: { select: { name: true } },
    },
  });

  return b ? mapBookingToDto(b) : null;
}

export async function createBooking(
  tenantId: string,
  userId: string,
  input: CreateBookingInput
): Promise<BookingDto> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  const hasConflict = await checkBookingConflict(tenantId, input.resourceId, start, end);
  if (hasConflict) {
    throw new Error("ช่วงเวลาดังกล่าวมีการจองทรัพยากรนี้แล้ว กรุณาเลือกช่วงเวลาอื่น");
  }

  const resource = await prisma.bookingResource.findUnique({
    where: { id: input.resourceId },
  });

  if (!resource) {
    throw new Error("ไม่พบทรัพยากรที่เลือก");
  }

  // If resource doesn't require approval, auto-approve
  const initialStatus = resource.requiresApproval ? "PENDING" : "APPROVED";

  const created = await prisma.booking.create({
    data: {
      tenantId,
      userId,
      resourceId: input.resourceId,
      title: input.title,
      description: input.description || null,
      startTime: start,
      endTime: end,
      status: initialStatus,
      attendeeCount: input.attendeeCount,
      destination: input.destination || null,
      driverName: input.driverName || null,
      driverPhone: input.driverPhone || null,
      notes: input.notes || null,
      approvedAt: initialStatus === "APPROVED" ? new Date() : null,
    },
    include: {
      resource: true,
      user: { select: { name: true, email: true } },
      approver: { select: { name: true } },
    },
  });

  return mapBookingToDto(created);
}

export async function updateBookingStatus(
  tenantId: string,
  approverId: string,
  input: UpdateBookingStatusInput
): Promise<BookingDto> {
  const updated = await prisma.booking.update({
    where: { id: input.id, tenantId },
    data: {
      status: input.status,
      approverId,
      approvedAt: input.status === "APPROVED" ? new Date() : null,
      rejectReason: input.rejectReason || null,
      driverName: input.driverName || undefined,
      driverPhone: input.driverPhone || undefined,
    },
    include: {
      resource: true,
      user: { select: { name: true, email: true } },
      approver: { select: { name: true } },
    },
  });

  return mapBookingToDto(updated);
}

export async function assignDriver(
  tenantId: string,
  input: AssignDriverInput
): Promise<BookingDto> {
  const updated = await prisma.booking.update({
    where: { id: input.id, tenantId },
    data: {
      driverName: input.driverName,
      driverPhone: input.driverPhone || null,
    },
    include: {
      resource: true,
      user: { select: { name: true, email: true } },
      approver: { select: { name: true } },
    },
  });

  return mapBookingToDto(updated);
}

export async function cancelBooking(
  tenantId: string,
  userId: string,
  id: string,
  isAdmin = false
): Promise<void> {
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      tenantId,
      ...(isAdmin ? {} : { userId }),
    },
  });

  if (!booking) {
    throw new Error("ไม่พบรายการจอง หรือคุณไม่มีสิทธิ์ยกเลิกรายการนี้");
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}

function mapResourceToDto(r: BookingResource): BookingResourceDto {
  let facilities: string[] = [];
  if (Array.isArray(r.facilities)) {
    facilities = r.facilities.map(String);
  }

  return {
    id: r.id,
    tenantId: r.tenantId,
    type: r.type,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    capacity: r.capacity,
    location: r.location,
    facilities,
    imageUrl: r.imageUrl,
    color: r.color,
    requiresApproval: r.requiresApproval,
    displayOrder: r.displayOrder,
    isActive: r.isActive,
  };
}

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    resource: true;
    user: { select: { name: true; email: true } };
    approver: { select: { name: true } };
  };
}>;

function mapBookingToDto(b: BookingWithRelations): BookingDto {
  return {
    id: b.id,
    tenantId: b.tenantId,
    resourceId: b.resourceId,
    resource: b.resource ? mapResourceToDto(b.resource) : null,
    userId: b.userId,
    userName: b.user?.name ?? null,
    userEmail: b.user?.email ?? null,
    title: b.title,
    description: b.description,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    attendeeCount: b.attendeeCount,
    driverName: b.driverName,
    driverPhone: b.driverPhone,
    destination: b.destination,
    approverId: b.approverId,
    approverName: b.approver?.name ?? null,
    approvedAt: b.approvedAt ? b.approvedAt.toISOString() : null,
    rejectReason: b.rejectReason,
    notes: b.notes,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}
