import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Eye, Sparkles, BookOpen, Users, FileText, Building2, Pin } from "lucide-react";
import { listPublishedArticles } from "@/features/news/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { ConveyorHero } from "./_components/conveyor-hero";

export default async function PortalHomePage() {
  const locale = await getLocale();
  const articles = await listPublishedArticles(undefined, { limit: 6 });
  const featured = articles.filter((a) => a.isPinned).slice(0, 2);
  const recent = articles.slice(0, 6);

  return (
    <div className="space-y-14 pb-12">
      {/* 🌟 3D CONVEYOR HERO (Inspired by Etail 3D - Monks & Lay Students) */}
      <ConveyorHero locale={locale} />

      {/* Featured Highlights Grid (Pinned News) */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Pin className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {locale === "th" ? "ข่าวประชาสัมพันธ์เด่น" : "Featured Announcements"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === "th" ? "กิจกรรมและประกาศสำคัญประจำหลักสูตร" : "Important program updates and announcements"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-muted">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={locale === "th" ? item.titleTh : (item.titleEn ?? item.titleTh)}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={!item.coverImageUrl.includes("unsplash.com")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                        <Sparkles className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow">
                        <Pin className="w-3 h-3" />
                        {locale === "th" ? "ข่าวเด่น" : "Featured"}
                      </span>
                      {item.category && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur text-foreground shadow">
                          {locale === "th" ? item.category.nameTh : item.category.nameEn}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {locale === "th" ? item.titleTh : (item.titleEn ?? item.titleTh)}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {locale === "th" ? item.summaryTh : (item.summaryEn ?? item.summaryTh)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.publishedAt ? formatDate(new Date(item.publishedAt), locale) : "-"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-1 transition-transform">
                        <span>{locale === "th" ? "อ่านรายละเอียด" : "Read more"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </section>
      )}

      {/* 📰 LATEST NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {locale === "th" ? "ข่าวสารและกิจกรรมล่าสุด" : "Latest News & Events"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === "th" ? "ติดตามข่าวประชาสัมพันธ์ กิจกรรม และประกาศสำคัญของคณะ" : "Updates, announcements, and activities"}
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <span>{locale === "th" ? "ดูข่าวทั้งหมด" : "View all news"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-2xl bg-muted/20">
            <p className="text-muted-foreground">{locale === "th" ? "ยังไม่มีข่าวสารในขณะนี้" : "No news articles found."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group rounded-xl overflow-hidden border border-border/70 bg-card hover:border-primary/50 transition-all duration-200 flex flex-col shadow-sm hover:shadow-md"
              >
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt={locale === "th" ? article.titleTh : (article.titleEn ?? article.titleTh)}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={!article.coverImageUrl.includes("unsplash.com")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground">
                      <FileText className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  {article.category && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-background/90 backdrop-blur text-foreground shadow-sm">
                      {locale === "th" ? article.category.nameTh : article.category.nameEn}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-2">
                      {locale === "th" ? article.titleTh : (article.titleEn ?? article.titleTh)}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {locale === "th" ? article.summaryTh : (article.summaryEn ?? article.summaryTh)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.viewCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 🎓 FACULTY QUICK SERVICES / SECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-card via-background to-card p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {locale === "th" ? "บริการและพันธกิจของหลักสูตร" : "Program Services & Missions"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {locale === "th" ? "เข้าถึงระบบสารสนเทศและการบริการต่างๆ อย่างสะดวกรวดเร็ว" : "Fast and accessible academic services"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                {locale === "th" ? "หลักสูตรการศึกษา" : "Academic Programs"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "th"
                  ? "หลักสูตรปริญญาตรี โท และเอก ออกแบบตามความต้องการของภาคอุตสาหกรรม"
                  : "Undergraduate and graduate degrees aligned with industry needs."}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                {locale === "th" ? "ทำเนียบคณาจารย์" : "Faculty & Staff"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "th"
                  ? "คณาจารย์ผู้ทรงคุณวุฒิและบุคลากรผู้เชี่ยวชาญพร้อมให้คำปรึกษา"
                  : "Qualified academic staff and research advisors."}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                {locale === "th" ? "ระบบสารบรรณอิเล็กทรอนิกส์" : "E-Document System"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "th"
                  ? "ยื่นคำร้อง ขออนุมัติโครงการ และติดตามสถานะเอกสารแบบไร้กระดาษ"
                  : "Paperless workflow for proposal submissions and approvals."}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                {locale === "th" ? "ระบบจองห้องและยานพาหนะ" : "Resource Booking"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "th"
                  ? "ตรวจสอบตารางความว่างและจองห้องประชุมหรือรถราชการออนไลน์"
                  : "Real-time room and vehicle scheduling system."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
