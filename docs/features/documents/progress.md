# Progress Tracking & Quality Gates
## Feature 4: ระบบบริหารจัดการและอนุมัติเอกสาร (E-Document & Approval Workflow)

---

## 1. สถานะความคืบหน้ารายขั้นตอน (Task Progress Matrix)

| รหัสงาน | รายละเอียดงาน (Task Description) | สถานะ (Status) | หมายเหตุ / ผลการตรวจ |
| :--- | :--- | :---: | :--- |
| **DOC-P1** | **Database & Migrations** | ✅ เสร็จสมบูรณ์ | สคีมาพร้อมและไมเกรชันเรียบร้อย |
| DOC-1.1 | ออกแบบ Enums และ Models ใน `schema.prisma` | ✅ เสร็จสมบูรณ์ | `Document`, `DocumentRouting`, `DocumentSequence` |
| DOC-1.2 | รัน Prisma Migration `add_documents_feature` | ✅ เสร็จสมบูรณ์ | ฐานข้อมูล `ums_dev` (`20260910093740_add_documents_feature`) |
| DOC-1.3 | Seed ข้อมูลเอกสารตัวอย่างและตัวนับลำดับ | ✅ เสร็จสมบูรณ์ | รัน `prisma/seed.ts` เอกสารตัวอย่างครบ 5 ประเภท |
| **DOC-P2** | **Feature Domain Layer** | ✅ เสร็จสมบูรณ์ | `src/features/documents/` |
| DOC-2.1 | กำหนดสิทธิ์และ RBAC (`permissions.ts`) | ✅ เสร็จสมบูรณ์ | 5 สิทธิ์สารบรรณ (`DOCUMENTS_P`) |
| DOC-2.2 | พจนานุกรม 2 ภาษา TH/EN (`messages.ts`) | ✅ เสร็จสมบูรณ์ | ครบทุกคีย์ UI, Forms, Modals, Permissions |
| DOC-2.3 | Zod Validation Schemas (`validations.ts`) | ✅ เสร็จสมบูรณ์ | Error mapping ตามภาษา (`zodErrorMap`) |
| DOC-2.4 | ระบบออกเลขทะเบียนสารบรรณ (`numbering.ts`) | ✅ เสร็จสมบูรณ์ | Atomic transaction counter แยกปี/ประเภท |
| DOC-2.5 | Business Services & DTOs (`services.ts`) | ✅ เสร็จสมบูรณ์ | Queries, Mutations, Track by number |
| DOC-2.6 | Server Actions (`actions.ts`) | ✅ เสร็จสมบูรณ์ | ห่อด้วย `runAction` & `requirePermission` |
| **DOC-P3** | **Global Integrations** | ✅ เสร็จสมบูรณ์ | การเชื่อมต่อระดับระบบ |
| DOC-3.1 | ลงทะเบียนใน `src/permissions.ts` | ✅ เสร็จสมบูรณ์ | รวมใน `ALL_PERMISSIONS` |
| DOC-3.2 | ลงทะเบียนใน `src/i18n/index.ts` และเทสต์ | ✅ เสร็จสมบูรณ์ | ตรวจสอบผ่าน Vitest `src/i18n/index.test.ts` |
| DOC-3.3 | เพิ่มเมนูใน `src/components/layout/sidebar-nav.ts` | ✅ เสร็จสมบูรณ์ | ไอคอน `FileText` (`/admin/documents`) |
| **DOC-P4** | **Admin Console UI & Public Portal** | ✅ เสร็จสมบูรณ์ | หน้าจอหลังบ้านและหน้าบ้าน |
| DOC-4.1 | Server Component Page (`page.tsx`) | ✅ เสร็จสมบูรณ์ | ตรวจสอบสิทธิ์ `document:read` |
| DOC-4.2 | แดชบอร์ดและ 4 แท็บกล่องเอกสาร (`documents-client.tsx`) | ✅ เสร็จสมบูรณ์ | Liyon DataTable + Filters + KPI Cards |
| DOC-4.3 | ฟอร์มสร้าง/แก้ไขเอกสาร (`document-form-dialog.tsx`) | ✅ เสร็จสมบูรณ์ | แนบ PDF, เลือกความเร็ว/ความลับ, ยื่นทันที |
| DOC-4.4 | โมดอลเกษียนหนังสือ/สั่งการ (`routing-dialog.tsx`) | ✅ เสร็จสมบูรณ์ | บันทึกความเห็น, ส่งต่อ, อนุมัติ, ตีกลับ |
| DOC-4.5 | Drawer แสดงประวัติและไทม์ไลน์ (`document-detail-drawer.tsx`) | ✅ เสร็จสมบูรณ์ | Visual Step History & ลายเซ็น |
| DOC-4.6 | หน้าพอร์ทัลสาธารณะ (`portal-documents-client.tsx`) | ✅ เสร็จสมบูรณ์ | ค้นหาประกาศ/คำสั่ง และติดตามสถานะสารบรรณ |
| **DOC-P5** | **Quality Gates & Verification** | ✅ เสร็จสมบูรณ์ | ผ่านการตรวจสอบมาตรฐาน 100% |

