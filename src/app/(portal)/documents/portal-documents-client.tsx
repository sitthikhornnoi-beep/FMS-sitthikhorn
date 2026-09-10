"use client";

import { useState, useTransition } from "react";
import {
  FileText,
  Search,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  DocumentDto,
  DocumentDetailDto,
  DocStatus,
} from "@/features/documents";
import { trackDocumentAction } from "@/features/documents/actions";

interface Props {
  initialDocuments: DocumentDto[];
}

export function PortalDocumentsClient({ initialDocuments }: Props) {
  const t = useT();
  const locale = useLocale();

  const [documents] = useState<DocumentDto[]>(initialDocuments);
  const [activeTab, setActiveTab] = useState<"announcements" | "tracking">("announcements");

  // Filter for announcements
  const [search, setSearch] = useState("");

  // Tracking state
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackedDoc, setTrackedDoc] = useState<DocumentDetailDto | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const statusToneMap: Record<DocStatus, StatusPillTone> = {
    APPROVED: "ok",
    IN_REVIEW: "warn",
    SUBMITTED: "info",
    DRAFT: "off",
    REJECTED: "bad",
    CANCELLED: "off",
  };

  const filteredAnnouncements = documents.filter((d) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (d.docNumber?.toLowerCase().includes(q) ?? false) ||
      d.title.toLowerCase().includes(q) ||
      (d.content?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    startTransition(async () => {
      try {
        setHasSearched(true);
        const res = await trackDocumentAction(trackingNumber.trim());
        if (!res.ok) {
          toast.error(res.error.message || t("document.toast.error"));
          setTrackedDoc(null);
          return;
        }
        setTrackedDoc(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t("document.toast.error");
        toast.error(msg);
        setTrackedDoc(null);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur text-blue-200 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("document.portal.publicBadge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("document.portal.title")}
          </h1>
          <p className="text-sm sm:text-base text-blue-200/90 leading-relaxed">
            {t("document.portal.subtitle")}
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-8">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`pb-3.5 text-base font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "announcements"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          <FileText className="w-5 h-5" />
          {t("document.portal.announcementsTab")}
        </button>

        <button
          onClick={() => setActiveTab("tracking")}
          className={`pb-3.5 text-base font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "tracking"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          <Clock className="w-5 h-5" />
          {t("document.portal.trackingTab")}
        </button>
      </div>

      {/* Tab 1: Announcements & Orders */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("document.portal.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* List of Documents */}
          {filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnouncements.map((doc) => {
                const mainAttachment = doc.attachments?.find((a) => a.isMain) ?? doc.attachments?.[0];
                return (
                  <div
                    key={doc.id}
                    className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {t(`document.type.${doc.docType}`)}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {doc.docNumber}
                        </span>
                      </div>

                      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base leading-snug">
                        {doc.title}
                      </h3>

                      {doc.content && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                          {doc.content}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(doc.approvedAt || doc.createdAt, locale)}</span>
                      </div>

                      {mainAttachment ? (
                        <a
                          href={mainAttachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t("document.portal.downloadDoc")}
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">
                          {t("document.drawer.noAttachments")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                {t("document.empty.title")}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {t("document.empty.desc")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Document Tracking Lookup */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {t("document.portal.trackPrompt")}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              เช่น &quot;อว 0604.01/ว 0001/2569&quot;, &quot;คำสั่งคณะ ที่ 1/2569&quot;, หรือ &quot;ประกาศคณะ ที่ 1/2569&quot;
            </p>

            <form onSubmit={handleTrack} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="กรอกเลขทะเบียนสารบรรณเต็มรูปแบบ..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" disabled={isPending} className="px-5">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("document.portal.trackBtn")}
              </Button>
            </form>
          </div>

          {/* Tracking Result */}
          {hasSearched && (
            <div>
              {trackedDoc ? (
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <div>
                      <span className="text-xs text-neutral-500 block">เลขทะเบียนสารบรรณ</span>
                      <span className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
                        {trackedDoc.docNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill tone={statusToneMap[trackedDoc.status]}>
                        {t(`document.status.${trackedDoc.status}`)}
                      </StatusPill>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                        {t(`document.type.${trackedDoc.docType}`)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                      {trackedDoc.title}
                    </h4>
                    <div className="text-xs text-neutral-500 mt-1 flex gap-4">
                      <span>ยื่นเรื่องเมื่อ: {formatDate(trackedDoc.createdAt, locale)}</span>
                      {trackedDoc.departmentName && <span>หน่วยงาน: {trackedDoc.departmentName}</span>}
                    </div>
                  </div>

                  {/* Public Routing Timeline */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                      {t("document.drawer.timeline")}
                    </h5>

                    {trackedDoc.routings && trackedDoc.routings.length > 0 ? (
                      <div className="relative pl-6 space-y-4 border-l-2 border-primary/40 ml-2">
                        {trackedDoc.routings.map((r) => (
                          <div key={r.id} className="relative">
                            <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow">
                              {r.stepOrder}
                            </div>
                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                  {r.actorName}
                                </span>
                                <span className="text-neutral-400 text-[11px]">
                                  {formatDate(r.createdAt, locale)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-medium">
                                  {t(`document.action.${r.action}`)}
                                </span>
                                {r.targetUserName && (
                                  <span className="text-neutral-500 flex items-center gap-1">
                                    <CornerDownRight className="w-3 h-3 text-neutral-400" />
                                    {r.targetUserName}
                                  </span>
                                )}
                              </div>
                              {r.comment && (
                                <p className="text-neutral-700 dark:text-neutral-300 italic mt-1">
                                  &ldquo;{r.comment}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic">
                        {t("document.drawer.noRoutings")}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {t("document.empty.title")}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    ไม่พบข้อมูลเอกสารสารบรรณสำหรับเลขที่ระบุ หรือเป็นเอกสารที่มีชั้นความลับ
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
