"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { errors } from "@/shared/lib/errors";
import { verifySmtp } from "@/shared/lib/infra/mailer";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, getTenantRawSmtp, type TenantSettings } from "../services/tenant.service";

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

