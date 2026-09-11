import { describe, it, expect } from "vitest";
import {
  createDocumentSchema,
  updateDocumentSchema,
  submitDocumentSchema,
  routeDocumentSchema,
} from "./validations";

describe("documents validations", () => {
  it("createDocumentSchema ผ่านเมื่อมีข้อมูลจำเป็นครบถ้วน", () => {
    const valid = {
      title: "ขออนุมัติจัดโครงการสัมมนาวิชาการ",
      docType: "MEMO" as const,
      urgency: "NORMAL" as const,
      confidentiality: "NORMAL" as const,
      content: "รายละเอียดโครงการ...",
    };
    const parsed = createDocumentSchema.parse(valid);
    expect(parsed.title).toBe(valid.title);
    expect(parsed.docType).toBe("MEMO");
    expect(parsed.isSubmitNow).toBe(false);
  });

  it("createDocumentSchema ล้มเหลวเมื่อชื่อเรื่องสั้นกว่า 3 ตัวอักษร", () => {
    expect(() =>
      createDocumentSchema.parse({
        title: "ขอ",
      })
    ).toThrow();
  });

  it("updateDocumentSchema ต้องการ id เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "ขออนุมัติแก้ไขโครงการ",
      docType: "MEMO" as const,
      urgency: "URGENT" as const,
      confidentiality: "CONFIDENTIAL" as const,
    };
    const parsed = updateDocumentSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
    expect(parsed.urgency).toBe("URGENT");
  });

  it("updateDocumentSchema ล้มเหลวเมื่อ id ไม่ใช่ UUID", () => {
    expect(() =>
      updateDocumentSchema.parse({
        id: "invalid-id",
        title: "เรื่องทั่วไป",
        docType: "MEMO",
        urgency: "NORMAL",
        confidentiality: "NORMAL",
      })
    ).toThrow();
  });

  it("routeDocumentSchema ตรวจสอบ action ที่ถูกต้อง", () => {
    const valid = {
      documentId: "123e4567-e89b-12d3-a456-426614174000",
      action: "APPROVE" as const,
      comment: "อนุมัติตามเสนอ",
    };
    const parsed = routeDocumentSchema.parse(valid);
    expect(parsed.action).toBe("APPROVE");
  });

  it("submitDocumentSchema ยอมรับ targetUserId เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      targetUserId: "987fcdeb-51a2-43d7-9876-543210fedcba",
      comment: "เรียนเสนอเพื่อพิจารณา",
    };
    const parsed = submitDocumentSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
    expect(parsed.targetUserId).toBe(valid.targetUserId);
  });
});
