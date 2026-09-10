"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Newspaper, Users, BookOpen, LogIn, LayoutDashboard, Calendar, FileText } from "lucide-react";
import { useAppSession } from "@/hooks/use-session";
import { useLocale } from "@/shared/lib/i18n/client";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const { status, user } = useAppSession();
  const isLoggedIn = status === "authenticated" && !!user;

  const navLinks = [
    { href: "/", label: locale === "th" ? "หน้าแรก" : "Home", icon: GraduationCap },
    { href: "/news", label: locale === "th" ? "ข่าวสารและกิจกรรม" : "News & Events", icon: Newspaper },
    { href: "/personnel", label: locale === "th" ? "คณาจารย์และบุคลากร" : "Faculty & Staff", icon: Users },
    { href: "/booking", label: locale === "th" ? "จองห้องและยานพาหนะ" : "Booking", icon: Calendar },
    { href: "/programs", label: locale === "th" ? "หลักสูตร" : "Curriculum", icon: BookOpen },
    { href: "/documents", label: locale === "th" ? "สารบรรณและประกาศ" : "E-Documents", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Accessibility / Faculty Bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Faculty Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg tracking-tight leading-none text-foreground group-hover:text-primary transition-colors">
                {locale === "th" ? "หลักสูตรรัฐศาสตรบัณฑิต" : "Bachelor of Political Science Program"}
              </div>
              <div className="text-xs text-muted-foreground leading-none mt-1">
                {locale === "th" ? "ระบบบริการข้อมูลและสารสนเทศหลักสูตร" : "Academic Program Web Platform"}
              </div>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="text-xs font-semibold" />

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{locale === "th" ? "ระบบจัดการหลังบ้าน" : "Admin Console"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-border bg-card/60 hover:bg-accent text-foreground transition-all"
              >
                <LogIn className="w-4 h-4 text-muted-foreground" />
                <span>{locale === "th" ? "เข้าสู่ระบบ" : "Staff Login"}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public Portal Footer */}
      <footer className="border-t border-border bg-card/40 mt-16 text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-foreground text-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>{locale === "th" ? "หลักสูตรรัฐศาสตรบัณฑิต" : "Bachelor of Political Science Program"}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                {locale === "th"
                  ? "มุ่งผลิตบัณฑิตนักคิดนักปฏิบัติที่มีคุณธรรม เชี่ยวชาญการบริหารงานรัฐกิจ และพร้อมพัฒนาสังคมสู่ความยั่งยืน"
                  : "Empowering visionary leaders and innovative practitioners in political science and public administration."}
              </p>
              <div className="text-xs text-muted-foreground pt-2">
                123 มหาวิทยาลัยนวัตกรรม ถนนวิทยากร ตำบลในเมือง อำเภอเมือง จ.ขอนแก่น 40000<br />
                โทรศัพท์: 043-000-000 | อีเมล: contact@fms.ac.th
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-sm">
                {locale === "th" ? "ลิงก์ด่วน" : "Quick Links"}
              </h4>
              <ul className="text-sm space-y-1.5">
                <li><Link href="/" className="hover:text-primary transition-colors">{locale === "th" ? "หน้าแรก" : "Home"}</Link></li>
                <li><Link href="/news" className="hover:text-primary transition-colors">{locale === "th" ? "ข่าวสารประชาสัมพันธ์" : "News & Events"}</Link></li>
                <li><Link href="/personnel" className="hover:text-primary transition-colors">{locale === "th" ? "ทำเนียบคณาจารย์และบุคลากร" : "Faculty & Staff Directory"}</Link></li>
                <li><Link href="/programs" className="hover:text-primary transition-colors">{locale === "th" ? "หลักสูตรการศึกษา" : "Academic Programs"}</Link></li>
                <li><Link href="/booking" className="hover:text-primary transition-colors">{locale === "th" ? "ตารางการใช้ห้องและยานพาหนะ" : "Booking Schedule"}</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">{locale === "th" ? "ระบบสารบรรณและจองห้อง (เจ้าหน้าที่)" : "Staff Intranet"}</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-sm">
                {locale === "th" ? "ระบบสารสนเทศหลักสูตร" : "Program Platforms"}
              </h4>
              <ul className="text-sm space-y-1.5">
                <li><Link href="/admin/news" className="hover:text-primary transition-colors">{locale === "th" ? "ระบบจัดการข่าวสาร" : "News CMS"}</Link></li>
                <li><Link href="/admin/personnel" className="hover:text-primary transition-colors">{locale === "th" ? "ระบบจัดการบุคลากร" : "Personnel CMS"}</Link></li>
                <li><Link href="/admin/programs" className="hover:text-primary transition-colors">{locale === "th" ? "ระบบจัดการหลักสูตร" : "Curriculum CMS"}</Link></li>
                <li><Link href="/admin/booking" className="hover:text-primary transition-colors">{locale === "th" ? "ระบบบริหารการจองห้องและยานพาหนะ" : "Booking Management"}</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">{locale === "th" ? "แผงควบคุมระบบ (Admin)" : "Admin Dashboard"}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/60 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 Bachelor of Political Science Program. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-mono text-[11px]">Powered by VibeCore Framework</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
