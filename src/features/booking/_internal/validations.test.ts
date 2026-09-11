import { describe, it, expect } from "vitest";
import {
  createBookingResourceSchema,
  updateBookingResourceSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  assignDriverSchema,
} from "./validations";

describe("booking validations", () => {
  it("createBookingResourceSchema ตรวจสอบข้อมูลห้องประชุมที่ถูกต้อง", () => {
    const valid = {
      type: "ROOM" as const,
      code: "ROOM-101",
      nameTh: "ห้องประชุมใหญ่",
      nameEn: "Main Conference Room",
      capacity: 50,
      location: "อาคาร 1 ชั้น 2",
    };
    const parsed = createBookingResourceSchema.parse(valid);
    expect(parsed.code).toBe("ROOM-101");
    expect(parsed.type).toBe("ROOM");
    expect(parsed.requiresApproval).toBe(true);
  });

  it("updateBookingResourceSchema ต้องการ id เป็น UUID", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      type: "ROOM" as const,
      code: "ROOM-102",
      nameTh: "ห้องประชุมย่อย",
      nameEn: "Small Meeting Room",
    };
    const parsed = updateBookingResourceSchema.parse(valid);
    expect(parsed.id).toBe(valid.id);
  });

  it("createBookingResourceSchema ปฏิเสธ code ที่มีอักขระพิเศษที่ไม่รองรับ", () => {
    expect(() =>
      createBookingResourceSchema.parse({
        type: "ROOM",
        code: "ROOM 101#@!",
        nameTh: "ห้อง 101",
        nameEn: "Room 101",
      })
    ).toThrow();
  });

  it("createBookingSchema ตรวจสอบช่วงเวลาเริ่มต้นและสิ้นสุดที่ถูกต้อง", () => {
    const valid = {
      resourceId: "123e4567-e89b-12d3-a456-426614174000",
      title: "การประชุมกรรมการบริหารคณะ",
      startTime: "2026-10-01T09:00:00.000Z",
      endTime: "2026-10-01T12:00:00.000Z",
      attendeeCount: 15,
    };
    const parsed = createBookingSchema.parse(valid);
    expect(parsed.title).toBe(valid.title);
  });

  it("createBookingSchema ปฏิเสธเมื่อเวลาสิ้นสุดมาก่อนหรือเท่ากับเวลาเริ่มต้น", () => {
    const invalid = {
      resourceId: "123e4567-e89b-12d3-a456-426614174000",
      title: "การประชุมกรรมการบริหารคณะ",
      startTime: "2026-10-01T12:00:00.000Z",
      endTime: "2026-10-01T09:00:00.000Z",
      attendeeCount: 15,
    };
    expect(() => createBookingSchema.parse(invalid)).toThrow();
  });

  it("updateBookingStatusSchema ตรวจสอบสถานะการอนุมัติ", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "APPROVED" as const,
    };
    const parsed = updateBookingStatusSchema.parse(valid);
    expect(parsed.status).toBe("APPROVED");
  });

  it("assignDriverSchema ตรวจสอบชื่อพนักงานขับรถ", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      driverName: "นายสมชาย ขยันขับ",
      driverPhone: "081-234-5678",
    };
    const parsed = assignDriverSchema.parse(valid);
    expect(parsed.driverName).toBe(valid.driverName);
  });
});
