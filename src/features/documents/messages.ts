export const messages = {
  // Navigation & Headers
  "document.nav": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "E-Document & Approvals" },
  "document.nav.inbox": { th: "กล่องเรื่องรอพิจารณา", en: "Pending Action Inbox" },
  "document.nav.registry": { th: "ทะเบียนสารบรรณกลาง", en: "Central Registry" },
  "document.title": { th: "ระบบบริหารจัดการและอนุมัติเอกสาร", en: "E-Document Management & Approval" },
  "document.subtitle": { th: "จัดการหนังสือราชการ บันทึกข้อความ และการเกษียนลงนามออนไลน์", en: "Manage official memos, incoming/outgoing letters, and electronic approvals" },
  "document.portal.title": { th: "งานสารบรรณและประกาศคณะ", en: "Faculty Registry & Public Orders" },
  "document.portal.subtitle": { th: "ค้นหาประกาศ คำสั่งคณะ และตรวจสอบสถานะเอกสารสารบรรณ", en: "Search faculty announcements, official orders, and track document status" },
  
  // Tabs & Stats
  "document.tab.inbox": { th: "กล่องเรื่องรอพิจารณา", en: "Pending Action Inbox" },
  "document.tab.mySubmissions": { th: "เอกสารที่ฉันเสนอ", en: "My Submissions" },
  "document.tab.registry": { th: "ทะเบียนสารบรรณกลาง", en: "Central Registry" },
  "document.tab.archive": { th: "คลังเอกสารเสร็จสิ้น", en: "Completed Archive" },
  "document.stats.inbox": { th: "เรื่องรอพิจารณา", en: "Pending Reviews" },
  "document.stats.mySubmissions": { th: "เรื่องที่ฉันเสนอ", en: "My Submissions" },
  "document.stats.total": { th: "เอกสารทั้งหมด", en: "Total Documents" },
  "document.stats.completed": { th: "อนุมัติแล้วเสร็จ", en: "Completed" },
  
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

  // Routing Actions
  "document.action.SUBMIT": { th: "ยื่นเสนอเรื่อง", en: "Submitted" },
  "document.action.FORWARD": { th: "แทงเรื่อง / ส่งต่อ", en: "Forwarded" },
  "document.action.ENDORSE": { th: "เกษียนเห็นชอบและส่งต่อ", en: "Endorsed & Forwarded" },
  "document.action.RETURN_FOR_EDIT": { th: "ส่งกลับให้แก้ไข", en: "Returned for Revision" },
  "document.action.APPROVE": { th: "ลงนามอนุมัติ", en: "Approved & Signed" },
  "document.action.REJECT": { th: "ไม่อนุมัติ / ยุติเรื่อง", en: "Rejected" },
  
  // Table Columns & Labels
  "document.col.docNumber": { th: "เลขที่หนังสือ", en: "Document No." },
  "document.col.title": { th: "เรื่อง", en: "Title" },
  "document.col.type": { th: "ประเภท", en: "Type" },
  "document.col.urgency": { th: "ความเร็ว", en: "Urgency" },
  "document.col.confidentiality": { th: "ชั้นความลับ", en: "Confidentiality" },
  "document.col.status": { th: "สถานะ", en: "Status" },
  "document.col.submitter": { th: "ผู้เสนอ", en: "Submitter" },
  "document.col.assignee": { th: "ผู้ถือเรื่องปัจจุบัน", en: "Current Assignee" },
  "document.col.department": { th: "หน่วยงาน/ภาควิชา", en: "Department" },
  "document.col.createdAt": { th: "วันที่สร้าง/ยื่น", en: "Created At" },
  "document.col.actions": { th: "จัดการ", en: "Actions" },

  // Form Fields & Modals
  "document.form.newTitle": { th: "สร้างเอกสาร / บันทึกข้อความใหม่", en: "Create New Document / Memo" },
  "document.form.editTitle": { th: "แก้ไขเอกสาร", en: "Edit Document" },
  "document.form.title": { th: "ชื่อเรื่อง", en: "Title" },
  "document.form.titlePlaceholder": { th: "เช่น ขออนุมัติจัดโครงการสัมมนาวิชาการ...", en: "e.g. Request for academic seminar budget..." },
  "document.form.docType": { th: "ประเภทเอกสาร", en: "Document Type" },
  "document.form.urgency": { th: "ระดับความเร็ว", en: "Urgency Level" },
  "document.form.confidentiality": { th: "ระดับความลับ", en: "Confidentiality" },
  "document.form.department": { th: "ภาควิชา / หน่วยงานที่สังกัด", en: "Department / Org Unit" },
  "document.form.originalDocNumber": { th: "เลขที่หนังสือเดิม (ถ้ามี)", en: "Original Document No." },
  "document.form.senderOrg": { th: "หน่วยงานผู้ส่ง (ภายนอก)", en: "Sender Organization" },
  "document.form.content": { th: "รายละเอียดข้อความ / ข้อเสนอ", en: "Content / Proposals" },
  "document.form.contentPlaceholder": { th: "ระบุสาระสำคัญและวัตถุประสงค์ของการเสนอเรื่อง...", en: "Specify the main objectives and details of this submission..." },
  "document.form.attachments": { th: "ไฟล์แนบเอกสาร (PDF / เอกสารอ้างอิง)", en: "Attachments (PDF / Reference Documents)" },
  "document.form.addAttachment": { th: "เพิ่มไฟล์แนบ", en: "Add Attachment" },
  "document.form.attachmentName": { th: "ชื่อไฟล์", en: "File Name" },
  "document.form.attachmentUrl": { th: "URL ไฟล์", en: "File URL" },
  "document.form.targetUser": { th: "ส่งต่อให้ผู้รับเรื่อง", en: "Assign To Reviewer" },
  "document.form.selectTargetUser": { th: "-- เลือกผู้รับเรื่อง --", en: "-- Select Assignee --" },
  "document.form.selectDepartment": { th: "-- เลือกภาควิชา/หน่วยงาน --", en: "-- Select Department --" },
  "document.form.isSubmitNow": { th: "ยื่นเสนอเรื่องทันที (ออกเลขสารบรรณ)", en: "Submit immediately (generate doc number)" },

  // Endorsement / Routing Dialog
  "document.route.dialogTitle": { th: "เกษียนหนังสือ / สั่งการ / ลงนาม", en: "Endorse / Action / Sign Document" },
  "document.route.dialogDesc": { th: "บันทึกความเห็นชอบ แทงเรื่องต่อ หรือลงนามอนุมัติเอกสารนี้", en: "Provide endorsement comment, forward to next assignee, or sign approval" },
  "document.route.selectAction": { th: "คำสั่งการ / การกระทำ", en: "Action" },
  "document.route.comment": { th: "บันทึกข้อความเกษียน / ความเห็น", en: "Endorsement Comment" },
  "document.route.commentPlaceholder": { th: "ระบุความเห็นชอบ เช่น 'เห็นควรอนุมัติตามเสนอ' หรือ 'แก้ไขข้อความหน้า 2'...", en: "e.g. 'Recommended for approval' or 'Please revise page 2'..." },
  "document.route.nextAssignee": { th: "ส่งต่อให้ (ผู้รับเรื่องถัดไป)", en: "Forward to (Next Assignee)" },
  "document.route.signatureUrl": { th: "ลิงก์ลายเซ็นดิจิทัล (ตัวเลือก)", en: "Digital Signature URL (optional)" },

  // Timeline & Drawer
  "document.drawer.title": { th: "รายละเอียดและประวัติเอกสาร", en: "Document Details & History" },
  "document.drawer.timeline": { th: "เส้นทางการเดินทางของหนังสือ (Routing History)", en: "Routing History & Timeline" },
  "document.drawer.step": { th: "ขั้นตอนที่", en: "Step" },
  "document.drawer.actor": { th: "ผู้ดำเนินการ", en: "Actor" },
  "document.drawer.target": { th: "ผู้รับเรื่องถัดไป", en: "Next Assignee" },
  "document.drawer.noAttachments": { th: "ไม่มีไฟล์แนบ", en: "No attachments" },
  "document.drawer.noRoutings": { th: "ยังไม่มีประวัติการเกษียนหนังสือ", en: "No routing history yet" },
  "document.drawer.docNumber": { th: "เลขที่สารบรรณ", en: "Official No." },
  "document.drawer.none": { th: "ยังไม่มี (ฉบับร่าง)", en: "None (Draft)" },

  // Buttons & Actions
  "document.btn.create": { th: "สร้างเอกสาร / บันทึกข้อความ", en: "New Document / Memo" },
  "document.btn.submit": { th: "ยื่นเสนอเรื่อง", en: "Submit Document" },
  "document.btn.saveDraft": { th: "บันทึกเป็นร่าง", en: "Save as Draft" },
  "document.btn.route": { th: "เกษียนหนังสือ / สั่งการ", en: "Endorse / Action" },
  "document.btn.approve": { th: "ลงนามอนุมัติ", en: "Approve & Sign" },
  "document.btn.reject": { th: "ไม่อนุมัติ / ยุติเรื่อง", en: "Reject" },
  "document.btn.returnForEdit": { th: "ส่งกลับแก้ไข", en: "Return for Revision" },
  "document.btn.viewTimeline": { th: "ดูรายละเอียด / ไทม์ไลน์", en: "View Details & Timeline" },
  "document.btn.cancel": { th: "ยกเลิกเรื่อง", en: "Cancel Document" },
  "document.btn.delete": { th: "ลบเอกสาร", en: "Delete" },
  "document.btn.confirm": { th: "ยืนยันการดำเนินการ", en: "Confirm Action" },
  "document.btn.close": { th: "ปิด", en: "Close" },
  "document.btn.search": { th: "ค้นหาเอกสาร", en: "Search Documents" },
  "document.btn.filter": { th: "กรองข้อมูล", en: "Filter" },
  "document.btn.reset": { th: "ล้างตัวกรอง", en: "Reset Filter" },
  "document.btn.download": { th: "เปิดไฟล์แนบ", en: "Open Attachment" },

  // Toasts & Notifications
  "document.toast.created": { th: "สร้างและบันทึกเอกสารเรียบร้อยแล้ว", en: "Document created successfully" },
  "document.toast.submitted": { th: "ยื่นเสนอเอกสารและออกเลขสารบรรณเรียบร้อยแล้ว", en: "Document submitted and numbered successfully" },
  "document.toast.updated": { th: "แก้ไขข้อมูลเอกสารเรียบร้อยแล้ว", en: "Document updated successfully" },
  "document.toast.routed": { th: "บันทึกการเกษียนหนังสือและส่งต่อเรียบร้อยแล้ว", en: "Document endorsed and routed successfully" },
  "document.toast.approved": { th: "ลงนามอนุมัติเอกสารเรียบร้อยแล้ว", en: "Document approved and signed successfully" },
  "document.toast.rejected": { th: "บันทึกการไม่อนุมัติเรียบร้อยแล้ว", en: "Document rejected successfully" },
  "document.toast.returned": { th: "ส่งเรื่องกลับให้แก้ไขเรียบร้อยแล้ว", en: "Document returned for revision" },
  "document.toast.cancelled": { th: "ยกเลิกเอกสารเรียบร้อยแล้ว", en: "Document cancelled successfully" },
  "document.toast.deleted": { th: "ลบเอกสารเรียบร้อยแล้ว", en: "Document deleted successfully" },
  "document.toast.error": { th: "เกิดข้อผิดพลาดในการดำเนินการ", en: "An error occurred while processing" },

  // Confirm Dialogs
  "document.confirm.cancelTitle": { th: "ยืนยันการยกเลิกเอกสาร?", en: "Confirm Document Cancellation?" },
  "document.confirm.cancelDesc": { th: "เมื่อยกเลิกแล้วจะไม่สามารถเสนอเรื่องต่อได้อีก", en: "Once cancelled, this document cannot be routed further." },
  "document.confirm.deleteTitle": { th: "ยืนยันการลบเอกสาร?", en: "Confirm Deletion?" },
  "document.confirm.deleteDesc": { th: "เอกสารฉบับร่างนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้", en: "This draft document will be permanently removed." },

  // Filters & Search Placeholders
  "document.filter.allTypes": { th: "ทุกประเภทเอกสาร", en: "All Document Types" },
  "document.filter.allStatuses": { th: "ทุกสถานะ", en: "All Statuses" },
  "document.search.placeholder": { th: "ค้นหาเลขที่หนังสือ, ชื่อเรื่อง หรือผู้เสนอ...", en: "Search document no., title, or submitter..." },
  "document.empty.title": { th: "ไม่พบเอกสาร", en: "No documents found" },
  "document.empty.desc": { th: "ยังไม่มีเอกสารในหมวดนี้ หรือไม่ตรงกับเงื่อนไขการค้นหา", en: "No documents in this category or matching your search filter" },

  // Public Portal Texts
  "document.portal.searchPlaceholder": { th: "ค้นหาตามเลขที่หนังสือ คำสำคัญ หรือปี พ.ศ. ...", en: "Search by document no., keyword, or year..." },
  "document.portal.announcementsTab": { th: "ประกาศและคำสั่งคณะล่าสุด", en: "Latest Orders & Announcements" },
  "document.portal.trackingTab": { th: "ตรวจสอบสถานะสารบรรณ", en: "Track Document Status" },
  "document.portal.trackPrompt": { th: "กรอกเลขทะเบียนสารบรรณเพื่อตรวจสอบเส้นทาง", en: "Enter document number to verify routing status" },
  "document.portal.trackBtn": { th: "ตรวจสอบสถานะ", en: "Check Status" },
  "document.portal.publicBadge": { th: "ประกาศทางการ", en: "Official Announcement" },
  "document.portal.downloadDoc": { th: "ดาวน์โหลดเอกสารประกาศ (PDF)", en: "Download Announcement PDF" },

  // Permissions & Modules
  "roles.module.document": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "E-Document & Approvals" },
  "roles.module.documents": { th: "ระบบสารบรรณและอนุมัติเอกสาร", en: "E-Document & Approvals" },
  "perm.document:read": { th: "เข้าถึงและดูเอกสารที่เกี่ยวข้อง", en: "View relevant documents" },
  "perm.document:create": { th: "สร้างและยื่นเสนอเอกสาร", en: "Create and submit documents" },
  "perm.document:endorse": { th: "เกษียนหนังสือและความเห็น", en: "Endorse and forward documents" },
  "perm.document:approve": { th: "ลงนามอนุมัติหรือสั่งการ", en: "Approve and sign documents" },
  "perm.document:manage": { th: "บริหารงานสารบรรณและดูเอกสารทั้งหมด", en: "Manage central registry and all documents" },
} as const;

export const MESSAGES = messages;
