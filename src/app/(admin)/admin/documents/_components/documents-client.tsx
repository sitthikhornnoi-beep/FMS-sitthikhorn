"use client";

import { useState, useTransition, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Inbox,
  Send,
  BookOpen,
  Archive,
  Eye,
  Edit2,
  Trash2,
  Ban,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogFooter,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  DocumentDto,
  DocumentDetailDto,
  DocumentStatsDto,
  DocStatus,
  DocUrgency,
  DocConfidentiality,
} from "@/features/documents";
import {
  cancelDocumentAction,
  deleteDocumentAction,
  submitDocumentAction,
} from "@/features/documents/actions";
import { DocumentFormDialog } from "./document-form-dialog";
import { RoutingDialog } from "./routing-dialog";
import { DocumentDetailDrawer } from "./document-detail-drawer";

interface Props {
  initialDocuments: DocumentDto[];
  initialStats: DocumentStatsDto;
  departments: Array<{ id: string; nameTh: string; nameEn: string }>;
  users: Array<{ id: string; name: string }>;
  currentUserId: string;
  canCreate: boolean;
  canEndorse: boolean;
  canApprove: boolean;
  canManage: boolean;
}

export function DocumentsClient({
  initialDocuments,
  initialStats,
  departments,
  users,
  currentUserId,
  canCreate,
  canEndorse,
  canApprove,
  canManage: _canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();

  const [documents, setDocuments] = useState<DocumentDto[]>(initialDocuments);
  const [stats] = useState<DocumentStatsDto>(initialStats);
  const [activeTab, setActiveTab] = useState<"inbox" | "mySubmissions" | "registry" | "archive">("inbox");

  // Filters
  const [search, setSearch] = useState("");
  const [filterDocType, setFilterDocType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDept, setFilterDept] = useState<string>("");

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentDto | null>(null);

  const [routingOpen, setRoutingOpen] = useState(false);
  const [routingDoc, setRoutingDoc] = useState<DocumentDto | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<DocumentDetailDto | null>(null);

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

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

  // Filter documents according to active tab and search criteria
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Tab filter
      if (activeTab === "inbox") {
        const isActionable = ["SUBMITTED", "IN_REVIEW"].includes(doc.status);
        const isAssigned = doc.currentAssigneeId === currentUserId || canApprove;
        if (!isActionable || !isAssigned) return false;
      } else if (activeTab === "mySubmissions") {
        if (doc.submitterId !== currentUserId) return false;
      } else if (activeTab === "archive") {
        if (!["APPROVED", "REJECTED", "CANCELLED"].includes(doc.status)) return false;
      } else if (activeTab === "registry") {
        if (doc.status === "DRAFT") return false;
      }

      // Dropdown filters
      if (filterDocType && doc.docType !== filterDocType) return false;
      if (filterStatus && doc.status !== filterStatus) return false;
      if (filterDept && doc.departmentId !== filterDept) return false;

      // Keyword search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const docNumMatch = doc.docNumber?.toLowerCase().includes(q) ?? false;
        const titleMatch = doc.title.toLowerCase().includes(q);
        const submitterMatch = doc.submitterName.toLowerCase().includes(q);
        const originalNumMatch = doc.originalDocNumber?.toLowerCase().includes(q) ?? false;
        if (!docNumMatch && !titleMatch && !submitterMatch && !originalNumMatch) return false;
      }

      return true;
    });
  }, [documents, activeTab, currentUserId, canApprove, filterDocType, filterStatus, filterDept, search]);

  const handleOpenDetail = (doc: DocumentDto) => {
    // Open detail dialog
    setDetailDoc({
      ...doc,
      routings: (doc as DocumentDetailDto).routings || [],
    });
    setDetailOpen(true);
  };

  const handleOpenRouting = (doc: DocumentDto) => {
    setRoutingDoc(doc);
    setRoutingOpen(true);
  };

  const handleSavedDoc = (savedDoc: DocumentDto) => {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === savedDoc.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedDoc;
        return updated;
      }
      return [savedDoc, ...prev];
    });
  };

  const handleRoutedDoc = (updated: DocumentDetailDto) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleCancel = (id: string) => {
    startTransition(async () => {
      try {
        const res = await cancelDocumentAction(id);
        if (!res.ok) {
          toast.error(res.error.message || t("document.toast.error"));
          return;
        }
        toast.success(t("document.toast.cancelled"));
        setDocuments((prev) => prev.map((d) => (d.id === id ? res.data : d)));
        setConfirmCancelId(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        const res = await deleteDocumentAction(id);
        if (!res.ok) {
          toast.error(res.error.message || t("document.toast.error"));
          return;
        }
        toast.success(t("document.toast.deleted"));
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setConfirmDeleteId(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
      }
    });
  };

  const handleSubmitDraftDirectly = (doc: DocumentDto) => {
    startTransition(async () => {
      try {
        const res = await submitDocumentAction({ id: doc.id });
        if (!res.ok) {
          toast.error(res.error.message || t("document.toast.error"));
          return;
        }
        toast.success(t("document.toast.submitted"));
        handleSavedDoc(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
      }
    });
  };

  const columns: DataTableColumn<DocumentDto>[] = [
    {
      key: "docNumber",
      header: t("document.col.docNumber"),
      sortable: true,
      render: (row: DocumentDto) => (
        <div className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
          {row.docNumber ? (
            <span className="text-primary hover:underline cursor-pointer" onClick={() => handleOpenDetail(row)}>
              {row.docNumber}
            </span>
          ) : (
            <span className="text-neutral-400 font-normal italic">
              {t("document.drawer.none")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: t("document.col.title"),
      render: (row: DocumentDto) => (
        <div className="max-w-md">
          <div
            onClick={() => handleOpenDetail(row)}
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary cursor-pointer line-clamp-1 text-sm"
          >
            {row.title}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-2">
            <span>{t(`document.type.${row.docType}`)}</span>
            {row.departmentName && <span>• {row.departmentName}</span>}
            {row.attachments && row.attachments.length > 0 && (
              <span className="text-primary">• {row.attachments.length} ไฟล์แนบ</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "urgency",
      header: t("document.col.urgency"),
      render: (row: DocumentDto) => (
        <StatusPill tone={urgencyToneMap[row.urgency]}>
          {t(`document.urgency.${row.urgency}`)}
        </StatusPill>
      ),
    },
    {
      key: "confidentiality",
      header: t("document.col.confidentiality"),
      render: (row: DocumentDto) => (
        <StatusPill tone={confidentialityToneMap[row.confidentiality]}>
          {t(`document.confidentiality.${row.confidentiality}`)}
        </StatusPill>
      ),
    },
    {
      key: "status",
      header: t("document.col.status"),
      render: (row: DocumentDto) => (
        <StatusPill tone={statusToneMap[row.status]}>
          {t(`document.status.${row.status}`)}
        </StatusPill>
      ),
    },
    {
      key: "submitter",
      header: t("document.col.submitter"),
      render: (row: DocumentDto) => (
        <div className="text-xs">
          <div className="font-medium text-neutral-800 dark:text-neutral-200">{row.submitterName}</div>
          <div className="text-[11px] text-neutral-400">{formatDate(row.createdAt, locale)}</div>
        </div>
      ),
    },
    {
      key: "assignee",
      header: t("document.col.assignee"),
      render: (row: DocumentDto) => (
        <div className="text-xs text-neutral-700 dark:text-neutral-300">
          {row.currentAssigneeName || "-"}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("document.col.actions"),
      className: "text-right",
      render: (row: DocumentDto) => {
        const isActionable = (row.status === "SUBMITTED" || row.status === "IN_REVIEW") &&
          (row.currentAssigneeId === currentUserId || canApprove || canEndorse);

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOpenDetail(row)}
              className="h-8 px-2 text-xs"
              title={t("document.btn.viewTimeline")}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              {t("document.btn.viewTimeline")}
            </Button>

            {isActionable && (
              <Button
                size="sm"
                onClick={() => handleOpenRouting(row)}
                className="h-8 px-2.5 text-xs bg-primary text-white"
              >
                {t("document.btn.route")}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("document.title")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t("document.subtitle")}
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => {
              setEditingDoc(null);
              setFormOpen(true);
            }}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("document.btn.create")}
          </Button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("inbox")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === "inbox"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {t("document.stats.inbox")}
            </span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">
            {stats.inboxCount}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">
            {t("document.tab.inbox")}
          </span>
        </div>

        <div
          onClick={() => setActiveTab("mySubmissions")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === "mySubmissions"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {t("document.stats.mySubmissions")}
            </span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">
            {stats.mySubmissionsCount}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 block">
            {t("document.tab.mySubmissions")}
          </span>
        </div>

        <div
          onClick={() => setActiveTab("registry")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === "registry"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {t("document.stats.total")}
            </span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">
            {stats.registryCount}
          </div>
          <span className="text-[11px] text-primary mt-0.5 block">
            {t("document.tab.registry")}
          </span>
        </div>

        <div
          onClick={() => setActiveTab("archive")}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeTab === "archive"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {t("document.stats.completed")}
            </span>
            <Archive className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-2">
            {stats.archiveCount}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {t("document.tab.archive")}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "inbox"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Inbox className="w-4 h-4" />
          {t("document.tab.inbox")}
          {stats.inboxCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold">
              {stats.inboxCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("mySubmissions")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "mySubmissions"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Send className="w-4 h-4" />
          {t("document.tab.mySubmissions")}
        </button>

        <button
          onClick={() => setActiveTab("registry")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "registry"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t("document.tab.registry")}
        </button>

        <button
          onClick={() => setActiveTab("archive")}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === "archive"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Archive className="w-4 h-4" />
          {t("document.tab.archive")}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("document.search.placeholder")}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <LiyonSelect
          value={filterDocType}
          onChange={(e) => setFilterDocType(e.target.value)}
          className="text-xs py-1.5"
        >
          <option value="">{t("document.filter.allTypes")}</option>
          <option value="MEMO">{t("document.type.MEMO")}</option>
          <option value="INCOMING">{t("document.type.INCOMING")}</option>
          <option value="OUTGOING">{t("document.type.OUTGOING")}</option>
          <option value="COMMAND">{t("document.type.COMMAND")}</option>
          <option value="ANNOUNCEMENT">{t("document.type.ANNOUNCEMENT")}</option>
        </LiyonSelect>

        <LiyonSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs py-1.5"
        >
          <option value="">{t("document.filter.allStatuses")}</option>
          <option value="DRAFT">{t("document.status.DRAFT")}</option>
          <option value="SUBMITTED">{t("document.status.SUBMITTED")}</option>
          <option value="IN_REVIEW">{t("document.status.IN_REVIEW")}</option>
          <option value="APPROVED">{t("document.status.APPROVED")}</option>
          <option value="REJECTED">{t("document.status.REJECTED")}</option>
          <option value="CANCELLED">{t("document.status.CANCELLED")}</option>
        </LiyonSelect>

        <LiyonSelect
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="text-xs py-1.5"
        >
          <option value="">{t("document.form.selectDepartment")}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameTh}
            </option>
          ))}
        </LiyonSelect>

        {(search || filterDocType || filterStatus || filterDept) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearch("");
              setFilterDocType("");
              setFilterStatus("");
              setFilterDept("");
            }}
            className="text-xs text-neutral-500 h-8"
          >
            {t("document.btn.reset")}
          </Button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <DataTable<DocumentDto>
          state={filteredDocuments.length === 0 ? "empty" : "data"}
          rows={filteredDocuments}
          columns={columns}
          getRowId={(row) => row.id}
          headHeading={t("document.title")}
          renderRowMenu={(row) => {
            const isMyDraft = row.status === "DRAFT" && row.submitterId === currentUserId;
            const isActionable =
              (row.status === "SUBMITTED" || row.status === "IN_REVIEW") &&
              (row.currentAssigneeId === currentUserId || canApprove || canEndorse);

            return (
              <>
                <RowMenuItem
                  onSelect={() => handleOpenDetail(row)}
                  icon={<Eye className="h-4 w-4" />}
                >
                  {t("document.btn.viewTimeline")}
                </RowMenuItem>

                {isActionable && (
                  <RowMenuItem
                    onSelect={() => handleOpenRouting(row)}
                    icon={<Send className="h-4 w-4" />}
                  >
                    {t("document.btn.route")}
                  </RowMenuItem>
                )}

                {isMyDraft && (
                  <>
                    <RowMenuItem
                      onSelect={() => handleSubmitDraftDirectly(row)}
                      icon={<Send className="h-4 w-4" />}
                    >
                      {t("document.btn.submit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => {
                        setEditingDoc(row);
                        setFormOpen(true);
                      }}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      {t("document.form.editTitle")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setConfirmDeleteId(row.id)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("document.btn.delete")}
                    </RowMenuItem>
                  </>
                )}

                {row.status === "SUBMITTED" && row.submitterId === currentUserId && (
                  <RowMenuItem
                    onSelect={() => setConfirmCancelId(row.id)}
                    danger
                    icon={<Ban className="h-4 w-4" />}
                  >
                    {t("document.btn.cancel")}
                  </RowMenuItem>
                )}
              </>
            );
          }}
          empty={{
            icon: <FileText className="h-10 w-10 text-muted-foreground/50" />,
            title: t("document.empty.title"),
            description: t("document.empty.desc"),
          }}
          error={{
            icon: <FileText className="h-10 w-10 text-destructive" />,
            title: t("document.toast.error"),
          }}
        />
      </div>

      {/* Form Dialog */}
      <DocumentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingDoc}
        departments={departments}
        users={users}
        onSuccess={handleSavedDoc}
      />

      {/* Routing Dialog */}
      <RoutingDialog
        open={routingOpen}
        onOpenChange={setRoutingOpen}
        document={routingDoc}
        users={users}
        canApprove={canApprove}
        canEndorse={canEndorse}
        onSuccess={handleRoutedDoc}
      />

      {/* Detail Drawer */}
      <DocumentDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        document={detailDoc}
        canEndorse={canEndorse}
        canApprove={canApprove}
        currentUserId={currentUserId}
        onOpenRouting={handleOpenRouting}
        onSuccess={handleRoutedDoc}
      />

      {/* Confirm Cancel Dialog */}
      <LiyonDialog open={!!confirmCancelId} onOpenChange={(open) => !open && setConfirmCancelId(null)}>
        <LiyonDialogHeader
          title={t("document.confirm.cancelTitle")}
          description={t("document.confirm.cancelDesc")}
        />
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setConfirmCancelId(null)}>
            {t("document.btn.close")}
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => confirmCancelId && handleCancel(confirmCancelId)}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("document.btn.cancel")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Confirm Delete Dialog */}
      <LiyonDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <LiyonDialogHeader
          title={t("document.confirm.deleteTitle")}
          description={t("document.confirm.deleteDesc")}
        />
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
            {t("document.btn.close")}
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("document.btn.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
