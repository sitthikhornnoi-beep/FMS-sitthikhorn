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
import { Button } from "@/components/ui/button";
import type { NewsCategoryDto } from "@/features/news";
import { createNewsCategoryAction } from "@/features/news/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: NewsCategoryDto[];
  onCategoryCreated: (cat: NewsCategoryDto) => void;
}

export function CategoryDialog({ open, onOpenChange, categories, onCategoryCreated }: Props) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("blue");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh || !nameEn || !slug) return;

    startTransition(async () => {
      const res = await createNewsCategoryAction({
        nameTh,
        nameEn,
        slug,
        color,
      });

      if (res.ok) {
        toast.success(t("news.categorySaveSuccess"));
        onCategoryCreated(res.data);
        setNameTh("");
        setNameEn("");
        setSlug("");
        setColor("blue");
        onOpenChange(false);
      } else {
        toast.error(res.error?.message ?? "Failed to create category");
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <LiyonDialogHeader
          title={t("news.categoryManage")}
          description={t("news.category.create")}
        />

        <LiyonDialogBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">หมวดหมู่ที่มีอยู่แล้ว:</label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40">
              {categories.length === 0 ? (
                <span className="text-xs text-muted-foreground">ยังไม่มีหมวดหมู่</span>
              ) : (
                categories.map((c) => (
                  <span key={c.id} className="px-2 py-0.5 rounded-full text-xs bg-background border border-border">
                    {c.nameTh} ({c.slug})
                  </span>
                ))
              )}
            </div>
          </div>

          <LiyonField label={t("news.category.nameTh")}>
            <input
              type="text"
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="เช่น ข่าววิชาการ"
            />
          </LiyonField>

          <LiyonField label={t("news.category.nameEn")}>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Academic News"
            />
          </LiyonField>

          <LiyonField label={t("news.category.slug")}>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. academic"
            />
          </LiyonField>

          <LiyonField label={t("news.category.color")}>
            <LiyonSelect
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="blue">Blue</option>
              <option value="emerald">Green</option>
              <option value="amber">Amber</option>
              <option value="purple">Purple</option>
              <option value="rose">Rose</option>
            </LiyonSelect>
          </LiyonField>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("common.saving") : t("news.category.create")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
