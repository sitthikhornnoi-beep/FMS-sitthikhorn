import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { logger } from "@/shared/lib/infra/logger";
import { requirePermission, P } from "@/features/identity/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  try {
    // 1. ตรวจสอบสิทธิ์ผู้ดูแลระบบ
    await requirePermission(P.settingsManage);

    // 2. อ่านข้อมูล Form Data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    // 3. ตรวจสอบขนาดไฟล์
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    // 4. ตรวจสอบประเภทไฟล์รูปภาพ
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid file type. Only PNG, JPG, WebP and GIF are allowed" },
        { status: 400 }
      );
    }

    const ext = EXTENSION_MAP[mimeType] || "png";
    const fileName = `logo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    logger.error("Failed to upload file", { error });
    return NextResponse.json(
      { ok: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
