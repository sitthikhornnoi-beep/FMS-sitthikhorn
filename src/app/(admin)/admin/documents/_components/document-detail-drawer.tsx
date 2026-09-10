"use client";

import { useTransition } from "react";
import {
  FileText,
  CornerDownRight,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  DocumentDetailDto,
  DocStatus,
  DocUrgency,
  DocConfidentiality,
} from "@/features/documents";
import { submitDocumentAction } from "@/features/documents/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentDetailDto | null;
  canEndorse: boolean;
  canApprove: boolean;
  currentUserId?: string;
  onOpenRouting: (doc: DocumentDetailDto) => void;
  onSuccess: (updated: DocumentDetailDto) => void;
}

export function DocumentDetailDrawer({
  open,
  onOpenChange,
  document: doc,
  canEndorse,
  canApprove,
  currentUserId,
  onOpenRouting,
  onSuccess,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  if (!doc) return null;

  const statusToneMap: Record<DocStatus, StatusPillTone> = {
    APPROVED: "ok",
    IN_REVIEW: "warn",
    SUBMITTED: "info",
    DRAFT: "off",
    REJECTED: "bad",
    CANCELLED: "off",
  };

  const urgencyToneMap: Record<DocUrgency, StatusPillTone> = {
    NORMAL: "off",
    URGENT: "info",
    VERY_URGENT: "warn",
    IMMEDIATE: "bad",
  };

  const confidentialityToneMap: Record<DocConfidentiality, StatusPillTone> = {
    NORMAL: "off",
    CONFIDENTIAL: "warn",
    SECRET: "bad",
  };

  const isMyDraft = doc.status === "DRAFT" && doc.submitterId === currentUserId;
  const isPendingMyAction = (doc.status === "SUBMITTED" || doc.status === "IN_REVIEW") &&
    (doc.currentAssigneeId === currentUserId || canApprove || canEndorse);

  const handleSubmitDraft = () => {
    startTransition(async () => {
      try {
        const res = await submitDocumentAction({ id: doc.id });
        if (!res.ok) {
          toast.error(res.error.message || t("document.toast.error"));
          return;
        }
        toast.success(t("document.toast.submitted"));
        onSuccess({ ...doc, ...res.data });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col h-full max-h-[90vh]">
        <LiyonDialogHeader
          title={doc.title}
          description={
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <StatusPill tone={statusToneMap[doc.status]}>
                {t(`document.status.${doc.status}`)}
              </StatusPill>
              <StatusPill tone={urgencyToneMap[doc.urgency]}>
                {t(`document.urgency.${doc.urgency}`)}
              </StatusPill>
              <StatusPill tone={confidentialityToneMap[doc.confidentiality]}>
                {t(`document.confidentiality.${doc.confidentiality}`)}
              </StatusPill>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("document.drawer.docNumber")}:{" "}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {doc.docNumber || t("document.drawer.none")}
                </span>
              </span>
            </div>
          }
        />

        <LiyonDialogBody className="space-y-6 overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-xs border border-neutral-200 dark:border-neutral-700">
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block mb-0.5">
                {t("document.col.type")}:
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {t(`document.type.${doc.docType}`)}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block mb-0.5">
                {t("document.col.department")}:
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {doc.departmentName || "-"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block mb-0.5">
                {t("document.col.submitter")}:
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {doc.submitterName}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block mb-0.5">
                {t("document.col.assignee")}:
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {doc.currentAssigneeName || "-"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block mb-0.5">
                {t("document.col.createdAt")}:
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatDate(doc.createdAt, locale)}
              </span>
            </div>
            {doc.approvedAt && (
              <div>
                <span className="text-neutral-500 dark:text-neutral-400 block mb-0.5">
                  {t("document.status.APPROVED")}:
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatDate(doc.approvedAt, locale)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          {doc.content && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                {t("document.form.content")}
              </h4>
              <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                {doc.content}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              {t("document.form.attachments")}
            </h4>
            {doc.attachments && doc.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {doc.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-xs group"
                  >
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium truncate text-neutral-800 dark:text-neutral-200 group-hover:text-primary">
                      {att.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 ml-auto shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic">
                {t("document.drawer.noAttachments")}
              </div>
            )}
          </div>

          {/* Routing History Timeline */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
              {t("document.drawer.timeline")}
            </h4>

            {doc.routings && doc.routings.length > 0 ? (
              <div className="relative pl-6 space-y-4 border-l-2 border-primary/30 ml-2">
                {doc.routings.map((r) => {
                  return (
                    <div key={r.id} className="relative group">
                      {/* Step Circle Indicator */}
                      <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow">
                        {r.stepOrder}
                      </div>

                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">
                            {r.actorName}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {formatDate(r.createdAt, locale)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] rounded font-medium bg-primary/10 text-primary">
                            {t(`document.action.${r.action}`)}
                          </span>
                          {r.targetUserName && (
                            <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                              <CornerDownRight className="w-3 h-3 text-neutral-400" />
                              {t("document.drawer.target")}: {r.targetUserName}
                            </span>
                          )}
                        </div>

                        {r.comment && (
                          <p className="text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-100 dark:border-neutral-800">
                            &ldquo;{r.comment}&rdquo;
                          </p>
                        )}

                        {r.signatureUrl && (
                          <div className="pt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.signatureUrl}
                              alt="Signature"
                              className="h-9 object-contain opacity-90 border-b border-neutral-300 pb-0.5"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic">
                {t("document.drawer.noRoutings")}
              </div>
            )}
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("document.btn.close")}
          </Button>

          {isMyDraft && (
            <Button disabled={isPending} onClick={handleSubmitDraft}>
              {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              {t("document.btn.submit")}
            </Button>
          )}

          {isPendingMyAction && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onOpenRouting(doc);
              }}
            >
              {t("document.btn.route")}
            </Button>
          )}
        </LiyonDialogFooter>
      </div>
    </LiyonDialog>
  );
}
