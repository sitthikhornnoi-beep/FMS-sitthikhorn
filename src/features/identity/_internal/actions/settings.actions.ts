"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { errors } from "@/shared/lib/errors";
import { verifySmtp } from "@/shared/lib/infra/mailer";
import { verifyGemini } from "@/shared/lib/infra/gemini";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpSchema, testGeminiSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, getTenantRawSmtp, getTenantRawGemini, type TenantSettings } from "../services/tenant.service";

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}
export async function testSmtpAction(input: unknown): Promise<ActionResult<{ success: boolean; error?: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const data = testSmtpSchema.parse(input, { error: zodErrorMap(await getLocale()) });

    let pass = data.pass;
    if (!pass) {
      const raw = await getTenantRawSmtp(ctx.tenantId);
      if (raw?.pass) {
        pass = raw.pass;
      } else {
        throw errors.validation("validation", { pass: ["กรุณาระบุรหัสผ่าน SMTP (App Password)"] });
      }
    }

    if (data.host.toLowerCase().includes("gmail") && data.user.toLowerCase().endsWith("@app.local")) {
      return {
        success: false,
        error: "admin@app.local คือบัญชีผู้ดูแลระบบ FMS ภายใน ไม่ใช่บัญชีอีเมล Gmail กรุณาระบุบัญชี Gmail จริงของคุณ (เช่น yourname@gmail.com)",
      };
    }

    if (pass === "Passw0rd!vibe") {
      return {
        success: false,
        error: "รหัสผ่าน Passw0rd!vibe คือรหัสเข้าเว็บ FMS ไม่ใช่รหัสผ่านแอป 16 หลักของ Gmail กรุณาสร้างรหัสผ่านแอปจาก https://myaccount.google.com/apppasswords",
      };
    }

    return await verifySmtp(
      {
        host: data.host,
        port: data.port,
        secure: data.secure,
        user: data.user,
        pass,
        from: data.from,
      },
      data.to
    );
  });
}

export async function testGeminiAction(input: unknown): Promise<ActionResult<{ success: boolean; error?: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const data = testGeminiSchema.parse(input, { error: zodErrorMap(await getLocale()) });

    let apiKey = data.apiKey;
    if (!apiKey) {
      const raw = await getTenantRawGemini(ctx.tenantId);
      if (raw?.apiKey) {
        apiKey = raw.apiKey;
      } else {
        throw errors.validation("validation", { apiKey: ["กรุณาระบุ Gemini API Key"] });
      }
    }

    return await verifyGemini(apiKey, data.model);
  });
}

