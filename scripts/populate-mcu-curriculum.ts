import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireDatabaseUrl } from "../prisma/lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

async function main() {
  console.log("🚀 Starting MCU Political Science Data Population from https://sothorn.mcu.ac.th/new/organization/unit.php?id=8...");

  // 1. Get default tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error("No tenant found in database! Please run seed first.");
  }
  const tenantId = tenant.id;
  console.log(`- Using tenant: ${tenant.nameTh} (${tenant.code}) [${tenantId}]`);

  // 2. Upsert Department: POL (สาขาวิชารัฐศาสตร์)
  const dept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: "POL" } },
    update: {
      nameTh: "สาขาวิชารัฐศาสตร์",
      nameEn: "Department of Political Science",
      type: "ACADEMIC",
      displayOrder: 1,
    },
    create: {
      tenantId,
      code: "POL",
      nameTh: "สาขาวิชารัฐศาสตร์",
      nameEn: "Department of Political Science",
      type: "ACADEMIC",
      displayOrder: 1,
    },
  });
  console.log(`✅ Upserted Department: ${dept.nameTh} (${dept.code})`);

  // Remove any legacy dummy staff in POL department
  await prisma.staffProfile.deleteMany({
    where: {
      tenantId,
      departmentId: dept.id,
      firstNameTh: { notIn: ["พระมหากฤษณ์ธนินต์", "พระใบฎีกาพงษ์ศักดิ์", "หฤทัย", "ชัยวิวัฒน์", "สิทธิกร", "กาญจนา"] },
    },
  });

  // 3. Upsert Official Faculty & Committee Members (6 ท่าน จากเว็บ มจร พุทธโสธร)
  const committeeMembers = [
    {
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "พระมหากฤษณ์ธนินต์",
      lastNameTh: "เสฎฺฐเมธี",
      firstNameEn: "Phramaha Kritthanin",
      lastNameEn: "Det (Dr.)",
      positionTh: "ประธานหลักสูตรรัฐศาสตรบัณฑิต",
      positionEn: "Head of Political Science Program Committee",
      staffType: "ACADEMIC" as const,
      isExecutive: true,
      email: "kritthanin.det@mcu.ac.th",
      phone: "038-821-119",
      roomNumber: "อาคารวิทยาลัยสงฆ์พุทธโสธร ชั้น 2",
      avatarUrl: "https://sothorn.mcu.ac.th/new/get-image.php?f=personnel%2Fimg69987652c59b7315234900.webp",
      education: [
        "พธ.ด. (รัฐประศาสนศาสตร์) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
        "พธ.ม. (รัฐประศาสนศาสตร์) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
        "พธ.บ. (การสอนสังคมศึกษา) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
        "เปรียญธรรม ๓ ประโยค (ป.ธ.๓)",
      ],
      researchInterests: [
        "พุทธรัฐศาสตร์ (Buddhist Political Science)",
        "ธรรมาภิบาลและการบริหารจัดการภาครัฐ (Good Governance)",
        "การพัฒนาภาวะผู้นำตามแนวพุทธศาสตร์",
      ],
      displayOrder: 1,
    },
    {
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "พระใบฎีกาพงษ์ศักดิ์",
      lastNameTh: "ขนฺติพโล (รอดทะยอย)",
      firstNameEn: "Phrabaidika Phongsak",
      lastNameEn: "Khantiphalo (Rodthayoi)",
      positionTh: "อาจารย์ประจำหลักสูตร",
      positionEn: "Lecturer in Political Science",
      staffType: "ACADEMIC" as const,
      isExecutive: false,
      email: "phongsak.rod@mcu.ac.th",
      phone: "038-821-119",
      roomNumber: "อาคารวิทยาลัยสงฆ์พุทธโสธร ชั้น 2",
      avatarUrl: "https://sothorn.mcu.ac.th/new/get-image.php?f=personnel%2Fimg699b0b30b53e7605636774.webp",
      education: [
        "พธ.ด. (การบริหารการศึกษา) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
        "ศศ.ม. (รัฐศาสตร์) มหาวิทยาลัยรามคำแหง",
        "พธ.บ. (ปรัชญา) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      ],
      researchInterests: [
        "ปรัชญาการเมืองและพุทธธรรม",
        "นโยบายสาธารณะและการวางแผนพัฒนาชุมชน",
      ],
      displayOrder: 2,
    },
    {
      academicTitleTh: "อ.",
      academicTitleEn: "Lect.",
      firstNameTh: "หฤทัย",
      lastNameTh: "คำเม้า",
      firstNameEn: "Haruethai",
      lastNameEn: "Kammao",
      positionTh: "อาจารย์ประจำหลักสูตร",
      positionEn: "Lecturer in Political Science",
      staffType: "ACADEMIC" as const,
      isExecutive: false,
      email: "haruethai.kam@mcu.ac.th",
      phone: "038-821-119",
      roomNumber: "อาคารวิทยาลัยสงฆ์พุทธโสธร ชั้น 2",
      avatarUrl: "https://sothorn.mcu.ac.th/new/get-image.php?f=personnel%2Fimg699b0ba376b2d895659245.webp",
      education: [
        "ร.ม. (การปกครอง) มหาวิทยาลัยธรรมศาสตร์",
        "ร.บ. (รัฐศาสตร์) มหาวิทยาลัยเชียงใหม่",
      ],
      researchInterests: [
        "การปกครองท้องถิ่นไทยและการกระจายอำนาจ",
        "พฤติกรรมทางการเมืองและการมีส่วนร่วมของประชาชน",
      ],
      displayOrder: 3,
    },
    {
      academicTitleTh: "อ.",
      academicTitleEn: "Lect.",
      firstNameTh: "ชัยวิวัฒน์",
      lastNameTh: "ลาไป",
      firstNameEn: "Chaiwiwat",
      lastNameEn: "Lapai",
      positionTh: "อาจารย์ประจำหลักสูตร",
      positionEn: "Lecturer in Political Science",
      staffType: "ACADEMIC" as const,
      isExecutive: false,
      email: "chaiwiwat.lap@mcu.ac.th",
      phone: "038-821-119",
      roomNumber: "อาคารวิทยาลัยสงฆ์พุทธโสธร ชั้น 2",
      avatarUrl: "https://sothorn.mcu.ac.th/new/get-image.php?f=personnel%2Fimg699b0c40a8c6f372058340.webp",
      education: [
        "ศศ.ม. (รัฐประศาสนศาสตร์) สถาบันบัณฑิตพัฒนบริหารศาสตร์ (NIDA)",
        "ร.บ. (ความสัมพันธ์ระหว่างประเทศ) มหาวิทยาลัยรามคำแหง",
      ],
      researchInterests: [
        "การบริหารทรัพยากรมนุษย์ภาครัฐ",
        "นวัตกรรมการบริหารงานภาครัฐในยุคดิจิทัล (GovTech)",
      ],
      displayOrder: 4,
    },
    {
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "สิทธิกร",
      lastNameTh: "พันศิริ",
      firstNameEn: "Sitthikhorn",
      lastNameEn: "Phansiri",
      positionTh: "อาจารย์ประจำหลักสูตร",
      positionEn: "Lecturer in Political Science",
      staffType: "ACADEMIC" as const,
      isExecutive: false,
      email: "sitthikhorn.pha@mcu.ac.th",
      phone: "089-533-6056",
      roomNumber: "อาคารวิทยาลัยสงฆ์พุทธโสธร ชั้น 2",
      avatarUrl: "https://sothorn.mcu.ac.th/new/get-image.php?f=personnel%2Fimg699b0cef5189b164646244.webp",
      education: [
        "ปร.ด. (รัฐประศาสนศาสตร์) มหาวิทยาลัยขอนแก่น",
        "รป.ม. (การบริหารงานท้องถิ่น) มหาวิทยาลัยขอนแก่น",
        "รป.บ. (รัฐประศาสนศาสตร์) มหาวิทยาลัยบูรพา",
      ],
      researchInterests: [
        "การบริหารรัฐกิจและการวิเคราะห์นโยบายสาธารณะ",
        "การปกครองส่วนท้องถิ่นและการจัดการเมืองอัจฉริยะ (Smart City)",
        "การจัดการความขัดแย้งและการมีส่วนร่วมของภาคประชาสังคม",
      ],
      displayOrder: 5,
    },
    {
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "กาญจนา",
      lastNameTh: "เชี่ยวชาญ",
      firstNameEn: "Kanjana",
      lastNameEn: "Chiawchan",
      positionTh: "งานเลขานุการหลักสูตร / นักจัดการงานทั่วไป",
      positionEn: "Program Secretary / General Administrative Officer",
      staffType: "SUPPORT" as const,
      isExecutive: false,
      email: "kanjana.chi@mcu.ac.th",
      phone: "038-821-119",
      roomNumber: "ห้องสำนักงานวิทยาลัยสงฆ์พุทธโสธร ชั้น 1",
      avatarUrl: "https://sothorn.mcu.ac.th/new/get-image.php?f=personnel%2Fimg69989e0c65194330544467.webp",
      education: [
        "บธ.บ. (การจัดการ) มหาวิทยาลัยราชภัฏราชนครินทร์",
      ],
      researchInterests: [],
      displayOrder: 6,
    },
  ];

  for (const m of committeeMembers) {
    const existing = await prisma.staffProfile.findFirst({
      where: { tenantId, firstNameTh: m.firstNameTh, lastNameTh: m.lastNameTh },
    });

    if (existing) {
      await prisma.staffProfile.update({
        where: { id: existing.id },
        data: {
          departmentId: dept.id,
          academicTitleTh: m.academicTitleTh,
          academicTitleEn: m.academicTitleEn,
          firstNameEn: m.firstNameEn,
          lastNameEn: m.lastNameEn,
          positionTh: m.positionTh,
          positionEn: m.positionEn,
          staffType: m.staffType,
          isExecutive: m.isExecutive,
          email: m.email,
          phone: m.phone,
          roomNumber: m.roomNumber,
          avatarUrl: m.avatarUrl,
          education: m.education,
          researchInterests: m.researchInterests,
          displayOrder: m.displayOrder,
        },
      });
      console.log(`  ✓ Updated staff profile: ${m.academicTitleTh}${m.firstNameTh} ${m.lastNameTh}`);
    } else {
      await prisma.staffProfile.create({
        data: {
          tenantId,
          departmentId: dept.id,
          academicTitleTh: m.academicTitleTh,
          academicTitleEn: m.academicTitleEn,
          firstNameTh: m.firstNameTh,
          lastNameTh: m.lastNameTh,
          firstNameEn: m.firstNameEn,
          lastNameEn: m.lastNameEn,
          positionTh: m.positionTh,
          positionEn: m.positionEn,
          staffType: m.staffType,
          isExecutive: m.isExecutive,
          email: m.email,
          phone: m.phone,
          roomNumber: m.roomNumber,
          avatarUrl: m.avatarUrl,
          education: m.education,
          researchInterests: m.researchInterests,
          displayOrder: m.displayOrder,
        },
      });
      console.log(`  + Created staff profile: ${m.academicTitleTh}${m.firstNameTh} ${m.lastNameTh}`);
    }
  }

  // 4. Upsert Official Program: POL-2567 (หลักสูตรรัฐศาสตรบัณฑิต สาขาวิชารัฐศาสตร์)
  const politicalScienceProgram = {
    code: "POL-2567",
    departmentId: dept.id,
    degreeLevel: "BACHELOR" as const,
    nameTh: "หลักสูตรรัฐศาสตรบัณฑิต สาขาวิชารัฐศาสตร์ (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๗)",
    nameEn: "Bachelor of Political Science Program in Political Science (Revised Curriculum 2024)",
    degreeTh: "รัฐศาสตรบัณฑิต (ร.บ.)",
    degreeEn: "Bachelor of Political Science (B.Pol.Sc.)",
    degreeShortTh: "ร.บ. (รัฐศาสตร์)",
    degreeShortEn: "B.Pol.Sc. (Political Science)",
    slug: "political-science",
    curriculumYear: 2567,
    totalCredits: 130,
    studyDuration: "4 ปี",
    tuitionFee: "ทุนการศึกษา 100% สำหรับบรรพชิต (พระภิกษุ-สามเณร) / กองทุน กยศ. และ กรอ. สำหรับคฤหัสถ์",
    descriptionTh: "หลักสูตรรัฐศาสตรบัณฑิต สาขาวิชารัฐศาสตร์ วิทยาลัยสงฆ์พุทธโสธร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย มุ่งผลิตบัณฑิตทางรัฐศาสตร์ที่มีคุณธรรม จริยธรรม และธรรมาภิบาล มีความรู้ความเข้าใจอย่างลึกซึ้งในหลักการปกครอง นโยบายสาธารณะ และการบริหารรัฐกิจสมัยใหม่ ผสานหลักพุทธธรรมเพื่อการพัฒนาสังคมและประเทศชาติอย่างยั่งยืน",
    descriptionEn: "The Bachelor of Political Science Program at Phutthasothon Buddhist College, MCU, aims to produce ethical, visionary leaders equipped with modern governance, public policy analysis, and Buddhist administrative ethics to serve community and society.",
    philosophyTh: "จัดการศึกษาพระพุทธศาสนาบูรณาการกับรัฐศาสตร์และศาสตร์สมัยใหม่ เพื่อพัฒนาจิตใจ ปัญญา และสังคม ผลิตบัณฑิตที่มีคุณธรรม เชี่ยวชาญการบริหารงานรัฐกิจ และพร้อมพัฒนาสังคมสู่ความยั่งยืน",
    philosophyEn: "Integrating Buddhist wisdom with political science to develop mind, intellect, and society; producing virtuous leaders proficient in public administration for sustainable societal progress.",
    careerPaths: [
      "ปลัดอำเภอ / เจ้าพนักงานปกครอง (Deputy District Chief / Administrative Officer)",
      "นักวิเคราะห์นโยบายและแผน ส่วนราชการ กระทรวง ทบวง กรม และ อปท. (Policy and Plan Analyst)",
      "เจ้าหน้าที่บริหารงานทั่วไป / บุคลากรทางการบริหารงานภาครัฐ รัฐวิสาหกิจ และเอกชน",
      "พระสังฆาธิการ / นักบริหารจัดการองค์กรทางพระพุทธศาสนาและกิจการคณะสงฆ์",
      "นักวิชาการด้านรัฐศาสตร์ พุทธศาสตร์ และการบริหารการพัฒนาชุมชน",
      "เจ้าหน้าที่องค์กรอิสระตามรัฐธรรมนูญ นักวิจัย และเจ้าหน้าที่ประสานงานระหว่างประเทศ",
    ],
    plos: [
      {
        code: "PLO1",
        titleTh: "มีความรู้ความเข้าใจในหลักการ ทฤษฎีทางรัฐศาสตร์ การเมืองการปกครอง นโยบายสาธารณะ และกฎหมายมหาชน",
        titleEn: "Demonstrate sound understanding of political science principles, governance, public policy, and public law",
      },
      {
        code: "PLO2",
        titleTh: "สามารถบูรณาการหลักพุทธธรรม ธรรมาภิบาล และจริยธรรมทางการบริหารในการวิเคราะห์และแก้ไขปัญหาสังคม",
        titleEn: "Integrate Buddhist ethics and good governance in public administration and societal problem-solving",
      },
      {
        code: "PLO3",
        titleTh: "สามารถวิเคราะห์ ออกแบบ และนำเสนอนโยบายสาธารณะและนวัตกรรมการบริหารท้องถิ่นในยุคดิจิทัล",
        titleEn: "Analyze, formulate, and recommend public policies and GovTech innovations for local governance",
      },
      {
        code: "PLO4",
        titleTh: "มีภาวะผู้นำ มีทักษะการสื่อสารดิจิทัล การทำงานร่วมกับผู้อื่นอย่างสร้างสรรค์ และมีจิตสาธารณะ",
        titleEn: "Exhibit leadership, digital communication, constructive teamwork, and civic responsibility",
      },
    ],
    courseStructure: [
      {
        groupName: "หมวดวิชาศึกษาทั่วไป (General Education)",
        credits: 30,
        description: "กลุ่มวิชาภาษาไทย-ภาษาอังกฤษเพื่อการสื่อสาร พุทธศาสตร์บูรณาการ ทักษะดิจิทัล และการคิดเชิงวิพากษ์",
      },
      {
        groupName: "หมวดวิชาเฉพาะ - กลุ่มวิชาแกนทางรัฐศาสตร์ (Core Courses)",
        credits: 36,
        description: "ปรัชญาการเมืองเบื้องต้น ทฤษฎีการเมือง การเมืองการปกครองไทย การเมืองเปรียบเทียบ กฎหมายมหาชน และสถิติเพื่อการวิจัย",
      },
      {
        groupName: "หมวดวิชาเฉพาะ - กลุ่มวิชาชีพเฉพาะบังคับ (Major Required)",
        credits: 46,
        description: "พุทธรัฐศาสตร์ นโยบายสาธารณะและการวางแผน การบริหารงานท้องถิ่น การบริหารรัฐกิจดิจิทัล กฎหมายปกครอง และการวิจัยทางรัฐศาสตร์",
      },
      {
        groupName: "หมวดวิชาเฉพาะ - กลุ่มวิชาชีพเฉพาะเลือก (Major Electives)",
        credits: 12,
        description: "สัมมนาประเด็นการเมืองร่วมสมัย การบริหารความขัดแย้ง ธรรมาภิบาลและการปราบปรามการทุจริต รัฐศาสตร์อาเซียน",
      },
      {
        groupName: "หมวดวิชาเลือกเสรี (Free Electives)",
        credits: 6,
        description: "เลือกศึกษาตามความสนใจข้ามสาขาวิชาเพื่อเสริมสร้างทักษะแห่งอนาคต",
      },
    ],
    studyPlan: [
      {
        year: 1,
        semester: 1,
        courses: [
          { code: "000101", nameTh: "ภาษาไทยเพื่อการสื่อสาร", nameEn: "Thai for Communication", credits: 3, type: "ศึกษาทั่วไป" },
          { code: "000102", nameTh: "ภาษาอังกฤษพื้นฐาน 1", nameEn: "Fundamental English I", credits: 3, type: "ศึกษาทั่วไป" },
          { code: "000115", nameTh: "พุทธประวัติและพุทธจริยธรรม", nameEn: "Life and Ethics of the Buddha", credits: 3, type: "ศึกษาทั่วไป" },
          { code: "401101", nameTh: "ความรู้เบื้องต้นทางรัฐศาสตร์", nameEn: "Introduction to Political Science", credits: 3, type: "วิชาแกน" },
          { code: "401102", nameTh: "ความรู้เบื้องต้นทางรัฐประศาสนศาสตร์", nameEn: "Introduction to Public Administration", credits: 3, type: "วิชาแกน" },
          { code: "401103", nameTh: "ประวัติศาสตร์การเมืองไทย", nameEn: "History of Thai Politics", credits: 3, type: "วิชาแกน" },
        ],
      },
      {
        year: 1,
        semester: 2,
        courses: [
          { code: "000103", nameTh: "ภาษาอังกฤษพื้นฐาน 2", nameEn: "Fundamental English II", credits: 3, type: "ศึกษาทั่วไป" },
          { code: "000108", nameTh: "ทักษะชีวิตและสังคมดิจิทัล", nameEn: "Life Skills in Digital Society", credits: 3, type: "ศึกษาทั่วไป" },
          { code: "000139", nameTh: "พุทธปรัชญาเบื้องต้น", nameEn: "Introduction to Buddhist Philosophy", credits: 3, type: "ศึกษาทั่วไป" },
          { code: "401104", nameTh: "ปรัชญาการเมืองเบื้องต้น", nameEn: "Introduction to Political Philosophy", credits: 3, type: "วิชาแกน" },
          { code: "401105", nameTh: "ระบบการเมืองเปรียบเทียบ", nameEn: "Comparative Political Systems", credits: 3, type: "วิชาแกน" },
          { code: "401106", nameTh: "กฎหมายเบื้องต้นทางรัฐศาสตร์", nameEn: "Introduction to Law for Political Science", credits: 3, type: "วิชาแกน" },
        ],
      },
      {
        year: 2,
        semester: 1,
        courses: [
          { code: "401201", nameTh: "พุทธรัฐศาสตร์", nameEn: "Buddhist Political Science", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401202", nameTh: "ทฤษฎีการบริหารองค์การภาครัฐ", nameEn: "Public Organization Theory", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401203", nameTh: "กฎหมายมหาชน", nameEn: "Public Law", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401204", nameTh: "นโยบายสาธารณะและการวางแผน", nameEn: "Public Policy and Planning", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401205", nameTh: "การเมืองและระบบราชการไทย", nameEn: "Thai Politics and Bureaucratic System", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401206", nameTh: "สถิติและการวิจัยทางสังคมศาสตร์", nameEn: "Statistics and Social Science Research", credits: 3, type: "วิชาแกน" },
        ],
      },
      {
        year: 2,
        semester: 2,
        courses: [
          { code: "401207", nameTh: "ธรรมาภิบาลและการบริหารจัดการที่ดี", nameEn: "Good Governance and Administration", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401208", nameTh: "การบริหารการพัฒนาและการปกครองท้องถิ่น", nameEn: "Development Admin and Local Governance", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401209", nameTh: "กฎหมายปกครองและวิธีพิจารณาคดีปกครอง", nameEn: "Administrative Law and Judicial Review", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401210", nameTh: "การบริหารงานคลังและงบประมาณภาครัฐ", nameEn: "Public Finance and Budgeting", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401211", nameTh: "รัฐกิจดิจิทัลและเทคโนโลยีภาครัฐ (GovTech)", nameEn: "Digital Governance and GovTech", credits: 3, type: "วิชาชีพเฉพาะ" },
        ],
      },
      {
        year: 3,
        semester: 1,
        courses: [
          { code: "401301", nameTh: "พุทธธรรมกับการบริหารจัดการความขัดแย้ง", nameEn: "Buddhism and Conflict Management", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401302", nameTh: "การบริหารทรัพยากรมนุษย์ภาครัฐ", nameEn: "Public Human Resource Management", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401303", nameTh: "การบริหารกิจการคณะสงฆ์ตามพระธรรมวินัยและกฎหมาย", nameEn: "Sangha Administration and Ecclesiastical Law", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401304", nameTh: "สัมมนาการเมืองและการบริหารท้องถิ่น", nameEn: "Seminar in Politics and Local Administration", credits: 3, type: "วิชาชีพเลือก" },
          { code: "401305", nameTh: "วิชาเลือกเสรี 1", nameEn: "Free Elective I", credits: 3, type: "เลือกเสรี" },
        ],
      },
      {
        year: 3,
        semester: 2,
        courses: [
          { code: "401306", nameTh: "ระเบียบวิธีวิจัยทางรัฐศาสตร์", nameEn: "Research Methodology in Political Science", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401307", nameTh: "การจัดการเชิงยุทธศาสตร์ในภาครัฐ", nameEn: "Strategic Management in Public Sector", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401308", nameTh: "ความสัมพันธ์ระหว่างประเทศและการทูต", nameEn: "International Relations and Diplomacy", credits: 3, type: "วิชาชีพเลือก" },
          { code: "401309", nameTh: "การเมืองและนโยบายสิ่งแวดล้อมเพื่อความยั่งยืน", nameEn: "Environmental Politics and Sustainable Policy", credits: 3, type: "วิชาชีพเลือก" },
          { code: "401310", nameTh: "วิชาเลือกเสรี 2", nameEn: "Free Elective II", credits: 3, type: "เลือกเสรี" },
        ],
      },
      {
        year: 4,
        semester: 1,
        courses: [
          { code: "401401", nameTh: "สัมมนาปัญหาและทิศทางการพัฒนาการเมืองไทย", nameEn: "Seminar on Contemporary Issues in Thai Politics", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401402", nameTh: "โครงงานวิจัยทางรัฐศาสตร์ (Senior Project)", nameEn: "Senior Research Project in Political Science", credits: 3, type: "วิชาชีพเฉพาะ" },
          { code: "401403", nameTh: "ภาวะผู้นำเชิงพุทธและการขับเคลื่อนนโยบายสาธารณะ", nameEn: "Buddhist Leadership and Public Policy Advocacy", credits: 3, type: "วิชาชีพเลือก" },
        ],
      },
      {
        year: 4,
        semester: 2,
        courses: [
          { code: "401404", nameTh: "การฝึกงานวิชาชีพทางรัฐศาสตร์และสหกิจศึกษา", nameEn: "Political Science Internship and Cooperative Education", credits: 6, type: "วิชาชีพเฉพาะ" },
        ],
      },
    ],
    imageUrl: "/images/hero-3d-conveyor.jpg",
    pdfUrl: "https://sothorn.mcu.ac.th/new/uploads/documents/20260815_180023_714c58.pdf",
    displayOrder: 1,
    isActive: true,
  };

  const existingProg = await prisma.program.findFirst({
    where: { tenantId, slug: "political-science" },
  });

  if (existingProg) {
    await prisma.program.update({
      where: { id: existingProg.id },
      data: {
        code: politicalScienceProgram.code,
        departmentId: politicalScienceProgram.departmentId,
        degreeLevel: politicalScienceProgram.degreeLevel,
        nameTh: politicalScienceProgram.nameTh,
        nameEn: politicalScienceProgram.nameEn,
        degreeTh: politicalScienceProgram.degreeTh,
        degreeEn: politicalScienceProgram.degreeEn,
        degreeShortTh: politicalScienceProgram.degreeShortTh,
        degreeShortEn: politicalScienceProgram.degreeShortEn,
        curriculumYear: politicalScienceProgram.curriculumYear,
        totalCredits: politicalScienceProgram.totalCredits,
        studyDuration: politicalScienceProgram.studyDuration,
        tuitionFee: politicalScienceProgram.tuitionFee,
        descriptionTh: politicalScienceProgram.descriptionTh,
        descriptionEn: politicalScienceProgram.descriptionEn,
        philosophyTh: politicalScienceProgram.philosophyTh,
        philosophyEn: politicalScienceProgram.philosophyEn,
        careerPaths: politicalScienceProgram.careerPaths,
        plos: politicalScienceProgram.plos,
        courseStructure: politicalScienceProgram.courseStructure,
        studyPlan: politicalScienceProgram.studyPlan,
        imageUrl: politicalScienceProgram.imageUrl,
        pdfUrl: politicalScienceProgram.pdfUrl,
        displayOrder: politicalScienceProgram.displayOrder,
        isActive: politicalScienceProgram.isActive,
      },
    });
    console.log(`✅ Updated existing Program: ${politicalScienceProgram.nameTh}`);
  } else {
    await prisma.program.create({
      data: {
        tenantId,
        ...politicalScienceProgram,
      },
    });
    console.log(`✅ Created Program: ${politicalScienceProgram.nameTh}`);
  }

  // 5. Upsert Official Document Record in DB
  const docTitle = "แต่งตั้งอาจารย์ผู้รับผิดชอบและอาจารย์ประจำหลักสูตรรัฐศาสตรบัณฑิต สาขาวิชารัฐศาสตร์ (ฉบับปี พ.ศ. ๒๕๖๗)";
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@app.local" } });

  if (adminUser) {
    const existingDoc = await prisma.document.findFirst({
      where: { tenantId, title: docTitle },
    });

    if (!existingDoc) {
      await prisma.document.create({
        data: {
          tenantId,
          title: docTitle,
          docType: "COMMAND",
          docNumber: "คำสั่ง วส.พธ. ๖๗/๒๕๖๗",
          docYear: 2567,
          status: "APPROVED",
          submitterId: adminUser.id,
          departmentId: dept.id,
          content: "คำสั่งแต่งตั้งอาจารย์ผู้รับผิดชอบและอาจารย์ประจำหลักสูตรรัฐศาสตรบัณฑิต สาขาวิชารัฐศาสตร์ วิทยาลัยสงฆ์พุทธโสธร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ฉบับปี พ.ศ. ๒๕๖๗",
          attachments: [
            {
              name: "20260815_180023_714c58.pdf",
              url: "https://sothorn.mcu.ac.th/new/uploads/documents/20260815_180023_714c58.pdf",
              isMain: true,
            },
          ],
        },
      });
      console.log(`✅ Created Official Document record: ${docTitle}`);
    } else {
      console.log(`  ✓ Document already exists: ${docTitle}`);
    }
  }

  console.log("\n🎉 Finished populating MCU Political Science data successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error populating MCU data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
