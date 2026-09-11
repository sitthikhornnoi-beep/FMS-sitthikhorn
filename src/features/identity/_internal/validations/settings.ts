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

export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
