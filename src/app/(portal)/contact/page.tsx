import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe2,
  Share2,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText,
  Calendar,
  Users,
  Compass,
} from "lucide-react";
import { getPortalTenantSettings } from "@/features/identity/server";
import { getLocale } from "@/shared/lib/i18n/server";

export const revalidate = 60;

export default async function ContactPublicPage() {
  const locale = await getLocale();
  const tenant = await getPortalTenantSettings();

  const brandName = locale === "th"
    ? (tenant?.nameTh || "วิทยาลัยสงฆ์พุทธโสธร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย")
    : (tenant?.nameEn || "MCU Phutthasothon Buddhist College");

  const brandSub = locale === "th"
    ? (tenant?.org?.sloganTh || "หลักสูตรรัฐศาสตรบัณฑิต (ร.บ.)")
    : (tenant?.org?.sloganEn || "Bachelor of Political Science Program");

  const contactPhone = tenant?.org?.contactPhone || "089 5336056";
  const contactEmail = tenant?.org?.contactEmail || "sitthikhorn.pha@mcu.ac.th";
  const address = tenant?.org?.address || "158 ถนนศรีโสธร ตำบลหน้าเมือง อำเภอเมืองฉะเชิงเทรา จังหวัดฉะเชิงเทรา 24000";
  const officeHours = tenant?.org?.officeHours || "จันทร์ - ศุกร์ 08:30 - 16:30 น.";
  const website = tenant?.org?.website || "https://fms.example.ac.th";
  const facebook = tenant?.org?.facebook || "https://facebook.com/mcu";
  const line = tenant?.org?.line || "@mcu";
  const mapUrl = tenant?.org?.mapUrl || "https://maps.google.com/?q=13.6841,101.0743";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          {locale === "th" ? "หน้าแรก" : "Home"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="text-foreground font-semibold" aria-current="page">
          {locale === "th" ? "การติดต่อ" : "Contact"}
        </span>
      </nav>

      {/* Page Hero Header */}
      <div className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/10 p-8 sm:p-12 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Phone className="w-3.5 h-3.5" />
            <span>{locale === "th" ? "ศูนย์ประสานงานและการติดต่อ" : "Contact & Communications Center"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            {locale === "th" ? "ช่องทางการติดต่อสำนักงาน" : "Contact Program Office"}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {locale === "th"
              ? `ยินดีต้อนรับสู่ศูนย์บริการข้อมูลและการติดต่อประสานงาน ${brandName} (${brandSub}) พร้อมให้บริการข้อมูลหลักสูตร การรับสมัครนิสิตใหม่ การบริการวิชาการ และงานบริหารทั่วไป`
              : `Welcome to the official communication center for ${brandName} (${brandSub}). We are here to assist you with academic inquiries, admissions, and student services.`}
          </p>
        </div>
      </div>

      {/* Primary 4 Contact Channels Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Phone */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "th" ? "เบอร์โทรศัพท์ติดต่อ" : "Phone Inquiries"}
              </span>
              <p className="text-lg font-bold text-foreground mt-1 tracking-tight">
                {contactPhone}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === "th"
                ? "ติดต่อสอบถามข้อมูลหลักสูตร การเรียนการสอน และงานธุรการ"
                : "Call our program administration during operating hours"}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60">
            <a
              href={`tel:${contactPhone}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>{locale === "th" ? "โทรออกทันที" : "Call immediately"}</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Card 2: Email */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "th" ? "อีเมลติดต่อทางการ" : "Official Email"}
              </span>
              <p className="text-sm font-bold text-foreground mt-1 break-all">
                {contactEmail}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === "th"
                ? "ส่งหนังสือราชการ ข้อสอบถาม หรือเอกสารหลักสูตร"
                : "Submit formal letters, curriculum questions, or document requests"}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>{locale === "th" ? "ส่งอีเมลถึงเรา" : "Send email"}</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Card 3: Office Hours */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "th" ? "วันและเวลาทำการ" : "Office Hours"}
              </span>
              <p className="text-base font-bold text-foreground mt-1">
                {officeHours}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === "th"
                ? "เปิดให้บริการในวันและเวลาราชการ (เว้นวันหยุดนักขัตฤกษ์)"
                : "Available during regular academic working days (closed on public holidays)"}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {locale === "th" ? "พร้อมให้บริการ" : "Open for service"}
            </span>
          </div>
        </div>

        {/* Card 4: Location */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {locale === "th" ? "ที่ตั้งสำนักงาน" : "Office Location"}
              </span>
              <p className="text-xs font-medium text-foreground mt-1 line-clamp-2 leading-relaxed">
                {address}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {locale === "th" ? "ใกล้วัดโสธรวรารามวรวิหาร เมืองฉะเชิงเทรา" : "Near Wat Sothon Wararam Worawihan"}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>{locale === "th" ? "เปิดแผนที่นำทาง" : "Open Google Maps"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Map & Directions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left 2 Cols: Embedded Google Map */}
        <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-border/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {locale === "th" ? "แผนที่และการเดินทาง" : "Location Map & Directions"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {locale === "th" ? "พิกัด: 13.6841, 101.0743 (วิทยาลัยสงฆ์พุทธโสธร)" : "Coordinates: 13.6841, 101.0743"}
                </p>
              </div>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
            >
              <span>{locale === "th" ? "เปิดในแอปแผนที่" : "Open Map App"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex-1 w-full min-h-[350px] relative bg-muted/40">
            <iframe
              title="MCU Phutthasothon Location Map"
              src="https://maps.google.com/maps?q=13.6841,101.0743&hl=th&z=15&output=embed"
              className="w-full h-full min-h-[380px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right 1 Col: Social & Digital Channels */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-foreground font-bold text-base">
              <Share2 className="w-4 h-4 text-primary" />
              <span>{locale === "th" ? "สื่อสังคมออนไลน์" : "Online & Social Channels"}</span>
            </div>
            <div className="space-y-3">
              {/* Facebook */}
              {facebook && (
                <a
                  href={facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20 dark:hover:border-blue-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      f
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                        Facebook Page
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {locale === "th" ? "ติดตามข่าวสารและกิจกรรม" : "Follow updates"}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </a>
              )}

              {/* LINE */}
              {line && (
                <a
                  href={line.startsWith("http") ? line : `https://line.me/ti/p/~${line.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:border-emerald-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                      LINE
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                        LINE Official Account
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {line}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </a>
              )}

              {/* Website */}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {locale === "th" ? "เว็บไซต์ทางการ" : "Official Website"}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                        {website.replace(/^https?:\/\//, "")}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Services Navigation */}
          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{locale === "th" ? "บริการที่เกี่ยวข้อง" : "Related Services"}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/programs"
                className="p-2.5 rounded-xl border border-border/60 bg-background/80 hover:bg-card hover:border-primary/30 transition-all flex items-center gap-2 text-foreground font-medium"
              >
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>{locale === "th" ? "หลักสูตร" : "Curriculum"}</span>
              </Link>
              <Link
                href="/personnel"
                className="p-2.5 rounded-xl border border-border/60 bg-background/80 hover:bg-card hover:border-primary/30 transition-all flex items-center gap-2 text-foreground font-medium"
              >
                <Users className="w-4 h-4 text-primary" />
                <span>{locale === "th" ? "คณาจารย์" : "Faculty"}</span>
              </Link>
              <Link
                href="/booking"
                className="p-2.5 rounded-xl border border-border/60 bg-background/80 hover:bg-card hover:border-primary/30 transition-all flex items-center gap-2 text-foreground font-medium"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>{locale === "th" ? "จองห้อง" : "Booking"}</span>
              </Link>
              <Link
                href="/documents"
                className="p-2.5 rounded-xl border border-border/60 bg-background/80 hover:bg-card hover:border-primary/30 transition-all flex items-center gap-2 text-foreground font-medium"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>{locale === "th" ? "สารบรรณ" : "Documents"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
