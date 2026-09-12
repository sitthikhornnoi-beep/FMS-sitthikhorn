import { z } from "zod";

export const degreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORATE"]);
export type DegreeLevelType = z.infer<typeof degreeLevelEnum>;

export const ploSchema = z.object({
  code: z.string().trim().min(1).max(50),
  titleTh: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().max(255).optional().nullable(),
  description: z.string().trim().optional().nullable(),
});

export const courseItemSchema = z.object({
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().max(255).optional().nullable(),
  credits: z.number().int().min(1).max(20),
  type: z.string().trim().max(100).optional().nullable(),
});

export const semesterPlanSchema = z.object({
  year: z.number().int().min(1).max(8),
  semester: z.number().int().min(1).max(3),
  courses: z.array(courseItemSchema),
});

export const courseGroupSchema = z.object({
  groupName: z.string().trim().min(1).max(255),
  credits: z.number().int().min(0).max(300),
  description: z.string().trim().optional().nullable(),
});

export const createProgramSchema = z.object({
  departmentId: z.string().uuid().optional().nullable(),
  degreeLevel: degreeLevelEnum.default("BACHELOR"),
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  degreeTh: z.string().trim().min(1).max(255),
  degreeEn: z.string().trim().min(1).max(255),
  degreeShortTh: z.string().trim().min(1).max(100),
  degreeShortEn: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  curriculumYear: z.number().int().min(2500).max(2600),
  totalCredits: z.number().int().min(1).max(400).default(120),
  studyDuration: z.string().trim().max(100).default("4 ปี"),
  tuitionFee: z.string().trim().max(255).optional().nullable(),
  descriptionTh: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().optional().nullable(),
  philosophyTh: z.string().trim().optional().nullable(),
  philosophyEn: z.string().trim().optional().nullable(),
  careerPaths: z.array(z.string()).optional().default([]),
  plos: z.array(ploSchema).optional().default([]),
  studyPlan: z.array(semesterPlanSchema).optional().default([]),
  courseStructure: z.array(courseGroupSchema).optional().default([]),
  pdfUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  imageUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateProgramSchema = createProgramSchema.extend({
  id: z.string().uuid(),
});

export const updateProgramStructureSchema = z.object({
  id: z.string().uuid(),
  careerPaths: z.array(z.string()).optional(),
  plos: z.array(ploSchema).optional(),
  studyPlan: z.array(semesterPlanSchema).optional(),
  courseStructure: z.array(courseGroupSchema).optional(),
});

export type PloInput = z.infer<typeof ploSchema>;
export type CourseItemInput = z.infer<typeof courseItemSchema>;
export type SemesterPlanInput = z.infer<typeof semesterPlanSchema>;
export type CourseGroupInput = z.infer<typeof courseGroupSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type UpdateProgramStructureInput = z.infer<typeof updateProgramStructureSchema>;

export const departmentTypeEnum = z.enum(["ACADEMIC", "SUPPORT", "EXECUTIVE"]);
export type DepartmentType = z.infer<typeof departmentTypeEnum>;

export const createCurriculumDeptSchema = z.object({
  code: z.string().trim().min(1).max(50),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  type: departmentTypeEnum.default("ACADEMIC"),
  descriptionTh: z.string().trim().optional().nullable().or(z.literal("")),
  descriptionEn: z.string().trim().optional().nullable().or(z.literal("")),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCurriculumDeptSchema = createCurriculumDeptSchema.extend({
  id: z.string().uuid(),
});

export type CreateCurriculumDeptInput = z.infer<typeof createCurriculumDeptSchema>;
export type UpdateCurriculumDeptInput = z.infer<typeof updateCurriculumDeptSchema>;
