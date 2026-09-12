import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput } from "../validations/settings";

export interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  hasPass: boolean;
}

export interface OrgConfig {
  sloganTh: string;
  sloganEn: string;
  descriptionTh: string;
  descriptionEn: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebook?: string;
  line?: string;
  officeHours?: string;
  mapUrl?: string;
}

export interface GeminiConfig {
  enabled: boolean;
  apiKey: string;
  hasKey: boolean;
  model: string;
}

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: SmtpConfig;
  org?: OrgConfig;
  gemini?: GeminiConfig;
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const rawSettings = (t.settings as {
    palette?: unknown;
    smtp?: { enabled?: boolean; host?: string; port?: number; secure?: boolean; user?: string; pass?: string; from?: string };
    org?: Partial<OrgConfig>;
    gemini?: { enabled?: boolean; apiKey?: string; model?: string };
  }) ?? {};
  const p = rawSettings.palette;
  const s = rawSettings.smtp;
  const o = rawSettings.org;
  const g = rawSettings.gemini;
  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    gemini: g ? {
      enabled: g.enabled ?? true,
      apiKey: "",
      hasKey: !!g.apiKey,
      model: g.model || "gemini-2.0-flash",
    } : {
      enabled: true,
      apiKey: "",
      hasKey: !!process.env.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
    },
    smtp: s ? {
      enabled: s.enabled ?? false,
      host: s.host ?? "smtp.gmail.com",
      port: s.port ?? 587,
      secure: s.secure ?? false,
      user: s.user ?? "",
      from: s.from ?? "",
      hasPass: !!s.pass,
    } : {
      enabled: false,
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      user: "",
      from: "",
      hasPass: false,
    },
    org: {
      sloganTh: o?.sloganTh ?? "",
      sloganEn: o?.sloganEn ?? "",
      descriptionTh: o?.descriptionTh ?? "",
      descriptionEn: o?.descriptionEn ?? "",
      website: o?.website ?? "",
      contactEmail: o?.contactEmail ?? "",
      contactPhone: o?.contactPhone ?? "",
      address: o?.address ?? "",
      facebook: o?.facebook ?? "",
      line: o?.line ?? "",
      officeHours: o?.officeHours ?? "",
      mapUrl: o?.mapUrl ?? "",
    },
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** ดึงการตั้งค่า SMTP จริง (รวมรหัสผ่าน) สำหรับใช้ส่งอีเมล */
export async function getTenantRawSmtp(tenantId: string): Promise<{ enabled: boolean; host: string; port: number; secure: boolean; user: string; pass: string; from: string } | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const s = (t?.settings as { smtp?: { enabled?: boolean; host?: string; port?: number; secure?: boolean; user?: string; pass?: string; from?: string } } | null)?.smtp;
  if (!s || !s.pass) return null;
  return {
    enabled: s.enabled ?? false,
    host: s.host || "smtp.gmail.com",
    port: s.port || 587,
    secure: s.secure ?? false,
    user: s.user || "",
    pass: s.pass || "",
    from: s.from || s.user || "",
  };
}

/** ดึงการตั้งค่า Gemini AI จริง (รวม API Key) */
export async function getTenantRawGemini(tenantId: string): Promise<{ enabled: boolean; apiKey: string; model: string } | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const g = (t?.settings as { gemini?: { enabled?: boolean; apiKey?: string; model?: string } } | null)?.gemini;
  const apiKey = g?.apiKey || process.env.GEMINI_API_KEY || "";
  if (!apiKey) return null;
  return {
    enabled: g?.enabled ?? true,
    apiKey,
    model: g?.model || "gemini-2.0-flash",
  };
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge เฉพาะ palette, smtp และ gemini ที่เปลี่ยน ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // อ่านผ่าน tx เดียวกัน ไม่ใช่ client กลาง
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const prevSettings = (t.settings as { smtp?: { pass?: string }; gemini?: { apiKey?: string } }) ?? {};

    // หากรหัสผ่านไม่ได้ส่งมาใหม่ ให้คงรหัสผ่านเดิมไว้
    let newSmtp = undefined;
    if (input.smtp) {
      const existingPass = prevSettings.smtp?.pass ?? "";
      const isGmail = (input.smtp.host || "").toLowerCase().includes("gmail");
      const pass = input.smtp.pass
        ? (isGmail ? input.smtp.pass.replace(/\s+/g, "") : input.smtp.pass.trim())
        : existingPass;
      newSmtp = {
        enabled: input.smtp.enabled,
        host: input.smtp.host.trim(),
        port: input.smtp.port,
        secure: input.smtp.secure,
        user: input.smtp.user.trim(),
        pass,
        from: input.smtp.from.trim(),
      };
    }

    // หาก Gemini API Key ไม่ได้ส่งมาใหม่ ให้คง Key เดิมไว้
    let newGemini = undefined;
    if (input.gemini) {
      const existingKey = prevSettings.gemini?.apiKey ?? "";
      const apiKey = input.gemini.apiKey
        ? input.gemini.apiKey.trim()
        : existingKey;
      newGemini = {
        enabled: input.gemini.enabled,
        apiKey,
        model: input.gemini.model?.trim() || "gemini-2.0-flash",
      };
    }

    const updatedSettings = {
      ...(t.settings as object),
      palette: input.palette,
      ...(newSmtp ? { smtp: newSmtp } : {}),
      ...(input.org !== undefined ? { org: input.org } : {}),
      ...(newGemini ? { gemini: newGemini } : {}),
    };

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: updatedSettings,
      },
    });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: input }, tx);
  });
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});

/** ดึงการตั้งค่าองค์กรและข้อมูลติดต่อสำหรับแสดงผลในหน้า Public Portal */
export const getPortalTenantSettings = cache(async (): Promise<TenantSettings | null> => {
  try {
    const tenantId = (await sessionTenantId()) || (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantSettings(tenantId) : null;
  } catch {
    return null;
  }
});
