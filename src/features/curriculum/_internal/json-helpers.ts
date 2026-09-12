import { z } from "zod";
import {
  degreeLevelEnum,
  ploSchema,
  courseGroupSchema,
  semesterPlanSchema,
  type DegreeLevelType,
  type PloInput,
  type CourseGroupInput,
  type SemesterPlanInput,
} from "./validations";

export const programJsonSchema = z.object({
  $schema: z.string().optional(),
  exportedAt: z.string().optional(),
  code: z.string().trim().min(1, "Program code is required"),
  nameTh: z.string().trim().min(1, "Thai program name is required"),
  nameEn: z.string().trim().optional(),
  degreeTh: z.string().trim().optional(),
  degreeEn: z.string().trim().optional(),
  degreeShortTh: z.string().trim().optional(),
  degreeShortEn: z.string().trim().optional(),
  degreeLevel: degreeLevelEnum.optional().default("BACHELOR"),
  departmentCode: z.string().trim().optional().nullable(),
  departmentNameTh: z.string().trim().optional().nullable(),
  slug: z.string().trim().optional(),
  curriculumYear: z.number().int().optional(),
  totalCredits: z.number().int().optional(),
  studyDuration: z.string().trim().optional(),
  tuitionFee: z.string().trim().optional().nullable(),
  descriptionTh: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().optional().nullable(),
  philosophyTh: z.string().trim().optional().nullable(),
  philosophyEn: z.string().trim().optional().nullable(),
  pdfUrl: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  careerPaths: z.array(z.string()).optional().default([]),
  plos: z.array(ploSchema).optional().default([]),
  studyPlan: z.array(semesterPlanSchema).optional().default([]),
  courseStructure: z.array(courseGroupSchema).optional().default([]),
});

export type ProgramJson = z.infer<typeof programJsonSchema>;

export interface ProgramExportData {
  code: string;
  nameTh: string;
  nameEn?: string;
  degreeTh?: string;
  degreeEn?: string;
  degreeShortTh?: string;
  degreeShortEn?: string;
  degreeLevel: DegreeLevelType;
  departmentCode?: string | null;
  departmentNameTh?: string | null;
  slug: string;
  curriculumYear: number;
  totalCredits: number;
  studyDuration: string;
  tuitionFee?: string | null;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  philosophyTh?: string | null;
  philosophyEn?: string | null;
  pdfUrl?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  careerPaths?: string[];
  plos?: PloInput[];
  studyPlan?: SemesterPlanInput[];
  courseStructure?: CourseGroupInput[];
}

export function exportProgramToJson(data: ProgramExportData): string {
  const jsonObject: ProgramJson = {
    $schema: "fms-curriculum-program-v1",
    exportedAt: new Date().toISOString(),
    code: data.code.trim(),
    nameTh: data.nameTh.trim(),
    nameEn: data.nameEn?.trim() || data.nameTh.trim(),
    degreeTh: data.degreeTh?.trim() || data.nameTh.trim(),
    degreeEn: data.degreeEn?.trim() || data.nameEn?.trim() || data.nameTh.trim(),
    degreeShortTh: data.degreeShortTh?.trim() || data.code.trim(),
    degreeShortEn: data.degreeShortEn?.trim() || data.code.trim(),
    degreeLevel: data.degreeLevel,
    departmentCode: data.departmentCode ?? null,
    departmentNameTh: data.departmentNameTh ?? null,
    slug: data.slug.trim(),
    curriculumYear: Number(data.curriculumYear) || new Date().getFullYear() + 543,
    totalCredits: Number(data.totalCredits) || 120,
    studyDuration: data.studyDuration.trim() || "4 ปี",
    tuitionFee: data.tuitionFee?.trim() || null,
    descriptionTh: data.descriptionTh?.trim() || null,
    descriptionEn: data.descriptionEn?.trim() || null,
    philosophyTh: data.philosophyTh?.trim() || null,
    philosophyEn: data.philosophyEn?.trim() || null,
    pdfUrl: data.pdfUrl?.trim() || null,
    imageUrl: data.imageUrl?.trim() || null,
    displayOrder: Number(data.displayOrder) || 0,
    isActive: Boolean(data.isActive),
    careerPaths: Array.isArray(data.careerPaths) ? data.careerPaths : [],
    plos: Array.isArray(data.plos) ? data.plos : [],
    studyPlan: Array.isArray(data.studyPlan) ? data.studyPlan : [],
    courseStructure: Array.isArray(data.courseStructure) ? data.courseStructure : [],
  };

  return JSON.stringify(jsonObject, null, 2);
}

export interface ParseProgramJsonResult {
  success: boolean;
  data?: ProgramJson;
  error?: string;
  summary?: {
    hasCourseStructure: number;
    hasPlos: number;
    hasStudyPlan: number;
    hasCareerPaths: number;
  };
}

export function parseProgramJson(jsonString: string): ParseProgramJsonResult {
  try {
    const raw = JSON.parse(jsonString);
    if (typeof raw !== "object" || raw === null) {
      return { success: false, error: "เนื้อหาไฟล์ไม่ใช่รูปแบบ JSON ของออบเจกต์ที่ถูกต้อง" };
    }

    const parsed = programJsonSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const fieldPath = issue.path.join(".");
      return {
        success: false,
        error: `ข้อมูลไม่ตรงตามรูปแบบ: ${fieldPath ? `[${fieldPath}] ` : ""}${issue.message}`,
      };
    }

    const data = parsed.data;
    return {
      success: true,
      data,
      summary: {
        hasCourseStructure: data.courseStructure?.length ?? 0,
        hasPlos: data.plos?.length ?? 0,
        hasStudyPlan: data.studyPlan?.length ?? 0,
        hasCareerPaths: data.careerPaths?.length ?? 0,
      },
    };
  } catch {
    return { success: false, error: "ไม่สามารถแปลงข้อความเป็น JSON ได้ กรุณาตรวจสอบไวยากรณ์ของไฟล์" };
  }
}
