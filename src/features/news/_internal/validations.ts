import { z } from "zod";

export const createNewsCategorySchema = z.object({
  nameTh: z.string().trim().min(1).max(100),
  nameEn: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens"),
  color: z.string().trim().default("blue"),
});

export const createNewsArticleSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  titleTh: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().max(255).optional().nullable(),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens"),
  summaryTh: z.string().trim().max(1000).optional().nullable(),
  summaryEn: z.string().trim().max(1000).optional().nullable(),
  contentTh: z.string().trim().min(1),
  contentEn: z.string().trim().optional().nullable(),
  coverImageUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isPinned: z.boolean().default(false),
  pinnedOrder: z.number().int().default(0),
  publishedAt: z.string().optional().nullable(),
  expiredAt: z.string().optional().nullable(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export type CreateNewsCategoryInput = z.infer<typeof createNewsCategorySchema>;
export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
