# Data Model & Validation Specifications
## Feature 4: ระบบบริหารจัดการและอนุมัติเอกสาร (E-Document & Approval Workflow)

---

## 1. การออกแบบสคีมาฐานข้อมูล (Prisma Schema)

โมเดลที่ต้องนำไปผนวกใน `prisma/schema.prisma`:

```prisma
/// ประเภทเอกสารราชการ
enum DocType {
  MEMO         /// บันทึกข้อความภายใน
  INCOMING     /// หนังสือรับเข้าจากภายนอก
  OUTGOING     /// หนังสือส่งออกภายนอก
  COMMAND      /// คำสั่งคณะ
  ANNOUNCEMENT /// ประกาศคณะ
}

/// ระดับชั้นความเร็ว
enum DocUrgency {
  NORMAL       /// ปกติ
  URGENT       /// ด่วน
  VERY_URGENT  /// ด่วนมาก
  IMMEDIATE    /// ด่วนที่สุด
}

/// ระดับชั้นความลับ
enum DocConfidentiality {
  NORMAL       /// ปกติ
  CONFIDENTIAL /// ลับ
  SECRET       /// ลับมาก
}

/// สถานะการดำเนินงานของเอกสาร
enum DocStatus {
  DRAFT        /// ร่างเอกสาร
  SUBMITTED    /// ยื่นเสนอเรื่องแล้ว
  IN_REVIEW    /// อยู่ระหว่างการพิจารณา/เกษียนหนังสือ
  APPROVED     /// อนุมัติ / ลงนามเรียบร้อย
  REJECTED     /// ไม่อนุมัติ / ยุติเรื่อง
  CANCELLED    /// ยกเลิกเอกสาร
}

/// การกระทำในบันทึกการเกษียนหนังสือ
enum RoutingAction {
  SUBMIT            /// ยื่นเรื่องเริ่มต้น
  FORWARD           /// แทงเรื่อง / ส่งต่อ
  ENDORSE           /// เกษียนเห็นชอบและส่งต่อ
  RETURN_FOR_EDIT   /// ส่งกลับให้แก้ไข
  APPROVE           /// ลงนามอนุมัติ
  REJECT            /// ไม่อนุมัติ
}

/// เอกสารสารบรรณและคำขออนุมัติ
model Document {
  id                String             @id @default(uuid()) @db.Uuid
  tenantId          String             @map("tenant_id") @db.Uuid
  docType           DocType            @default(MEMO) @map("doc_type")
  urgency           DocUrgency         @default(NORMAL)
  confidentiality   DocConfidentiality @default(NORMAL)
  status            DocStatus          @default(DRAFT)
  
  /// เลขทะเบียนสารบรรณ เช่น "อว 0604.01/ว 0142/2567" (null เมื่อเป็น DRAFT)
  docNumber         String?            @map("doc_number") @db.VarChar(100)
  sequenceNumber    Int?               @map("sequence_number")
  docYear           Int                @map("doc_year") /// ปี พ.ศ. เช่น 2567
  
  title             String             @db.VarChar(500)
  content           String?            @db.Text
  originalDocNumber String?            @map("original_doc_number") @db.VarChar(100) /// เลขที่หนังสือเดิม (กรณีหนังสือรับเข้า)
  senderOrganization String?           @map("sender_organization") @db.VarChar(255) /// หน่วยงานผู้ส่ง
  
  /// ไฟล์แนบ Array<{ name: string, url: string, size?: number, isMain?: boolean }>
  attachments       Json?              @db.JsonB
  
  submitterId       String             @map("submitter_id") @db.Uuid
  currentAssigneeId String?            @map("current_assignee_id") @db.Uuid
  departmentId      String?            @map("department_id") @db.Uuid
  
  approvedAt        DateTime?          @map("approved_at") @db.Timestamptz()
  completedAt       DateTime?          @map("completed_at") @db.Timestamptz()
  createdAt         DateTime           @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime           @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  submitter       User               @relation("DocSubmitter", fields: [submitterId], references: [id], onDelete: Cascade)
  currentAssignee User?              @relation("DocAssignee", fields: [currentAssigneeId], references: [id], onDelete: SetNull)
  department      Department?        @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  routings        DocumentRouting[]

  @@unique([tenantId, docNumber])
  @@index([tenantId, status, docType])
  @@index([tenantId, currentAssigneeId])
  @@index([tenantId, submitterId])
  @@index([tenantId, docYear, sequenceNumber])
  @@map("documents")
}

/// บันทึกเส้นทางการแทงเรื่อง/เกษียนหนังสือ (Audit & Endorsement Log)
model DocumentRouting {
  id           String        @id @default(uuid()) @db.Uuid
  tenantId     String        @map("tenant_id") @db.Uuid
  documentId   String        @map("document_id") @db.Uuid
  stepOrder    Int           @map("step_order")
  
  actorId      String        @map("actor_id") @db.Uuid
  targetUserId String?       @map("target_user_id") @db.Uuid
  action       RoutingAction
  comment      String?       @db.Text
  signatureUrl String?       @map("signature_url") @db.VarChar(500)
  
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  tenant       Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  document     Document      @relation(fields: [documentId], references: [id], onDelete: Cascade)
  actor        User          @relation("RoutingActor", fields: [actorId], references: [id], onDelete: Cascade)
  targetUser   User?         @relation("RoutingTarget", fields: [targetUserId], references: [id], onDelete: SetNull)

  @@index([tenantId, documentId, stepOrder])
  @@map("document_routings")
}

/// ตัวนับลำดับเลขทะเบียนสารบรรณแบบแยกปีและประเภท
model DocumentSequence {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @map("tenant_id") @db.Uuid
  docType    DocType  @map("doc_type")
  year       Int
  lastNumber Int      @default(0) @map("last_number")
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@unique([tenantId, docType, year])
  @@map("document_sequences")
}
```

