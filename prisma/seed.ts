import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed News Categories
  const categories = [
    { nameTh: "ข่าววิชาการและวิจัย", nameEn: "Academic & Research", slug: "academic", color: "blue" },
    { nameTh: "ข่าวกิจกรรมคณะ", nameEn: "Faculty Events", slug: "events", color: "emerald" },
    { nameTh: "ทุนการศึกษา", nameEn: "Scholarships", slug: "scholarships", color: "amber" },
    { nameTh: "ประกาศและจัดซื้อจัดจ้าง", nameEn: "Announcements", slug: "announcements", color: "purple" },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.newsCategory.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: c.slug } },
      update: { nameTh: c.nameTh, nameEn: c.nameEn, color: c.color },
      create: { tenantId: core.tenantId, nameTh: c.nameTh, nameEn: c.nameEn, slug: c.slug, color: c.color },
    });
    catMap[c.slug] = row.id;
  }

  // Seed Sample News Articles
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  const sampleNews = [
    {
      titleTh: "ขอแสดงความยินดีกับคณาจารย์และนักศึกษาที่ได้รับรางวัลนวัตกรรมระดับนานาชาติ ประจำปี 2569",
      titleEn: "Congratulations to Faculty and Students on International Innovation Awards 2026",
      slug: "international-innovation-awards-2026",
      categoryId: catMap["academic"],
      summaryTh: "ผลงานวิจัยและนวัตกรรมปัญญาประดิษฐ์ของคณะได้รับรางวัลเหรียญทองเกียรติยศในการประกวดนวัตกรรมระดับโลก",
      summaryEn: "Faculty's AI research and innovation was awarded gold medal at the World Innovation Expo.",
      contentTh: "คณะขอแสดงความยินดีเป็นอย่างยิ่งกับทีมนักวิจัยและนักศึกษาที่สร้างชื่อเสียงให้กับมหาวิทยาลัยในการแข่งขันประกวดนวัตกรรมระดับนานาชาติ...",
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: true,
      pinnedOrder: 1,
      viewCount: 142,
    },
    {
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ระดับปริญญาตรีและบัณฑิตศึกษา ประจำปีการศึกษา 2570",
      titleEn: "Admissions Open for Undergraduate and Graduate Programs Academic Year 2027",
      slug: "admissions-open-academic-year-2027",
      categoryId: catMap["announcements"],
      summaryTh: "เปิดรับสมัครบุคคลเข้าศึกษาต่อในหลักสูตรที่ทันสมัย มุ่งเน้นการปฏิบัติจริงและเทคโนโลยีดิจิทัล",
      summaryEn: "Applications are now open for prospective students seeking world-class curriculum.",
      contentTh: "เปิดรับสมัครนักศึกษาใหม่ในรอบ Portfolio และ Quota พร้อมทุนการศึกษาสำหรับผู้มีความสามารถพิเศษ...",
      coverImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: true,
      pinnedOrder: 2,
      viewCount: 380,
    },
    {
      titleTh: "คณะจัดงานสัมมนาทางวิชาการและเทคโนโลยี AI เพื่อการบริหารจัดการธุรกิจยุคดิจิทัล",
      titleEn: "Faculty Hosts Seminar on AI & Digital Business Transformation",
      slug: "seminar-ai-digital-business-transformation",
      categoryId: catMap["events"],
      summaryTh: "เชิญชวนคณาจารย์ นักศึกษา และผู้ประกอบการร่วมรับฟังการบรรยายพิเศษจากผู้เชี่ยวชาญชั้นนำในวงการเทคโนโลยี",
      summaryEn: "Join leading industry experts for insights on AI implementation in modern enterprise management.",
      contentTh: "งานสัมมนาจะจัดขึ้น ณ ห้องประชุมใหญ่ ชั้น 4 อาคารนวัตกรรม พร้อมระบบถ่ายทอดสดออนไลน์...",
      coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 95,
    },
  ];

  for (const n of sampleNews) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: n.slug } },
      update: {
        titleTh: n.titleTh,
        titleEn: n.titleEn,
        categoryId: n.categoryId,
        summaryTh: n.summaryTh,
        summaryEn: n.summaryEn,
        contentTh: n.contentTh,
        coverImageUrl: n.coverImageUrl,
        status: n.status,
        isPinned: n.isPinned,
        pinnedOrder: n.pinnedOrder,
        authorId: adminUser?.id,
      },
      create: {
        tenantId: core.tenantId,
        authorId: adminUser?.id,
        titleTh: n.titleTh,
        titleEn: n.titleEn,
        slug: n.slug,
        categoryId: n.categoryId,
        summaryTh: n.summaryTh,
        summaryEn: n.summaryEn,
        contentTh: n.contentTh,
        coverImageUrl: n.coverImageUrl,
        status: n.status,
        isPinned: n.isPinned,
        pinnedOrder: n.pinnedOrder,
        publishedAt: new Date(),
        viewCount: n.viewCount,
      },
    });
  }

  // Seed Departments
  const departmentsData = [
    { code: "DEAN", nameTh: "สำนักงานคณบดี", nameEn: "Dean's Office", type: "EXECUTIVE", displayOrder: 1 },
    { code: "CS", nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์", nameEn: "Department of Computer Science", type: "ACADEMIC", displayOrder: 2 },
    { code: "IT", nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ", nameEn: "Department of Information Technology", type: "ACADEMIC", displayOrder: 3 },
    { code: "SE", nameTh: "ภาควิชาวิศวกรรมซอฟต์แวร์", nameEn: "Department of Software Engineering", type: "ACADEMIC", displayOrder: 4 },
    { code: "POL", nameTh: "ภาควิชารัฐศาสตร์", nameEn: "Department of Political Science", type: "ACADEMIC", displayOrder: 5 },
    { code: "ADMIN", nameTh: "งานบริหารและบริการการศึกษา", nameEn: "General Administration & Academic Services", type: "SUPPORT", displayOrder: 6 },
  ];

  const deptMap: Record<string, string> = {};
  for (const d of departmentsData) {
    const row = await prisma.department.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: d.code } },
      update: { nameTh: d.nameTh, nameEn: d.nameEn, type: d.type, displayOrder: d.displayOrder },
      create: { tenantId: core.tenantId, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn, type: d.type, displayOrder: d.displayOrder },
    });
    deptMap[d.code] = row.id;
  }

  // Seed Staff Profiles
  const staffData = [
    {
      deptCode: "DEAN",
      academicTitleTh: "ศ.ดร.",
      academicTitleEn: "Prof. Dr.",
      firstNameTh: "สิทธิกร",
      lastNameTh: "เกียรติบวรพาณิชย์",
      firstNameEn: "Sitthikhorn",
      lastNameEn: "Kiatbawornpanich",
      positionTh: "ประธานหลักสูตรรัฐศาสตรบัณฑิต",
      positionEn: "Chairperson of Bachelor of Political Science Program",
      staffType: "ACADEMIC",
      isExecutive: true,
      email: "dean@fms.ac.th",
      phone: "02-123-4567 ต่อ 101",
      roomNumber: "ICT-401",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      education: ["Ph.D. in Computer Engineering, MIT, USA", "M.S. in Computer Science, Stanford University, USA", "วศ.บ. วิศวกรรมคอมพิวเตอร์ เกียรตินิยมอันดับหนึ่ง จุฬาฯ"],
      researchInterests: ["Artificial Intelligence", "Cloud Architecture", "Distributed Systems", "Enterprise Architecture"],
      scopusUrl: "https://www.scopus.com",
      scholarUrl: "https://scholar.google.com",
      displayOrder: 1,
      publications: [
        { title: "Scalable Microservices Architecture for Distributed Enterprise Platforms", year: 2025, journalName: "IEEE Transactions on Cloud Computing", authors: "Kiatbawornpanich, S., et al." },
        { title: "Federated Learning Optimization in Edge-Cloud Collaboration Networks", year: 2024, journalName: "ACM Computing Surveys", authors: "Kiatbawornpanich, S., Smith, J." },
      ],
    },
    {
      deptCode: "DEAN",
      academicTitleTh: "รศ.ดร.",
      academicTitleEn: "Assoc. Prof. Dr.",
      firstNameTh: "พิมพ์ชนก",
      lastNameTh: "วรโชติสกุล",
      firstNameEn: "Pimchanok",
      lastNameEn: "Worachotisakul",
      positionTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
      positionEn: "Associate Dean for Academic Affairs & Research",
      staffType: "ACADEMIC",
      isExecutive: true,
      email: "pimchanok@fms.ac.th",
      phone: "02-123-4567 ต่อ 102",
      roomNumber: "ICT-402",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      education: ["Ph.D. in Software Engineering, Carnegie Mellon University, USA", "วศ.ม. วิศวกรรมคอมพิวเตอร์ จุฬาลงกรณ์มหาวิทยาลัย"],
      researchInterests: ["Software Quality Assurance", "DevOps & CI/CD", "Applied Machine Learning"],
      scopusUrl: "https://www.scopus.com",
      scholarUrl: "https://scholar.google.com",
      displayOrder: 2,
      publications: [
        { title: "Continuous Verification Patterns in Modern High-Reliability Web Applications", year: 2025, journalName: "Journal of Systems and Software", authors: "Worachotisakul, P." },
      ],
    },
    {
      deptCode: "CS",
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "อัครพล",
      lastNameTh: "วัฒนกิจเจริญ",
      firstNameEn: "Akarapol",
      lastNameEn: "Wattanakitcharoen",
      positionTh: "หัวหน้าภาควิชาวิทยาการคอมพิวเตอร์",
      positionEn: "Head of Computer Science Department",
      staffType: "ACADEMIC",
      isExecutive: false,
      email: "akarapol@fms.ac.th",
      phone: "02-123-4567 ต่อ 201",
      roomNumber: "ICT-305",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      education: ["D.Eng. in Information Science, Tokyo Tech, Japan", "วศ.บ. วิศวกรรมสารสนเทศ สจล."],
      researchInterests: ["Cybersecurity", "Zero Trust Architecture", "Cryptographic Protocols"],
      scopusUrl: "https://www.scopus.com",
      displayOrder: 3,
      publications: [
        { title: "Zero Trust Network Access Implementation in Multi-Tenant Cloud Environments", year: 2025, journalName: "IEEE Security & Privacy", authors: "Wattanakitcharoen, A., Sato, K." },
      ],
    },
    {
      deptCode: "IT",
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "ธีรภัทร",
      lastNameTh: "อนันต์ไพศาล",
      firstNameEn: "Theeraphat",
      lastNameEn: "Ananpaisarn",
      positionTh: "หัวหน้าภาควิชาเทคโนโลยีสารสนเทศ และผู้ช่วยคณบดีฝ่ายนวัตกรรมดิจิทัล",
      positionEn: "Head of Information Technology Department & Assistant Dean for Digital Innovation",
      staffType: "ACADEMIC",
      isExecutive: true,
      email: "theeraphat@fms.ac.th",
      phone: "02-123-4567 ต่อ 203",
      roomNumber: "ICT-308",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Information Systems, National University of Singapore (NUS)",
        "วศ.ม. เทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
        "วท.บ. วิทยาการคอมพิวเตอร์ มหาวิทยาลัยเชียงใหม่ (เกียรตินิยม)",
      ],
      researchInterests: ["Big Data Analytics", "Internet of Things (IoT)", "Smart Campus & Smart Cities", "Business Intelligence"],
      scopusUrl: "https://www.scopus.com",
      scholarUrl: "https://scholar.google.com",
      displayOrder: 3,
      publications: [
        { title: "IoT-Driven Sensor Network Optimization for Smart University Campus Environments", year: 2025, journalName: "IEEE Internet of Things Journal", authors: "Ananpaisarn, T., Tan, W." },
        { title: "Predictive Analytics Framework for Academic Performance Using High-Dimensional Educational Data", year: 2024, journalName: "Computers & Education", authors: "Ananpaisarn, T." },
      ],
    },
    {
      deptCode: "SE",
      academicTitleTh: "อ.ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "ชัชวาลย์",
      lastNameTh: "รัตนโชติ",
      firstNameEn: "Chatchawan",
      lastNameEn: "Rattanachote",
      positionTh: "อาจารย์ประจำภาควิชาวิศวกรรมซอฟต์แวร์",
      positionEn: "Lecturer in Software Engineering",
      staffType: "ACADEMIC",
      isExecutive: false,
      email: "chatchawan@fms.ac.th",
      phone: "02-123-4567 ต่อ 205",
      roomNumber: "ICT-312",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      education: ["Ph.D. in Software Engineering, University of Melbourne, Australia"],
      researchInterests: ["Automated Software Testing", "Domain-Driven Design", "Frontend Engineering"],
      displayOrder: 4,
      publications: [],
    },
    {
      deptCode: "POL",
      academicTitleTh: "รศ.ดร.",
      academicTitleEn: "Assoc. Prof. Dr.",
      firstNameTh: "นันทิยา",
      lastNameTh: "เกียรติเกรียงไกร",
      firstNameEn: "Nanthiya",
      lastNameEn: "Kiatkriangkrai",
      positionTh: "หัวหน้าภาควิชารัฐศาสตร์",
      positionEn: "Head of Political Science Department",
      staffType: "ACADEMIC",
      isExecutive: false,
      email: "nanthiya@fms.ac.th",
      phone: "02-123-4567 ต่อ 206",
      roomNumber: "ICT-205",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Political Science, London School of Economics (LSE), UK",
        "ร.ม. รัฐศาสตร์ (การปกครอง) จุฬาลงกรณ์มหาวิทยาลัย",
        "ร.บ. รัฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์ (เกียรตินิยมอันดับหนึ่ง)",
      ],
      researchInterests: ["Public Policy & Governance", "Comparative Politics", "Digital Democracy & E-Governance"],
      scopusUrl: "https://www.scopus.com",
      scholarUrl: "https://scholar.google.com",
      displayOrder: 5,
      publications: [
        { title: "Digital Governance and Democratic Resilience in Southeast Asia", year: 2025, journalName: "Asian Journal of Political Science", authors: "Kiatkriangkrai, N." },
      ],
    },
    {
      deptCode: "ADMIN",
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "กมลวรรณ",
      lastNameTh: "สุขเกษม",
      firstNameEn: "Kamonwan",
      lastNameEn: "Sukkasem",
      positionTh: "หัวหน้างานบริการการศึกษาและธุรการ",
      positionEn: "Head of Academic Services & Administration",
      staffType: "SUPPORT",
      isExecutive: false,
      email: "kamonwan@fms.ac.th",
      phone: "02-123-4567 ต่อ 110",
      roomNumber: "ICT-101",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      education: ["ศศ.ม. การบริหารการศึกษา มหาวิทยาลัยเกษตรศาสตร์"],
      researchInterests: [],
      displayOrder: 6,
      publications: [],
    },
  ];

  for (const s of staffData) {
    const existing = await prisma.staffProfile.findFirst({
      where: { tenantId: core.tenantId, firstNameTh: s.firstNameTh, lastNameTh: s.lastNameTh },
    });

    const staffProfile = existing
      ? await prisma.staffProfile.update({
          where: { id: existing.id },
          data: {
            departmentId: deptMap[s.deptCode],
            academicTitleTh: s.academicTitleTh,
            academicTitleEn: s.academicTitleEn,
            firstNameEn: s.firstNameEn,
            lastNameEn: s.lastNameEn,
            positionTh: s.positionTh,
            positionEn: s.positionEn,
            staffType: s.staffType,
            isExecutive: s.isExecutive,
            email: s.email,
            phone: s.phone,
            roomNumber: s.roomNumber,
            avatarUrl: s.avatarUrl,
            education: s.education,
            researchInterests: s.researchInterests,
            scopusUrl: s.scopusUrl || null,
            scholarUrl: s.scholarUrl || null,
            displayOrder: s.displayOrder,
          },
        })
      : await prisma.staffProfile.create({
          data: {
            tenantId: core.tenantId,
            departmentId: deptMap[s.deptCode],
            academicTitleTh: s.academicTitleTh,
            academicTitleEn: s.academicTitleEn,
            firstNameTh: s.firstNameTh,
            lastNameTh: s.lastNameTh,
            firstNameEn: s.firstNameEn,
            lastNameEn: s.lastNameEn,
            positionTh: s.positionTh,
            positionEn: s.positionEn,
            staffType: s.staffType,
            isExecutive: s.isExecutive,
            email: s.email,
            phone: s.phone,
            roomNumber: s.roomNumber,
            avatarUrl: s.avatarUrl,
            education: s.education,
            researchInterests: s.researchInterests,
            scopusUrl: s.scopusUrl || null,
            scholarUrl: s.scholarUrl || null,
            displayOrder: s.displayOrder,
          },
        });

    if (s.publications && s.publications.length > 0) {
      for (const pub of s.publications) {
        const existingPub = await prisma.staffPublication.findFirst({
          where: { tenantId: core.tenantId, staffId: staffProfile.id, title: pub.title },
        });
        if (!existingPub) {
          await prisma.staffPublication.create({
            data: {
              tenantId: core.tenantId,
              staffId: staffProfile.id,
              title: pub.title,
              year: pub.year,
              journalName: pub.journalName,
              authors: pub.authors,
            },
          });
        }
      }
    }
  }

  // Seed Booking Resources (Rooms & Vehicles)
  const resourcesData = [
    {
      type: "ROOM",
      code: "ROOM-BOARD",
      nameTh: "ห้องประชุมสภาคณะ (Executive Boardroom)",
      nameEn: "Executive Boardroom",
      capacity: 25,
      location: "อาคารเรียนรวมและปฏิบัติการ ICT ชั้น 4",
      facilities: ["โปรเจกเตอร์ 4K Laser", "ระบบประชุมทางไกล Zoom Rooms", "ไมโครโฟนประจำที่นั่ง", "ระบบถ่ายทอดสดภายใน"],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
      color: "#3b82f6",
      requiresApproval: true,
      displayOrder: 1,
    },
    {
      type: "ROOM",
      code: "ROOM-HALL",
      nameTh: "ห้องประชุมอเนกประสงค์ (Grand Auditorium)",
      nameEn: "Grand Auditorium",
      capacity: 120,
      location: "อาคารเรียนรวมและปฏิบัติการ ICT ชั้น 1",
      facilities: ["จอ LED Wall Full HD", "ระบบเครื่องเสียงเวที", "ระบบ Live Streaming", "ไมโครโฟนไร้สาย 4 ตัว"],
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80",
      color: "#8b5cf6",
      requiresApproval: true,
      displayOrder: 2,
    },
    {
      type: "ROOM",
      code: "ROOM-MEET1",
      nameTh: "ห้องประชุมวิชาการ 1 (Seminar Room 1)",
      nameEn: "Seminar Room 1",
      capacity: 15,
      location: "อาคารเรียนรวมและปฏิบัติการ ICT ชั้น 3",
      facilities: ["Smart TV 75 นิ้ว", "ไวท์บอร์ดอัจฉริยะ", "ระบบ Video Conference"],
      imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80",
      color: "#10b981",
      requiresApproval: false,
      displayOrder: 3,
    },
    {
      type: "VEHICLE",
      code: "VAN-01",
      nameTh: "รถตู้ปรับอากาศ VIP (Toyota Commuter)",
      nameEn: "VIP Passenger Van (Toyota Commuter)",
      capacity: 10,
      location: "ทะเบียน นข-4589 ขอนแก่น",
      facilities: ["พนักงานขับรถประจำ", "ระบบติดตาม GPS", "ประกันภัยชั้น 1", "ที่ชาร์จ USB ทุกที่นั่ง"],
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
      color: "#f59e0b",
      requiresApproval: true,
      displayOrder: 4,
    },
    {
      type: "VEHICLE",
      code: "CAR-01",
      nameTh: "รถเก๋งบริการวิชาการ (Toyota Camry Hybrid)",
      nameEn: "Executive Sedan (Toyota Camry)",
      capacity: 4,
      location: "ทะเบียน 2กข-8921 กทม.",
      facilities: ["พนักงานขับรถประจำ", "ระบบนำทาง GPS", "ความสะดวกสบายระดับผู้บริหาร"],
      imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&auto=format&fit=crop&q=80",
      color: "#ec4899",
      requiresApproval: true,
      displayOrder: 5,
    },
  ];

  const resourceMap: Record<string, string> = {};
  for (const r of resourcesData) {
    const row = await prisma.bookingResource.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: r.code } },
      update: {
        nameTh: r.nameTh,
        nameEn: r.nameEn,
        capacity: r.capacity,
        location: r.location,
        facilities: r.facilities,
        imageUrl: r.imageUrl,
        color: r.color,
        requiresApproval: r.requiresApproval,
        displayOrder: r.displayOrder,
      },
      create: {
        tenantId: core.tenantId,
        type: r.type,
        code: r.code,
        nameTh: r.nameTh,
        nameEn: r.nameEn,
        capacity: r.capacity,
        location: r.location,
        facilities: r.facilities,
        imageUrl: r.imageUrl,
        color: r.color,
        requiresApproval: r.requiresApproval,
        displayOrder: r.displayOrder,
      },
    });
    resourceMap[r.code] = row.id;
  }

  // Seed Initial Sample Bookings
  if (adminUser) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 4);
    nextWeek.setHours(8, 30, 0, 0);

    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setHours(16, 30, 0, 0);

    const sampleBookings = [
      {
        resourceId: resourceMap["ROOM-BOARD"],
        title: "การประชุมคณะกรรมการประจำคณะฯ สมัยสามัญ ครั้งที่ 3/2569",
        description: "พิจารณาข้อเสนอเปิดหลักสูตรใหม่ และติดตามงบประมาณพัฒนาคณะ",
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: "APPROVED",
        attendeeCount: 18,
        approverId: adminUser.id,
        approvedAt: new Date(),
      },
      {
        resourceId: resourceMap["VAN-01"],
        title: "เดินทางไปราชการส่งเสริมความร่วมมือทางวิชาการและวิจัย ณ อุทยานวิทยาศาสตร์",
        description: "คณะผู้วิจัยเดินทางไปร่วมประชุมเครือข่ายความร่วมมืออุตสาหกรรม",
        startTime: nextWeek,
        endTime: nextWeekEnd,
        status: "PENDING",
        attendeeCount: 7,
        destination: "อุทยานวิทยาศาสตร์ภาคตะวันออกเฉียงเหนือ",
        driverName: "นายสมศักดิ์ ขับดีเลิศ",
        driverPhone: "081-999-8877",
      },
    ];

    for (const b of sampleBookings) {
      const existingBooking = await prisma.booking.findFirst({
        where: { tenantId: core.tenantId, resourceId: b.resourceId, title: b.title },
      });
      if (!existingBooking) {
        await prisma.booking.create({
          data: {
            tenantId: core.tenantId,
            userId: adminUser.id,
            resourceId: b.resourceId,
            title: b.title,
            description: b.description,
            startTime: b.startTime,
            endTime: b.endTime,
            status: b.status,
            attendeeCount: b.attendeeCount,
            destination: b.destination || null,
            driverName: b.driverName || null,
            driverPhone: b.driverPhone || null,
            approverId: b.approverId || null,
            approvedAt: b.approvedAt || null,
          },
        });
      }
    }
  }

  // Seed Academic Programs
  console.log("[seed] กำลังลงข้อมูลหลักสูตรการศึกษา (Academic Programs)...");
  const programsData = [
    {
      code: "CS-2567",
      deptCode: "CS",
      degreeLevel: "BACHELOR" as const,
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2567)",
      nameEn: "Bachelor of Science Program in Computer Science (Revised Curriculum 2024)",
      degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeEn: "Bachelor of Science (Computer Science)",
      degreeShortTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeShortEn: "B.Sc. (Computer Science)",
      slug: "computer-science",
      curriculumYear: 2567,
      totalCredits: 128,
      studyDuration: "4 ปี",
      tuitionFee: "22,000 บาท / ภาคการศึกษา",
      descriptionTh: "มุ่งเน้นสร้างบัณฑิตที่มีความรู้ความเชี่ยวชาญทั้งทฤษฎีและการประยุกต์ใช้วิทยาการคอมพิวเตอร์ ปัญญาประดิษฐ์ และการพัฒนาซอฟต์แวร์ระดับสากล",
      descriptionEn: "Focused on producing graduates with deep expertise in theoretical computer science, applied AI, and enterprise software systems.",
      philosophyTh: "ผลิตบัณฑิตนักคิด นักพัฒนา ผู้มีทักษะการแก้ปัญหาเชิงคำนวณและจริยธรรมดิจิทัลในการขับเคลื่อนเศรษฐกิจสร้างสรรค์",
      philosophyEn: "Cultivating innovative problem solvers equipped with algorithmic thinking and digital ethics to drive the modern economy.",
      careerPaths: [
        "Software Engineer / Developer",
        "AI & Machine Learning Engineer",
        "Data Scientist / Data Engineer",
        "DevOps & Cloud Solutions Architect",
        "Cybersecurity Specialist",
        "Tech Entrepreneur / Startup Founder"
      ],
      plos: [
        { code: "PLO1", titleTh: "อธิบายหลักการทางคณิตศาสตร์ วิทยาการคอมพิวเตอร์ และสถาปัตยกรรมระบบคอมพิวเตอร์ได้อย่างถูกต้อง", titleEn: "Explain foundational principles of computer science and systems architecture" },
        { code: "PLO2", titleTh: "ออกแบบและพัฒนาซอฟต์แวร์ที่ปลอดภัย มีประสิทธิภาพ และตรงตามความต้องการของผู้ใช้งาน", titleEn: "Design and implement secure, high-performance software applications" },
        { code: "PLO3", titleTh: "ประยุกต์ใช้ปัญญาประดิษฐ์และการเรียนรู้ของเครื่องในการแก้ปัญหาเชิงซ้อน", titleEn: "Apply artificial intelligence and machine learning to complex domain problems" },
        { code: "PLO4", titleTh: "ทำงานร่วมกับผู้อื่นได้อย่างมีประสิทธิผล มีทักษะการสื่อสารทางวิชาชีพและจรรยาบรรณวิชาชีพ", titleEn: "Collaborate effectively with professional communication and ethical responsibility" },
      ],
      courseStructure: [
        { groupName: "หมวดวิชาศึกษาทั่วไป (General Education)", credits: 30, description: "กลุ่มวิชาภาษา มนุษยศาสตร์ สังคมศาสตร์ และการคิดเชิงวิพากษ์" },
        { groupName: "หมวดวิชาเฉพาะ - กลุ่มวิชาแกน (Core Courses)", credits: 36, description: "คณิตศาสตร์ดิสครีต สถาปัตยกรรมคอมพิวเตอร์ โครงสร้างข้อมูล และขั้นตอนวิธี" },
        { groupName: "หมวดวิชาเฉพาะ - กลุ่มวิชาชีพเฉพาะ (Major Required)", credits: 44, description: "วิศวกรรมซอฟต์แวร์ ระบบฐานข้อมูล ปัญญาประดิษฐ์ เครือข่าย และโครงงานวิจัย" },
        { groupName: "หมวดวิชาเฉพาะ - กลุ่มวิชาเลือกเฉพาะ (Major Electives)", credits: 12, description: "คลาวด์คอมพิวติ้ง วิทยาการข้อมูลขั้นสูง บล็อกเชน และความมั่นคงปลอดภัย" },
        { groupName: "หมวดวิชาเลือกเสรี (Free Electives)", credits: 6, description: "วิชาเลือกตามความสนใจของผู้เรียนข้ามสาขาวิชา" },
      ],
      studyPlan: [
        {
          year: 1,
          semester: 1,
          courses: [
            { code: "CS101", nameTh: "การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน", nameEn: "Fundamental Computer Programming", credits: 3, type: "วิชาแกน" },
            { code: "MA101", nameTh: "แคลคูลัสสำหรับวิทยาการคอมพิวเตอร์ 1", nameEn: "Calculus for Computer Science I", credits: 3, type: "วิชาแกน" },
            { code: "GE101", nameTh: "ทักษะภาษาอังกฤษเพื่อการสื่อสาร", nameEn: "English Communication Skills", credits: 3, type: "ศึกษาทั่วไป" },
            { code: "GE102", nameTh: "การคิดเชิงวิพากษ์และการแก้ปัญหา", nameEn: "Critical Thinking and Problem Solving", credits: 3, type: "ศึกษาทั่วไป" },
            { code: "CS102", nameTh: "คณิตศาสตร์ไม่ต่อเนื่อง", nameEn: "Discrete Mathematics", credits: 3, type: "วิชาแกน" },
          ]
        },
        {
          year: 1,
          semester: 2,
          courses: [
            { code: "CS103", nameTh: "การเขียนโปรแกรมเชิงวัตถุ", nameEn: "Object-Oriented Programming", credits: 3, type: "วิชาแกน" },
            { code: "CS104", nameTh: "โครงสร้างข้อมูลและขั้นตอนวิธี", nameEn: "Data Structures and Algorithms", credits: 3, type: "วิชาแกน" },
            { code: "CS105", nameTh: "สถาปัตยกรรมและระบบปฏิบัติการคอมพิวเตอร์", nameEn: "Computer Architecture and OS", credits: 3, type: "วิชาแกน" },
            { code: "MA102", nameTh: "พีชคณิตเชิงเส้นและสถิติเชิงคำนวณ", nameEn: "Linear Algebra & Computational Statistics", credits: 3, type: "วิชาแกน" },
            { code: "GE103", nameTh: "พลเมืองดิจิทัลและกฎหมายเทคโนโลยี", nameEn: "Digital Citizenship and Cyber Law", credits: 3, type: "ศึกษาทั่วไป" },
          ]
        },
      ],
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
      pdfUrl: "https://example.com/tqf2-cs-2567.pdf",
      displayOrder: 1,
    },
    {
      code: "IT-2565",
      deptCode: "IT",
      degreeLevel: "BACHELOR" as const,
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ",
      nameEn: "Bachelor of Science Program in Information Technology",
      degreeTh: "วิทยาศาสตรบัณฑิต (เทคโนโลยีสารสนเทศ)",
      degreeEn: "Bachelor of Science (Information Technology)",
      degreeShortTh: "วท.บ. (เทคโนโลยีสารสนเทศ)",
      degreeShortEn: "B.Sc. (Information Technology)",
      slug: "information-technology",
      curriculumYear: 2565,
      totalCredits: 126,
      studyDuration: "4 ปี",
      tuitionFee: "21,000 บาท / ภาคการศึกษา",
      descriptionTh: "เน้นการบูรณาการเทคโนโลยีสารสนเทศ การจัดการระบบเครือข่าย คลาวด์ และการประยุกต์ใช้ดิจิทัลเพื่อธุรกิจและองค์กร",
      descriptionEn: "Empowering students in IT infrastructure, cloud architecture, cybersecurity, and digital business solutions.",
      philosophyTh: "พัฒนาผู้นำเทคโนโลยีสารสนเทศที่เชี่ยวชาญการประยุกต์ใช้เครื่องมือดิจิทัลเพื่อเพิ่มมูลค่าให้องค์กร",
      philosophyEn: "Developing IT professionals who bridge modern technologies with enterprise value creation.",
      careerPaths: [
        "Network & Cloud Administrator",
        "IT Business Analyst",
        "Frontend / Full-stack Web Developer",
        "IT Support & Security Engineer",
        "Database Administrator"
      ],
      plos: [
        { code: "PLO1", titleTh: "ติดตั้ง กำหนดค่า และดูแลรักษาระบบโครงสร้างพื้นฐานด้านไอทีและคลาวด์", titleEn: "Deploy and manage enterprise IT and cloud infrastructures" },
        { code: "PLO2", titleTh: "วิเคราะห์ความต้องการและออกแบบโซลูชันระบบสารสนเทศสำหรับองค์กร", titleEn: "Analyze business needs and engineer IT enterprise systems" },
      ],
      courseStructure: [
        { groupName: "หมวดวิชาศึกษาทั่วไป", credits: 30 },
        { groupName: "หมวดวิชาเฉพาะ", credits: 90 },
        { groupName: "หมวดวิชาเลือกเสรี", credits: 6 },
      ],
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
      pdfUrl: "https://example.com/tqf2-it-2565.pdf",
      displayOrder: 2,
    },
    {
      code: "SE-2566",
      deptCode: "SE",
      degreeLevel: "BACHELOR" as const,
      nameTh: "หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์",
      nameEn: "Bachelor of Engineering Program in Software Engineering",
      degreeTh: "วิศวกรรมศาสตรบัณฑิต (วิศวกรรมซอฟต์แวร์)",
      degreeEn: "Bachelor of Engineering (Software Engineering)",
      degreeShortTh: "วศ.บ. (วิศวกรรมซอฟต์แวร์)",
      degreeShortEn: "B.Eng. (Software Engineering)",
      slug: "software-engineering",
      curriculumYear: 2566,
      totalCredits: 132,
      studyDuration: "4 ปี",
      tuitionFee: "25,000 บาท / ภาคการศึกษา",
      descriptionTh: "เน้นกระบวนการวิศวกรรมซอฟต์แวร์มาตรฐานสากล สถาปัตยกรรมซอฟต์แวร์ การประกันคุณภาพ และการบริหารโครงการแบบ Agile",
      descriptionEn: "Focused on rigorous software engineering practices, scalable software architecture, QA/testing, and agile product development.",
      philosophyTh: "สร้างวิศวกรซอฟต์แวร์มืออาชีพที่สามารถสร้างสรรค์ระบบขนาดใหญ่ที่มีความน่าเชื่อถือสูง",
      philosophyEn: "Producing software engineers capable of building mission-critical, large-scale distributed systems.",
      careerPaths: [
        "Software Architect",
        "Lead Software Engineer",
        "Site Reliability Engineer (SRE)",
        "QA Automation Engineer",
        "Scrum Master / Agile Project Manager"
      ],
      plos: [
        { code: "PLO1", titleTh: "ใช้ระเบียบวิธีทางวิศวกรรมซอฟต์แวร์ในการพัฒนาและควบคุมคุณภาพระบบ", titleEn: "Apply software engineering methodology in building high-quality software" },
      ],
      courseStructure: [
        { groupName: "หมวดวิชาศึกษาทั่วไป", credits: 30 },
        { groupName: "หมวดวิชาเฉพาะทางวิศวกรรม", credits: 96 },
        { groupName: "หมวดวิชาเลือกเสรี", credits: 6 },
      ],
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
      pdfUrl: "https://example.com/tqf2-se-2566.pdf",
      displayOrder: 3,
    },
    {
      code: "POL-2566",
      deptCode: "POL",
      degreeLevel: "BACHELOR" as const,
      nameTh: "หลักสูตรศิลปศาสตรบัณฑิต สาขาวิชารัฐศาสตร์และการบริหารรัฐกิจ",
      nameEn: "Bachelor of Arts Program in Political Science and Public Administration",
      degreeTh: "ศิลปศาสตรบัณฑิต (รัฐศาสตร์)",
      degreeEn: "Bachelor of Arts (Political Science)",
      degreeShortTh: "ศศ.บ. (รัฐศาสตร์)",
      degreeShortEn: "B.A. (Political Science)",
      slug: "political-science",
      curriculumYear: 2566,
      totalCredits: 124,
      studyDuration: "4 ปี",
      tuitionFee: "18,000 บาท / ภาคการศึกษา",
      descriptionTh: "ศึกษาทฤษฎีการเมือง การบริหารงานภาครัฐ นโยบายสาธารณะ และการจัดการความสัมพันธ์ระหว่างประเทศในยุคดิจิทัล",
      descriptionEn: "Comprehensive education in political theory, public administration, policy analysis, and international governance.",
      philosophyTh: "สร้างผู้นำการเปลี่ยนแปลงทางสังคมและการบริหารภาครัฐที่มีคุณธรรม โปร่งใส และมีวิสัยทัศน์",
      philosophyEn: "Fostering visionary public leaders dedicated to good governance, civic responsibility, and public good.",
      careerPaths: [
        "นักวิเคราะห์นโยบายและแผน (Policy & Plan Analyst)",
        "ปลัดอำเภอ / เจ้าหน้าที่ฝ่ายปกครอง",
        "นักการทูต / เจ้าหน้าที่วิเทศสัมพันธ์",
        "ที่ปรึกษาด้านรัฐกิจสัมพันธ์ (Public Affairs Consultant)",
        "นักวิจัยด้านสังคมและการเมือง"
      ],
      plos: [
        { code: "PLO1", titleTh: "วิเคราะห์ปรากฏการณ์ทางการเมือง นโยบายสาธารณะ และการบริหารภาครัฐอย่างเป็นระบบ", titleEn: "Systematically analyze political dynamics and public policies" },
      ],
      courseStructure: [
        { groupName: "หมวดวิชาศึกษาทั่วไป", credits: 30 },
        { groupName: "หมวดวิชาเฉพาะ", credits: 88 },
        { groupName: "หมวดวิชาเลือกเสรี", credits: 6 },
      ],
      imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80",
      pdfUrl: "https://example.com/tqf2-pol-2566.pdf",
      displayOrder: 4,
    },
    {
      code: "MS-AI-2567",
      deptCode: "CS",
      degreeLevel: "MASTER" as const,
      nameTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล",
      nameEn: "Master of Science Program in Artificial Intelligence and Data Science",
      degreeTh: "วิทยาศาสตรมหาบัณฑิต (ปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล)",
      degreeEn: "Master of Science (Artificial Intelligence and Data Science)",
      degreeShortTh: "วท.ม. (ปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล)",
      degreeShortEn: "M.Sc. (AI and Data Science)",
      slug: "ms-ai-data-science",
      curriculumYear: 2567,
      totalCredits: 36,
      studyDuration: "2 ปี",
      tuitionFee: "45,000 บาท / ภาคการศึกษา",
      descriptionTh: "หลักสูตรระดับบัณฑิตศึกษา มุ่งเน้นการวิจัยเชิงลึกด้าน Deep Learning, Natural Language Processing, Computer Vision และการนำ AI ไปแก้ปัญหาธุรกิจขั้นสูง",
      descriptionEn: "Graduate research program specializing in Deep Learning, Large Language Models, Computer Vision, and Enterprise AI applications.",
      philosophyTh: "สร้างนักวิจัยและผู้เชี่ยวชาญระดับสูงทางด้านปัญญาประดิษฐ์ที่สามารถสร้างนวัตกรรมใหม่ในระดับสากล",
      philosophyEn: "Advancing future researchers and AI specialists driving breakthrough innovations globally.",
      careerPaths: [
        "AI Research Scientist",
        "Lead Data Scientist",
        "Machine Learning Operations (MLOps) Specialist",
        "Chief Technology Officer (CTO)",
        "University Lecturer / Researcher"
      ],
      plos: [
        { code: "PLO1", titleTh: "พัฒนากรอบงานวิจัยและสร้างสรรค์องค์ความรู้ใหม่ทางด้านปัญญาประดิษฐ์", titleEn: "Conduct independent advanced research in artificial intelligence" },
      ],
      courseStructure: [
        { groupName: "หมวดวิชาบังคับ (Core Courses)", credits: 12 },
        { groupName: "หมวดวิชาเลือกเฉพาะ (Specialized Electives)", credits: 12 },
        { groupName: "วิทยานิพนธ์ (Master Thesis)", credits: 12 },
      ],
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
      pdfUrl: "https://example.com/tqf2-ms-ai-2567.pdf",
      displayOrder: 5,
    }
  ];

  for (const prog of programsData) {
    const departmentId = deptMap[prog.deptCode] || null;
    await prisma.program.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: prog.slug } },
      update: {
        departmentId,
        degreeLevel: prog.degreeLevel,
        code: prog.code,
        nameTh: prog.nameTh,
        nameEn: prog.nameEn,
        degreeTh: prog.degreeTh,
        degreeEn: prog.degreeEn,
        degreeShortTh: prog.degreeShortTh,
        degreeShortEn: prog.degreeShortEn,
        curriculumYear: prog.curriculumYear,
        totalCredits: prog.totalCredits,
        studyDuration: prog.studyDuration,
        tuitionFee: prog.tuitionFee,
        descriptionTh: prog.descriptionTh,
        descriptionEn: prog.descriptionEn,
        philosophyTh: prog.philosophyTh,
        philosophyEn: prog.philosophyEn,
        careerPaths: prog.careerPaths,
        plos: prog.plos,
        courseStructure: prog.courseStructure,
        studyPlan: prog.studyPlan || [],
        imageUrl: prog.imageUrl,
        pdfUrl: prog.pdfUrl,
        displayOrder: prog.displayOrder,
      },
      create: {
        tenantId: core.tenantId,
        departmentId,
        degreeLevel: prog.degreeLevel,
        code: prog.code,
        nameTh: prog.nameTh,
        nameEn: prog.nameEn,
        degreeTh: prog.degreeTh,
        degreeEn: prog.degreeEn,
        degreeShortTh: prog.degreeShortTh,
        degreeShortEn: prog.degreeShortEn,
        slug: prog.slug,
        curriculumYear: prog.curriculumYear,
        totalCredits: prog.totalCredits,
        studyDuration: prog.studyDuration,
        tuitionFee: prog.tuitionFee,
        descriptionTh: prog.descriptionTh,
        descriptionEn: prog.descriptionEn,
        philosophyTh: prog.philosophyTh,
        philosophyEn: prog.philosophyEn,
        careerPaths: prog.careerPaths,
        plos: prog.plos,
        courseStructure: prog.courseStructure,
        studyPlan: prog.studyPlan || [],
        imageUrl: prog.imageUrl,
        pdfUrl: prog.pdfUrl,
        displayOrder: prog.displayOrder,
      },
    });
  }

  // Seed Document Sequences & Sample Documents
  const currentDocYear = 2569;
  const docTypes = ["MEMO", "INCOMING", "OUTGOING", "COMMAND", "ANNOUNCEMENT"] as const;
  for (const dt of docTypes) {
    await prisma.documentSequence.upsert({
      where: { tenantId_docType_year: { tenantId: core.tenantId, docType: dt, year: currentDocYear } },
      update: { lastNumber: 1 },
      create: { tenantId: core.tenantId, docType: dt, year: currentDocYear, lastNumber: 1 },
    });
  }

  if (adminUser) {
    const csDept = await prisma.department.findFirst({ where: { tenantId: core.tenantId, code: "CS" } });

    // 1. Memo (IN_REVIEW)
    const memoDoc = await prisma.document.upsert({
      where: { tenantId_docNumber: { tenantId: core.tenantId, docNumber: "อว 0604.01/ว 0001/2569" } },
      update: {},
      create: {
        tenantId: core.tenantId,
        docType: "MEMO",
        urgency: "URGENT",
        confidentiality: "NORMAL",
        status: "IN_REVIEW",
        docNumber: "อว 0604.01/ว 0001/2569",
        sequenceNumber: 1,
        docYear: currentDocYear,
        title: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการเทคโนโลยีปัญญาประดิษฐ์ในองค์กร ประจำปี 2569",
        content: "ด้วยภาควิชาวิทยาการคอมพิวเตอร์มีความประสงค์จะจัดโครงการสัมมนาเชิงปฏิบัติการเพื่อยกระดับทักษะบุคลากรและนักศึกษา...",
        submitterId: adminUser.id,
        currentAssigneeId: adminUser.id,
        departmentId: csDept?.id ?? null,
        attachments: [
          { name: "กำหนดการสัมมนา.pdf", url: "https://example.com/docs/schedule.pdf", size: 524288, isMain: true },
        ],
      },
    });

    await prisma.documentRouting.createMany({
      data: [
        {
          tenantId: core.tenantId,
          documentId: memoDoc.id,
          stepOrder: 1,
          actorId: adminUser.id,
          action: "SUBMIT",
          comment: "ยื่นเสนอเรื่องเพื่อโปรดพิจารณาอนุมัติโครงการและงบประมาณ",
        },
        {
          tenantId: core.tenantId,
          documentId: memoDoc.id,
          stepOrder: 2,
          actorId: adminUser.id,
          action: "ENDORSE",
          comment: "เห็นควรอนุมัติการจัดโครงการ เป็นประโยชน์ต่อนักศึกษาและคณาจารย์",
        },
      ],
      skipDuplicates: true,
    });

    // 2. Announcement (APPROVED)
    await prisma.document.upsert({
      where: { tenantId_docNumber: { tenantId: core.tenantId, docNumber: "ประกาศคณะ ที่ 1/2569" } },
      update: {},
      create: {
        tenantId: core.tenantId,
        docType: "ANNOUNCEMENT",
        urgency: "NORMAL",
        confidentiality: "NORMAL",
        status: "APPROVED",
        docNumber: "ประกาศคณะ ที่ 1/2569",
        sequenceNumber: 1,
        docYear: currentDocYear,
        title: "ประกาศคณะ เรื่อง แนวปฏิบัติการขอรับทุนสนับสนุนการนำเสนอผลงานวิชาการระดับนานาชาติ ประจำปีงบประมาณ 2569",
        content: "เพื่อให้การบริหารจัดการงบประมาณสนับสนุนการเผยแพร่ผลงานวิจัยของคณาจารย์และนักศึกษาเป็นไปด้วยความเรียบร้อยและมีประสิทธิภาพสูงสุด จึงออกประกาศแนวปฏิบัตินี้...",
        submitterId: adminUser.id,
        approvedAt: new Date(),
        completedAt: new Date(),
        attachments: [
          { name: "ประกาศแนวปฏิบัติ_2569.pdf", url: "https://example.com/docs/announcement_2569.pdf", size: 1048576, isMain: true },
        ],
      },
    });

    // 3. Command (APPROVED)
    await prisma.document.upsert({
      where: { tenantId_docNumber: { tenantId: core.tenantId, docNumber: "คำสั่งคณะ ที่ 1/2569" } },
      update: {},
      create: {
        tenantId: core.tenantId,
        docType: "COMMAND",
        urgency: "NORMAL",
        confidentiality: "NORMAL",
        status: "APPROVED",
        docNumber: "คำสั่งคณะ ที่ 1/2569",
        sequenceNumber: 1,
        docYear: currentDocYear,
        title: "คำสั่งคณะ เรื่อง แต่งตั้งคณะกรรมการพัฒนาและปรับปรุงหลักสูตรเทคโนโลยีสารสนเทศ",
        content: "เพื่อให้หลักสูตรมีความทันสมัย สอดคล้องกับเกณฑ์มาตรฐานและทักษะแห่งอนาคต จึงแต่งตั้งผู้มีรายนามต่อไปนี้เป็นคณะกรรมการ...",
        submitterId: adminUser.id,
        approvedAt: new Date(),
        completedAt: new Date(),
        attachments: [
          { name: "คำสั่งแต่งตั้งกรรมการ.pdf", url: "https://example.com/docs/committee_order.pdf", size: 786432, isMain: true },
        ],
      },
    });
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
