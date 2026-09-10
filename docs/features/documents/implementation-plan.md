# Step-by-Step Implementation Plan
## Feature 4: ระบบบริหารจัดการและอนุมัติเอกสาร (E-Document & Approval Workflow)

---

## แผนปฏิบัติการการพัฒนา (Execution Checklist)

### Phase 1: การออกแบบฐานข้อมูลและการไมเกรชัน (Database & Migrations)
- [x] **1.1 อัปเดต Prisma Schema**
  - นำ `DocType`, `DocUrgency`, `DocConfidentiality`, `DocStatus`, `RoutingAction` ไปใส่ใน [prisma/schema.prisma](file:///d:/น้อย/FMS-sitthikhorn/prisma/schema.prisma)
  - เพิ่มโมเดล `Document`, `DocumentRouting`, `DocumentSequence`
  - ผูกความสัมพันธ์กับ `Tenant`, `User` (`DocSubmitter`, `DocAssignee`, `RoutingActor`, `RoutingTarget`), และ `Department`
- [x] **1.2 รัน Database Migration**
  - ตรวจสอบและปิด dev server ชั่วคราวเพื่อปลดล็อก query engine binary
  - รันคำสั่ง `npx prisma migrate dev --name add_documents_feature`
  - ตรวจสอบการสร้าง Client ใน `src/generated/prisma`
- [x] **1.3 ปรับปรุง Seed Data**
  - เพิ่มการลงทะเบียนเริ่มต้นใน [prisma/seed.ts](file:///d:/น้อย/FMS-sitthikhorn/prisma/seed.ts): เอกสารตัวอย่างครบทุกสถานะ (`DRAFT`, `SUBMITTED`, `IN_REVIEW`, `APPROVED`) และตัวนับลำดับ `DocumentSequence`

---

### Phase 2: โดเมนฟีเจอร์และตรรกะธุรกิจ (`src/features/documents/`)
- [x] **2.1 สิทธิ์และการเข้าถึง (`permissions.ts`)**
  - ประกาศ `DOCUMENTS_P` และ `DOCUMENTS_PERMISSIONS` (5 สิทธิ์: read, create, endorse, approve, manage)
- [x] **2.2 พจนานุกรมข้อความ 2 ภาษา (`messages.ts`)**
  - ใส่คีย์ `document.*`, `roles.module.documents`, และ `perm.document:*` ทั้ง `th` และ `en`
- [x] **2.3 Zod Validations (`_internal/validations.ts`)**
  - สร้าง schemas: `createDocumentSchema`, `updateDocumentSchema`, `routeDocumentSchema` พร้อม error mapping
- [x] **2.4 ระบบออกเลขสารบรรณอัตโนมัติ (`_internal/numbering.ts`)**
  - สร้างฟังก์ชัน `getNextDocumentNumber(tx, tenantId, docType, year)` ด้วย atomic increment ภายใต้ Prisma transaction
- [x] **2.5 บริการฐานข้อมูลและ DTOs (`_internal/services.ts`)**
  - ฟังก์ชัน `listDocuments(tenantId, params)` กรองตามกล่อง (inbox, mySubmissions, registry, archive)
  - ฟังก์ชัน `getDocumentById(tenantId, id)` พร้อม include `routings` และ `submitter/assignee`
  - ฟังก์ชัน `createDocument`, `updateDocument`, `routeDocument` (เกษียน/ส่งต่อ/อนุมัติ), `cancelDocument`
- [x] **2.6 Server Actions (`_internal/actions.ts`)**
  - สร้าง Server Actions ห่อด้วย `runAction` และ `requirePermission`
- [x] **2.7 Public Entry Points (`index.ts`, `server.ts`, `actions.ts`)**
  - Export ตามมาตรฐาน Modular Monolith

---

### Phase 3: การเชื่อมโยงระดับระบบ (Global Integrations)
- [x] **3.1 ลงทะเบียนสิทธิ์ใน `src/permissions.ts`**
  - นำ `DOCUMENTS_PERMISSIONS` รวมเข้า `ALL_PERMISSIONS`
- [x] **3.2 ลงทะเบียนพจนานุกรมใน `src/i18n/index.ts`**
  - นำ `documentsMessages` รวมเข้า `UI_MESSAGES`
  - เพิ่มใน `DICTIONARIES` ของ [src/i18n/index.test.ts](file:///d:/น้อย/FMS-sitthikhorn/src/i18n/index.test.ts)
- [x] **3.3 เพิ่มเมนูนำทางใน `src/components/layout/sidebar-nav.ts`**
  - เพิ่มเมนู `/admin/documents` พร้อมไอคอน `FileText` ใน Sidebar หลังบ้าน
- [x] **3.4 เพิ่มเส้นทางสาธารณะ/สิทธิ์ใน `src/proxy.ts`**
  - ป้องกันเส้นทาง `/admin/documents` ให้เข้าถึงเฉพาะผู้ที่ล็อกอิน
  - เพิ่ม `/documents` ใน `PUBLIC_PREFIXES`

---

### Phase 4: หน้าจอผู้ดูแลระบบและการทำงาน (Admin Console UI)
- [x] **4.1 หน้าเพจหลัก `src/app/(admin)/admin/documents/page.tsx`**
  - ตรวจสอบสิทธิ์ `document:read`
  - โหลดรายการเอกสารเบื้องต้น, รายชื่อบุคลากร (สำหรับเลือกผู้รับเรื่อง), และภาควิชา
- [x] **4.2 คอนโซลแดชบอร์ด `_components/documents-client.tsx`**
  - สถิติสรุป (รอลงนาม, เรื่องที่ฉันเสนอ, เอกสารทั้งหมดของคณะ)
  - 4 แท็บการทำงาน:
    1. กล่องเรื่องรอพิจารณา (Action Required / Inbox)
    2. เรื่องที่ฉันเสนอ (My Submissions)
    3. ทะเบียนสารบรรณกลาง (Central Registry)
    4. คลังเอกสารเสร็จสิ้น (Archive)
  - ตัวกรองตามประเภทเอกสาร, ชั้นความเร็ว, สถานะ และช่องค้นหา
  - ตาราง Liyon `DataTable` แสดงเลขที่, วันที่, ชื่อเรื่อง, ผู้ยื่น, ผู้ถือเรื่องปัจจุบัน, ชั้นความเร็ว, สถานะ
- [x] **4.3 โมดอลสร้าง/แก้ไขเอกสาร `_components/document-form-dialog.tsx`**
  - ฟอร์มกรอกชื่อเรื่อง, เนื้อหาบันทึก, เลือกประเภท, ชั้นความเร็ว, ชั้นความลับ, แนบลิงก์ไฟล์ PDF
  - ปุ่ม "บันทึกเป็นร่าง" และ "ยื่นเสนอเรื่องทันที"
- [x] **4.4 โมดอลเกษียนหนังสือ / สั่งการ `_components/routing-dialog.tsx`**
  - ฟอร์มบันทึกความเห็น (Endorsement comment)
  - เลือกการกระทำ: "เกษียนและส่งต่อ", "ลงนามอนุมัติ", "ส่งกลับแก้ไข", "ไม่อนุมัติ"
  - Dropdown เลือกผู้รับเรื่องคนถัดไป
- [x] **4.5 Drawer แสดงรายละเอียดและไทม์ไลน์ `_components/document-detail-drawer.tsx`**
  - แสดงหัวหนังสือ, เนื้อหาฉบับเต็ม, รายการไฟล์แนบ
  - Visual Step Timeline แสดงประวัติการเกษียนตั้งแต่เริ่มต้นจนถึงปัจจุบัน
- [x] **4.6 หน้าพอร์ทัลสาธารณะ `src/app/(portal)/documents/`**
  - ค้นหาประกาศและคำสั่งคณะ พร้อมดาวน์โหลดไฟล์ PDF
  - ระบบติดตามสถานะสารบรรณแบบ Real-time ด้วยเลขที่เอกสาร

---

### Phase 5: การตรวจสอบและทดสอบคุณภาพ (Verification & Quality Gates)
- [x] **5.1 Type-Check**: รัน `npm run type-check` (tsc --noEmit) ผ่าน 0 errors
- [x] **5.2 Lint**: รัน `npm run lint` (ESLint 0 errors)
- [x] **5.3 Boundary Check**: รัน `npm run deps:check` (0 boundary violations)
- [x] **5.4 Unit Tests**: รัน `npm run test` (27 test files, 132 tests passed 100%)
- [x] **5.5 Live Verification**: ตรวจสอบ Endpoint ผ่าน curl: `/admin/documents` (HTTP 307 Redirect) และ `/documents` (HTTP 200 OK)

