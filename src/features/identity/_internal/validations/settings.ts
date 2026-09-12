import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  host: z.string().trim().default(""),
  port: z.coerce.number().default(587),
  secure: z.boolean().default(false),
  user: z.string().trim().default(""),
  pass: z.string().trim().default(""),
  from: z.string().trim().default(""),
});

export const orgContentSchema = z.object({
  sloganTh: z.string().trim().max(255).optional().default(""),
  sloganEn: z.string().trim().max(255).optional().default(""),
  descriptionTh: z.string().trim().max(1000).optional().default(""),
  descriptionEn: z.string().trim().max(1000).optional().default(""),
  website: z.string().trim().max(255).optional().default(""),
  contactEmail: z.string().trim().max(255).optional().default(""),
  contactPhone: z.string().trim().max(50).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  facebook: z.string().trim().max(255).optional().default(""),
  line: z.string().trim().max(100).optional().default(""),
  officeHours: z.string().trim().max(255).optional().default(""),
  mapUrl: z.string().trim().max(1000).optional().default(""),
});

export const geminiSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  apiKey: z.string().trim().default(""),
  model: z.string().trim().default("gemini-2.0-flash"),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (val) => val === "" || val.startsWith("/") || /^https?:\/\//i.test(val),
      { message: "ต้องเป็น URL หรือ path ที่ถูกต้อง" }
    )
    .default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: smtpSettingsSchema.optional(),
  org: orgContentSchema.optional(),
  gemini: geminiSettingsSchema.optional(),
});

export const testSmtpSchema = z.object({
  to: z.string().trim().email(),
  host: z.string().trim().min(1),
  port: z.coerce.number().min(1).max(65535),
  secure: z.boolean().default(false),
  user: z.string().trim().min(1),
  pass: z.string().trim().default(""),
  from: z.string().trim().min(1),
});

export const testGeminiSchema = z.object({
  apiKey: z.string().trim().default(""),
  model: z.string().trim().default("gemini-2.0-flash"),
});

export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
export type OrgContentInput = z.infer<typeof orgContentSchema>;
export type GeminiSettingsInput = z.infer<typeof geminiSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type TestGeminiInput = z.infer<typeof testGeminiSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

