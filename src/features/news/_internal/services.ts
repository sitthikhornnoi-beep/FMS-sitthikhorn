import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import type { CreateNewsArticleInput, UpdateNewsArticleInput, CreateNewsCategoryInput } from "./validations";

export interface NewsCategoryDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  color: string;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  categoryId: string | null;
  category?: NewsCategoryDto | null;
  titleTh: string;
  titleEn: string | null;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string | null;
  coverImageUrl: string | null;
  status: string;
  isPinned: boolean;
  pinnedOrder: number;
  publishedAt: string | null;
  expiredAt: string | null;
  viewCount: number;
  authorId: string | null;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getDefaultTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true }, select: { id: true } });
  return tenant?.id ?? "";
}

export async function listNewsCategories(tenantId?: string): Promise<NewsCategoryDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const categories = await prisma.newsCategory.findMany({
    where: { tenantId: tId },
    orderBy: { nameTh: "asc" },
  });
  return categories.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    color: c.color,
  }));
}

export async function createNewsCategory(tenantId: string, input: CreateNewsCategoryInput): Promise<NewsCategoryDto> {
  const cat = await prisma.newsCategory.create({
    data: {
      tenantId,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug.toLowerCase(),
      color: input.color,
    },
  });
  return {
    id: cat.id,
    tenantId: cat.tenantId,
    nameTh: cat.nameTh,
    nameEn: cat.nameEn,
    slug: cat.slug,
    color: cat.color,
  };
}

export async function listPublishedArticles(
  tenantId?: string,
  options?: { categorySlug?: string; search?: string; limit?: number; featuredOnly?: boolean }
): Promise<NewsArticleDto[]> {
  const tId = tenantId || (await getDefaultTenantId());
  const now = new Date();
  const where: Prisma.NewsArticleWhereInput = {
    tenantId: tId,
    status: "PUBLISHED",
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: now } },
    ],
    AND: [
      {
        OR: [
          { expiredAt: null },
          { expiredAt: { gt: now } },
        ],
      },
    ],
  };

  if (options?.featuredOnly) {
    where.isPinned = true;
  }

  if (options?.categorySlug) {
    where.category = { slug: options.categorySlug };
  }

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { titleTh: { contains: s, mode: "insensitive" } },
      { titleEn: { contains: s, mode: "insensitive" } },
      { summaryTh: { contains: s, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: {
      category: true,
      author: { select: { name: true } },
    },
    orderBy: [
      { isPinned: "desc" },
      { pinnedOrder: "asc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: options?.limit ?? 50,
  });

  return articles.map(mapArticleToDto);
}

export async function getArticleBySlug(slug: string, tenantId?: string, incrementView = false): Promise<NewsArticleDto | null> {
  const tId = tenantId || (await getDefaultTenantId());
  if (incrementView) {
    await prisma.newsArticle.updateMany({
      where: { tenantId: tId, slug },
      data: { viewCount: { increment: 1 } },
    });
  }

  const article = await prisma.newsArticle.findFirst({
    where: { tenantId: tId, slug },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  return article ? mapArticleToDto(article) : null;
}

export async function listAdminArticles(tenantId: string): Promise<NewsArticleDto[]> {
  const articles = await prisma.newsArticle.findMany({
    where: { tenantId },
    include: {
      category: true,
      author: { select: { name: true } },
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  return articles.map(mapArticleToDto);
}

export async function createNewsArticle(
  tenantId: string,
  authorId: string | null,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      authorId,
      categoryId: input.categoryId || null,
      titleTh: input.titleTh,
      titleEn: input.titleEn || null,
      slug: input.slug.toLowerCase(),
      summaryTh: input.summaryTh || null,
      summaryEn: input.summaryEn || null,
      contentTh: input.contentTh,
      contentEn: input.contentEn || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      isPinned: input.isPinned,
      pinnedOrder: input.pinnedOrder,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : (input.status === "PUBLISHED" ? new Date() : null),
      expiredAt: input.expiredAt ? new Date(input.expiredAt) : null,
    },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  return mapArticleToDto(created);
}

export async function updateNewsArticle(
  tenantId: string,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      categoryId: input.categoryId || null,
      titleTh: input.titleTh,
      titleEn: input.titleEn || null,
      slug: input.slug.toLowerCase(),
      summaryTh: input.summaryTh || null,
      summaryEn: input.summaryEn || null,
      contentTh: input.contentTh,
      contentEn: input.contentEn || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      isPinned: input.isPinned,
      pinnedOrder: input.pinnedOrder,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      expiredAt: input.expiredAt ? new Date(input.expiredAt) : null,
    },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  return mapArticleToDto(updated);
}

export async function togglePinArticle(tenantId: string, id: string, isPinned: boolean): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { isPinned },
  });
}

export async function deleteNewsArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}

type ArticleWithRelations = Prisma.NewsArticleGetPayload<{
  include: {
    category: true;
    author: { select: { name: true } };
  };
}>;

function mapArticleToDto(a: ArticleWithRelations): NewsArticleDto {
  return {
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    category: a.category
      ? {
          id: a.category.id,
          tenantId: a.category.tenantId,
          nameTh: a.category.nameTh,
          nameEn: a.category.nameEn,
          slug: a.category.slug,
          color: a.category.color,
        }
      : null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status,
    isPinned: a.isPinned,
    pinnedOrder: a.pinnedOrder,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    expiredAt: a.expiredAt ? a.expiredAt.toISOString() : null,
    viewCount: a.viewCount,
    authorId: a.authorId,
    authorName: a.author?.name ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
