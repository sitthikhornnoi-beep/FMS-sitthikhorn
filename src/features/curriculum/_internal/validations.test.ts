import { describe, it, expect } from "vitest";
import {
  createProgramSchema,
  updateProgramSchema,
  updateProgramStructureSchema,
  ploSchema,
  courseItemSchema,
} from "./validations";

describe("curriculum validations", () => {
  it("createProgramSchema ตรวจสอบข้อมูลหลักสูตรที่ถูกต้อง", () => {
    const valid = {
      code: "BPS-2567",
      nameTh: "หลักสูตรรัฐศาสตรบัณฑิต",
      nameEn: "Bachelor of Political Science",
      degreeTh: "รัฐศาสตรบัณฑิต",
      degreeEn: "Bachelor of Political Science",
      degreeShortTh: "ร.บ.",
      degreeShortEn: "B.Pol.Sc.",
      slug: "bachelor-of-political-science-2567",
      curriculumYear: 2567,
      totalCredits: 130,
      degreeLevel: "BACHELOR" as const,
    };
    const parsed = createProgramSchema.parse(valid);
    expect(parsed.code).toBe(valid.code);
    expect(parsed.degreeLevel).toBe("BACHELOR");
    expect(parsed.totalCredits).toBe(130);
  });

  it("updateProgramSchema ต้องการ id เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      code: "BPS-2567",
      nameTh: "หลักสูตรรัฐศาสตรบัณฑิต (ปรับปรุง)",
      nameEn: "Bachelor of Political Science",
      degreeTh: "รัฐศาสตรบัณฑิต",
      degreeEn: "Bachelor of Political Science",
      degreeShortTh: "ร.บ.",
      degreeShortEn: "B.Pol.Sc.",
      slug: "bachelor-of-political-science-2567",
      curriculumYear: 2567,
    };
    const parsed = updateProgramSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
  });

  it("createProgramSchema ปฏิเสธ slug ที่มีอักขระตัวพิมพ์ใหญ่หรือเว้นวรรค", () => {
    const invalid = {
      code: "BPS-2567",
      nameTh: "หลักสูตรรัฐศาสตรบัณฑิต",
      nameEn: "Bachelor of Political Science",
      degreeTh: "รัฐศาสตรบัณฑิต",
      degreeEn: "Bachelor of Political Science",
      degreeShortTh: "ร.บ.",
      degreeShortEn: "B.Pol.Sc.",
      slug: "Bachelor of Political Science",
      curriculumYear: 2567,
    };
    expect(() => createProgramSchema.parse(invalid)).toThrow();
  });

  it("createProgramSchema ปฏิเสธปีหลักสูตรที่ไม่อยู่ในช่วง พ.ศ. 2500 - 2600", () => {
    const invalid = {
      code: "BPS-2024",
      nameTh: "หลักสูตร",
      nameEn: "Program",
      degreeTh: "ปริญญา",
      degreeEn: "Degree",
      degreeShortTh: "ป.",
      degreeShortEn: "D.",
      slug: "bps-2024",
      curriculumYear: 2024, // ค.ศ. แทนที่จะเป็น พ.ศ.
    };
    expect(() => createProgramSchema.parse(invalid)).toThrow();
  });

  it("ploSchema ตรวจสอบผลลัพธ์การเรียนรู้", () => {
    const valid = {
      code: "PLO1",
      titleTh: "มีความรู้ความเข้าใจในทฤษฎีทางรัฐศาสตร์",
      titleEn: "Understand political science theories",
    };
    const parsed = ploSchema.parse(valid);
    expect(parsed.code).toBe("PLO1");
  });

  it("courseItemSchema ตรวจสอบรายวิชาและหน่วยกิต", () => {
    const valid = {
      code: "PS101",
      nameTh: "ความรู้เบื้องต้นทางรัฐศาสตร์",
      nameEn: "Introduction to Political Science",
      credits: 3,
    };
    const parsed = courseItemSchema.parse(valid);
    expect(parsed.credits).toBe(3);
  });

  it("updateProgramStructureSchema ต้องการ id เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      careerPaths: ["นักวิเคราะห์นโยบายและแผน", "ข้าราชการ"],
    };
    const parsed = updateProgramStructureSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
    expect(parsed.careerPaths).toHaveLength(2);
  });
});
