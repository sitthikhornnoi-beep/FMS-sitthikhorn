# AI Coding Instructions & Rules: E-Document Feature
## คู่มือและข้อบังคับสำหรับ AI Agent ในการพัฒนาฟีเจอร์บริหารจัดการและอนุมัติเอกสาร

เอกสารฉบับนี้กำหนดกฎเกณฑ์และมาตรฐานที่ AI Agent **ต้องปฏิบัติตามอย่างเคร่งครัด 100% โดยไม่มีข้อยกเว้น** เมื่อทำการพัฒนา ทดสอบ หรือแก้ไขโค้ดในฟีเจอร์ `documents`

---

## 1. ขอบเขตโมดูลและกฎ Modular Monolith (Strict Boundaries)

1. **โครงสร้างไฟล์ของฟีเจอร์**:
   - โค้ดทั้งหมดของฟีเจอร์ต้องอยู่ภายใต้ `src/features/documents/` เท่านั้น
   - ส่วนประกอบภายใน (Services, DB Queries, Schemas, Actions) ต้องอยู่ใน `src/features/documents/_internal/`
   - **Public API Exports**:
     - `src/features/documents/index.ts` (Client-safe types & components)
     - `src/features/documents/server.ts` (Server functions สำหรับ Server Components)
     - `src/features/documents/actions.ts` (Server Actions สำหรับ Mutations)
2. **ข้อห้ามเรื่อง Cross-Feature Imports**:
   - **ห้าม** Import ไฟล์จากโฟลเดอร์ `_internal/` ของฟีเจอร์อื่นโดยเด็ดขาด (จะถูกตรวจจับด้วย `dependency-cruiser` / `npm run deps:check`)
   - หากต้องการเรียกใช้ข้อมูลจากฟีเจอร์อื่น (เช่น บุคลากร `personnel` หรือผู้ใช้ `identity`) ต้องเรียกผ่าน Public API (`@/features/personnel/server` หรือ `@/features/identity/server`) เท่านั้น

---

## 2. การใช้ UI Component (Liyon Design System)

1. **ห้ามสร้าง Component UI พื้นฐานขึ้นมาเองซ้ำซ้อน**:
   - ต้องใช้ Components จาก `@/shared/components/liyon` เสมอ ได้แก่:
     - `DataTable`, `type DataTableColumn` สำหรับแสดงตารางข้อมูล
     - `StatusPill`, `type StatusPillTone` สำหรับแสดงป้ายสถานะ (ใช้ tone: `"ok" | "warn" | "bad" | "info" | "off"`)
     - `LiyonDialog`, `LiyonDialogHeader`, `LiyonDialogBody`, `LiyonDialogFooter` สำหรับ Modal Dialogs
     - `LiyonSelect` สำหรับ Dropdown เมนู (ส่ง children เป็น `<option>`)
     - `RowMenuItem` สำหรับเมนู Action รายแถวในตาราง
2. **ข้อกำหนด LiyonDialogHeader**:
   - `LiyonDialogHeader` ต้องการ props `title: ReactNode` และ `description?: ReactNode` เสมอ ห้ามใส่ `<div className="...">` เป็น children โดยไม่ระบุ title
3. **ห้ามแก้ไขไฟล์ Theme**:
   - **ห้าม** แก้ไขไฟล์ใน `src/shared/styles/liyon/` โดยตรงเนื่องจากเป็นไฟล์ที่ซิงค์มาจาก Upstream Theme

---

## 3. กฎเหล็กด้านสากลภิวัฒน์และการแสดงผล (i18n & Formatting)

1. **ห้ามฮาร์ดโค้ดข้อความ UI เด็ดขาด (No Hardcoded Strings)**:
   - ทุกป้ายข้อความ, ปุ่ม, คำอธิบาย, placeholder, และข้อความแจ้งเตือน (Toast) ต้องผ่านฟังก์ชัน `t("document.xxx")`
   - ต้องประกาศคีย์คำแปลทั้งภาษาไทย (`th`) และภาษาอังกฤษ (`en`) ใน `src/features/documents/messages.ts`
   - ต้องลงทะเบียนพจนานุกรมใน `src/i18n/index.ts` และเพิ่มใน `DICTIONARIES` ของ `src/i18n/index.test.ts`
2. **การแสดงผลวันที่และเวลา**:
   - ต้องใช้ `formatDate(date, locale)` จาก `@/shared/lib/format` เพื่อแสดงปี พ.ศ. เมื่อเป็นภาษาไทย และปี ค.ศ. เมื่อเป็นภาษาอังกฤษ

---

## 4. มาตรฐาน Server Actions และความปลอดภัย (Security & Multi-Tenancy)

1. **การห่อหุ้ม Server Actions**:
   - ทุก Server Action ต้องห่อด้วย `runAction(async () => { ... })` จาก `@/shared/lib/result` เพื่อให้คืนค่าเป็น `ActionResult<T>` มาตรฐาน
   - การดักจับ Error ใน Client ต้องเข้าถึงผ่าน `res.error.message`
2. **Multi-Tenancy**:
   - **ห้าม** รับ `tenantId` จาก Client payload เด็ดขาด
   - ต้องดึง `tenantId` จากเซสชันที่ผ่านการยืนยันตัวตนเสมอ เช่น:
     ```ts
     const ctx = await requirePermission(DOCUMENTS_P.documentCreate);
     const tenantId = ctx.tenantId;
     ```
3. **การตรวจสอบสิทธิ์ (RBAC)**:
   - ทุกการกระทำที่ส่งผลต่อข้อมูล ต้องเรียกใช้ `requirePermission(ctx, "<permission>")` ก่อนเริ่มดำเนินการใน Transaction
4. **Audit Trail**:
   - การอนุมัติ, การปฏิเสธ, และการเปลี่ยนสถานะเอกสาร ต้องบันทึกประวัติการกระทำ (Audit Log) เสมอ

---

## 5. กฎเฉพาะของ React 19 และ Next.js 16

1. **หลีกเลี่ยงการ Reset State ใน `useEffect`**:
   - ห้ามใช้ `useEffect(() => setFormData(...), [props])` ภายใน Dialog
   - ให้ใช้เทคนิค **Key Reset Pattern**:
     ```tsx
     <DocumentFormDialogInner key={doc?.id ?? "create"} doc={doc} ... />
     ```
2. **Dynamic Route Parameters ใน Next.js 16**:
   - ในหน้าเพจแบบ dynamic (เช่น `[id]/page.tsx`) `params` จะเป็น Promise เสมอ:
     ```tsx
     export default async function Page({ params }: { params: Promise<{ id: string }> }) {
       const { id } = await params;
       ...
     }
     ```

---

## 6. ข้อกำหนดก่อนส่งมอบงาน (Quality Gates)

ก่อนสรุปงานกับผู้ใช้ AI ต้องรันคำสั่งตรวจสอบและผ่าน 100%:
1. `npm run type-check` (tsc --noEmit)
2. `npm run lint` (ESLint 0 errors)
3. `npm run deps:check` (Dependency Cruiser 0 boundary violations)
4. `npm run test` (Vitest suites passed 100%)
