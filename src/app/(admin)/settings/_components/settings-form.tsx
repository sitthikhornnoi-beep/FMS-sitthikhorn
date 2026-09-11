"use client";
import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  Mail,
  Send,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSwitchRow, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, testSmtpAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: {
      enabled: initial.smtp?.enabled ?? false,
      host: initial.smtp?.host ?? "smtp.gmail.com",
      port: initial.smtp?.port ?? 587,
      secure: initial.smtp?.secure ?? false,
      user: initial.smtp?.user ?? "",
      pass: "",
      from: initial.smtp?.from ?? "",
      hasPass: initial.smtp?.hasPass ?? false,
    },
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  // Test SMTP state
  const [testEmail, setTestEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting the same file fires change event
    e.target.value = "";

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("settings.logoHint"));
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (result.ok && result.url) {
        setForm((prev) => ({ ...prev, logoUrl: result.url }));
        setErrors((prev) => ({ ...prev, logoUrl: [] }));
        toast.success(t("settings.uploadLogo"));
      } else {
        toast.error(result.error || t("settings.uploadError"));
      }
    } catch {
      toast.error(t("settings.uploadError"));
    } finally {
      setUploading(false);
    }
  }

  function applyGmailPreset() {
    setForm((prev) => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        from: prev.smtp.from || (prev.smtp.user ? `FMS <${prev.smtp.user}>` : "FMS System"),
      },
    }));
    toast.info(t("settings.smtpPresetGmail"));
  }

  async function handleTestSmtp() {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error(t("settings.smtpTestEmail") + ": กรุณาระบุอีเมลที่ถูกต้อง");
      return;
    }
    if (!form.smtp.user) {
      toast.error(t("settings.smtpUser") + ": กรุณาระบุบัญชีอีเมล");
      return;
    }
    if (!form.smtp.pass && !form.smtp.hasPass) {
      toast.error(t("settings.smtpPass") + ": กรุณาระบุรหัสผ่านแอปพลิเคชัน (App Password)");
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await testSmtpAction({
        to: testEmail,
        host: form.smtp.host,
        port: form.smtp.port,
        secure: form.smtp.secure,
        user: form.smtp.user,
        pass: form.smtp.pass,
        from: form.smtp.from || form.smtp.user,
      });

      if (res.ok && res.data.success) {
        toast.success(t("settings.smtpTestSuccess"));
      } else {
        const errMsg = (!res.ok ? res.error.message : res.data.error) || "Error";
        toast.error(t("settings.smtpTestFailed", { error: errMsg }));
      }
    } catch (e) {
      toast.error(t("settings.smtpTestFailed", { error: e instanceof Error ? e.message : String(e) }));
    } finally {
      setTestingSmtp(false);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      if (form.smtp.pass) {
        setForm((prev) => ({
          ...prev,
          smtp: {
            ...prev.smtp,
            pass: "",
            hasPass: true,
          },
        }));
      }
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("settings.logoHint")} error={errors.logoUrl?.[0]}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  {form.logoUrl ? (
                    <div className="relative group rounded-lg border border-border bg-muted/30 p-2 flex items-center justify-center min-w-[100px] h-[80px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.logoUrl}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground shadow-sm transition-colors cursor-pointer"
                        title={t("settings.removeLogo")}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 w-[100px] h-[80px] flex flex-col items-center justify-center text-muted-foreground gap-1">
                      <ImageIcon className="w-6 h-6 opacity-40" />
                      <span className="text-[10px]">No Logo</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t("settings.uploading")}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>{t("settings.uploadLogo")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <input
                  id="s-logo"
                  type="text"
                  placeholder="https://... หรือ /uploads/..."
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
              </div>
            </LiyonField>
          </div>
        </LiyonCard>

        {/* SMTP Configuration Card */}
        <LiyonCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="!mb-0">{t("settings.smtpTitle")}</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyGmailPreset}
              className="inline-flex items-center gap-1.5 text-xs h-8 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("settings.smtpPresetGmail")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.smtpDesc")}</p>

          <div className="fields">
            <LiyonSwitchRow
              id="smtp-enabled"
              checked={form.smtp.enabled}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, enabled: checked } }))
              }
              label={t("settings.smtpEnable")}
              description={form.smtp.enabled ? "ระบบกำลังใช้งานการส่งอีเมลผ่านเซิร์ฟเวอร์นี้" : "เมื่อปิดใช้งาน อีเมลจะถูกบันทึกลง log เท่านั้น"}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <LiyonField label={t("settings.smtpHost")} htmlFor="smtp-host" error={errors["smtp.host"]?.[0]}>
                  <input
                    id="smtp-host"
                    type="text"
                    value={form.smtp.host}
                    placeholder="smtp.gmail.com"
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, host: e.target.value } }))
                    }
                  />
                </LiyonField>
              </div>
              <div>
                <LiyonField label={t("settings.smtpPort")} htmlFor="smtp-port" error={errors["smtp.port"]?.[0]}>
                  <input
                    id="smtp-port"
                    type="number"
                    value={form.smtp.port}
                    onChange={(e) => {
                      const port = Number(e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        smtp: {
                          ...prev.smtp,
                          port,
                          secure: port === 465,
                        },
                      }));
                    }}
                  />
                </LiyonField>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField
                label={t("settings.smtpUser")}
                htmlFor="smtp-user"
                error={errors["smtp.user"]?.[0]}
                hint="ระบุบัญชี Gmail จริงของคุณ เช่น yourname@gmail.com"
              >
                <input
                  id="smtp-user"
                  type="email"
                  value={form.smtp.user}
                  placeholder="yourname@gmail.com"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, user: e.target.value } }))
                  }
                />
                {form.smtp.user.toLowerCase().includes("@app.local") && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    ⚠️ &quot;{form.smtp.user}&quot; คือบัญชีผู้ใช้ระบบ FMS ไม่ใช่บัญชี Gmail กรุณาใช้อีเมล Gmail จริงของคุณ (เช่น yourname@gmail.com)
                  </p>
                )}
              </LiyonField>

              <LiyonField
                label={t("settings.smtpPass")}
                htmlFor="smtp-pass"
                error={errors["smtp.pass"]?.[0]}
                hint={form.smtp.hasPass ? t("settings.smtpPassKeep") : t("settings.smtpPassPlaceholder")}
              >
                <div className="relative flex items-center">
                  <input
                    id="smtp-pass"
                    type={showPassword ? "text" : "password"}
                    value={form.smtp.pass}
                    placeholder={form.smtp.hasPass ? "••••••••••••••••" : "abcd efgh ijkl mnop"}
                    className="w-full pr-10"
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, pass: e.target.value } }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.smtp.pass === "Passw0rd!vibe" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    ⚠️ &quot;Passw0rd!vibe&quot; คือรหัสผ่านเข้าเว็บ FMS ไม่ใช่รหัสผ่านแอป Gmail กรุณาใช้รหัสผ่านแอป 16 ตัวอักษรจาก Google
                  </p>
                )}
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField
                label={t("settings.smtpFrom")}
                htmlFor="smtp-from"
                error={errors["smtp.from"]?.[0]}
                hint="เช่น ระบบ FMS <no-reply@yourdomain.com>"
              >
                <input
                  id="smtp-from"
                  type="text"
                  value={form.smtp.from}
                  placeholder={t("settings.smtpFromPlaceholder")}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, from: e.target.value } }))
                  }
                />
              </LiyonField>

              <div className="field">
                <label>{t("settings.smtpSecure")}</label>
                <div className="flex items-center gap-4 h-[42px]">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="smtp-secure"
                      checked={!form.smtp.secure}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, secure: false, port: 587 } }))
                      }
                    />
                    <span>{t("settings.smtpSecureTls")}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="smtp-secure"
                      checked={form.smtp.secure}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, secure: true, port: 465 } }))
                      }
                    />
                    <span>{t("settings.smtpSecureSsl")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Guide Card */}
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm mt-2">
              <div className="flex items-center justify-between font-medium text-foreground mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  {t("settings.smtpGmailHelpTitle")}
                </span>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <span>Google App Passwords</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-none pl-1">
                <li>{t("settings.smtpGmailHelpStep1")}</li>
                <li>{t("settings.smtpGmailHelpStep2")}</li>
                <li>{t("settings.smtpGmailHelpStep3")}</li>
              </ul>
            </div>

            {/* Test Connection Card */}
            <div className="rounded-lg border border-border p-4 bg-background mt-2 space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{t("settings.smtpTestCard")}</h3>
                <p className="text-xs text-muted-foreground">{t("settings.smtpTestDesc")}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder={t("settings.smtpTestEmail") + " (เช่น myemail@gmail.com)"}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  disabled={testingSmtp}
                  onClick={handleTestSmtp}
                  className="inline-flex items-center gap-2 cursor-pointer shrink-0"
                >
                  {testingSmtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("settings.smtpTesting")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t("settings.smtpTestBtn")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}

