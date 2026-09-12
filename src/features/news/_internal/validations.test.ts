import { describe, it, expect } from "vitest";
import {
  createNewsCategorySchema,
  createNewsArticleSchema,
  updateNewsArticleSchema,
  translateNewsSchema,
} from "./validations";

describe("news validations", () => {
  it("createNewsCategorySchema ตรวจสอบหมวดหมู่ข่าวที่ถูกต้อง", () => {
    const valid = {
      nameTh: "ข่าวประชาสัมพันธ์",
      nameEn: "Announcements",
      slug: "announcements",
      color: "blue",
    };
    const parsed = createNewsCategorySchema.parse(valid);
    expect(parsed.slug).toBe("announcements");
    expect(parsed.color).toBe("blue");
  });

  it("createNewsCategorySchema ปฏิเสธ slug ที่มีอักขระตัวพิมพ์ใหญ่", () => {
    expect(() =>
      createNewsCategorySchema.parse({
        nameTh: "ข่าว",
        nameEn: "News",
        slug: "Announcements-2026",
      })
    ).toThrow();
  });

  it("createNewsArticleSchema ตรวจสอบบทความข่าวที่ถูกต้อง", () => {
    const valid = {
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2567",
      slug: "admissions-open-academic-year-2027",
      contentTh: "รายละเอียดการรับสมัครนักศึกษา...",
      status: "PUBLISHED" as const,
      isPinned: true,
    };
    const parsed = createNewsArticleSchema.parse(valid);
    expect(parsed.titleTh).toBe(valid.titleTh);
    expect(parsed.status).toBe("PUBLISHED");
    expect(parsed.isPinned).toBe(true);
  });

  it("createNewsArticleSchema ล้มเหลวเมื่อไม่มี contentTh", () => {
    expect(() =>
      createNewsArticleSchema.parse({
        titleTh: "ข่าวไม่มีเนื้อหา",
        slug: "news-without-content",
        contentTh: "",
      })
    ).toThrow();
  });

  it("updateNewsArticleSchema ต้องการ id เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      titleTh: "แก้ไขข่าวประชาสัมพันธ์",
      slug: "edited-announcement",
      contentTh: "เนื้อหาที่แก้ไขแล้ว",
    };
    const parsed = updateNewsArticleSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
  });

  it("translateNewsSchema ผ่านเมื่อมี titleTh และยอมรับ optional summary/content", () => {
    const valid = {
      titleTh: "หัวข้อข่าวภาษาไทยสำหรับแปล",
      summaryTh: "สรุปย่อ",
      contentTh: "เนื้อหาข่าว",
    };
    const parsed = translateNewsSchema.parse(valid);
    expect(parsed.titleTh).toBe(valid.titleTh);
    expect(parsed.summaryTh).toBe(valid.summaryTh);
    expect(parsed.contentTh).toBe(valid.contentTh);
  });

  it("translateNewsSchema ล้มเหลวเมื่อ titleTh ว่างเปล่า", () => {
    expect(() =>
      translateNewsSchema.parse({
        titleTh: "   ",
      })
    ).toThrow();
  });
});