---

## 2. ข้อกำหนด Zod Validation Schemas (`_internal/validations.ts`)

```ts
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
  targetUserId: z.string().uuid().optional().nullable(), // ผู้รับเรื่องคนแรก (ถ้าส่งเรื่องทันที)
  isSubmitNow: z.boolean().default(false),               // true = SUBMITTED, false = DRAFT
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
  attachments: z.array(attachmentItemSchema).optional(),
});

export const routeDocumentSchema = z.object({
  documentId: z.string().uuid(),
  action: routingActionEnum,
  targetUserId: z.string().uuid().optional().nullable(), // จำเป็นเมื่อ FORWARD หรือ ENDORSE
  comment: z.string().trim().max(2000).optional().nullable(),
  signatureUrl: z.string().trim().url().optional().nullable(),
});
```

---

## 3. พจนานุกรมข้อความสองภาษา (`messages.ts`)

```ts
export const messages = {
  // Navigation & Headers
  "document.nav": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "E-Document & Approvals" },
  "document.title": { th: "ระบบบริหารจัดการและอนุมัติเอกสาร", en: "E-Document Management & Approval" },
  "document.subtitle": { th: "จัดการหนังสือราชการ บันทึกข้อความ และการเกษียนลงนามออนไลน์", en: "Manage official memos, incoming/outgoing letters, and electronic approvals" },
  
  // Tabs
  "document.tab.inbox": { th: "กล่องเรื่องรอพิจารณา", en: "Pending Action Inbox" },
  "document.tab.mySubmissions": { th: "เอกสารที่ฉันเสนอ", en: "My Submissions" },
  "document.tab.registry": { th: "ทะเบียนสารบรรณกลาง", en: "Central Registry" },
  "document.tab.archive": { th: "คลังเอกสารเสร็จสิ้น", en: "Completed Archive" },
  
  // Doc Types
  "document.type.MEMO": { th: "บันทึกข้อความภายใน", en: "Internal Memo" },
  "document.type.INCOMING": { th: "หนังสือรับจากภายนอก", en: "Incoming Letter" },
  "document.type.OUTGOING": { th: "หนังสือส่งภายนอก", en: "Outgoing Letter" },
  "document.type.COMMAND": { th: "คำสั่งคณะ", en: "Faculty Order" },
  "document.type.ANNOUNCEMENT": { th: "ประกาศคณะ", en: "Faculty Announcement" },
  
  // Statuses
  "document.status.DRAFT": { th: "ฉบับร่าง", en: "Draft" },
  "document.status.SUBMITTED": { th: "ยื่นเสนอเรื่องแล้ว", en: "Submitted" },
  "document.status.IN_REVIEW": { th: "อยู่ระหว่างพิจารณา", en: "In Review" },
  "document.status.APPROVED": { th: "อนุมัติ / ลงนามแล้ว", en: "Approved" },
  "document.status.REJECTED": { th: "ไม่อนุมัติ / ยุติเรื่อง", en: "Rejected" },
  "document.status.CANCELLED": { th: "ยกเลิกแล้ว", en: "Cancelled" },
  
  // Urgency
  "document.urgency.NORMAL": { th: "ปกติ", en: "Normal" },
  "document.urgency.URGENT": { th: "ด่วน", en: "Urgent" },
  "document.urgency.VERY_URGENT": { th: "ด่วนมาก", en: "Very Urgent" },
  "document.urgency.IMMEDIATE": { th: "ด่วนที่สุด", en: "Immediate" },
  
  // Confidentiality
  "document.confidentiality.NORMAL": { th: "ปกติ", en: "Normal" },
  "document.confidentiality.CONFIDENTIAL": { th: "ลับ", en: "Confidential" },
  "document.confidentiality.SECRET": { th: "ลับมาก", en: "Secret" },
  
  // Actions & Buttons
  "document.btn.create": { th: "สร้างเอกสาร / บันทึกข้อความ", en: "New Document / Memo" },
  "document.btn.submit": { th: "ยื่นเสนอเรื่อง", en: "Submit Document" },
  "document.btn.saveDraft": { th: "บันทึกเป็นร่าง", en: "Save as Draft" },
  "document.btn.route": { th: "เกษียนหนังสือ / สั่งการ", en: "Endorse / Action" },
  "document.btn.approve": { th: "ลงนามอนุมัติ", en: "Approve & Sign" },
  "document.btn.reject": { th: "ไม่อนุมัติ / ตีกลับ", en: "Reject" },
  "document.btn.returnForEdit": { th: "ส่งกลับแก้ไข", en: "Return for Revision" },
  "document.btn.viewTimeline": { th: "ดูเส้นทางเอกสาร", en: "View Route History" },
  
  // Permissions & Modules
  "roles.module.documents": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "E-Document & Approvals" },
  "perm.document:read": { th: "เข้าถึงและดูเอกสารที่เกี่ยวข้อง", en: "View relevant documents" },
  "perm.document:create": { th: "สร้างและยื่นเสนอเอกสาร", en: "Create and submit documents" },
  "perm.document:endorse": { th: "เกษียนหนังสือและความเห็น", en: "Endorse and forward documents" },
  "perm.document:approve": { th: "ลงนามอนุมัติหรือสั่งการ", en: "Approve and sign documents" },
  "perm.document:manage": { th: "บริหารงานสารบรรณและดูเอกสารทั้งหมด", en: "Manage central registry and all documents" },
} as const;
```
