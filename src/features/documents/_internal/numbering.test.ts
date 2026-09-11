import { describe, it, expect } from "vitest";
import { getCurrentDocYear, formatDocumentNumber } from "./numbering";

describe("documents numbering", () => {
  it("getCurrentDocYear คำนวณปี พ.ศ. ถูกต้อง", () => {
    const currentCeYear = new Date().getFullYear();
    const expectedBeYear = currentCeYear + 543;
    expect(getCurrentDocYear()).toBe(expectedBeYear);
  });

  it("formatDocumentNumber จัดรูปแบบเลขบันทึกข้อความ (MEMO)", () => {
    const formatted = formatDocumentNumber("MEMO", 1, 2569);
    expect(formatted).toBe("อว 0604.01/ว 0001/2569");
  });

  it("formatDocumentNumber จัดรูปแบบหนังสือรับ (INCOMING)", () => {
    const formatted = formatDocumentNumber("INCOMING", 42, 2569);
    expect(formatted).toBe("รับ 0042/2569");
  });

  it("formatDocumentNumber จัดรูปแบบหนังสือส่ง (OUTGOING)", () => {
    const formatted = formatDocumentNumber("OUTGOING", 99, 2569);
    expect(formatted).toBe("อว 0604.01/0099/2569");
  });

  it("formatDocumentNumber จัดรูปแบบคำสั่งคณะ (COMMAND)", () => {
    const formatted = formatDocumentNumber("COMMAND", 5, 2569);
    expect(formatted).toBe("คำสั่งคณะ ที่ 5/2569");
  });

  it("formatDocumentNumber จัดรูปแบบประกาศคณะ (ANNOUNCEMENT)", () => {
    const formatted = formatDocumentNumber("ANNOUNCEMENT", 12, 2569);
    expect(formatted).toBe("ประกาศคณะ ที่ 12/2569");
  });
});
