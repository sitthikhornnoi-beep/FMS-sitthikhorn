import Link from "next/link";
import { Search, Calendar, Eye, FileText, Pin } from "lucide-react";
import { listPublishedArticles, listNewsCategories } from "@/features/news/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";

interface NewsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function PublicNewsPage({ searchParams }: NewsPageProps) {
  const { category, search } = await searchParams;
  const locale = await getLocale();

  const [categories, articles] = await Promise.all([
    listNewsCategories(),
    listPublishedArticles(undefined, { categorySlug: category, search }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {locale === "th" ? "ข่าวสารและกิจกรรม" : "News & Announcements"}
        </h1>
        <p className="text-base text-muted-foreground">
          {locale === "th"
            ? "ศูนย์รวมข่าวประชาสัมพันธ์ กิจกรรม และประกาศสำคัญของคณะวิทยาการจัดการ"
            : "All announcements, news updates, and press releases from the faculty"}
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/news"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {locale === "th" ? "ทั้งหมด" : "All Categories"}
          </Link>
          {categories.map((cat) => {
            const isSelected = category === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/news?category=${cat.slug}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {locale === "th" ? cat.nameTh : cat.nameEn}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/news" className="relative w-full md:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder={locale === "th" ? "ค้นหาข่าวสาร..." : "Search news..."}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-card/40 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground opacity-40" />
          <p className="text-base font-medium text-foreground">
            {locale === "th" ? "ไม่พบข่าวสารที่ค้นหา" : "No news articles found"}
          </p>
          <p className="text-xs text-muted-foreground">
            {locale === "th" ? "ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น" : "Try adjusting your search criteria"}
          </p>
          {category || search ? (
            <Link href="/news" className="inline-block mt-3 text-xs text-primary font-semibold hover:underline">
              {locale === "th" ? "ล้างตัวกรองทั้งหมด" : "Clear all filters"}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group rounded-2xl overflow-hidden border border-border/70 bg-card hover:border-primary/50 transition-all duration-200 flex flex-col shadow-sm hover:shadow-lg"
            >
              <div className="relative h-52 w-full bg-muted overflow-hidden">
                {article.coverImageUrl ? (
                  <img
                    src={article.coverImageUrl}
                    alt={locale === "th" ? article.titleTh : (article.titleEn ?? article.titleTh)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground">
                    <FileText className="w-10 h-10 opacity-30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {article.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow">
                      <Pin className="w-3 h-3" />
                      {locale === "th" ? "ปักหมุด" : "Pinned"}
                    </span>
                  )}
                  {article.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background/90 backdrop-blur text-foreground shadow-sm">
                      {locale === "th" ? article.category.nameTh : article.category.nameEn}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h2 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {locale === "th" ? article.titleTh : (article.titleEn ?? article.titleTh)}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {locale === "th" ? article.summaryTh : (article.summaryEn ?? article.summaryTh)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{article.viewCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
