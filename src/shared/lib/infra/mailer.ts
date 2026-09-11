import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";
import { prisma } from "./prisma";

export interface MailInput { to: string; subject: string; text: string; html?: string }

export interface SmtpTransportConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

/** ดึงการตั้งค่า SMTP จาก Tenant ในฐานข้อมูลก่อน ถ้าไม่มีจึงสลับไปใช้ Environment Variables */
async function resolveSmtpConfig(tenantId?: string): Promise<SmtpTransportConfig | null> {
  try {
    if (tenantId) {
      const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
      const s = (t?.settings as { smtp?: { enabled?: boolean; host?: string; port?: number; secure?: boolean; user?: string; pass?: string; from?: string } } | null)?.smtp;
      if (s?.enabled && s.user && s.pass) {
        return {
          host: s.host || "smtp.gmail.com",
          port: s.port || 587,
          secure: s.secure ?? (s.port === 465),
          user: s.user,
          pass: s.pass,
          from: s.from || s.user,
        };
      }
    } else {
      const t = await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { settings: true } });
      const s = (t?.settings as { smtp?: { enabled?: boolean; host?: string; port?: number; secure?: boolean; user?: string; pass?: string; from?: string } } | null)?.smtp;
      if (s?.enabled && s.user && s.pass) {
        return {
          host: s.host || "smtp.gmail.com",
          port: s.port || 587,
          secure: s.secure ?? (s.port === 465),
          user: s.user,
          pass: s.pass,
          from: s.from || s.user,
        };
      }
    }
  } catch (err) {
    logger.warn("resolveSmtpConfig from database failed, falling back to env", { err });
  }

  // Fallback to environment variables
  if (smtpConfigured()) {
    const e = env();
    return {
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465,
      user: e.SMTP_USER || undefined,
      pass: e.SMTP_PASS || undefined,
      from: e.SMTP_FROM,
    };
  }

  return null;
}

/** ไม่มี SMTP → เขียนลง log ระดับ info แล้วคืน delivered:false — ระบบต้องไม่ล้มเพราะส่งอีเมลไม่ได้ */
export async function sendMail(input: MailInput, tenantId?: string): Promise<{ delivered: boolean }> {
  const cfg = await resolveSmtpConfig(tenantId);
  if (!cfg) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }

  try {
    const isGmail = cfg.host.toLowerCase().includes("gmail");
    const user = cfg.user ? cfg.user.trim() : undefined;
    const pass = cfg.pass ? (isGmail ? cfg.pass.replace(/\s+/g, "") : cfg.pass.trim()) : undefined;

    const transport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: user ? { user, pass } : undefined,
    });
    await transport.sendMail({
      from: cfg.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}

/** ตรวจสอบการเชื่อมต่อ SMTP และทดสอบส่งอีเมล */
export async function verifySmtp(
  cfg: { host: string; port: number; secure: boolean; user: string; pass: string; from: string },
  testToEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isGmail = cfg.host.toLowerCase().includes("gmail");
    const user = cfg.user.trim();
    const pass = isGmail ? cfg.pass.replace(/\s+/g, "") : cfg.pass.trim();

    const transport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
    await transport.verify();

    if (testToEmail) {
      await transport.sendMail({
        from: cfg.from || cfg.user,
        to: testToEmail,
        subject: "ทดสอบการเชื่อมต่อ SMTP Gmail สำเร็จ (SMTP Connection Test)",
        text: `สวัสดีครับ,\n\nอีเมลนี้เป็นการทดสอบการเชื่อมต่อระบบ SMTP (${cfg.host}:${cfg.port}) จากระบบ FMS\nการตั้งค่าของคุณทำงานได้ถูกต้องสมบูรณ์แล้ว!\n\nเวลาทดสอบ: ${new Date().toLocaleString("th-TH")}`,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #16a34a; margin-top: 0; display: flex; items-center; gap: 8px;">
            ✅ เชื่อมต่อระบบ SMTP Gmail สำเร็จ
          </h2>
          <p style="color: #3f3f46; font-size: 15px;">อีเมลนี้เป็นการทดสอบการเชื่อมต่อระบบส่งอีเมลจาก <strong>ระบบ FMS</strong></p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
            <p style="margin: 6px 0; color: #27272a;"><strong>SMTP Host:</strong> ${cfg.host}</p>
            <p style="margin: 6px 0; color: #27272a;"><strong>SMTP Port:</strong> ${cfg.port}</p>
            <p style="margin: 6px 0; color: #27272a;"><strong>Username:</strong> ${cfg.user}</p>
            <p style="margin: 6px 0; color: #27272a;"><strong>Security:</strong> ${cfg.secure ? "SSL" : "TLS / STARTTLS"}</p>
            <p style="margin: 6px 0; color: #27272a;"><strong>From:</strong> ${cfg.from || cfg.user}</p>
          </div>
          <p style="color: #a1a1aa; font-size: 13px; margin-bottom: 0;">วันและเวลาที่ทดสอบ: ${new Date().toLocaleString("th-TH")}</p>
        </div>`,
      });
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
