import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type Program, type Department, type DegreeLevel } from "@/generated/prisma";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  UpdateProgramStructureInput,
  PloInput,
  SemesterPlanInput,
  CourseGroupInput,
} from "./validations";

export interface ProgramDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  departmentCode: string | null;
  degreeLevel: DegreeLevel;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  degreeShortTh: string;
  degreeShortEn: string;
  slug: string;
  curriculumYear: number;
  totalCredits: number;
  studyDuration: string;
  tuitionFee: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  philosophyTh: string | null;
  philosophyEn: string | null;
  careerPaths: string[];
  plos: PloInput[];
  studyPlan: SemesterPlanInput[];
  courseStructure: CourseGroupInput[];
  pdfUrl: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ProgramWithDepartment = Program & {
  department: Pick<Department, "id" | "nameTh" | "nameEn" | "code"> | null;
};

function mapProgramToDto(p: ProgramWithDepartment): ProgramDto {
  let careerPaths: string[] = [];
  if (Array.isArray(p.careerPaths)) {
    careerPaths = p.careerPaths.map(String);
  }

  let plos: PloInput[] = [];
  if (Array.isArray(p.plos)) {
    plos = p.plos as unknown as PloInput[];
  }

  let studyPlan: SemesterPlanInput[] = [];
  if (Array.isArray(p.studyPlan)) {
    studyPlan = p.studyPlan as unknown as SemesterPlanInput[];
  }

  let courseStructure: CourseGroupInput[] = [];
  if (Array.isArray(p.courseStructure)) {
    courseStructure = p.courseStructure as unknown as CourseGroupInput[];
  }

  return {
    id: p.id,
    tenantId: p.tenantId,
    departmentId: p.departmentId,
    departmentNameTh: p.department?.nameTh ?? null,
    departmentNameEn: p.department?.nameEn ?? null,
    departmentCode: p.department?.code ?? null,
    degreeLevel: p.degreeLevel,
    code: p.code,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    degreeTh: p.degreeTh,
    degreeEn: p.degreeEn,
    degreeShortTh: p.degreeShortTh,
    degreeShortEn: p.degreeShortEn,
    slug: p.slug,
    curriculumYear: p.curriculumYear,
    totalCredits: p.totalCredits,
    studyDuration: p.studyDuration,
    tuitionFee: p.tuitionFee,
    descriptionTh: p.descriptionTh,
    descriptionEn: p.descriptionEn,
    philosophyTh: p.philosophyTh,
    philosophyEn: p.philosophyEn,
    careerPaths,
    plos,
    studyPlan,
    courseStructure,
    pdfUrl: p.pdfUrl,
    imageUrl: p.imageUrl,
    displayOrder: p.displayOrder,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getDefaultTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true }, select: { id: true } });
  return tenant?.id ?? "";
}

