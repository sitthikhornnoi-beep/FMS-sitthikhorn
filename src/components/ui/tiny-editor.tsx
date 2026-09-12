"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface TinyEditorProps {
  id?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

// Dynamically load TinyMCE Editor to avoid SSR issues
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] rounded-lg border border-border bg-muted/20 flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs font-medium">กำลังโหลด Tiny Editor...</span>
      </div>
    ),
  }
);

export function TinyEditor({
  id,
  value,
  onChange,
  placeholder = "พิมพ์เนื้อหาข่าวที่นี่...",
  height = 380,
  disabled = false,
}: TinyEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border/80 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <Editor
        id={id}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        disabled={disabled}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: false,
          statusbar: true,
          branding: false,
          promotion: false,
          placeholder,
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | link image table | " +
            "removeformat code fullscreen",
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Thai', 'Prompt', 'Sarabun', sans-serif;
              font-size: 14.5px;
              line-height: 1.7;
              color: ${isDark ? "#f1f5f9" : "#1e293b"};
              background-color: ${isDark ? "#0f172a" : "#ffffff"};
              padding: 12px 14px;
            }
            p { margin-bottom: 0.85em; }
            h1, h2, h3, h4, h5, h6 { font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; }
            ul, ol { padding-left: 1.5em; margin-bottom: 0.85em; }
            blockquote { border-left: 3px solid #6366f1; padding-left: 1em; color: #64748b; font-style: italic; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            table, th, td { border: 1px solid ${isDark ? "#334155" : "#e2e8f0"}; }
            th, td { padding: 8px; text-align: left; }
          `,
        }}
      />
    </div>
  );
}
