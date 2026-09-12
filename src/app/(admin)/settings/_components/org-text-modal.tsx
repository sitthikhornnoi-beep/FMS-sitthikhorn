"use client";

import React, { useState } from "react";
import {
  Building2,
  Globe2,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Eye,
  FileText,
} from "lucide-react";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { useT } from "@/shared/lib/i18n/client";

export interface OrgFormState {
  nameTh: string;
  nameEn: string;
  sloganTh: string;
  sloganEn: string;
  descriptionTh: string;
  descriptionEn: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

interface OrgTextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: OrgFormState;
  logoUrl?: string;
  onApply: (updated: OrgFormState) => void;
}

export function OrgTextModal({
  open,
  onOpenChange,
  initial,
  logoUrl,
  onApply,
}: OrgTextModalProps) {
  const t = useT();
  const [draft, setDraft] = useState<OrgFormState>(initial);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  function handleSave() {
    onApply(draft);
    onOpenChange(false);
  }

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>{t("settings.orgModalTitle")}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t("settings.standardBadge")}
            </span>
          </div>
        }
        description={t("settings.orgModalDesc")}
      />

      <LiyonDialogBody className="space-y-4">
        {/* Navigation Tabs (Edit Form / Live Preview) */}
        <div className="flex border-b border-border text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer inline-flex items-center gap-2 ${
              activeTab === "edit"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>แก้ไขข้อมูล</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer inline-flex items-center gap-2 ${
              activeTab === "preview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{t("settings.previewBrandCard")}</span>
          </button>
        </div>

        {activeTab === "edit" ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Core Organization Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("settings.nameTh")} htmlFor="modal-name-th">
                <input
                  id="modal-name-th"
                  type="text"
                  required
                  value={draft.nameTh}
                  onChange={(e) => setDraft((prev) => ({ ...prev, nameTh: e.target.value }))}
                  placeholder="เช่น คณะวิทยาการจัดการ"
                />
              </LiyonField>
              <LiyonField label={t("settings.nameEn")} htmlFor="modal-name-en">
                <input
                  id="modal-name-en"
                  type="text"
                  required
                  value={draft.nameEn}
                  onChange={(e) => setDraft((prev) => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="e.g. Faculty of Management Sciences"
                />
              </LiyonField>
            </div>

            {/* Slogans / Taglines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("settings.sloganTh")} htmlFor="modal-slogan-th">
                <input
                  id="modal-slogan-th"
                  type="text"
                  value={draft.sloganTh}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sloganTh: e.target.value }))}
                  placeholder="คำขวัญหรือสโลแกนภาษาไทย"
                />
              </LiyonField>
              <LiyonField label={t("settings.sloganEn")} htmlFor="modal-slogan-en">
                <input
                  id="modal-slogan-en"
                  type="text"
                  value={draft.sloganEn}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sloganEn: e.target.value }))}
                  placeholder="Official Slogan or Tagline"
                />
              </LiyonField>
            </div>

            {/* Vision & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LiyonField label={t("settings.descriptionTh")} htmlFor="modal-desc-th">
                <textarea
                  id="modal-desc-th"
                  rows={3}
                  value={draft.descriptionTh}
                  onChange={(e) => setDraft((prev) => ({ ...prev, descriptionTh: e.target.value }))}
                  placeholder="วิสัยทัศน์หรือคำอธิบายองค์กรภาษาไทย..."
                  className="w-full text-sm p-2.5 border rounded-lg"
                />
              </LiyonField>
              <LiyonField label={t("settings.descriptionEn")} htmlFor="modal-desc-en">
                <textarea
                  id="modal-desc-en"
                  rows={3}
                  value={draft.descriptionEn}
                  onChange={(e) => setDraft((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                  placeholder="Corporate Vision & Mission description in English..."
                  className="w-full text-sm p-2.5 border rounded-lg"
                />
              </LiyonField>
            </div>

            {/* Contact Information */}
            <div className="pt-2 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                ข้อมูลติดต่อสากล (Global Contact Details)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <LiyonField label={t("settings.website")} htmlFor="modal-website">
                  <input
                    id="modal-website"
                    type="url"
                    value={draft.website}
                    onChange={(e) => setDraft((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://fms.example.ac.th"
                  />
                </LiyonField>
                <LiyonField label={t("settings.contactEmail")} htmlFor="modal-email">
                  <input
                    id="modal-email"
                    type="email"
                    value={draft.contactEmail}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@example.ac.th"
                  />
                </LiyonField>
                <LiyonField label={t("settings.contactPhone")} htmlFor="modal-phone">
                  <input
                    id="modal-phone"
                    type="tel"
                    value={draft.contactPhone}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="02-xxx-xxxx"
                  />
                </LiyonField>
              </div>
              <div className="mt-3">
                <LiyonField label={t("settings.address")} htmlFor="modal-address">
                  <input
                    id="modal-address"
                    type="text"
                    value={draft.address}
                    onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="ที่อยู่สำนักงาน / สำนักงานคณบดี..."
                  />
                </LiyonField>
              </div>
            </div>
          </div>
        ) : (
          /* Live Brand Identity Preview Card */
          <div className="py-2">
            <div className="rounded-xl border border-border bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border/80 pb-4">
                {logoUrl ? (
                  <div className="w-16 h-16 rounded-xl border border-border bg-background p-2 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                    <Building2 className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{draft.nameTh || "ชื่อองค์กรภาษาไทย"}</h3>
                    <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      Verified Brand
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{draft.nameEn || "Organization Name (English)"}</p>
                  {(draft.sloganTh || draft.sloganEn) && (
                    <p className="text-xs text-primary font-medium mt-1 italic flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      &ldquo;{draft.sloganTh || draft.sloganEn}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {(draft.descriptionTh || draft.descriptionEn) && (
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p>{draft.descriptionTh || draft.descriptionEn}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-muted-foreground">
                {draft.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-primary" />
                    <span>{draft.website}</span>
                  </div>
                )}
                {draft.contactEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{draft.contactEmail}</span>
                  </div>
                )}
                {draft.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{draft.contactPhone}</span>
                  </div>
                )}
                {draft.address && (
                  <div className="flex items-center gap-1.5 w-full">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{draft.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </LiyonDialogBody>

      <LiyonDialogFooter className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!draft.nameTh.trim() || !draft.nameEn.trim()}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>นำข้อมูลไปใช้</span>
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
