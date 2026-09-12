import { LayoutDashboard, Users, Settings, Layers, Newspaper, GraduationCap, Calendar, BookOpen, FileText, type LucideIcon } from "lucide-react";
import { hasPermission, P } from "@/features/identity";
import { SAMPLE_P } from "@/features/sample";
import { NEWS_P } from "@/features/news";
import { PERSONNEL_P } from "@/features/personnel";
import { BOOKING_P } from "@/features/booking";
import { CURRICULUM_P } from "@/features/curriculum";
import { DOCUMENTS_P } from "@/features/documents";

export interface NavItem {
  /** i18n key */
  title: string;
  href: string;
  icon?: LucideIcon;
  /** ต้องมีสิทธิ์นี้ถึงเห็น — ไม่มี = ทุกคนที่ login เห็น */
  permission?: string;
  children?: NavItem[];
}
export interface NavGroup { label: string; items: NavItem[] }
export interface NavCrumb { title: string; href: string }

export const sidebarGroups: NavGroup[] = [
  // 1. ภาพรวมระบบ (Overview)
  {
    label: "nav.group.overview",
    items: [{ title: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },

  // 2. งานวิชาการและการศึกษา (Academic Affairs & Curriculum)
  {
    label: "nav.group.academic",
    items: [
      {
        title: "curriculum.nav",
        href: "/admin/programs",
        icon: BookOpen,
        permission: CURRICULUM_P.curriculumRead,
        children: [
          { title: "curriculum.nav.programs", href: "/admin/programs", permission: CURRICULUM_P.curriculumRead },
          { title: "curriculum.nav.departments", href: "/admin/departments", permission: CURRICULUM_P.curriculumRead },
        ],
      },
      { title: "personnel.nav", href: "/admin/personnel", icon: GraduationCap, permission: PERSONNEL_P.personnelRead },
    ],
  },

  // 3. งานบริหารและบริการทั่วไป (Operations & Administrative Services)
  {
    label: "nav.group.operations",
    items: [
      { title: "document.nav", href: "/admin/documents", icon: FileText, permission: DOCUMENTS_P.documentRead },
      { title: "booking.nav", href: "/admin/booking", icon: Calendar, permission: BOOKING_P.bookingRead },
      { title: "news.nav", href: "/admin/news", icon: Newspaper, permission: NEWS_P.newsRead },
    ],
  },

  // 4. การจัดการระบบและความปลอดภัย (System & Security)
  {
    label: "nav.group.system",
    items: [
      {
        title: "nav.usersManagement",
        href: "/users",
        icon: Users,
        permission: P.usersRead,
        children: [
          { title: "nav.usersList", href: "/users", permission: P.usersRead },
          { title: "nav.rolesManage", href: "/users/roles", permission: P.rolesManage },
        ],
      },
      { title: "nav.settings", href: "/settings", icon: Settings, permission: P.settingsManage },
    ],
  },

  // 5. สำหรับนักพัฒนา / ตัวอย่างระบบ (Developer & Samples)
  {
    label: "nav.group.sample",
    items: [{ title: "sample.nav", href: "/sample", icon: Layers, permission: SAMPLE_P.sampleRead }],
  },
];

type Ctx = Parameters<typeof hasPermission>[0];

function visibleItem(item: NavItem, ctx: Ctx): NavItem | null {
  if (item.permission && !hasPermission(ctx, item.permission)) return null;
  if (!item.children) return item;
  const children = item.children.filter((c) => !c.permission || hasPermission(ctx, c.permission));
  return children.length ? { ...item, children } : null;
}

export function visibleGroups(ctx: Ctx): NavGroup[] {
  return sidebarGroups
    .map((g) => ({ ...g, items: g.items.map((i) => visibleItem(i, ctx)).filter((i): i is NavItem => i !== null) }))
    .filter((g) => g.items.length > 0);
}

/** สายเมนูสำหรับ breadcrumb — จับ href ที่ยาวที่สุดที่ตรง (ลูกชนะแม่) */
export function getActiveNavChain(pathname: string): NavCrumb[] {
  let best: { parent: NavItem | null; item: NavItem } | null = null;
  const consider = (item: NavItem, parent: NavItem | null) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.item.href.length || (item.href.length === best.item.href.length && parent)) best = { parent, item };
    }
  };
  for (const g of sidebarGroups) for (const i of g.items) { consider(i, null); for (const c of i.children ?? []) consider(c, i); }
  if (!best) return [];
  const { parent, item } = best as { parent: NavItem | null; item: NavItem };
  const chain: NavCrumb[] = [];
  if (parent && parent.href !== item.href) chain.push({ title: parent.title, href: parent.href });
  chain.push({ title: item.title, href: item.href });
  return chain;
}
