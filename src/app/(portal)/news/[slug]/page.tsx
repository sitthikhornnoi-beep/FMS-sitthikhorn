import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, User, Pin, Tag } from "lucide-react";
import { getArticleBySlug } from "@/features/news/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  // Fetch article and increment view counter
  const article = await getArticleBySlug(slug, undefined, true);
  if (!article) {
    notFound();
  }

  const title = locale === "th" ? article.titleTh : (article.titleEn ?? article.titleTh);
  const summary = locale === "th" ? article.summaryTh : (article.summaryEn ?? article.summaryTh);
  const content = locale === "th" ? article.contentTh : (article.contentEn ?? article.contentTh);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button & Breadcrumbs */}
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "th" ? "ย้อนกลับไปหน้ารวมข่าวสาร" : "Back to all news"}</span>
        </Link>
      </div>

      {/* Article Header Metadata */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {article.isPinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
              <Pin className="w-3 h-3" />
              {locale === "th" ? "ข่าวเด่น" : "Featured"}
            </span>
          )}
          {article.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Tag className="w-3 h-3" />
              {locale === "th" ? article.category.nameTh : article.category.nameEn}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {title}
        </h1>

        {/* Sub-meta: Date, Author, Views */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground py-3 border-y border-border/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}</span>
          </div>

          {article.authorName && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{article.authorName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span>{article.viewCount} {locale === "th" ? "ครั้ง" : "views"}</span>
          </div>
        </div>
      </header>

      {/* Cover Image Banner */}
      {article.coverImageUrl && (
        <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm max-h-[480px] w-full bg-muted">
          <img
            src={article.coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Summary Highlight */}
      {summary && (
        <div className="p-4 sm:p-6 rounded-xl bg-muted/40 border-l-4 border-primary text-foreground text-sm sm:text-base leading-relaxed font-medium italic">
          {summary}
        </div>
      )}

      {/* Full Content Body */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4 text-sm sm:text-base whitespace-pre-line">
        {content}
      </div>

      {/* Article Footer & Action */}
      <footer className="pt-8 border-t border-border flex items-center justify-between">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{locale === "th" ? "ดูข่าวสารอื่น ๆ" : "Explore more news"}</span>
        </Link>
      </footer>
    </article>
  );
}
