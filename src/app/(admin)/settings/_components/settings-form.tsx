"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
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
  Crop,
  Building2,
  FileText,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, LiyonSwitchRow, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, testSmtpAction } from "@/features/identity/actions";
import { LogoCropModal } from "./logo-crop-modal";
import { OrgTextModal } from "./org-text-modal";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    org: {
      sloganTh: initial.org?.sloganTh ?? "",
      sloganEn: initial.org?.sloganEn ?? "",
      descriptionTh: initial.org?.descriptionTh ?? "",
      descriptionEn: initial.org?.descriptionEn ?? "",
      website: initial.org?.website ?? "",
      contactEmail: initial.org?.contactEmail ?? "",
      contactPhone: initial.org?.contactPhone ?? "",
      address: initial.org?.address ?? "",
      facebook: initial.org?.facebook ?? "",
      line: initial.org?.line ?? "",
      officeHours: initial.org?.officeHours ?? "",
      mapUrl: initial.org?.mapUrl ?? "",
    },
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
  const [pending, start] = useTransition();

  // Modals state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  // Test SMTP state
  const [testEmail, setTestEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        {/* Card 1: โลโก้องค์กร (Organization Logo) */}
        <LiyonCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <h2 className="!mb-0">{t("settings.logoTitle")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("settings.logoDesc")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                PNG, JPG, JPEG &bull; สูงสุด 200 KB
              </span>
            </div>
          </div>

          <div className="fields mt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {form.logoUrl ? (
                  <div className="relative group rounded-xl border border-border bg-muted/20 p-2 flex items-center justify-center min-w-[120px] h-[90px] overflow-hidden shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.logoUrl}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground shadow-sm transition-colors cursor-pointer"
                      title={t("settings.removeLogo")}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 w-[120px] h-[90px] flex flex-col items-center justify-center text-muted-foreground gap-1.5">
                    <ImageIcon className="w-7 h-7 opacity-40" />
                    <span className="text-[10px] font-medium">ยังไม่มีโลโก้</span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => setCropModalOpen(true)}
                    className="inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Crop className="w-4 h-4" />
                    <span>{t("settings.editLogoBtn")}</span>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    รองรับการลากวางไฟล์ หรือนำเข้าจาก URL พร้อมเครื่องมือครอบภาพ ย่อขยาย ปรับความเอียง จัดกึ่งกลาง และบีบอัดไม่เกิน 200 KB
                  </p>
                </div>
              </div>

              <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("settings.logoHint")} error={errors.logoUrl?.[0]}>
                <input
                  id="s-logo"
                  type="text"
                  placeholder="https://... หรือ /uploads/..."
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>

        {/* Card 2: ข้อมูลและข้อความองค์กรแบบมาตรฐานโลก (World-Standard Organization Text Editor) */}
        {/* ตำแหน่ง: อยู่ด้านล่างของ ปุ่ม อัพโหลดภาพ และอยู่ก่อนหน้า ระบบ ปรับโทนสี */}
        <LiyonCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="!mb-0">{t("settings.orgSectionTitle")}</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {t("settings.standardBadge")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t("settings.orgSectionDesc")}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOrgModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs h-8 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{t("settings.editOrgTextBtn")}</span>
            </Button>
          </div>

          <div className="fields">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}>
                <input
                  id="s-name-th"
                  value={form.nameTh}
                  onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                />
              </LiyonField>
              <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}>
                <input
                  id="s-name-en"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("settings.sloganTh")} htmlFor="s-slogan-th">
                <input
                  id="s-slogan-th"
                  value={form.org.sloganTh}
                  placeholder="สโลแกนหรือคำขวัญภาษาไทย"
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, sloganTh: e.target.value } })
                  }
                />
              </LiyonField>
              <LiyonField label={t("settings.sloganEn")} htmlFor="s-slogan-en">
                <input
                  id="s-slogan-en"
                  value={form.org.sloganEn}
                  placeholder="Official Tagline or Slogan in English"
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, sloganEn: e.target.value } })
                  }
                />
              </LiyonField>
            </div>

            {/* World-Standard Live Corporate Brand Preview Card */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  {t("settings.previewBrandCard")}
                </span>
                <button
                  type="button"
                  onClick={() => setOrgModalOpen(true)}
                  className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>แก้ไขข้อความและข้อมูลติดต่อ &rarr;</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {form.logoUrl ? (
                  <div className="w-12 h-12 rounded-lg border border-border bg-background p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                    <Building2 className="w-6 h-6 opacity-40" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm leading-tight">
                      {form.nameTh || "ชื่อองค์กร"}
                    </h4>
                    <span className="text-[9px] bg-primary/10 text-primary font-semibold px-1.5 py-0.2 rounded">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{form.nameEn || "Organization Name"}</p>
                  {(form.org.sloganTh || form.org.sloganEn) && (
                    <p className="text-xs text-primary italic mt-0.5">
                      &ldquo;{form.org.sloganTh || form.org.sloganEn}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </LiyonCard>

        {/* Card 3: ข้อมูลการติดต่อสำหรับแสดงผลหน้าเว็บไซต์ (Public Portal Contact Information) */}
        <LiyonCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="!mb-0">{t("settings.contactSectionTitle")}</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("settings.contactSectionDesc")}
              </p>
            </div>
          </div>

          <div className="fields">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("settings.contactPhone")} htmlFor="s-phone">
                <input
                  id="s-phone"
                  type="tel"
                  placeholder="02-xxx-xxxx หรือ 08x-xxx-xxxx"
                  value={form.org.contactPhone}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, contactPhone: e.target.value } })
                  }
                />
              </LiyonField>
              <LiyonField label={t("settings.contactEmail")} htmlFor="s-email">
                <input
                  id="s-email"
                  type="email"
                  placeholder="contact@fms.example.ac.th"
                  value={form.org.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, contactEmail: e.target.value } })
                  }
                />
              </LiyonField>
              <LiyonField label={t("settings.website")} htmlFor="s-website">
                <input
                  id="s-website"
                  type="url"
                  placeholder="https://fms.example.ac.th"
                  value={form.org.website}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, website: e.target.value } })
                  }
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LiyonField label={t("settings.officeHours")} htmlFor="s-office-hours">
                <input
                  id="s-office-hours"
                  type="text"
                  placeholder="จันทร์ - ศุกร์ 08:30 - 16:30 น."
                  value={form.org.officeHours}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, officeHours: e.target.value } })
                  }
                />
              </LiyonField>
              <LiyonField label={t("settings.facebook")} htmlFor="s-facebook">
                <input
                  id="s-facebook"
                  type="text"
                  placeholder="https://facebook.com/..."
                  value={form.org.facebook}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, facebook: e.target.value } })
                  }
                />
              </LiyonField>
              <LiyonField label={t("settings.line")} htmlFor="s-line">
                <input
                  id="s-line"
                  type="text"
                  placeholder="@lineid หรือ ลิงก์ LINE"
                  value={form.org.line}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, line: e.target.value } })
                  }
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("settings.address")} htmlFor="s-address">
                <input
                  id="s-address"
                  type="text"
                  placeholder="อาคาร 1 คณะวิทยาการจัดการ มหาวิทยาลัย..."
                  value={form.org.address}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, address: e.target.value } })
                  }
                />
              </LiyonField>
              <LiyonField label={t("settings.mapUrl")} htmlFor="s-map-url">
                <input
                  id="s-map-url"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={form.org.mapUrl}
                  onChange={(e) =>
                    setForm({ ...form, org: { ...form.org, mapUrl: e.target.value } })
                  }
                />
              </LiyonField>
            </div>
          </div>
        </LiyonCard>

        {/* Card 4: Brand Colour Palette (ระบบปรับโทนสี อยู่ถัดจากข้อความองค์กร) */}
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>

        {/* Card 4: SMTP Configuration Card */}
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
        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>

      {/* Logo Transformation & Crop Modal (<= 200 KB) */}
      <LogoCropModal
        key={cropModalOpen ? "crop-open" : "crop-closed"}
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        onSuccess={(logoUrl) => {
          setForm((prev) => ({ ...prev, logoUrl }));
          setErrors((prev) => ({ ...prev, logoUrl: [] }));
        }}
      />

      {/* World-Standard Organization Text Modal */}
      <OrgTextModal
        key={orgModalOpen ? "org-open" : "org-closed"}
        open={orgModalOpen}
        onOpenChange={setOrgModalOpen}
        initial={{
          nameTh: form.nameTh,
          nameEn: form.nameEn,
          sloganTh: form.org.sloganTh,
          sloganEn: form.org.sloganEn,
          descriptionTh: form.org.descriptionTh,
          descriptionEn: form.org.descriptionEn,
          website: form.org.website,
          contactEmail: form.org.contactEmail,
          contactPhone: form.org.contactPhone,
          address: form.org.address,
          facebook: form.org.facebook,
          line: form.org.line,
          officeHours: form.org.officeHours,
          mapUrl: form.org.mapUrl,
        }}
        logoUrl={form.logoUrl}
        onApply={(updated) => {
          setForm((prev) => ({
            ...prev,
            nameTh: updated.nameTh,
            nameEn: updated.nameEn,
            org: {
              sloganTh: updated.sloganTh,
              sloganEn: updated.sloganEn,
              descriptionTh: updated.descriptionTh,
              descriptionEn: updated.descriptionEn,
              website: updated.website,
              contactEmail: updated.contactEmail,
              contactPhone: updated.contactPhone,
              address: updated.address,
              facebook: updated.facebook ?? "",
              line: updated.line ?? "",
              officeHours: updated.officeHours ?? "",
              mapUrl: updated.mapUrl ?? "",
            },
          }));
          toast.success("อัปเดตข้อความองค์กรเรียบร้อยแล้ว (กรุณากดบันทึกเพื่อมีผลถาวร)");
        }}
      />
    </>
  );
}

