import { describe, it, expect } from "vitest";
import {
  geminiSettingsSchema,
  testGeminiSchema,
  updateSettingsSchema,
} from "./settings";

describe("settings validations", () => {
  it("geminiSettingsSchema กำหนดค่าเริ่มต้น enabled=true และ model=gemini-2.0-flash", () => {
    const parsed = geminiSettingsSchema.parse({});
    expect(parsed.enabled).toBe(true);
    expect(parsed.model).toBe("gemini-2.0-flash");
    expect(parsed.apiKey).toBe("");
  });

  it("geminiSettingsSchema รับค่า apiKey และ model ที่กำหนดเองได้", () => {
    const parsed = geminiSettingsSchema.parse({
      enabled: false,
      apiKey: "AIzaSyTest123",
      model: "gemini-1.5-pro",
    });
    expect(parsed.enabled).toBe(false);
    expect(parsed.apiKey).toBe("AIzaSyTest123");
    expect(parsed.model).toBe("gemini-1.5-pro");
  });

  it("testGeminiSchema ยอมรับ apiKey เปล่าเพื่อใช้ key เดิมจาก DB", () => {
    const parsed = testGeminiSchema.parse({
      apiKey: "",
      model: "gemini-2.0-flash",
    });
    expect(parsed.apiKey).toBe("");
    expect(parsed.model).toBe("gemini-2.0-flash");
  });

  it("updateSettingsSchema รวมการตั้งค่า gemini เข้ามาด้วยได้", () => {
    const parsed = updateSettingsSchema.parse({
      nameTh: "มหาวิทยาลัย",
      nameEn: "University",
      palette: "blue",
      gemini: {
        enabled: true,
        apiKey: "AIzaSyExampleKey",
        model: "gemini-2.0-flash",
      },
    });
    expect(parsed.gemini?.apiKey).toBe("AIzaSyExampleKey");
  });
});
