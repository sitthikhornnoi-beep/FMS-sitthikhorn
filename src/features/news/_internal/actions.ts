"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, requireSession, hasPermission } from "@/features/identity/server";
import { errors, FORBIDDEN_DIGEST } from "@/shared/lib/errors";
import { translateNewsWithGemini, type NewsTranslationOutput } from "@/shared/lib/infra/gemini";
import { NEWS_P } from "../permissions";
import {
  createNewsArticleSchema,
  updateNewsArticleSchema,
  createNewsCategorySchema,
  translateNewsSchema,
} from "./validations";
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  togglePinArticle,
  createNewsCategory,
  listNewsCategories,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./services";

export async function createNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function updateNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function deleteNewsArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/");
  });
}

export async function togglePinArticleAction(id: string, isPinned: boolean): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await togglePinArticle(ctx.tenantId, id, isPinned);
    revalidatePath("/news");
    revalidatePath("/");
  });
}

export async function createNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}

export async function getNewsCategoriesAction(): Promise<ActionResult<NewsCategoryDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listNewsCategories(ctx.tenantId);
  });
}

export async function translateNewsWithGeminiAction(input: unknown): Promise<ActionResult<NewsTranslationOutput>> {
  return runAction(async () => {
    const ctx = await requireSession();
    if (!hasPermission(ctx, NEWS_P.newsCreate) && !hasPermission(ctx, NEWS_P.newsManage)) {
      const err = errors.forbidden(`forbidden:${NEWS_P.newsCreate}`);
      err.digest = FORBIDDEN_DIGEST;
      throw err;
    }
    const parsed = translateNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    return await translateNewsWithGemini(parsed, ctx.tenantId);
  });
}
