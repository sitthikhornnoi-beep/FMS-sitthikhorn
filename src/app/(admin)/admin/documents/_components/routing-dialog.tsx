"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
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
  DocumentDetailDto,
  RoutingAction,
} from "@/features/documents";
import { routeDocumentAction } from "@/features/documents/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentDto | null;
  users: Array<{ id: string; name: string }>;
  canApprove: boolean;
  canEndorse: boolean;
  onSuccess: (doc: DocumentDetailDto) => void;
}

function RoutingDialogInner({
  open,
  onOpenChange,
  document: doc,
  users,
  canApprove,
  canEndorse,
  onSuccess,
}: Props) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [action, setAction] = useState<RoutingAction>(
    canApprove ? "APPROVE" : canEndorse ? "ENDORSE" : "FORWARD"
  );
  const [targetUserId, setTargetUserId] = useState("");
  const [comment, setComment] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

  if (!doc) return null;

  const requiresTargetUser = action === "FORWARD" || action === "ENDORSE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresTargetUser && !targetUserId) {
      toast.error(t("document.form.selectTargetUser"));
      return;
    }

    startTransition(async () => {
      try {
        const res = await routeDocumentAction({
          documentId: doc.id,
          action,
          targetUserId: requiresTargetUser ? targetUserId : null,
          comment: comment.trim() || null,
          signatureUrl: signatureUrl.trim() || null,
        });

        if (!res.ok) {
          toast.error(res.error.message || t("document.toast.error"));
          return;
        }

        switch (action) {
          case "APPROVE":
            toast.success(t("document.toast.approved"));
            break;
          case "REJECT":
            toast.success(t("document.toast.rejected"));
            break;
          case "RETURN_FOR_EDIT":
            toast.success(t("document.toast.returned"));
            break;
          default:
            toast.success(t("document.toast.routed"));
            break;
        }

        onSuccess(res.data);
        onOpenChange(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
        <LiyonDialogHeader
          title={t("document.route.dialogTitle")}
          description={t("document.route.dialogDesc")}
        />

        <LiyonDialogBody className="space-y-4">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {doc.docNumber ? `${doc.docNumber}: ` : ""}{doc.title}
            </div>
            <div className="text-neutral-500 dark:text-neutral-400">
              {t("document.col.submitter")}: {doc.submitterName} | {t("document.col.type")}: {t(`document.type.${doc.docType}`)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("document.route.selectAction")}
            </label>
            <LiyonSelect
              value={action}
              onChange={(e) => setAction(e.target.value as RoutingAction)}
              className="w-full text-sm"
            >
              {canEndorse && (
                <>
                  <option value="ENDORSE">{t("document.action.ENDORSE")}</option>
                  <option value="FORWARD">{t("document.action.FORWARD")}</option>
                  <option value="RETURN_FOR_EDIT">{t("document.action.RETURN_FOR_EDIT")}</option>
                </>
              )}
              {canApprove && (
                <>
                  <option value="APPROVE">{t("document.action.APPROVE")}</option>
                  <option value="REJECT">{t("document.action.REJECT")}</option>
                </>
              )}
            </LiyonSelect>
          </div>

          {requiresTargetUser && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t("document.route.nextAssignee")} <span className="text-red-500">*</span>
              </label>
              <LiyonSelect
                required
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

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("document.route.comment")}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("document.route.commentPlaceholder")}
              className="w-full px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t("document.route.signatureUrl")}
            </label>
            <input
              type="url"
              value={signatureUrl}
              onChange={(e) => setSignatureUrl(e.target.value)}
              placeholder="https://example.com/signatures/my-sign.png"
              className="w-full px-3 py-1.5 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
            />
          </div>
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
          <Button
            type="submit"
            disabled={isPending}
            className={action === "REJECT" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {action === "APPROVE"
              ? t("document.btn.approve")
              : action === "REJECT"
              ? t("document.btn.reject")
              : action === "RETURN_FOR_EDIT"
              ? t("document.btn.returnForEdit")
              : t("document.btn.confirm")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}

export function RoutingDialog(props: Props) {
  if (!props.open) return null;
  return <RoutingDialogInner key={props.document?.id ?? "route-doc"} {...props} />;
}

