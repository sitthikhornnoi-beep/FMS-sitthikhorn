import { z } from "zod";

export const docTypeEnum = z.enum(["MEMO", "INCOMING", "OUTGOING", "COMMAND", "ANNOUNCEMENT"]);
export const docUrgencyEnum = z.enum(["NORMAL", "URGENT", "VERY_URGENT", "IMMEDIATE"]);
export const docConfidentialityEnum = z.enum(["NORMAL", "CONFIDENTIAL", "SECRET"]);
export const docStatusEnum = z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "CANCELLED"]);
export const routingActionEnum = z.enum(["SUBMIT", "FORWARD", "ENDORSE", "RETURN_FOR_EDIT", "APPROVE", "REJECT"]);

export const attachmentItemSchema = z.object({
  name: z.string().trim().min(1).max(255),
  url: z.string().trim().url(),
  size: z.number().int().optional(),
  isMain: z.boolean().default(false),
});

export const createDocumentSchema = z.object({
  docType: docTypeEnum.default("MEMO"),
  urgency: docUrgencyEnum.default("NORMAL"),
  confidentiality: docConfidentialityEnum.default("NORMAL"),
  title: z.string().trim().min(3).max(500),
  content: z.string().trim().optional().nullable(),
  originalDocNumber: z.string().trim().max(100).optional().nullable(),
  senderOrganization: z.string().trim().max(255).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  attachments: z.array(attachmentItemSchema).optional().default([]),
  targetUserId: z.string().uuid().optional().nullable(),
  isSubmitNow: z.boolean().default(false),
});

export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  docType: docTypeEnum,
  urgency: docUrgencyEnum,
  confidentiality: docConfidentialityEnum,
  title: z.string().trim().min(3).max(500),
  content: z.string().trim().optional().nullable(),
  originalDocNumber: z.string().trim().max(100).optional().nullable(),
  senderOrganization: z.string().trim().max(255).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  attachments: z.array(attachmentItemSchema).optional().default([]),
});

export const submitDocumentSchema = z.object({
  id: z.string().uuid(),
  targetUserId: z.string().uuid().optional().nullable(),
  comment: z.string().trim().max(2000).optional().nullable(),
});

export const routeDocumentSchema = z.object({
  documentId: z.string().uuid(),
  action: routingActionEnum,
  targetUserId: z.string().uuid().optional().nullable(),
  comment: z.string().trim().max(2000).optional().nullable(),
  signatureUrl: z.string().trim().url().optional().nullable(),
});

export const listDocumentsQuerySchema = z.object({
  tab: z.enum(["inbox", "mySubmissions", "registry", "archive"]).default("inbox"),
  docType: docTypeEnum.optional(),
  status: docStatusEnum.optional(),
  search: z.string().trim().optional(),
  departmentId: z.string().uuid().optional(),
});

export type DocType = z.infer<typeof docTypeEnum>;
export type DocUrgency = z.infer<typeof docUrgencyEnum>;
export type DocConfidentiality = z.infer<typeof docConfidentialityEnum>;
export type DocStatus = z.infer<typeof docStatusEnum>;
export type RoutingAction = z.infer<typeof routingActionEnum>;
export type AttachmentItem = z.infer<typeof attachmentItemSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type SubmitDocumentInput = z.infer<typeof submitDocumentSchema>;
export type RouteDocumentInput = z.infer<typeof routeDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
