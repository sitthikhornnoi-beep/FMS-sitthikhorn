import { describe, it, expect } from "vitest";
import {
  exportProgramToJson,
  parseProgramJson,
  type ProgramExportData,
} from "./json-helpers";

describe("curriculum json-helpers", () => {
  const sampleData: ProgramExportData = {
    code: "CS-2567",
    nameTh: "วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
    nameEn: "Bachelor of Science in Computer Science",
    degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
    degreeEn: "Bachelor of Science (Computer Science)",
    degreeShortTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
    degreeShortEn: "B.S. (Computer Science)",
    degreeLevel: "BACHELOR",
    departmentCode: "CS-DEPT",
    slug: "computer-science-2567",
    curriculumYear: 2567,
    totalCredits: 128,
    studyDuration: "4 ปี",
    tuitionFee: "18,000 บาท/ภาคการศึกษา",
    descriptionTh: "หลักสูตรมุ่งเน้นการพัฒนาซอฟต์แวร์และปัญญาประดิษฐ์",
    descriptionEn: "Focuses on software engineering and AI",
    philosophyTh: "สร้างบัณฑิตที่มีทักษะแห่งอนาคต",
    philosophyEn: "Nurturing future-ready innovators",
    pdfUrl: "https://example.com/cs-tqf2.pdf",
    imageUrl: "https://example.com/cs-cover.jpg",
    displayOrder: 1,
    isActive: true,
    careerPaths: ["Software Engineer", "Data Scientist"],
    plos: [
      { code: "PLO1", titleTh: "สามารถเขียนโปรแกรมคอมพิวเตอร์ได้", titleEn: "Can write computer programs" },
    ],
    courseStructure: [
      { groupName: "หมวดวิชาศึกษาทั่วไป", credits: 30, description: "พื้นฐานภาษาและสังคม" },
      { groupName: "หมวดวิชาเฉพาะ", credits: 92, description: "วิชาแกนและวิชาเอก" },
    ],
    studyPlan: [
      {
        year: 1,
        semester: 1,
        courses: [
          { code: "CS101", nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 1", credits: 3 },
        ],
      },
    ],
  };

  it("exportProgramToJson ส่งออก JSON ถูกต้องพร้อม metadata และโครงสร้างครบถ้วน", () => {
    const jsonStr = exportProgramToJson(sampleData);
    expect(jsonStr).toContain('"code": "CS-2567"');
    expect(jsonStr).toContain('"$schema": "fms-curriculum-program-v1"');
    expect(jsonStr).toContain('"courseStructure"');
    expect(jsonStr).toContain('"plos"');

    const parsed = JSON.parse(jsonStr);
    expect(parsed.code).toBe("CS-2567");
    expect(parsed.totalCredits).toBe(128);
    expect(parsed.courseStructure).toHaveLength(2);
    expect(parsed.plos).toHaveLength(1);
    expect(parsed.studyPlan).toHaveLength(1);
  });

  it("parseProgramJson แปลงข้อมูลที่ถูกต้องสำเร็จและรายงานสรุปโครงสร้าง", () => {
    const jsonStr = exportProgramToJson(sampleData);
    const result = parseProgramJson(jsonStr);

    expect(result.success).toBe(true);
    expect(result.data?.code).toBe("CS-2567");
    expect(result.data?.nameTh).toBe(sampleData.nameTh);
    expect(result.summary?.hasCourseStructure).toBe(2);
    expect(result.summary?.hasPlos).toBe(1);
    expect(result.summary?.hasStudyPlan).toBe(1);
    expect(result.summary?.hasCareerPaths).toBe(2);
  });

  it("parseProgramJson ปฏิเสธ JSON ที่ไม่มี code หรือ nameTh", () => {
    const invalidJson = JSON.stringify({
      slug: "some-slug",
      descriptionTh: "ไม่มีรหัสและชื่อ",
    });
    const result = parseProgramJson(invalidJson);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("parseProgramJson ปฏิเสธไวยากรณ์ JSON ที่ผิดพลาด (syntax error)", () => {
    const brokenJson = "{ code: 'CS-2567', broken... ";
    const result = parseProgramJson(brokenJson);

    expect(result.success).toBe(false);
    expect(result.error).toContain("ไม่สามารถแปลงข้อความเป็น JSON ได้");
  });
});
