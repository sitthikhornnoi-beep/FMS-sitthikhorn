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

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: SmtpConfig;
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const rawSettings = (t.settings as { palette?: unknown; smtp?: { enabled?: boolean; host?: string; port?: number; secure?: boolean; user?: string; pass?: string; from?: string } }) ?? {};
  const p = rawSettings.palette;
  const s = rawSettings.smtp;
  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
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

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge เฉพาะ palette และ smtp ที่เปลี่ยน ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // อ่านผ่าน tx เดียวกัน ไม่ใช่ client กลาง
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const prevSettings = (t.settings as { smtp?: { pass?: string } }) ?? {};

    // หากรหัสผ่านไม่ได้ส่งมาใหม่ ให้คงรหัสผ่านเดิมไว้
    let newSmtp = undefined;
    if (input.smtp) {
      const existingPass = prevSettings.smtp?.pass ?? "";
      const pass = input.smtp.pass ? input.smtp.pass : existingPass;
      newSmtp = {
        enabled: input.smtp.enabled,
        host: input.smtp.host,
        port: input.smtp.port,
        secure: input.smtp.secure,
        user: input.smtp.user,
        pass,
        from: input.smtp.from,
      };
    }

    const updatedSettings = {
      ...(t.settings as object),
      palette: input.palette,
      ...(newSmtp ? { smtp: newSmtp } : {}),
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
