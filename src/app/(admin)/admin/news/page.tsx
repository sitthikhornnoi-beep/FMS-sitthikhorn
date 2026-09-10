import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listAdminArticles, listNewsCategories } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function AdminNewsPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const [initialArticles, categories] = await Promise.all([
    listAdminArticles(ctx.tenantId),
    listNewsCategories(ctx.tenantId),
  ]);

  return (
    <NewsClient
      initialArticles={initialArticles}
      initialCategories={categories}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
    />
  );
}
