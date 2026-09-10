import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z.string().trim().min(1).max(50).regex(/^[A-Za-z0-9_-]+$/, "Code must be alphanumeric"),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  descriptionTh: z.string().trim().max(1000).optional().nullable(),
  descriptionEn: z.string().trim().max(1000).optional().nullable(),
  type: z.enum(["ACADEMIC", "SUPPORT", "EXECUTIVE"]).default("ACADEMIC"),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const createStaffProfileSchema = z.object({
  departmentId: z.string().uuid().optional().nullable(),
  academicTitleTh: z.string().trim().max(50).optional().nullable(),
  academicTitleEn: z.string().trim().max(50).optional().nullable(),
  firstNameTh: z.string().trim().min(1).max(100),
  lastNameTh: z.string().trim().min(1).max(100),
  firstNameEn: z.string().trim().max(100).optional().nullable(),
  lastNameEn: z.string().trim().max(100).optional().nullable(),
  positionTh: z.string().trim().max(150).optional().nullable(),
  positionEn: z.string().trim().max(150).optional().nullable(),
  staffType: z.enum(["ACADEMIC", "SUPPORT", "EXECUTIVE"]).default("ACADEMIC"),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(50).optional().nullable(),
  roomNumber: z.string().trim().max(50).optional().nullable(),
  avatarUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  education: z.array(z.string()).optional().default([]),
  researchInterests: z.array(z.string()).optional().default([]),
  scopusUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  scholarUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  websiteUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  isExecutive: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateStaffProfileSchema = createStaffProfileSchema.extend({
  id: z.string().uuid(),
});

export const createStaffPublicationSchema = z.object({
  staffId: z.string().uuid(),
  title: z.string().trim().min(1).max(500),
  year: z.number().int().min(1950).max(2100),
  journalName: z.string().trim().max(300).optional().nullable(),
  doiUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  authors: z.string().trim().max(500).optional().nullable(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateStaffProfileInput = z.infer<typeof createStaffProfileSchema>;
export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;
export type CreateStaffPublicationInput = z.infer<typeof createStaffPublicationSchema>;
