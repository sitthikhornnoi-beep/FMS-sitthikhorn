import { prisma } from "@/shared/lib/infra/prisma";
import { getDefaultTenantId } from "@/shared/lib/infra/tenant";
import { Prisma } from "@/generated/prisma";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateStaffProfileInput,
  UpdateStaffProfileInput,
  CreateStaffPublicationInput,
} from "./validations";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  type: string;
  displayOrder: number;
  isActive: boolean;
  staffCount?: number;
}

export interface StaffPublicationDto {
  id: string;
  tenantId: string;
  staffId: string;
  title: string;
  year: number;
  journalName: string | null;
  doiUrl: string | null;
  authors: string | null;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  userId: string | null;
  departmentId: string | null;
  academicTitleTh: string | null;
  academicTitleEn: string | null;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string | null;
  lastNameEn: string | null;
  fullNameTh: string;
  fullNameEn: string;
  positionTh: string | null;
  positionEn: string | null;
  staffType: string;
  email: string | null;
  phone: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  education: string[];
  researchInterests: string[];
  scopusUrl: string | null;
  scholarUrl: string | null;
  websiteUrl: string | null;
  isExecutive: boolean;
  displayOrder: number;
  isActive: boolean;
  department?: DepartmentDto | null;
  publications?: StaffPublicationDto[];
  createdAt: string;
  updatedAt: string;
}

export { getDefaultTenantId };

export async function listDepartments(tenantId?: string, activeOnly = false): Promise<DepartmentDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const depts = await prisma.department.findMany({
    where: {
      tenantId: tId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: {
      _count: { select: { staffProfiles: true } },
    },
    orderBy: [
      { displayOrder: "asc" },
      { nameTh: "asc" },
    ],
  });

  return depts.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    descriptionTh: d.descriptionTh,
    descriptionEn: d.descriptionEn,
    type: d.type,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
    staffCount: d._count.staffProfiles,
  }));
}

export async function createDepartment(tenantId: string, input: CreateDepartmentInput): Promise<DepartmentDto> {
  const d = await prisma.department.create({
    data: {
      tenantId,
      code: input.code.toUpperCase(),
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      type: input.type,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });

  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    descriptionTh: d.descriptionTh,
    descriptionEn: d.descriptionEn,
    type: d.type,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
  };
}

export async function updateDepartment(tenantId: string, input: UpdateDepartmentInput): Promise<DepartmentDto> {
  const d = await prisma.department.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code.toUpperCase(),
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      type: input.type,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });

  return {
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    descriptionTh: d.descriptionTh,
    descriptionEn: d.descriptionEn,
    type: d.type,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
  };
}

export async function deleteDepartment(tenantId: string, id: string): Promise<void> {
  await prisma.department.delete({
    where: { id, tenantId },
  });
}

export async function listStaffProfiles(
  tenantId?: string,
  options?: {
    departmentId?: string;
    staffType?: string;
    isExecutive?: boolean;
    search?: string;
    activeOnly?: boolean;
  }
): Promise<StaffProfileDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const where: Prisma.StaffProfileWhereInput = {
    tenantId: tId,
    ...(options?.activeOnly ? { isActive: true } : {}),
  };

  if (options?.departmentId) {
    where.departmentId = options.departmentId;
  }

  if (options?.staffType) {
    where.staffType = options.staffType;
  }

  if (options?.isExecutive !== undefined) {
    where.isExecutive = options.isExecutive;
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { firstNameTh: { contains: s, mode: "insensitive" } },
      { lastNameTh: { contains: s, mode: "insensitive" } },
      { firstNameEn: { contains: s, mode: "insensitive" } },
      { lastNameEn: { contains: s, mode: "insensitive" } },
      { positionTh: { contains: s, mode: "insensitive" } },
      { positionEn: { contains: s, mode: "insensitive" } },
      { roomNumber: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  const staff = await prisma.staffProfile.findMany({
    where,
    include: {
      department: true,
      publications: {
        orderBy: { year: "desc" },
      },
    },
    orderBy: [
      { isExecutive: "desc" },
      { displayOrder: "asc" },
      { firstNameTh: "asc" },
    ],
  });

  return staff.map(mapStaffToDto);
}

export async function getStaffProfileById(id: string, tenantId?: string): Promise<StaffProfileDto | null> {
  const tId = tenantId || (await getDefaultTenantId());
  const staff = await prisma.staffProfile.findFirst({
    where: { id, tenantId: tId },
    include: {
      department: true,
      publications: {
        orderBy: { year: "desc" },
      },
    },
  });

  return staff ? mapStaffToDto(staff) : null;
}

export async function createStaffProfile(
  tenantId: string,
  input: CreateStaffProfileInput
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      academicTitleTh: input.academicTitleTh || null,
      academicTitleEn: input.academicTitleEn || null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn || null,
      lastNameEn: input.lastNameEn || null,
      positionTh: input.positionTh || null,
      positionEn: input.positionEn || null,
      staffType: input.staffType,
      email: input.email || null,
      phone: input.phone || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      education: input.education && input.education.length > 0 ? (input.education as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      researchInterests: input.researchInterests && input.researchInterests.length > 0 ? (input.researchInterests as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      scopusUrl: input.scopusUrl || null,
      scholarUrl: input.scholarUrl || null,
      websiteUrl: input.websiteUrl || null,
      isExecutive: input.isExecutive,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
    include: {
      department: true,
      publications: true,
    },
  });

  return mapStaffToDto(created);
}

export async function updateStaffProfile(
  tenantId: string,
  input: UpdateStaffProfileInput
): Promise<StaffProfileDto> {
  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId || null,
      academicTitleTh: input.academicTitleTh || null,
      academicTitleEn: input.academicTitleEn || null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn || null,
      lastNameEn: input.lastNameEn || null,
      positionTh: input.positionTh || null,
      positionEn: input.positionEn || null,
      staffType: input.staffType,
      email: input.email || null,
      phone: input.phone || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      education: input.education && input.education.length > 0 ? (input.education as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      researchInterests: input.researchInterests && input.researchInterests.length > 0 ? (input.researchInterests as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      scopusUrl: input.scopusUrl || null,
      scholarUrl: input.scholarUrl || null,
      websiteUrl: input.websiteUrl || null,
      isExecutive: input.isExecutive,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
    include: {
      department: true,
      publications: true,
    },
  });

  return mapStaffToDto(updated);
}

export async function deleteStaffProfile(tenantId: string, id: string): Promise<void> {
  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });
}

