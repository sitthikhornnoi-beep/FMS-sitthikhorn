import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Coins,
  FileDown,
  Building,
  Award,
  Briefcase,
  Layers,
  CheckCircle2,
  Calendar,
  Users,
} from "lucide-react";
import { getProgramBySlug } from "@/features/curriculum/server";
import { getLocale } from "@/shared/lib/i18n/server";

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  const program = await getProgramBySlug(slug);
  if (!program) {
    notFound();
  }

  const getDegreeLevelName = () => {
    switch (program.degreeLevel) {
      case "BACHELOR":
        return locale === "th" ? "ระดับปริญญาตรี (Undergraduate)" : "Bachelor's Degree";
      case "MASTER":
        return locale === "th" ? "ระดับปริญญาโท (Graduate)" : "Master's Degree";
      case "DOCTORATE":
        return locale === "th" ? "ระดับปริญญาเอก (Doctorate)" : "Doctorate Degree";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === "th" ? "ย้อนกลับไปหน้ารวมหลักสูตร" : "Back to All Programs"}</span>
        </Link>
      </div>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
        {/* Banner Background Image (if available) */}
        {program.imageUrl && (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <Image
              src={program.imageUrl}
              alt={program.nameTh}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/75 to-transparent" />
          </div>
        )}

        <div className={`p-6 sm:p-10 space-y-6 ${program.imageUrl ? "-mt-24 sm:-mt-32 relative z-10" : ""}`}>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-xs">
              {getDegreeLevelName()}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-muted text-foreground border border-border">
              {program.code}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted/80 text-muted-foreground">
              {locale === "th" ? `หลักสูตรปรับปรุง พ.ศ. ${program.curriculumYear}` : `Curriculum ${program.curriculumYear}`}
            </span>

            {program.departmentNameTh && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                <span>{locale === "th" ? program.departmentNameTh : program.departmentNameEn}</span>
              </span>
            )}
          </div>

          {/* Program Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {locale === "th" ? program.nameTh : program.nameEn}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              {locale === "th" ? program.nameEn : program.nameTh}
            </p>
          </div>

          {/* Degree Titles Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "th" ? "ชื่อปริญญาเต็ม" : "Full Degree Title"}
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {locale === "th" ? program.degreeTh : program.degreeEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {locale === "th" ? program.degreeEn : program.degreeTh}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "th" ? "ชื่อย่อปริญญา" : "Abbreviated Degree"}
              </span>
              <p className="text-xs sm:text-sm font-bold text-primary">
                {program.degreeShortTh} • {program.degreeShortEn}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{locale === "th" ? "ระยะเวลาศึกษา" : "Duration"}</span>
                <span className="text-xs sm:text-sm font-bold text-foreground">{program.studyDuration}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{locale === "th" ? "จำนวนหน่วยกิต" : "Total Credits"}</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-foreground">{program.totalCredits} นก.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{locale === "th" ? "ค่าธรรมเนียม" : "Tuition Fee"}</span>
                <span className="text-xs sm:text-sm font-bold text-foreground truncate block">{program.tuitionFee || "ตามระเบียบ มข."}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">{locale === "th" ? "สถานะการรับสมัคร" : "Status"}</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600">
                  {program.isActive ? (locale === "th" ? "เปิดรับสมัคร" : "Open") : (locale === "th" ? "ปิดรับสมัคร" : "Closed")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row: Download TQF2 Button */}
          {program.pdfUrl && (
            <div className="pt-2">
              <a
                href={program.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-muted hover:bg-accent text-foreground border border-border transition-all shadow-2xs"
              >
                <FileDown className="w-4 h-4 text-primary" />
                <span>{locale === "th" ? "ดาวน์โหลดเล่มหลักสูตร มคอ.2 (PDF)" : "Download Curriculum Document (TQF2)"}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: Philosophy & Description */}
      {(program.philosophyTh || program.descriptionTh) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {locale === "th" ? "ปรัชญาและความสำคัญของหลักสูตร" : "Philosophy & Program Objectives"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {program.philosophyTh && (
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {locale === "th" ? "ปรัชญาของหลักสูตร" : "Curriculum Philosophy"}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {locale === "th" ? program.philosophyTh : (program.philosophyEn || program.philosophyTh)}
                </p>
              </div>
            )}

            {program.descriptionTh && (
              <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {locale === "th" ? "ความสำคัญและจุดเด่น" : "Program Highlights"}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {locale === "th" ? program.descriptionTh : (program.descriptionEn || program.descriptionTh)}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: PLOs (Program Learning Outcomes) */}
      {program.plos.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {locale === "th" ? "ผลลัพธ์การเรียนรู้ของหลักสูตร (PLOs)" : "Program Learning Outcomes (PLOs)"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "th" ? "ความรู้ ทักษะ และสมรรถนะที่ผู้เรียนจะได้รับเมื่อสำเร็จการศึกษา" : "Expected competencies upon program graduation"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {program.plos.map((plo, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border flex items-start gap-3.5 hover:border-primary/40 transition-colors"
              >
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary shrink-0">
                  {plo.code}
                </span>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                    {locale === "th" ? plo.titleTh : (plo.titleEn || plo.titleTh)}
                  </p>
                  {plo.titleEn && locale === "th" && (
                    <p className="text-[11px] text-muted-foreground">
                      {plo.titleEn}
                    </p>
                  )}
                  {plo.description && (
                    <p className="text-xs text-muted-foreground pt-1">
                      {plo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Course Structure & Credit Breakdown */}
      {program.courseStructure.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {locale === "th" ? "โครงสร้างหลักสูตรและสัดส่วนหน่วยกิต" : "Curriculum Structure & Credit Distribution"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "th" ? `รวมทั้งสิ้น ${program.totalCredits} หน่วยกิต` : `Total ${program.totalCredits} credits`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.courseStructure.map((group, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                    {group.groupName}
                  </h4>
                  {group.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                  <span className="text-[11px] text-muted-foreground">{locale === "th" ? "หน่วยกิต" : "Credits"}</span>
                  <span className="text-base font-bold font-mono text-primary">
                    {group.credits} <span className="text-xs font-normal text-muted-foreground">{locale === "th" ? "นก." : "credits"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 4: Study Plan (Semester by Semester) */}
      {program.studyPlan.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {locale === "th" ? "แผนการศึกษาตามชั้นปีและภาคเรียน" : "Semester-by-Semester Study Plan"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "th" ? "ตัวอย่างแผนการลงทะเบียนเรียนในแต่ละภาคการศึกษา" : "Sample course enrollment sequence"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {program.studyPlan.map((sem, sIdx) => {
              const semCredits = sem.courses.reduce((acc, c) => acc + (c.credits || 0), 0);
              return (
                <div key={sIdx} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {locale === "th"
                        ? `ชั้นปีที่ ${sem.year} ภาคการศึกษาที่ ${sem.semester}`
                        : `Year ${sem.year}, Semester ${sem.semester}`}
                    </span>
                    <span className="text-xs font-mono font-semibold text-primary">
                      {semCredits} {locale === "th" ? "นก." : "credits"}
                    </span>
                  </div>

                  <div className="divide-y divide-border/60">
                    {sem.courses.map((course, cIdx) => (
                      <div key={cIdx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {course.code}
                            </span>
                            {course.type && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                {course.type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground font-medium truncate">
                            {locale === "th" ? course.nameTh : (course.nameEn || course.nameTh)}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
                          {course.credits} {locale === "th" ? "นก." : "cr."}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 5: Career Opportunities */}
      {program.careerPaths.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {locale === "th" ? "โอกาสทางวิชาชีพและสายงานหลังสำเร็จการศึกษา" : "Career Pathways & Professional Opportunities"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "th" ? "ตำแหน่งงานและสายอาชีพที่สามารถประกอบได้" : "Target career roles for graduates"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {program.careerPaths.map((career, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-border flex items-center gap-3 shadow-2xs hover:border-primary/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {career}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: Department & Faculty Contact */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-muted/60 via-muted/30 to-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            {locale === "th" ? "สนใจสมัครเข้าศึกษาหรือสอบถามข้อมูลหลักสูตร?" : "Interested in Enrolling or Need Advice?"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {locale === "th"
              ? `ติดต่อคณาจารย์และเจ้าหน้าที่ประจำ${program.departmentNameTh || "หลักสูตรรัฐศาสตรบัณฑิต"} เพื่อขอคำปรึกษาด้านการศึกษาและการรับเข้าศึกษา`
              : "Contact academic advisors and department staff for educational guidance and admission inquiries."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/personnel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-2xs"
          >
            <Users className="w-4 h-4" />
            <span>{locale === "th" ? "ทำเนียบคณาจารย์ผู้สอน" : "Faculty Members"}</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-card border border-border hover:bg-accent text-foreground transition-all"
          >
            <span>{locale === "th" ? "กลับสู่หน้าหลักคณะ" : "Faculty Homepage"}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
