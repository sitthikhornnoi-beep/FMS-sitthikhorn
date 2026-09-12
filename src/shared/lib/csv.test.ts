import { describe, it, expect } from "vitest";
import { generateCsv, parseCsv } from "./csv";

describe("csv utility", () => {
  it("generateCsv ใส่ UTF-8 BOM และ escape ข้อความที่มี comma หรือ newline อย่างถูกต้อง", () => {
    const columns = [
      { key: "name", label: "ชื่อ-นามสกุล" },
      { key: "email", label: "อีเมล" },
      { key: "note", label: "หมายเหตุ" },
    ];
    const data = [
      { name: "สมชาย ใจดี", email: "somchai@example.com", note: "ปกติ" },
      { name: "วิชัย, ผู้จัดการ", email: "wichai@example.com", note: 'มีเครื่องหมาย "คำพูด"' },
      { name: "สายฝน", email: "fon@example.com", note: "บรรทัดที่ 1\nบรรทัดที่ 2" },
    ];

    const csv = generateCsv(columns, data);

    // ต้องขึ้นต้นด้วย UTF-8 BOM (\uFEFF)
    expect(csv.charCodeAt(0)).toBe(0xfeff);

    // หัวตาราง
    expect(csv).toContain("ชื่อ-นามสกุล,อีเมล,หมายเหตุ");

    // ข้อมูลที่มี comma ต้องถูกครอบด้วย quote
    expect(csv).toContain('"วิชัย, ผู้จัดการ"');

    // ข้อมูลที่มี double quote ต้องถูก escape เป็น ""
    expect(csv).toContain('"มีเครื่องหมาย ""คำพูด"""');

    // ข้อมูลที่มี newline ต้องถูกครอบด้วย quote
    expect(csv).toContain('"บรรทัดที่ 1\nบรรทัดที่ 2"');
  });

  it("parseCsv อ่านข้อมูลและตัด UTF-8 BOM ออก แปลงเป็น rows อย่างถูกต้อง", () => {
    const rawCsv = '\uFEFF"ชื่อ-นามสกุล",อีเมล,บทบาท\r\n"สมชาย ใจดี",somchai@example.com,"ADMIN,STAFF"\r\n"สมหญิง",somying@example.com,TEACHER';

    const parsed = parseCsv(rawCsv);

    expect(parsed.headers).toEqual(["ชื่อ-นามสกุล", "อีเมล", "บทบาท"]);
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0]).toEqual({
      "ชื่อ-นามสกุล": "สมชาย ใจดี",
      อีเมล: "somchai@example.com",
      บทบาท: "ADMIN,STAFF",
    });
    expect(parsed.rows[1]).toEqual({
      "ชื่อ-นามสกุล": "สมหญิง",
      อีเมล: "somying@example.com",
      บทบาท: "TEACHER",
    });
  });

  it("parseCsv รองรับไฟล์เปล่า", () => {
    const parsed = parseCsv("");
    expect(parsed.headers).toEqual([]);
    expect(parsed.rows).toEqual([]);
  });
});
