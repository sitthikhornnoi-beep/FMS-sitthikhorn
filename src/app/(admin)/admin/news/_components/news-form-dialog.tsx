"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Sparkles, Loader2, FileCode, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TinyEditor } from "@/components/ui/tiny-editor";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  translateNewsWithGeminiAction,
} from "@/features/news/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: NewsArticleDto | null;
  categories: NewsCategoryDto[];
  onSaved: (saved: NewsArticleDto) => void;
}

export function NewsFormDialog({ open, onOpenChange, article, categories, onSaved }: Props) {
  if (!open) return null;
  return (
    <NewsFormDialogInner
      key={article?.id ?? "create"}
      open={open}
      onOpenChange={onOpenChange}
      article={article}
      categories={categories}
      onSaved={onSaved}
    />
  );
}

function NewsFormDialogInner({ open, onOpenChange, article, categories, onSaved }: Props) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [titleTh, setTitleTh] = useState(article?.titleTh ?? "");
  const [titleEn, setTitleEn] = useState(article?.titleEn ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [summaryTh, setSummaryTh] = useState(article?.summaryTh ?? "");
  const [summaryEn, setSummaryEn] = useState(article?.summaryEn ?? "");
  const [contentTh, setContentTh] = useState(article?.contentTh ?? "");
  const [contentEn, setContentEn] = useState(article?.contentEn ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    article?.status === "PUBLISHED" ? "PUBLISHED" : article?.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT"
  );
  const [isPinned, setIsPinned] = useState(article?.isPinned ?? false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [useTinyEditorTh, setUseTinyEditorTh] = useState(true);
  const [useTinyEditorEn, setUseTinyEditorEn] = useState(true);

  const handleAiTranslate = async () => {
    if (!titleTh.trim()) {
      toast.error(t("news.aiTranslateEmptyThai"));
      return;
    }

    setIsTranslating(true);
    try {
      const res = await translateNewsWithGeminiAction({
        titleTh: titleTh.trim(),
        summaryTh: summaryTh.trim() || undefined,
        contentTh: contentTh.trim() || undefined,
      });

      if (res.ok && res.data) {
        if (res.data.titleEn) setTitleEn(res.data.titleEn);
        if (res.data.summaryEn) setSummaryEn(res.data.summaryEn);
        if (res.data.contentEn) setContentEn(res.data.contentEn);
        if (res.data.suggestedSlug && (!slug || slug === "news" || !article)) {
          setSlug(res.data.suggestedSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
        }
        toast.success(t("news.aiTranslateSuccess"));
      } else {
        const errMsg = (!res.ok ? res.error.message : "") || "AI translation error";
        toast.error(t("news.aiTranslateError", { error: errMsg }));
      }
    } catch (e) {
      toast.error(t("news.aiTranslateError", { error: e instanceof Error ? e.message : String(e) }));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitleTh(val);
    if (!article && !slug) {
      const clean = val.toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      if (clean) setSlug(clean);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isContentEmpty =
      !contentTh ||
      contentTh.trim() === "" ||
      contentTh.trim() === "<p></p>" ||
      contentTh.trim() === "<p><br></p>";

    if (!titleTh.trim() || !slug.trim() || isContentEmpty) {
      if (isContentEmpty) toast.error("กรุณากรอกเนื้อหาข่าว (ภาษาไทย)");
      return;
    }

    startTransition(async () => {
      const payload = {
        categoryId: categoryId || null,
        titleTh,
        titleEn: titleEn || null,
        slug,
        summaryTh: summaryTh || null,
        summaryEn: summaryEn || null,
        contentTh,
        contentEn: contentEn || null,
        coverImageUrl: coverImageUrl || null,
        status,
        isPinned,
        pinnedOrder: 0,
      };

      if (article) {
        const res = await updateNewsArticleAction({
          id: article.id,
          ...payload,
        });

        if (res.ok) {
          toast.success(t("news.saveSuccess"));
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Failed to update article");
        }
      } else {
        const res = await createNewsArticleAction(payload);

        if (res.ok) {
          toast.success(t("news.saveSuccess"));
          onSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error?.message ?? "Failed to create article");
        }
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <form onSubmit={handleSubmit}>
        <LiyonDialogHeader
          title={article ? t("news.edit") : t("news.create")}
          description={t("news.desc")}
        />

        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Gemini AI Translation Assistant Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">ตัวช่วยแปลข่าว 2 ภาษาด้วย Gemini AI</span>
                <p className="text-[11px] text-muted-foreground">กรอกข้อมูลภาษาไทยแล้วกดปุ่มนี้เพื่อแปลและสร้างเนื้อหาภาษาอังกฤษอัตโนมัติ</p>
              </div>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isPending || isTranslating}
              onClick={handleAiTranslate}
              className="inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-sm text-xs"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("news.aiTranslating")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("news.btn.aiTranslate")}</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("news.field.titleTh")}>
              <input
                type="text"
                required
                value={titleTh}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="เช่น ประกาศเปิดรับสมัครนักศึกษาใหม่"
              />
            </LiyonField>

            <LiyonField label={t("news.field.titleEn")}>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Admissions Announcement"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("news.field.slug")}>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. admissions-2027"
              />
            </LiyonField>

            <LiyonField label={t("news.field.category")}>
              <LiyonSelect
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">{t("news.field.categorySelect")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameTh}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>
          </div>

          <LiyonField label={t("news.field.coverImageUrl")}>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="https://example.com/image.jpg"
            />
          </LiyonField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("news.field.status")}>
              <LiyonSelect
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
              >
                <option value="DRAFT">{t("news.status.DRAFT")}</option>
                <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
              </LiyonSelect>
            </LiyonField>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="isPinned" className="text-xs font-medium text-foreground cursor-pointer">
                {t("news.field.isPinned")}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiyonField label={t("news.field.summaryTh")}>
              <textarea
                rows={2}
                value={summaryTh}
                onChange={(e) => setSummaryTh(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="สรุปเนื้อหาข่าวสั้นๆ (ภาษาไทย)"
              />
            </LiyonField>

            <LiyonField label={t("news.field.summaryEn")}>
              <textarea
                rows={2}
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Summary snippet (English)"
              />
            </LiyonField>
          </div>

          {/* เนื้อหาข่าว (ไทย) * พร้อม Tiny Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span>{t("news.field.contentTh")}</span>
                <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUseTinyEditorTh((prev) => !prev)}
                className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-primary/10 transition-colors"
                title={useTinyEditorTh ? "สลับไปใช้กล่องข้อความธรรมดา / HTML Code" : "สลับไปใช้ Tiny Editor (Rich Text)"}
              >
                <FileCode className="w-3 h-3" />
                <span>{useTinyEditorTh ? "โหมดข้อความดิบ / โค้ด" : "โหมด Tiny Editor"}</span>
              </button>
            </div>
            {useTinyEditorTh ? (
              <TinyEditor
                id="news-content-th"
                value={contentTh}
                onChange={setContentTh}
                placeholder="พิมพ์เนื้อหาข่าวแบบละเอียด (ภาษาไทย) จัดย่อหน้า ตัวหนา ตัวเอียง ลิงก์ รูปภาพ และตาราง..."
                height={360}
              />
            ) : (
              <textarea
                rows={8}
                required
                value={contentTh}
                onChange={(e) => setContentTh(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                placeholder="เนื้อหาข่าวแบบละเอียด (ภาษาไทย)..."
              />
            )}
          </div>

          {/* เนื้อหาข่าว (อังกฤษ) พร้อม Tiny Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span>{t("news.field.contentEn")}</span>
              </label>
              <button
                type="button"
                onClick={() => setUseTinyEditorEn((prev) => !prev)}
                className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-primary/10 transition-colors"
                title={useTinyEditorEn ? "สลับไปใช้กล่องข้อความธรรมดา / HTML Code" : "สลับไปใช้ Tiny Editor (Rich Text)"}
              >
                <FileCode className="w-3 h-3" />
                <span>{useTinyEditorEn ? "โหมดข้อความดิบ / โค้ด" : "โหมด Tiny Editor"}</span>
              </button>
            </div>
            {useTinyEditorEn ? (
              <TinyEditor
                id="news-content-en"
                value={contentEn}
                onChange={setContentEn}
                placeholder="Full article content (English)..."
                height={260}
              />
            ) : (
              <textarea
                rows={5}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                placeholder="Full article content (English)..."
              />
            )}
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("common.saving") : t("common.save")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
