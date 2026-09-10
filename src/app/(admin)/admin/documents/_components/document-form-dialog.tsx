"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  DocumentDto,
  DocType,
  DocUrgency,
  DocConfidentiality,
  AttachmentItem,
} from "@/features/documents";
import {
  createDocumentAction,
  updateDocumentAction,
} from "@/features/documents/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DocumentDto | null;
  departments: Array<{ id: string; nameTh: string; nameEn: string }>;
  users: Array<{ id: string; name: string }>;
  onSuccess: (doc: DocumentDto) => void;
}

function DocumentFormDialogInner({
  open,
  onOpenChange,
  initialData,
  departments,
  users,
  onSuccess,
}: Props) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [docType, setDocType] = useState<DocType>(initialData?.docType ?? "MEMO");
  const [urgency, setUrgency] = useState<DocUrgency>(initialData?.urgency ?? "NORMAL");
  const [confidentiality, setConfidentiality] = useState<DocConfidentiality>(initialData?.confidentiality ?? "NORMAL");
  const [departmentId, setDepartmentId] = useState(initialData?.departmentId ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [originalDocNumber, setOriginalDocNumber] = useState(initialData?.originalDocNumber ?? "");
  const [senderOrganization, setSenderOrganization] = useState(initialData?.senderOrganization ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [targetUserId, setTargetUserId] = useState("");
  const [isSubmitNow, setIsSubmitNow] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialData?.attachments ?? []);
  const [newAttName, setNewAttName] = useState("");
  const [newAttUrl, setNewAttUrl] = useState("");

  const isEditing = !!initialData;

  const handleAddAttachment = () => {
    if (!newAttName.trim() || !newAttUrl.trim()) return;
    try {
      new URL(newAttUrl);
    } catch {
      toast.error("URL ไฟล์ไม่ถูกต้อง");
      return;
    }
    setAttachments((prev) => [
      ...prev,
      { name: newAttName.trim(), url: newAttUrl.trim(), isMain: prev.length === 0 },
    ]);
    setNewAttName("");
    setNewAttUrl("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      toast.error(t("document.form.titlePlaceholder"));
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && initialData) {
          const res = await updateDocumentAction({
            id: initialData.id,
            docType,
            urgency,
            confidentiality,
            title: title.trim(),
            content: content.trim() || null,
            originalDocNumber: originalDocNumber.trim() || null,
            senderOrganization: senderOrganization.trim() || null,
            departmentId: departmentId || null,
            attachments,
          });

          if (!res.ok) {
            toast.error(res.error.message || t("document.toast.error"));
            return;
          }

          toast.success(t("document.toast.updated"));
          onSuccess(res.data);
          onOpenChange(false);
        } else {
          const res = await createDocumentAction({
            docType,
            urgency,
            confidentiality,
            title: title.trim(),
            content: content.trim() || null,
            originalDocNumber: originalDocNumber.trim() || null,
            senderOrganization: senderOrganization.trim() || null,
            departmentId: departmentId || null,
            attachments,
            targetUserId: targetUserId || null,
            isSubmitNow,
          });

          if (!res.ok) {
            toast.error(res.error.message || t("document.toast.error"));
            return;
          }

          toast.success(isSubmitNow ? t("document.toast.submitted") : t("document.toast.created"));
          onSuccess(res.data);
          onOpenChange(false);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <LiyonDialogHeader
          title={isEditing ? t("document.form.editTitle") : t("document.form.newTitle")}
          description={t("document.subtitle")}
        />

        <LiyonDialogBody className="space-y-4 overflow-y-auto pr-1">
          {/* Row 1: Document Type, Urgency, Confidentiality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t("document.form.docType")}
              </label>
              <LiyonSelect
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className="w-full text-sm"
              >
                <option value="MEMO">{t("document.type.MEMO")}</option>
                <option value="INCOMING">{t("document.type.INCOMING")}</option>
                <option value="OUTGOING">{t("document.type.OUTGOING")}</option>
                <option value="COMMAND">{t("document.type.COMMAND")}</option>
                <option value="ANNOUNCEMENT">{t("document.type.ANNOUNCEMENT")}</option>
              </LiyonSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t("document.form.urgency")}
              </label>
              <LiyonSelect
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as DocUrgency)}
                className="w-full text-sm"
              >
                <option value="NORMAL">{t("document.urgency.NORMAL")}</option>
                <option value="URGENT">{t("document.urgency.URGENT")}</option>
                <option value="VERY_URGENT">{t("document.urgency.VERY_URGENT")}</option>
                <option value="IMMEDIATE">{t("document.urgency.IMMEDIATE")}</option>
              </LiyonSelect>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t("document.form.confidentiality")}
              </label>
              <LiyonSelect
                value={confidentiality}
                onChange={(e) => setConfidentiality(e.target.value as DocConfidentiality)}
                className="w-full text-sm"
              >
                <option value="NORMAL">{t("document.confidentiality.NORMAL")}</option>
                <option value="CONFIDENTIAL">{t("document.confidentiality.CONFIDENTIAL")}</option>
                <option value="SECRET">{t("document.confidentiality.SECRET")}</option>
              </LiyonSelect>
            </div>
          </div>

          {/* Row 2: Department & Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("document.form.department")}
            </label>
            <LiyonSelect
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full text-sm"
            >
              <option value="">{t("document.form.selectDepartment")}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("document.form.title")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={500}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("document.form.titlePlaceholder")}
              className="w-full px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Conditional: Incoming / Outgoing letter fields */}
          {(docType === "INCOMING" || docType === "OUTGOING") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t("document.form.originalDocNumber")}
                </label>
                <input
                  type="text"
                  value={originalDocNumber}
                  onChange={(e) => setOriginalDocNumber(e.target.value)}
                  placeholder="เช่น อว 0200/ว 1289"
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t("document.form.senderOrg")}
                </label>
                <input
                  type="text"
                  value={senderOrganization}
                  onChange={(e) => setSenderOrganization(e.target.value)}
                  placeholder="เช่น สำนักงานปลัดกระทรวงการอุดมศึกษาฯ"
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          )}

          {/* Row 3: Content */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("document.form.content")}
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("document.form.contentPlaceholder")}
              className="w-full px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {t("document.form.attachments")}
            </label>

            {attachments.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium truncate">{att.name}</span>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline shrink-0 text-[11px]"
                      >
                        (Link)
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("document.form.attachmentName")}
                value={newAttName}
                onChange={(e) => setNewAttName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <input
                type="url"
                placeholder={t("document.form.attachmentUrl")}
                value={newAttUrl}
                onChange={(e) => setNewAttUrl(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttachment}
                className="text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t("document.form.addAttachment")}
              </Button>
            </div>
          </div>

          {/* Submission and Initial Assignment (when creating new) */}
          {!isEditing && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSubmitNow"
                  checked={isSubmitNow}
                  onChange={(e) => setIsSubmitNow(e.target.checked)}
                  className="rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isSubmitNow" className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">
                  {t("document.form.isSubmitNow")}
                </label>
              </div>

              {isSubmitNow && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t("document.form.targetUser")}
                  </label>
                  <LiyonSelect
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="">{t("document.form.selectTargetUser")}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </LiyonSelect>
                </div>
              )}
            </div>
          )}
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("document.btn.close")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing
              ? t("document.btn.confirm")
              : isSubmitNow
              ? t("document.btn.submit")
              : t("document.btn.saveDraft")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}

export function DocumentFormDialog(props: Props) {
  if (!props.open) return null;
  return <DocumentFormDialogInner key={props.initialData?.id ?? "new-doc"} {...props} />;
}

