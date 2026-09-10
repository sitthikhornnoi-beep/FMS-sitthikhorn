"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Pin, PinOff, Tag, ExternalLink, AlertCircle, Newspaper, Search } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
  RowMenuItem,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import { deleteNewsArticleAction, togglePinArticleAction } from "@/features/news/actions";
import { NewsFormDialog } from "./news-form-dialog";
import { CategoryDialog } from "./category-dialog";

interface Props {
  initialArticles: NewsArticleDto[];
  initialCategories: NewsCategoryDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function NewsClient({ initialArticles, initialCategories, canManage, canCreate }: Props) {
  const t = useT();
  const locale = useLocale();
  const [articles, setArticles] = useState<NewsArticleDto[]>(initialArticles);
  const [categories, setCategories] = useState<NewsCategoryDto[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Search & Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticleDto | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleDto | null>(null);

  const openCreate = () => {
    setEditingArticle(null);
    setFormOpen(true);
  };

  const openEdit = (article: NewsArticleDto) => {
    setEditingArticle(article);
    setFormOpen(true);
  };

  const handleSaved = (saved: NewsArticleDto) => {
    setArticles((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleTogglePin = (article: NewsArticleDto) => {
    startTransition(async () => {
      const nextPin = !article.isPinned;
      const res = await togglePinArticleAction(article.id, nextPin);
      if (res.ok) {
        toast.success(t("news.pinSuccess"));
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, isPinned: nextPin } : a))
        );
      } else {
        toast.error(res.error?.message ?? "Failed to toggle pin");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteNewsArticleAction(deleteConfirmItem.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setArticles((prev) => prev.filter((a) => a.id !== deleteConfirmItem.id));
        setDeleteConfirmItem(null);
      } else {
        toast.error(res.error?.message ?? "Failed to delete article");
      }
    });
  };

  // Filtered List
  const filtered = articles.filter((a) => {
    if (filterCategory && a.categoryId !== filterCategory) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTh = a.titleTh.toLowerCase().includes(q);
      const matchEn = (a.titleEn ?? "").toLowerCase().includes(q);
      const matchSlug = a.slug.toLowerCase().includes(q);
      if (!matchTh && !matchEn && !matchSlug) return false;
    }
    return true;
  });

  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "title",
      header: t("news.field.titleTh"),
      render: (row) => (
        <div className="flex items-start gap-2.5 max-w-md">
          {row.isPinned && (
            <span className="mt-0.5 inline-flex p-1 rounded bg-amber-500/15 text-amber-600" title={t("news.pinned")}>
              <Pin className="w-3.5 h-3.5 fill-current" />
            </span>
          )}
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground text-sm line-clamp-1">
              {locale === "th" ? row.titleTh : (row.titleEn ?? row.titleTh)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>/{row.slug}</span>
              {row.status === "PUBLISHED" && (
                <a
                  href={`/news/${row.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.field.category"),
      render: (row) => (
        <span className="text-xs font-medium text-muted-foreground">
          {row.category ? (locale === "th" ? row.category.nameTh : row.category.nameEn) : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.field.status"),
      render: (row) => {
        let tone: "ok" | "warn" | "off" = "off";
        let label = row.status;
        if (row.status === "PUBLISHED") {
          tone = "ok";
          label = t("news.status.PUBLISHED");
        } else if (row.status === "DRAFT") {
          tone = "warn";
          label = t("news.status.DRAFT");
        } else if (row.status === "ARCHIVED") {
          label = t("news.status.ARCHIVED");
        }
        return (
          <StatusPill tone={tone}>
            {label}
          </StatusPill>
        );
      },
    },
    {
      key: "publishedAt",
      header: t("news.field.publishedAt"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.publishedAt ? formatDate(new Date(row.publishedAt), locale) : "-"}
        </span>
      ),
    },
    {
      key: "viewCount",
      header: "Views",
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.viewCount}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            <span>{t("news.title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("news.desc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryDialogOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Tag className="w-4 h-4" />
              <span>{t("news.categoryManage")}</span>
            </Button>
          )}

          {(canCreate || canManage) && (
            <Button
              size="sm"
              onClick={openCreate}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t("news.create")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        state="data"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        headHeading={t("news.title")}
        headMeta={`(${filtered.length} รายการ)`}
        toolbar={
          <>
            <span className="tsearch">
              <Search aria-hidden="true" className="w-4 h-4" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("news.searchPlaceholder")}
                aria-label={t("common.search")}
              />
            </span>
            <LiyonSelect
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">{t("news.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "th" ? c.nameTh : c.nameEn}
                </option>
              ))}
            </LiyonSelect>
            <LiyonSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">ทุกสถานะ</option>
              <option value="DRAFT">{t("news.status.DRAFT")}</option>
              <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
              <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
            </LiyonSelect>
          </>
        }
        empty={{
          icon: <Newspaper aria-hidden="true" className="w-8 h-8 opacity-40" />,
          title: t("news.noArticles"),
        }}
        error={{
          icon: <AlertCircle aria-hidden="true" className="w-8 h-8 opacity-40" />,
          title: "เกิดข้อผิดพลาดในการโหลดข่าวสาร",
        }}
        renderRowMenu={
          canManage
            ? (row) => (
                <>
                  <RowMenuItem
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onSelect={() => openEdit(row)}
                  >
                    {t("common.edit")}
                  </RowMenuItem>
                  <RowMenuItem
                    icon={row.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    onSelect={() => handleTogglePin(row)}
                  >
                    {row.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุดข่าวเด่น"}
                  </RowMenuItem>
                  <RowMenuItem
                    danger
                    icon={<Trash2 className="w-3.5 h-3.5 text-destructive" />}
                    onSelect={() => setDeleteConfirmItem(row)}
                  >
                    {t("common.delete")}
                  </RowMenuItem>
                </>
              )
            : undefined
        }
      />

      {/* Form Dialog */}
      <NewsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        article={editingArticle}
        categories={categories}
        onSaved={handleSaved}
      />

      {/* Category Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categories={categories}
        onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
      />

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title={t("news.delete")}
          description={t("news.deleteConfirm")}
        />
        <LiyonDialogBody>
          {deleteConfirmItem && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold line-clamp-1">{deleteConfirmItem.titleTh}</span>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