export async function addStaffPublication(
  tenantId: string,
  input: CreateStaffPublicationInput
): Promise<StaffPublicationDto> {
  const pub = await prisma.staffPublication.create({
    data: {
      tenantId,
      staffId: input.staffId,
      title: input.title,
      year: input.year,
      journalName: input.journalName || null,
      doiUrl: input.doiUrl || null,
      authors: input.authors || null,
    },
  });

  return {
    id: pub.id,
    tenantId: pub.tenantId,
    staffId: pub.staffId,
    title: pub.title,
    year: pub.year,
    journalName: pub.journalName,
    doiUrl: pub.doiUrl,
    authors: pub.authors,
  };
}

export async function deleteStaffPublication(tenantId: string, id: string): Promise<void> {
  await prisma.staffPublication.delete({
    where: { id, tenantId },
  });
}

type StaffWithRelations = Prisma.StaffProfileGetPayload<{
  include: {
    department: true;
    publications: true;
  };
}>;

function mapStaffToDto(s: StaffWithRelations): StaffProfileDto {
  const titleTh = s.academicTitleTh ? `${s.academicTitleTh} ` : "";
  const fullNameTh = `${titleTh}${s.firstNameTh} ${s.lastNameTh}`.trim();
  const titleEn = s.academicTitleEn ? `${s.academicTitleEn} ` : "";
  const fnEn = s.firstNameEn || "";
  const lnEn = s.lastNameEn || "";
  const fullNameEn = `${titleEn}${fnEn} ${lnEn}`.trim();

  let education: string[] = [];
  if (Array.isArray(s.education)) {
    education = s.education.map(String);
  }

  let researchInterests: string[] = [];
  if (Array.isArray(s.researchInterests)) {
    researchInterests = s.researchInterests.map(String);
  }

  return {
    id: s.id,
    tenantId: s.tenantId,
    userId: s.userId,
    departmentId: s.departmentId,
    academicTitleTh: s.academicTitleTh,
    academicTitleEn: s.academicTitleEn,
    firstNameTh: s.firstNameTh,
    lastNameTh: s.lastNameTh,
    firstNameEn: s.firstNameEn,
    lastNameEn: s.lastNameEn,
    fullNameTh,
    fullNameEn: fullNameEn || fullNameTh,
    positionTh: s.positionTh,
    positionEn: s.positionEn,
    staffType: s.staffType,
    email: s.email,
    phone: s.phone,
    roomNumber: s.roomNumber,
    avatarUrl: s.avatarUrl,
    education,
    researchInterests,
    scopusUrl: s.scopusUrl,
    scholarUrl: s.scholarUrl,
    websiteUrl: s.websiteUrl,
    isExecutive: s.isExecutive,
    displayOrder: s.displayOrder,
    isActive: s.isActive,
    department: s.department
      ? {
          id: s.department.id,
          tenantId: s.department.tenantId,
          code: s.department.code,
          nameTh: s.department.nameTh,
          nameEn: s.department.nameEn,
          descriptionTh: s.department.descriptionTh,
          descriptionEn: s.department.descriptionEn,
          type: s.department.type,
          displayOrder: s.department.displayOrder,
          isActive: s.department.isActive,
        }
      : null,
    publications: s.publications?.map((p) => ({
      id: p.id,
      tenantId: p.tenantId,
      staffId: p.staffId,
      title: p.title,
      year: p.year,
      journalName: p.journalName,
      doiUrl: p.doiUrl,
      authors: p.authors,
    })),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