---

## 2. การตรวจสอบเกณฑ์คุณภาพ VibeCore (Quality Gates Checklist)

| รายการตรวจสอบ (Quality Gate) | คำสั่งที่ใช้ตรวจ (Command) | เกณฑ์ที่ต้องผ่าน (Threshold) | ผลการตรวจจริง |
| :--- | :--- | :--- | :---: |
| **Type Safety** | `npm run type-check` | TypeScript (`tsc --noEmit`) 0 errors | ✅ ผ่าน (0 errors) |
| **Code Formatting & Linting** | `npm run lint` | ESLint 0 errors, 0 unused imports | ✅ ผ่าน (0 errors) |
| **Architecture Boundaries** | `npm run deps:check` | 0 boundary violations across modules | ✅ ผ่าน (0 violations) |
| **Automated Unit Tests** | `npm run test` | ทุกชุดการทดสอบ Vitest ผ่าน 100% | ✅ ผ่าน (27/27 files, 132 tests) |
| **Live Endpoint Verification** | `curl -s http://localhost:3010/admin/documents` | Protected Route (HTTP 307 / 200) | ✅ ผ่าน (HTTP 307 Redirect, /documents 200) |

---

## 3. ตารางประเมินผลตามเกณฑ์การตรวจรับงาน (Acceptance Criteria Matrix)

| รหัสเกณฑ์ | รายละเอียดเกณฑ์การตรวจรับ (Acceptance Criteria) | การทดสอบที่ต้องทำ | ผลการประเมิน |
| :---: | :--- | :--- | :---: |
| **AC-1** | ผู้ใช้สามารถสร้างบันทึกข้อความ แนบไฟล์ และยื่นเรื่องได้ | ทดสอบส่งฟอร์มสร้างเอกสารใหม่ | ✅ ผ่านการประเมิน |
| **AC-2** | ออกเลขทะเบียนสารบรรณอัตโนมัติตามประเภทและปี พ.ศ. ถูกต้อง | ทดสอบยื่นเอกสารและตรวจฟอร์แมตเลข | ✅ ผ่านการประเมิน |
| **AC-3** | สามารถเขียนข้อความเกษียนและส่งต่อให้ผู้บริหารลำดับถัดไปได้ | ทดสอบการแทงเรื่องผ่าน `routing-dialog` | ✅ ผ่านการประเมิน |
| **AC-4** | ผู้บริหารสามารถกดอนุมัติหรือส่งกลับแก้ไขได้ พร้อมเปลี่ยนสถานะ | ทดสอบกด Approve และ Return for edit | ✅ ผ่านการประเมิน |
| **AC-5** | ไทม์ไลน์แสดงประวัติการเดินทางของเอกสารถูกต้องสมบูรณ์ | ตรวจสอบ Step History ใน Drawer | ✅ ผ่านการประเมิน |
| **AC-6** | ผ่าน Quality Gates ครบถ้วนตามมาตรฐาน `AGENTS.md` | รัน `npm run check` | ✅ ผ่านการประเมิน (0 errors) |
