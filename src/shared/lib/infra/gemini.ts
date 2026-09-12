import "server-only";
import { logger } from "./logger";
import { prisma } from "./prisma";
import { errors } from "../errors";

export interface GeminiConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface NewsTranslationInput {
  titleTh: string;
  summaryTh?: string | null;
  contentTh?: string | null;
}

export interface NewsTranslationOutput {
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  suggestedSlug?: string;
}

/** ดึงการตั้งค่า Gemini จาก Tenant ในฐานข้อมูลก่อน ถ้าไม่มีจึงสลับไปใช้ Environment Variables */
export async function resolveGeminiConfig(tenantId?: string): Promise<GeminiConfig | null> {
  try {
    if (tenantId) {
      const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
      const g = (t?.settings as { gemini?: { enabled?: boolean; apiKey?: string; model?: string } } | null)?.gemini;
      if (g?.enabled !== false && g?.apiKey) {
        return {
          apiKey: g.apiKey,
          model: g.model || "gemini-2.0-flash",
          enabled: true,
        };
      }
    } else {
      const t = await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { settings: true } });
      const g = (t?.settings as { gemini?: { enabled?: boolean; apiKey?: string; model?: string } } | null)?.gemini;
      if (g?.enabled !== false && g?.apiKey) {
        return {
          apiKey: g.apiKey,
          model: g.model || "gemini-2.0-flash",
          enabled: true,
        };
      }
    }
  } catch (err) {
    logger.warn("resolveGeminiConfig from database failed, falling back to env", { err });
  }

  // Fallback to environment variables
  if (process.env.GEMINI_API_KEY) {
    return {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      enabled: true,
    };
  }

  return null;
}

/** ตรวจสอบและทดสอบการเชื่อมต่อไปยัง Gemini API */
export async function verifyGemini(
  apiKey: string,
  model = "gemini-2.0-flash"
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, reply with OK." }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data?.error?.message || `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** แปลและสร้างเนื้อหาข่าวสารเป็นภาษาอังกฤษระดับมืออาชีพด้วย Gemini AI */
export async function translateNewsWithGemini(
  input: NewsTranslationInput,
  tenantId?: string
): Promise<NewsTranslationOutput> {
  const cfg = await resolveGeminiConfig(tenantId);
  if (!cfg || !cfg.apiKey) {
    throw errors.validation(
      "ยังไม่ได้ตั้งค่า Gemini API Key ในระบบ กรุณาไปที่เมนู 'ตั้งค่าระบบ' (/settings) เพื่อเปิดใช้งานและระบุ Google Gemini API Key ก่อนแปลภาษา"
    );
  }

  const prompt = `You are a professional university news translator and public relations editor for MCU (Mahachulalongkornrajavidyalaya University).
Translate and adapt the following Thai university news article into formal, natural, fluent English suitable for an academic institution portal.

Return ONLY a valid JSON object with EXACTLY the following keys:
- "titleEn": Professional English headline (concise, engaging)
- "summaryEn": Clear summary snippet in English (1-2 sentences)
- "contentEn": Full translated news content in English with clear paragraphing
- "suggestedSlug": SEO-friendly English URL slug (lowercase alphanumeric and hyphens only, e.g. "mcu-annual-admissions-announcement-2024")

Source Thai News Article:
Title: ${input.titleTh}
Summary: ${input.summaryTh || "(No summary provided, summarize based on title/content)"}
Content: ${input.contentTh || "(No content provided)"}

Output STRICT JSON only, without markdown backticks or commentary.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${cfg.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const rawMsg = data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw errors.validation(`การเชื่อมต่อ Gemini API ล้มเหลว: ${rawMsg}`);
  }

  const result = await res.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw errors.validation("ไม่ได้รับผลลัพธ์ข้อความจาก Gemini API (กรุณากดลองใหม่อีกครั้ง)");
  }

  try {
    const parsed = JSON.parse(text);
    return {
      titleEn: parsed.titleEn || "",
      summaryEn: parsed.summaryEn || "",
      contentEn: parsed.contentEn || "",
      suggestedSlug: parsed.suggestedSlug || "",
    };
  } catch {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return {
        titleEn: parsed.titleEn || "",
        summaryEn: parsed.summaryEn || "",
        contentEn: parsed.contentEn || "",
        suggestedSlug: parsed.suggestedSlug || "",
      };
    } catch (err) {
      logger.warn("Failed to parse Gemini translation response as JSON", { err, text });
      throw errors.validation("รูปแบบข้อมูลที่ได้รับจาก Gemini ไม่ถูกต้อง ไม่สามารถแยกแยะเนื้อหาแปลได้");
    }
  }
}