export async function listPrograms(
  tenantId?: string,
  params?: {
    degreeLevel?: DegreeLevel;
    departmentId?: string;
    search?: string;
    isActive?: boolean;
  }
): Promise<ProgramDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const where: Prisma.ProgramWhereInput = {
    tenantId: tId,
    ...(params?.degreeLevel ? { degreeLevel: params.degreeLevel } : {}),
    ...(params?.departmentId ? { departmentId: params.departmentId } : {}),
    ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
  };

  if (params?.search?.trim()) {
    const term = params.search.trim();
    where.OR = [
      { nameTh: { contains: term, mode: "insensitive" } },
      { nameEn: { contains: term, mode: "insensitive" } },
      { code: { contains: term, mode: "insensitive" } },
      { degreeTh: { contains: term, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.program.findMany({
    where,
    include: {
      department: {
        select: { id: true, nameTh: true, nameEn: true, code: true },
      },
    },
    orderBy: [
      { displayOrder: "asc" },
      { curriculumYear: "desc" },
      { nameTh: "asc" },
    ],
  });

  return rows.map(mapProgramToDto);
}

export async function getProgramBySlug(
  slug: string,
  tenantId?: string
): Promise<ProgramDto | null> {
  const tId = tenantId || (await getDefaultTenantId());
  const row = await prisma.program.findUnique({
    where: { tenantId_slug: { tenantId: tId, slug } },
    include: {
      department: {
        select: { id: true, nameTh: true, nameEn: true, code: true },
      },
    },
  });

  return row ? mapProgramToDto(row) : null;
}

export async function getProgramById(
  tenantId: string,
  id: string
): Promise<ProgramDto | null> {
  const row = await prisma.program.findFirst({
    where: { tenantId, id },
    include: {
      department: {
        select: { id: true, nameTh: true, nameEn: true, code: true },
      },
    },
  });

  return row ? mapProgramToDto(row) : null;
}

export async function createProgram(
  tenantId: string,
  input: CreateProgramInput
): Promise<ProgramDto> {
  const existing = await prisma.program.findUnique({
    where: { tenantId_slug: { tenantId, slug: input.slug } },
  });
  if (existing) {
    throw new Error(`Slug "${input.slug}" ถูกใช้งานไปแล้ว กรุณาใช้ slug อื่น`);
  }

  const created = await prisma.program.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      degreeLevel: input.degreeLevel,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      degreeShortTh: input.degreeShortTh,
      degreeShortEn: input.degreeShortEn,
      slug: input.slug,
      curriculumYear: input.curriculumYear,
      totalCredits: input.totalCredits,
      studyDuration: input.studyDuration,
      tuitionFee: input.tuitionFee || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      philosophyTh: input.philosophyTh || null,
      philosophyEn: input.philosophyEn || null,
      careerPaths: (input.careerPaths ?? []) as unknown as Prisma.InputJsonValue,
      plos: (input.plos ?? []) as unknown as Prisma.InputJsonValue,
      studyPlan: (input.studyPlan ?? []) as unknown as Prisma.InputJsonValue,
      courseStructure: (input.courseStructure ?? []) as unknown as Prisma.InputJsonValue,
      pdfUrl: input.pdfUrl || null,
      imageUrl: input.imageUrl || null,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
    include: {
      department: {
        select: { id: true, nameTh: true, nameEn: true, code: true },
      },
    },
  });

  return mapProgramToDto(created);
}

export async function updateProgram(
  tenantId: string,
  input: UpdateProgramInput
): Promise<ProgramDto> {
  const existing = await prisma.program.findFirst({
    where: { tenantId, id: input.id },
  });
  if (!existing) {
    throw new Error("ไม่พบข้อมูลหลักสูตรที่ต้องการแก้ไข");
  }

  if (input.slug !== existing.slug) {
    const slugConflict = await prisma.program.findUnique({
      where: { tenantId_slug: { tenantId, slug: input.slug } },
    });
    if (slugConflict && slugConflict.id !== input.id) {
      throw new Error(`Slug "${input.slug}" ถูกใช้งานไปแล้ว`);
    }
  }

  const updated = await prisma.program.update({
    where: { id: input.id },
    data: {
      departmentId: input.departmentId || null,
      degreeLevel: input.degreeLevel,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      degreeShortTh: input.degreeShortTh,
      degreeShortEn: input.degreeShortEn,
      slug: input.slug,
      curriculumYear: input.curriculumYear,
      totalCredits: input.totalCredits,
      studyDuration: input.studyDuration,
      tuitionFee: input.tuitionFee || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      philosophyTh: input.philosophyTh || null,
      philosophyEn: input.philosophyEn || null,
      careerPaths: (input.careerPaths ?? []) as unknown as Prisma.InputJsonValue,
      plos: (input.plos ?? []) as unknown as Prisma.InputJsonValue,
      studyPlan: (input.studyPlan ?? []) as unknown as Prisma.InputJsonValue,
      courseStructure: (input.courseStructure ?? []) as unknown as Prisma.InputJsonValue,
      pdfUrl: input.pdfUrl || null,
      imageUrl: input.imageUrl || null,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
    include: {
      department: {
        select: { id: true, nameTh: true, nameEn: true, code: true },
      },
    },
  });

  return mapProgramToDto(updated);
}

export async function updateProgramStructure(
  tenantId: string,
  input: UpdateProgramStructureInput
): Promise<ProgramDto> {
  const existing = await prisma.program.findFirst({
    where: { tenantId, id: input.id },
  });
  if (!existing) {
    throw new Error("ไม่พบหลักสูตรที่ต้องการแก้ไขโครงสร้าง");
  }

  const updateData: Prisma.ProgramUpdateInput = {};
  if (input.careerPaths !== undefined) {
    updateData.careerPaths = input.careerPaths as unknown as Prisma.InputJsonValue;
  }
  if (input.plos !== undefined) {
    updateData.plos = input.plos as unknown as Prisma.InputJsonValue;
  }
  if (input.studyPlan !== undefined) {
    updateData.studyPlan = input.studyPlan as unknown as Prisma.InputJsonValue;
  }
  if (input.courseStructure !== undefined) {
    updateData.courseStructure = input.courseStructure as unknown as Prisma.InputJsonValue;
  }

  const updated = await prisma.program.update({
    where: { id: input.id },
    data: updateData,
    include: {
      department: {
        select: { id: true, nameTh: true, nameEn: true, code: true },
      },
    },
  });

  return mapProgramToDto(updated);
}

export async function deleteProgram(tenantId: string, id: string): Promise<void> {
  const existing = await prisma.program.findFirst({
    where: { tenantId, id },
  });
  if (!existing) {
    throw new Error("ไม่พบหลักสูตรที่ต้องการลบ");
  }

  await prisma.program.delete({
    where: { id },
  });
}
