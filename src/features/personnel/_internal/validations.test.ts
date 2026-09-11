import { describe, it, expect } from "vitest";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createStaffProfileSchema,
  createStaffPublicationSchema,
} from "./validations";

describe("personnel validations", () => {
  it("createDepartmentSchema ตรวจสอบข้อมูลภาควิชาที่ถูกต้อง", () => {
    const valid = {
      code: "DEPT-POLSCI",
      nameTh: "ภาควิชารัฐศาสตร์",
      nameEn: "Department of Political Science",
      type: "ACADEMIC" as const,
    };
    const parsed = createDepartmentSchema.parse(valid);
    expect(parsed.code).toBe("DEPT-POLSCI");
    expect(parsed.type).toBe("ACADEMIC");
  });

  it("updateDepartmentSchema ต้องการ id เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      code: "DEPT-POLSCI",
      nameTh: "ภาควิชารัฐศาสตร์ (ปรับปรุง)",
      nameEn: "Department of Political Science",
      type: "ACADEMIC" as const,
    };
    const parsed = updateDepartmentSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
  });

  it("createDepartmentSchema ปฏิเสธ code ที่มีอักขระพิเศษ", () => {
    expect(() =>
      createDepartmentSchema.parse({
        code: "DEPT POLSCI!@#",
        nameTh: "ภาควิชา",
        nameEn: "Dept",
      })
    ).toThrow();
  });

  it("createStaffProfileSchema ตรวจสอบข้อมูลบุคลากรที่ถูกต้อง", () => {
    const valid = {
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "สิทธิกร",
      lastNameTh: "น้อย",
      firstNameEn: "Sitthikhorn",
      lastNameEn: "Noi",
      email: "sitthikhorn@fms.local",
      staffType: "ACADEMIC" as const,
    };
    const parsed = createStaffProfileSchema.parse(valid);
    expect(parsed.firstNameTh).toBe("สิทธิกร");
    expect(parsed.staffType).toBe("ACADEMIC");
  });

  it("createStaffProfileSchema ปฏิเสธรูปแบบอีเมลที่ไม่ถูกต้อง", () => {
    const invalid = {
      firstNameTh: "สิทธิกร",
      lastNameTh: "น้อย",
      email: "not-an-email",
    };
    expect(() => createStaffProfileSchema.parse(invalid)).toThrow();
  });

  it("createStaffPublicationSchema ตรวจสอบข้อมูลผลงานตีพิมพ์", () => {
    const valid = {
      staffId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Comparative Politics in Southeast Asia",
      year: 2025,
      journalName: "Asian Journal of Political Science",
    };
    const parsed = createStaffPublicationSchema.parse(valid);
    expect(parsed.year).toBe(2025);
    expect(parsed.title).toBe(valid.title);
  });
});
