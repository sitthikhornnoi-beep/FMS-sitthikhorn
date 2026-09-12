"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  AlignCenter,
  RefreshCw,
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from "lucide-react";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { useT } from "@/shared/lib/i18n/client";

interface LogoCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (logoUrl: string) => void;
}

const MAX_BYTES = 200 * 1024; // 200 KB
const PREVIEW_SIZE = 340; // Canvas viewport size (px)
const EXPORT_SIZE = 512; // Final exported crop size (px)

export function LogoCropModal({ open, onOpenChange, onSuccess }: LogoCropModalProps) {
  const t = useT();

  // Source image state
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Transform controls state
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse pan state
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // File size calculation state
  const [calculatedSize, setCalculatedSize] = useState<number | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image object directly without cascading effect render
  const loadImage = useCallback((src: string) => {
    setIsLoadingImage(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageObj(img);
      setScale(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setIsLoadingImage(false);
    };
    img.onerror = () => {
      toast.error(t("settings.invalidUrlOrCors"));
      setIsLoadingImage(false);
    };
    img.src = src;
  }, [t]);

  // Redraw preview canvas whenever image or transform changes
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    // Draw background grid pattern
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    ctx.save();
    // Center of preview canvas
    ctx.translate(PREVIEW_SIZE / 2 + offset.x, PREVIEW_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Fit image nicely into preview bounds initially
    const maxDim = Math.max(imageObj.naturalWidth, imageObj.naturalHeight);
    const fitFactor = PREVIEW_SIZE / maxDim;
    const w = imageObj.naturalWidth * fitFactor;
    const h = imageObj.naturalHeight * fitFactor;

    ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Draw visual crop overlay mask (circle + 1:1 square guide)
    ctx.save();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    // Outer guide box (1:1 crop frame)
    const margin = 10;
    const boxSize = PREVIEW_SIZE - margin * 2;
    ctx.strokeRect(margin, margin, boxSize, boxSize);

    // Circular crop guide
    ctx.beginPath();
    ctx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, boxSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(147, 51, 234, 0.45)";
    ctx.stroke();

    ctx.restore();
  }, [imageObj, scale, rotation, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Generate compressed blob adhering to <= 200 KB limit
  const generateCompressedBlob = useCallback(async (): Promise<Blob | null> => {
    if (!imageObj) return null;

    let targetSize = EXPORT_SIZE;
    let quality = 0.92;

    const renderBlob = (size: number, q: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
        const offscreen = document.createElement("canvas");
        offscreen.width = size;
        offscreen.height = size;
        const ctx = offscreen.getContext("2d");
        if (!ctx) return resolve(null);

        // Fill white background for transparent PNG if exported as JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        const exportRatio = size / PREVIEW_SIZE;
        ctx.translate(size / 2 + offset.x * exportRatio, size / 2 + offset.y * exportRatio);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale * exportRatio, scale * exportRatio);

        const maxDim = Math.max(imageObj.naturalWidth, imageObj.naturalHeight);
        const fitFactor = PREVIEW_SIZE / maxDim;
        const w = imageObj.naturalWidth * fitFactor;
        const h = imageObj.naturalHeight * fitFactor;

        ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);
        ctx.restore();

        offscreen.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          q
        );
      });
    };

    let blob = await renderBlob(targetSize, quality);
    if (!blob) return null;

    // Smart compression loop to guarantee <= 200 KB
    while (blob.size > MAX_BYTES && quality > 0.4) {
      quality -= 0.12;
      const nextBlob = await renderBlob(targetSize, quality);
      if (nextBlob) blob = nextBlob;
    }

    while (blob.size > MAX_BYTES && targetSize > 256) {
      targetSize -= 64;
      const nextBlob = await renderBlob(targetSize, quality);
      if (nextBlob) blob = nextBlob;
    }

    return blob;
  }, [imageObj, scale, rotation, offset]);

  // Recalculate estimated size periodically
  useEffect(() => {
    if (!imageObj) return;
    const timer = setTimeout(async () => {
      const blob = await generateCompressedBlob();
      if (blob) {
        setCalculatedSize(blob.size);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [imageObj, generateCompressedBlob]);

  // File loading handlers
  function processFile(file: File) {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error(t("settings.invalidFileType"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        loadImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  }

  function handleLoadFromUrl() {
    if (!externalUrl.trim()) return;
    loadImage(externalUrl.trim());
  }

  // Mouse pan event handlers
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isPanning) return;
    setOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }

  function handleMouseUp() {
    setIsPanning(false);
  }

  // Touch pan event handlers
  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y,
    });
  }

  // Reset transformations
  function handleReset() {
    setScale(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }

  // Center image
  function handleCenter() {
    setOffset({ x: 0, y: 0 });
  }

  // Upload cropped & compressed logo
  async function handleApplyAndUpload() {
    setUploading(true);
    try {
      const blob = await generateCompressedBlob();
      if (!blob) {
        toast.error(t("settings.uploadError"));
        setUploading(false);
        return;
      }

      if (blob.size > MAX_BYTES) {
        toast.error(`ขนาดภาพเกิน 200 KB (${Math.round(blob.size / 1024)} KB)`);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "logo-cropped.jpg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.ok && result.url) {
        onSuccess(result.url);
        toast.success(t("settings.uploadLogo"));
        onOpenChange(false);
      } else {
        toast.error(result.error || t("settings.uploadError"));
      }
    } catch {
      toast.error(t("settings.uploadError"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={t("settings.cropModalTitle")}
        description={t("settings.cropModalDesc")}
      />

      <LiyonDialogBody className="space-y-4">
        {!imageObj ? (
          /* Step 1: Upload Source Image (Drag & Drop or External URL) */
          <div className="space-y-4 py-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-medium text-foreground text-sm mb-1">{t("settings.dropzoneHint")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.dropzoneTypes")}</p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border absolute w-full" />
              <span className="bg-background px-3 text-xs text-muted-foreground relative font-medium">
                {t("settings.orFromUrl")}
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!externalUrl.trim() || isLoadingImage}
                onClick={handleLoadFromUrl}
                className="inline-flex items-center gap-2 cursor-pointer shrink-0"
              >
                {isLoadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileImage className="w-4 h-4" />
                )}
                <span>{t("settings.loadUrlBtn")}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Step 2: Interactive Crop, Zoom, Rotate, Center & Size Tools */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">
                {t("settings.toolCrop")} &bull; สัดส่วน 1:1
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImageObj(null);
                  setCalculatedSize(null);
                }}
                className="text-xs h-7 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {t("settings.changeFileBtn")}
              </Button>
            </div>

            {/* Viewport Canvas Area */}
            <div className="flex justify-center items-center bg-slate-900/5 dark:bg-slate-900/40 rounded-xl p-3 border border-border">
              <canvas
                ref={canvasRef}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="rounded-lg shadow-sm cursor-grab active:cursor-grabbing max-w-full touch-none"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              />
            </div>

            {/* Tool Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-3.5 rounded-lg border border-border text-xs">
              {/* Zoom Controls */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-medium">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-primary" />
                    {t("settings.toolZoom")}
                  </span>
                  <span className="text-muted-foreground font-mono">{Math.round(scale * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
                    className="p-1 rounded hover:bg-muted border border-border text-muted-foreground cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="flex-1 accent-primary cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.min(3, Number((s + 0.1).toFixed(2))))}
                    className="p-1 rounded hover:bg-muted border border-border text-muted-foreground cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rotate & Tilt Controls */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-medium">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-primary" />
                    {t("settings.toolRotate")}
                  </span>
                  <span className="text-muted-foreground font-mono">{rotation}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r - 90 < -180 ? r - 90 + 360 : r - 90))}
                    className="p-1 rounded hover:bg-muted border border-border text-muted-foreground cursor-pointer"
                    title="Rotate -90°"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={rotation > 45 || rotation < -45 ? 0 : rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                    className="flex-1 accent-primary cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90 > 180 ? r + 90 - 360 : r + 90))}
                    className="p-1 rounded hover:bg-muted border border-border text-muted-foreground cursor-pointer"
                    title="Rotate +90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center & Reset Buttons */}
              <div className="col-span-1 md:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCenter}
                    className="h-8 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>{t("settings.toolCenter")}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t("settings.toolReset")}</span>
                  </Button>
                </div>

                {/* File Size Calculation Indicator */}
                <div className="flex items-center gap-1.5 font-medium">
                  {calculatedSize !== null ? (
                    calculatedSize <= MAX_BYTES ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {Math.round(calculatedSize / 1024)} KB / 200 KB ({t("settings.fileSizeUnderLimit")})
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded text-[11px]">
                        <AlertCircle className="w-3 h-3" />
                        <span>กำลังบีบอัดอัตโนมัติ ({Math.round(calculatedSize / 1024)} KB)</span>
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-[11px]">คำนวณขนาดภาพ...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </LiyonDialogBody>

      <LiyonDialogFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={uploading}
          className="cursor-pointer"
        >
          {t("common.cancel")}
        </Button>
        {imageObj && (
          <Button
            type="button"
            onClick={handleApplyAndUpload}
            disabled={uploading}
            className="inline-flex items-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("settings.uploading")}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("settings.applyLogoBtn")}</span>
              </>
            )}
          </Button>
        )}
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
