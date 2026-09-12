"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  Newspaper,
  Users,
  BookOpen,
  LogIn,
  LayoutDashboard,
  Calendar,
  FileText,
  Menu,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe2,
  Share2,
  Building2,
} from "lucide-react";
import { useAppSession } from "@/hooks/use-session";
import { useLocale } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";
import { hasPermission, P, type TenantSettings } from "@/features/identity";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

interface PortalClientLayoutProps {
  children: React.ReactNode;
  tenant: TenantSettings | null;
}

export function PortalClientLayout({ children, tenant }: PortalClientLayoutProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { status, user, roles, permissions, isSuperAdmin } = useAppSession();
  const isLoggedIn = status === "authenticated" && !!user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const ctx = { roles, permissions, isSuperAdmin };
  const canManageSettings = hasPermission(ctx, P.settingsManage);

  // Dynamic brand information
  const brandName = locale === "th"
    ? (tenant?.nameTh || "วิทยาลัยสงฆ์พุทธโสธร มจร")
    : (tenant?.nameEn || "MCU Phutthasothon");

  const brandSub = locale === "th"
    ? (tenant?.org?.sloganTh || "หลักสูตรรัฐศาสตรบัณฑิต (ร.บ.)")
    : (tenant?.org?.sloganEn || "Bachelor of Political Science");

  const brandDesc = locale === "th"
    ? (tenant?.org?.descriptionTh || "จัดการศึกษาพระพุทธศาสนาบูรณาการกับศาสตร์สมัยใหม่ เพื่อพัฒนาจิตใจและสังคม ผลิตบัณฑิตที่มีคุณธรรม เชี่ยวชาญการบริหารงานรัฐกิจ และพร้อมพัฒนาสังคมสู่ความยั่งยืน")
    : (tenant?.org?.descriptionEn || "Empowering visionary leaders and innovative practitioners through Buddhist wisdom and modern political science.");

  const logoUrl = tenant?.logoUrl || "/uploads/mcu-logo.png";
  const contactPhone = tenant?.org?.contactPhone || "089 5336056";
  const contactEmail = tenant?.org?.contactEmail || "sitthikhorn.pha@mcu.ac.th";
  const address = tenant?.org?.address || "158 ถนนศรีโสธร ตำบลหน้าเมือง อำเภอเมืองฉะเชิงเทรา จังหวัดฉะเชิงเทรา 24000";
  const website = tenant?.org?.website;
  const officeHours = tenant?.org?.officeHours;
  const facebook = tenant?.org?.facebook;
  const line = tenant?.org?.line;
  const mapUrl = tenant?.org?.mapUrl;

  const navLinks = [
    { href: "/", labelTh: "หน้าแรก", labelEn: "Home", icon: GraduationCap },
    { href: "/news", labelTh: "ข่าวสารและกิจกรรม", labelEn: "News & Events", icon: Newspaper },
    { href: "/personnel", labelTh: "คณาจารย์และบุคลากร", labelEn: "Faculty & Staff", icon: Users },
    { href: "/booking", labelTh: "จองห้องและยานพาหนะ", labelEn: "Booking", icon: Calendar },
    { href: "/programs", labelTh: "หลักสูตร", labelEn: "Curriculum", icon: BookOpen },
    { href: "/documents", labelTh: "สารบรรณและประกาศ", labelEn: "E-Documents", icon: FileText },
    { href: "/contact", labelTh: "การติดต่อ", labelEn: "Contact", icon: Phone },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Navigation Bar — Styled identically to AdminShell (.adm-head) */}
      <header className="adm-head sticky top-0 z-50 h-[64px] [--adm-head-h:64px] [--adm-gap:14px] px-3 sm:px-6">
        {/* Brand Block */}
        <Link className="brand-blk !w-auto shrink-0 pr-2 mr-2" href="/">
          <i className="overflow-hidden flex items-center justify-center bg-white shadow-xs p-0.5">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={brandName}
                width={34}
                height={34}
                className="w-full h-full object-contain"
                priority
                unoptimized={!logoUrl.startsWith("/")}
              />
            ) : (
              <Building2 className="w-5 h-5 text-primary" />
            )}
          </i>
          <div className="t">
            <b>{brandName}</b>
            <span>{brandSub}</span>
          </div>
        </Link>

        {/* Portal Navigation Items */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0" aria-label={locale === "th" ? "เมนูหลัก" : "Portal Navigation"}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-[var(--r-sm)] text-[.82rem] xl:text-[.85rem] font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-[var(--side-active-bg)] text-[var(--side-active-ink)] font-semibold border border-[var(--brand)]/25 shadow-xs"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-[var(--brand-ink)]" : "opacity-70")} />
                <span>{locale === "th" ? link.labelTh : link.labelEn}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer pushing tools to right */}
        <span className="sp" />

        {/* Theme Toggle Button (Admin Style) */}
        <button
          type="button"
          className="icon-btn"
          aria-label={locale === "th" ? "สลับโหมดสี" : "Toggle theme"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
          </svg>
          <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
          </svg>
        </button>

        {/* Language Switcher (Admin Style) */}
        <LanguageSwitcher className="lang" />

        {/* User Account Avatar Menu / Staff Login Button */}
        {status === "loading" ? (
          <div aria-hidden="true" className="h-8 w-8 animate-pulse rounded-full bg-[var(--glass-strong)] ml-1" />
        ) : isLoggedIn && user ? (
          <div className="acct ml-1">
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <button type="button" aria-label={locale === "th" ? "เมนูบัญชีผู้ใช้" : "Account menu"}>
                  <span className="who" aria-hidden="true">
                    {user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="nm hidden sm:inline">{user.name}</span>
                  <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </DropdownMenuPrimitive.Trigger>
              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content
                  className="menu-list"
                  align="end"
                  sideOffset={8}
                  style={{ position: "static" }}
                >
                  <DropdownMenuPrimitive.Label asChild>
                    <div className="px-2.5 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuPrimitive.Label>
                  <DropdownMenuPrimitive.Separator asChild>
                    <hr />
                  </DropdownMenuPrimitive.Separator>
                  <DropdownMenuPrimitive.Item asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 opacity-80" />
                      <span>{locale === "th" ? "ระบบจัดการหลังบ้าน" : "Admin Console"}</span>
                    </Link>
                  </DropdownMenuPrimitive.Item>
                  <DropdownMenuPrimitive.Item asChild>
                    <Link href="/me" className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 opacity-80" />
                      <span>{locale === "th" ? "โปรไฟล์ของฉัน" : "My Profile"}</span>
                    </Link>
                  </DropdownMenuPrimitive.Item>
                  {canManageSettings && (
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4 opacity-80" />
                        <span>{locale === "th" ? "ตั้งค่าระบบ" : "Settings"}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                  )}
                  <DropdownMenuPrimitive.Separator asChild>
                    <hr />
                  </DropdownMenuPrimitive.Separator>
                  <DropdownMenuPrimitive.Item asChild onSelect={() => signOut({ callbackUrl: "/login" })}>
                    <button type="button" className="danger flex items-center gap-2 w-full text-left">
                      <LogOut className="w-4 h-4" />
                      <span>{locale === "th" ? "ออกจากระบบ" : "Sign Out"}</span>
                    </button>
                  </DropdownMenuPrimitive.Item>
                </DropdownMenuPrimitive.Content>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-medium border border-[var(--glass-border)] bg-[var(--glass-strong)] hover:bg-[var(--glass-hover)] text-[var(--text)] transition-all whitespace-nowrap shadow-xs ml-1"
          >
            <LogIn className="w-3.5 h-3.5 shrink-0 text-[var(--text-2)]" />
            <span>{locale === "th" ? "เข้าสู่ระบบ" : "Staff Login"}</span>
          </Link>
        )}

        {/* Mobile Menu Toggle (Admin Icon-Btn Style) */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="icon-btn lg:hidden ml-1"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 border-b border-[var(--glass-border)] bg-[var(--glass-strong)] backdrop-blur-xl px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-sm)] text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--side-active-bg)] text-[var(--side-active-ink)] font-semibold"
                      : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-hover)]"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span>{locale === "th" ? link.labelTh : link.labelEn}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public Portal Footer (Liyon Ink-Band Design) */}
      <footer className="mt-20 bg-[var(--ink-band)] text-[var(--ink-band-text)] border-t border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative subtle ambient glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[var(--brand)]/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Column 1 & 2: Institutional Identity & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 shadow-md border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={brandName}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      unoptimized={!logoUrl.startsWith("/")}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-base sm:text-lg tracking-tight leading-snug">
                    {brandName}
                  </div>
                  <div className="text-xs text-[var(--ink-band-muted)] leading-tight mt-0.5">
                    {brandSub}
                  </div>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-[var(--ink-band-muted)] leading-relaxed max-w-md pt-1">
                {brandDesc}
              </p>

              {/* Contact Information */}
              <div className="space-y-2 pt-2 text-xs text-[var(--ink-band-muted)]">
                {address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[var(--brand-light)] shrink-0 mt-0.5" />
                    <span className="leading-snug">{address}</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[var(--brand-light)] shrink-0" />
                      <span>{contactPhone}</span>
                    </a>
                  )}
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[var(--brand-light)] shrink-0" />
                      <span>{contactEmail}</span>
                    </a>
                  )}
                </div>

                {/* Additional contacts: Office Hours, Website, Facebook, Line, Map */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                  {officeHours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--brand-light)] shrink-0" />
                      <span>{officeHours}</span>
                    </div>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-[var(--brand-light)] shrink-0" />
                      <span>{website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[var(--brand-light)] shrink-0" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {line && (
                    <a
                      href={line.startsWith("http") ? line : `https://line.me/ti/p/~${line.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span className="font-semibold text-[var(--brand-light)]">LINE:</span>
                      <span>{line}</span>
                    </a>
                  )}
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white transition-colors text-[var(--brand-light)] underline underline-offset-2"
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{locale === "th" ? "ดูแผนที่ Google Maps" : "View Google Maps"}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-[var(--brand)] inline-block" />
                {locale === "th" ? "ลิงก์ด่วน" : "Quick Links"}
              </h4>
              <ul className="text-xs sm:text-sm space-y-2 text-[var(--ink-band-muted)]">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    {locale === "th" ? "หน้าแรก" : "Home"}
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-white transition-colors">
                    {locale === "th" ? "ข่าวสารและกิจกรรม" : "News & Events"}
                  </Link>
                </li>
                <li>
                  <Link href="/personnel" className="hover:text-white transition-colors">
                    {locale === "th" ? "ทำเนียบคณาจารย์และบุคลากร" : "Faculty & Staff"}
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-white transition-colors">
                    {locale === "th" ? "หลักสูตรการศึกษา" : "Curriculum"}
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="hover:text-white transition-colors">
                    {locale === "th" ? "จองห้องและยานพาหนะ" : "Booking Schedule"}
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="hover:text-white transition-colors">
                    {locale === "th" ? "สารบรรณและประกาศ" : "E-Documents"}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    {locale === "th" ? "ช่องทางการติดต่อ" : "Contact Us"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Academic Program */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-[var(--brand)] inline-block" />
                {locale === "th" ? "หลักสูตรรัฐศาสตรบัณฑิต" : "Academic Program"}
              </h4>
              <ul className="text-xs sm:text-sm space-y-2 text-[var(--ink-band-muted)]">
                <li>
                  <Link href="/programs" className="hover:text-white transition-colors">
                    {locale === "th" ? "โครงสร้างและแผนการศึกษา" : "Curriculum Structure"}
                  </Link>
                </li>
                <li>
                  <Link href="/personnel" className="hover:text-white transition-colors">
                    {locale === "th" ? "อาจารย์ประจำหลักสูตร" : "Faculty Members"}
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-white transition-colors">
                    {locale === "th" ? "กิจกรรมวิชาการและการอบรม" : "Academic Activities"}
                  </Link>
                </li>
                <li>
                  <Link href="/booking" className="hover:text-white transition-colors">
                    {locale === "th" ? "บริการห้องเรียนและยานพาหนะ" : "Resource Reservation"}
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="hover:text-white transition-colors">
                    {locale === "th" ? "ระเบียบและข้อบังคับวิทยาลัย" : "Rules & Regulations"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Digital Platforms & Admin */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-[var(--brand)] inline-block" />
                {locale === "th" ? "ระบบสารสนเทศ" : "Systems & Intranet"}
              </h4>
              <ul className="text-xs sm:text-sm space-y-2 text-[var(--ink-band-muted)]">
                <li>
                  <Link href="/admin/news" className="hover:text-white transition-colors">
                    {locale === "th" ? "ระบบจัดการข่าวสาร" : "News Management"}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/personnel" className="hover:text-white transition-colors">
                    {locale === "th" ? "ระบบจัดการบุคลากร" : "Personnel Directory"}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/booking" className="hover:text-white transition-colors">
                    {locale === "th" ? "ระบบบริหารการจองห้อง" : "Booking Management"}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    {locale === "th" ? "แผงควบคุมระบบ (Admin)" : "Admin Dashboard"}
                  </Link>
                </li>
                <li className="pt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{locale === "th" ? "เข้าสู่ระบบบุคลากร" : "Staff Intranet Login"}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Compliance & Framework Badge */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-band-muted)]">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono text-[11px] text-[var(--ink-band-muted)]/80">
                Powered by VibeCore Framework
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[11px] text-[var(--ink-band-muted)]/80">
                Liyon Design System
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
