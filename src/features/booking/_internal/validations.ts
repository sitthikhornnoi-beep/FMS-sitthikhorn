import { z } from "zod";

export const createBookingResourceSchema = z.object({
  type: z.enum(["ROOM", "VEHICLE"]),
  code: z.string().trim().min(1).max(50).regex(/^[A-Za-z0-9_-]+$/, "Code must be alphanumeric"),
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  capacity: z.number().int().min(1).default(1),
  location: z.string().trim().max(255).optional().nullable(),
  facilities: z.array(z.string()).optional().default([]),
  imageUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  color: z.string().trim().default("#3b82f6"),
  requiresApproval: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateBookingResourceSchema = createBookingResourceSchema.extend({
  id: z.string().uuid(),
});

export const createBookingSchema = z.object({
  resourceId: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().optional().nullable(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  attendeeCount: z.number().int().min(1).default(1),
  destination: z.string().trim().max(255).optional().nullable(),
  driverName: z.string().trim().max(100).optional().nullable(),
  driverPhone: z.string().trim().max(50).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
  path: ["endTime"],
});

export const updateBookingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
  rejectReason: z.string().trim().optional().nullable(),
  driverName: z.string().trim().max(100).optional().nullable(),
  driverPhone: z.string().trim().max(50).optional().nullable(),
});

export const assignDriverSchema = z.object({
  id: z.string().uuid(),
  driverName: z.string().trim().min(1).max(100),
  driverPhone: z.string().trim().max(50).optional().nullable(),
});

export type CreateBookingResourceInput = z.infer<typeof createBookingResourceSchema>;
export type UpdateBookingResourceInput = z.infer<typeof updateBookingResourceSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type AssignDriverInput = z.infer<typeof assignDriverSchema>;
