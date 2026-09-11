"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Pause,
  Play,
  X,
  Compass,
  Zap,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StudentProfile {
  id: string;
  category: "ordained" | "lay";
  categoryTh: string;
  categoryEn: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  quoteTh: string;
  quoteEn: string;
  trackTh: string;
  trackEn: string;
  benefitsTh: string[];
  benefitsEn: string[];
  badgeColor: string;
  accentColor: string;
  glowColor: string;
  baseOffset: number; // 0 to 1 position along conveyor loop
  pillTextTh: string;
  pillTextEn: string;
  avatarType: "monk" | "novice" | "male-student" | "female-student";
}

// Fixed 2.5D Isometric Conveyor Belt Track Waypoints (matches the belt curvature in 3D visual)
const CONVEYOR_TRACK = [
  { x: 25, y: 27 }, // 0: Novice Monk (Top-Left corner)
  { x: 20, y: 40 }, // 1: Left straight entering curve
  { x: 17, y: 55 }, // 2: Monk Student (Mid-Left)
  { x: 13, y: 65 }, // 3: Bottom-Left corner turn
  { x: 24, y: 73 }, // 4: Front lane entering center
  { x: 37, y: 71 }, // 5: Male Lay Student (Front-Center)
  { x: 55, y: 77 }, // 6: Front lane continuing right
  { x: 74, y: 74 }, // 7: Front-Right Turn
  { x: 86, y: 60 }, // 8: Female Lay Student (Right)
  { x: 88, y: 46 }, // 9: Back-Right Curve
  { x: 74, y: 28 }, // 10: Back lane behind temple right
  { x: 55, y: 16 }, // 11: Back lane behind temple center
  { x: 38, y: 20 }, // 12: Approaching Top-Left
];

// Catmull-Rom spline interpolation for silky smooth continuous movement
function getTrackPosition(progress: number) {
  const n = CONVEYOR_TRACK.length;
  const p = ((progress % 1) + 1) % 1;
  const floatIdx = p * n;
  const i1 = Math.floor(floatIdx) % n;
  const u = floatIdx - Math.floor(floatIdx);
  const i0 = (i1 - 1 + n) % n;
  const i2 = (i1 + 1) % n;
  const i3 = (i1 + 2) % n;

  const p0 = CONVEYOR_TRACK[i0];
  const p1 = CONVEYOR_TRACK[i1];
  const p2 = CONVEYOR_TRACK[i2];
  const p3 = CONVEYOR_TRACK[i3];

  const u2 = u * u;
  const u3 = u2 * u;

  const x = 0.5 * (
    2 * p1.x +
    (-p0.x + p2.x) * u +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3
  );

  const y = 0.5 * (
    2 * p1.y +
    (-p0.y + p2.y) * u +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3
  );

  // Depth scale & zIndex calculation based on y-position (closer to front = larger)
  const scale = 0.8 + (y / 100) * 0.35;
  const zIndex = Math.round(15 + y);

  return { x, y, scale, zIndex };
}

const STUDENTS_ON_BELT: StudentProfile[] = [
  {
    id: "monk-lead",
    category: "ordained",
    categoryTh: "ฝ่ายบรรพชิต (พระภิกษุ)",
    categoryEn: "Ordained Sangha (Monk)",
    nameTh: "พระภิกษุนิสิต รัฐประศาสนศาสตร์",
    nameEn: "Monk Scholar, Public Administration",
    degreeTh: "หลักสูตรรัฐศาสตรบัณฑิต (ร.บ.)",
    degreeEn: "Bachelor of Political Science (B.Pol.Sc.)",
    quoteTh: "“ผสานหลักพุทธธรรมและธรรมาภิบาลสู่การบริหารกิจการคณะสงฆ์และสังคมยุคดิจิทัลอย่างยั่งยืน”",
    quoteEn: "“Integrating Buddhist ethics and governance for modern sangha and societal administration.”",
    trackTh: "พุทธรัฐศาสตร์และการบริหารองค์กรภาครัฐ",
    trackEn: "Buddhist Political Science & Public Management",
    benefitsTh: ["ทุนการศึกษาฟรี 100% ตลอดหลักสูตร", "ที่พักและภัตตาหารสนับสนุน", "อุปกรณ์คอมพิวเตอร์และห้องปฏิบัติการดิจิทัล"],
    benefitsEn: ["100% Full Free Tuition Scholarship", "Sangha Accommodation & Support", "Digital Lab & Computer Access"],
    badgeColor: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.6)",
    baseOffset: 0.15, // near mid-left
    pillTextTh: "พระภิกษุนิสิต • ทุน 100%",
    pillTextEn: "Monk Student • Full Schol.",
    avatarType: "monk",
  },
  {
    id: "male-lay-student",
    category: "lay",
    categoryTh: "ฝ่ายคฤหัสถ์ (นิสิตชาย)",
    categoryEn: "Lay Student (Male)",
    nameTh: "นายพงศธร นิสิตชั้นปีที่ 3",
    nameEn: "Pongsathorn, 3rd Year Lay Student",
    degreeTh: "หลักสูตรรัฐศาสตรบัณฑิต (ร.บ.)",
    degreeEn: "Bachelor of Political Science (B.Pol.Sc.)",
    quoteTh: "“หลักสูตรเน้นการลงมือปฏิบัติจริง ทั้งการวิเคราะห์นโยบายสาธารณะและการปกครองท้องถิ่นดิจิทัล”",
    quoteEn: "“Hands-on curriculum focused on public policy analysis and digital local governance.”",
    trackTh: "นโยบายสาธารณะและนวัตกรรมภาครัฐ (GovTech)",
    trackEn: "Public Policy & GovTech Innovation",
    benefitsTh: ["สิทธิ์กู้ยืมกองทุน กยศ. และ กรอ. 100%", "เครือข่ายฝึกงานเทศบาล อบต. และกระทรวง", "อบรมเตรียมสอบ ก.พ. ภาค ก ฟรี"],
    benefitsEn: ["Full Student Loan Support (SLF)", "Internship Network in Government Agencies", "Free Civil Service Exam Preparation"],
    badgeColor: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/40",
    accentColor: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.6)",
    baseOffset: 0.40, // front center
    pillTextTh: "นิสิตชาย • นโยบายสาธารณะ",
    pillTextEn: "Male Student • Public Policy",
    avatarType: "male-student",
  },
  {
    id: "female-lay-student",
    category: "lay",
    categoryTh: "ฝ่ายคฤหัสถ์ (นิสิตหญิง)",
    categoryEn: "Lay Student (Female)",
    nameTh: "นางสาวศิริลักษณ์ นิสิตชั้นปีที่ 4",
    nameEn: "Sirilak, Senior Lay Student",
    degreeTh: "หลักสูตรรัฐศาสตรบัณฑิต (ร.บ.)",
    degreeEn: "Bachelor of Political Science (B.Pol.Sc.)",
    quoteTh: "“บรรยากาศอบอุ่น อาจารย์ให้คำปรึกษาใกล้ชิด พร้อมส่งเสริมความเท่าเทียมและผู้นำการเปลี่ยนแปลง”",
    quoteEn: "“Supportive environment, close academic mentorship, championing equality and change-making.”",
    trackTh: "การบริหารการพัฒนาท้องถิ่นและกฎหมายปกครอง",
    trackEn: "Local Development Admin & Administrative Law",
    benefitsTh: ["โอกาสแลกเปลี่ยนวิชาการต่างประเทศ", "โครงงานวิจัยชุมชนสู่นวัตกรรมจริง", "อัตราการได้งานทำหลังจบ 98.5%"],
    benefitsEn: ["International Academic Exchange", "Community Research for Real Impact", "98.5% Post-Graduation Employment"],
    badgeColor: "from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/40",
    accentColor: "#2dd4bf",
    glowColor: "rgba(45, 212, 191, 0.6)",
    baseOffset: 0.65, // right side
    pillTextTh: "นิสิตหญิง • ผู้นำท้องถิ่น",
    pillTextEn: "Female Student • Local Leader",
    avatarType: "female-student",
  },
  {
    id: "novice-scholar",
    category: "ordained",
    categoryTh: "ฝ่ายบรรพชิต (สามเณร)",
    categoryEn: "Ordained Sangha (Novice)",
    nameTh: "สามเณรนิสิต ผู้รับทุนเล่าเรียนหลวง",
    nameEn: "Novice Scholar, Royal Scholarship",
    degreeTh: "หลักสูตรรัฐศาสตรบัณฑิต (ร.บ.)",
    degreeEn: "Bachelor of Political Science (B.Pol.Sc.)",
    quoteTh: "“ต่อยอดการศึกษาพระปริยัติธรรมสู่ระดับอุดมศึกษา สานต่อปัญญาเพื่อการพัฒนาประเทศ”",
    quoteEn: "“Advancing Pali scriptures to higher education, driving national progress through wisdom.”",
    trackTh: "การเมืองเปรียบเทียบและการพัฒนาสังคม",
    trackEn: "Comparative Politics & Social Development",
    benefitsTh: ["ทุนการศึกษาพระราชทาน / สมาคมศิษย์เก่า", "เรียนร่วมหลักสูตรสองภาษา (Bilingual)", "โครงการทัศนศึกษาดูงานรัฐสภา"],
    benefitsEn: ["Royal & Alumni Foundation Scholarships", "Bilingual Elective Classes", "Parliamentary Study Tours"],
    badgeColor: "from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40",
    accentColor: "#eab308",
    glowColor: "rgba(234, 179, 8, 0.6)",
    baseOffset: 0.90, // top-left
    pillTextTh: "สามเณรนิสิต • พระปริยัติธรรม",
    pillTextEn: "Novice Scholar • Pali Track",
    avatarType: "novice",
  },
];

export function ConveyorHero({ locale }: { locale: string }) {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(STUDENTS_ON_BELT[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "ordained" | "lay">("all");
  const [progress, setProgress] = useState(0);

  // High-performance continuous animation loop for conveyor belt
  useEffect(() => {
    if (isPaused || isHovered) return;
    let lastTime = performance.now();
    let animFrame: number;

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Normal full lap is 28 seconds; scaled by speedMultiplier
      const cycleDuration = 28 / speedMultiplier;
      setProgress((prev) => (prev + delta / cycleDuration) % 1);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPaused, isHovered, speedMultiplier]);

  // Pre-generate SVG path for the conveyor track
  const svgTrackPath = useMemo(() => {
    const steps = 60;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pos = getTrackPosition(t);
      const px = (pos.x / 100) * 1000;
      const py = (pos.y / 100) * 625;
      if (i === 0) d += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      else d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    return d + " Z";
  }, []);

  const filteredStudents = STUDENTS_ON_BELT.filter((s) => {
    if (activeFilter === "all") return true;
    return s.category === activeFilter;
  });

  return (
    <div className="relative overflow-hidden bg-[#0c0916] text-white border-b border-white/10 selection:bg-purple-500/30">
      {/* 🔮 Background Glow & Cyber Grid Aesthetic */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-cyan-500/15 rounded-full blur-[130px]" />
        <div className="absolute -bottom-24 left-1/3 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-14 lg:pb-16">
        {/* ═══ TOP TWO-COLUMN GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* 👈 LEFT COLUMN: Bold Editorial & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 z-10">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/15 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="bg-gradient-to-r from-purple-200 via-white to-cyan-300 bg-clip-text text-transparent tracking-wide">
                {locale === "th"
                  ? "เปิดรับสมัครนิสิตใหม่ 2569 • ทั้งฝ่ายบรรพชิตและคฤหัสถ์"
                  : "ADMISSIONS 2026 ACTIVE • SANGHA & LAY STUDENTS"}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-[2.75rem] font-black tracking-tight leading-[1.15]">
                <span className="block text-white">
                  {locale === "th" ? "บ่มเพาะบัณฑิต" : "Nurturing Leaders"}
                </span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {locale === "th" ? "สู่ผู้นำรัฐกิจยุคดิจิทัล" : "For The Digital Era"}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 leading-relaxed max-w-xl">
                {locale === "th"
                  ? "หลักสูตรรัฐศาสตรบัณฑิต วิทยาลัยสงฆ์พุทธโสธร มจร บนสายพานแห่งปัญญาและการเรียนรู้ มุ่งผลิตบัณฑิตทั้งฝ่ายบรรพชิต (พระภิกษุ-สามเณร) และฝ่ายคฤหัสถ์ (ประชาชนทั่วไป) ให้เปี่ยมด้วยคุณธรรม จริยธรรม และวิสัยทัศน์การบริหารสมัยใหม่"
                  : "Bachelor of Political Science, MCU Phutthasothon Buddhist College. An interactive 3D moving conveyor of wisdom shaping monks, novices, and lay students with Buddhist governance and digital public policy."}
              </p>
            </div>

            {/* Quick Filter Buttons for Conveyor */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-400 mr-1">
                {locale === "th" ? "คัดกรองสายพาน:" : "Filter conveyor:"}
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border",
                  activeFilter === "all"
                    ? "bg-purple-500/25 border-purple-400/50 text-white shadow-sm shadow-purple-500/20"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {locale === "th" ? "ทั้งหมด (4)" : "All (4)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("ordained")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center gap-1.5",
                  activeFilter === "ordained"
                    ? "bg-amber-500/25 border-amber-400/50 text-amber-200 shadow-sm shadow-amber-500/20"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {locale === "th" ? "ฝ่ายบรรพชิต (พระ-เณร)" : "Sangha (Monks)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("lay")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center gap-1.5",
                  activeFilter === "lay"
                    ? "bg-cyan-500/25 border-cyan-400/50 text-cyan-200 shadow-sm shadow-cyan-500/20"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {locale === "th" ? "ฝ่ายคฤหัสถ์ (ฆราวาส)" : "Lay Students"}
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/programs"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>{locale === "th" ? "สมัครเข้าศึกษาต่อ (TCAS)" : "Apply for Admission"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-gray-200 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.01]"
              >
                <BookOpen className="w-4 h-4 text-purple-300" />
                <span>{locale === "th" ? "โครงสร้างหลักสูตร 4 ปี" : "4-Year Curriculum"}</span>
              </Link>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                  {locale === "th" ? "ทุนการศึกษาฝ่ายบรรพชิต" : "Full Sangha Schol."}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  98.5%
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                  {locale === "th" ? "อัตราการมีงานทำ & บรรจุ" : "Employment Rate"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Top 1
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                  {locale === "th" ? "สถาบันพุทธศาสน์ภาคตะวันออก" : "Eastern Region Rank"}
                </div>
              </div>
            </div>
          </div>

          {/* 👉 RIGHT COLUMN: Interactive 3D Real-time Moving Conveyor Belt Stage */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#1c1433] via-[#100c22] to-[#0a0715] shadow-2xl shadow-purple-950/50 p-2 group">
              {/* Top Bar with Conveyor Status & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-white/10 bg-black/40 rounded-t-2xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80"
                    )}
                  />
                  <span className="text-[11px] font-mono text-gray-200 uppercase tracking-wider">
                    {isPaused
                      ? (locale === "th" ? "⏸ สายพานพักชั่วคราว" : "⏸ CONVEYOR PAUSED")
                      : (locale === "th" ? "🟢 สายพานกำลังลำเลียง (LIVE)" : "🟢 CONVEYOR ACTIVE (LIVE)")}
                  </span>
                </div>

                {/* Speed Controls & Pause/Resume */}
                <div className="flex items-center gap-1.5">
                  <div className="hidden sm:flex items-center bg-white/5 rounded-md p-0.5 border border-white/10 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setSpeedMultiplier(0.5)}
                      className={cn(
                        "px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                        speedMultiplier === 0.5 ? "bg-purple-600 text-white font-bold" : "text-gray-400 hover:text-white"
                      )}
                      title="Slow"
                    >
                      0.5x
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeedMultiplier(1)}
                      className={cn(
                        "px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                        speedMultiplier === 1 ? "bg-purple-600 text-white font-bold" : "text-gray-400 hover:text-white"
                      )}
                      title="Normal"
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeedMultiplier(1.8)}
                      className={cn(
                        "px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                        speedMultiplier === 1.8 ? "bg-purple-600 text-white font-bold" : "text-gray-400 hover:text-white"
                      )}
                      title="Fast"
                    >
                      1.8x
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/10 hover:bg-white/20 text-gray-100 transition-colors cursor-pointer border border-white/15 shadow-sm"
                    title={isPaused ? "Play conveyor" : "Pause conveyor"}
                  >
                    {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                    <span>{isPaused ? "RESUME" : "PAUSE"}</span>
                  </button>
                </div>
              </div>

              {/* 3D Visual Stage with Moving Conveyor Slats & Moving Capsules */}
              <div
                className="relative aspect-[16/10] w-full overflow-hidden rounded-b-2xl bg-[#090611] select-none"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* 3D Master Background Visual */}
                <Image
                  src="/images/hero-3d-conveyor.jpg"
                  alt="3D Conveyor Belt Animation - MCU Political Science Students"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />

                {/* 🌀 Continuous Moving Conveyor Belt Rollers & Neon Energy Lines (SVG Layer) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 1000 625"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="beltTrackGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                      <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.95" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer glowing track guide aura */}
                  <path
                    d={svgTrackPath}
                    fill="none"
                    stroke="rgba(34, 211, 238, 0.22)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* High-speed moving conveyor slats / rollers (stroke-dashoffset roll animation) */}
                  <path
                    d={svgTrackPath}
                    fill="none"
                    stroke="url(#beltTrackGlow)"
                    strokeWidth="6"
                    strokeDasharray="14 10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonFilter)"
                    className={cn(!isPaused && !isHovered && "animate-[conveyorTrackRoll_2s_linear_infinite]")}
                  />

                  {/* Secondary inner racing pulse line */}
                  <path
                    d={svgTrackPath}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="2"
                    strokeDasharray="6 24"
                    strokeLinecap="round"
                    className={cn(!isPaused && !isHovered && "animate-[conveyorTrackRoll_1.4s_linear_infinite]")}
                  />
                </svg>

                {/* 🏃 PHYSICALLY GLIDING STUDENT CAPSULES ON THE CONVEYOR BELT */}
                {filteredStudents.map((student) => {
                  const studentProgress = (progress + student.baseOffset) % 1;
                  const { x, y, scale, zIndex } = getTrackPosition(studentProgress);
                  const isSelected = selectedStudent?.id === student.id;

                  return (
                    <div
                      key={student.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 cursor-pointer"
                      style={{
                        left: `${x.toFixed(2)}%`,
                        top: `${y.toFixed(2)}%`,
                        zIndex,
                        transform: `translate(-50%, -50%) scale(${scale.toFixed(2)})`,
                      }}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <button
                        type="button"
                        aria-label={locale === "th" ? student.nameTh : student.nameEn}
                        className="group/capsule relative flex flex-col items-center focus:outline-none"
                      >
                        {/* 1. Floating Pill Label on Top */}
                        <div
                          className={cn(
                            "whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-xl transition-all duration-200 mb-1 border",
                            isSelected
                              ? "bg-white text-gray-950 border-white scale-110 shadow-white/40"
                              : "bg-black/85 text-gray-200 border-white/25 group-hover/capsule:scale-105"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: student.accentColor }}
                            />
                            <span>{locale === "th" ? student.pillTextTh : student.pillTextEn}</span>
                          </span>
                        </div>

                        {/* 2. Glass Capsule Body */}
                        <div
                          className={cn(
                            "relative w-12 sm:w-14 h-16 sm:h-20 rounded-t-full rounded-b-xl border-2 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col items-center justify-end pb-1 shadow-2xl",
                            isSelected
                              ? "border-white bg-white/20 ring-4 ring-white/60 shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                              : "border-cyan-300/60 bg-gradient-to-b from-cyan-400/15 via-purple-500/10 to-black/60 group-hover/capsule:border-white/90"
                          )}
                          style={{
                            boxShadow: isSelected
                              ? `0 0 25px ${student.glowColor}`
                              : `0 8px 20px rgba(0,0,0,0.7), 0 0 12px ${student.glowColor}`,
                          }}
                        >
                          {/* Specular glass reflection line */}
                          <div className="absolute top-1 left-1.5 w-1 h-10 bg-white/50 rounded-full blur-[0.5px] pointer-events-none" />

                          {/* Aura glow inside capsule */}
                          <div
                            className="absolute inset-0 opacity-40 blur-sm pointer-events-none"
                            style={{ backgroundColor: student.accentColor }}
                          />

                          {/* Student Avatar Graphic inside capsule */}
                          <div className="relative z-10 flex flex-col items-center">
                            {student.avatarType === "monk" && (
                              <div className="flex flex-col items-center text-center">
                                {/* Monk Head */}
                                <div className="w-5 h-5 rounded-full bg-amber-200/90 border border-amber-400/80 shadow-inner flex items-center justify-center">
                                  <Flame className="w-3 h-3 text-amber-600" />
                                </div>
                                {/* Saffron Robe */}
                                <div className="w-8 h-8 -mt-0.5 rounded-t-lg bg-gradient-to-b from-amber-500 via-orange-600 to-amber-700 shadow-md flex items-center justify-center">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                                </div>
                              </div>
                            )}

                            {student.avatarType === "novice" && (
                              <div className="flex flex-col items-center text-center">
                                {/* Novice Head */}
                                <div className="w-4 h-4 rounded-full bg-amber-100 border border-yellow-400 shadow-inner flex items-center justify-center">
                                  <Flame className="w-2.5 h-2.5 text-amber-500" />
                                </div>
                                {/* Yellow Robe */}
                                <div className="w-7 h-7 -mt-0.5 rounded-t-lg bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-500 shadow-md flex items-center justify-center">
                                  <Award className="w-3 h-3 text-yellow-100" />
                                </div>
                              </div>
                            )}

                            {student.avatarType === "male-student" && (
                              <div className="flex flex-col items-center text-center">
                                {/* Student Head */}
                                <div className="w-5 h-5 rounded-full bg-orange-100 border border-blue-400 shadow-inner flex items-center justify-center">
                                  <GraduationCap className="w-3 h-3 text-indigo-700" />
                                </div>
                                {/* University Suit & Tie */}
                                <div className="w-8 h-8 -mt-0.5 rounded-t-lg bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 border-t border-white/40 shadow-md flex items-center justify-center">
                                  <Zap className="w-3 h-3 text-cyan-300" />
                                </div>
                              </div>
                            )}

                            {student.avatarType === "female-student" && (
                              <div className="flex flex-col items-center text-center">
                                {/* Student Head */}
                                <div className="w-5 h-5 rounded-full bg-orange-100 border border-teal-400 shadow-inner flex items-center justify-center">
                                  <GraduationCap className="w-3 h-3 text-teal-700" />
                                </div>
                                {/* University Uniform */}
                                <div className="w-8 h-8 -mt-0.5 rounded-t-lg bg-gradient-to-b from-white via-slate-200 to-blue-950 border-t border-teal-300 shadow-md flex items-center justify-center">
                                  <BookOpen className="w-3 h-3 text-teal-600" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. Metallic Pedestal Rim & Glowing Base */}
                        <div
                          className="w-10 sm:w-12 h-3 -mt-1 rounded-full border border-white/40 flex items-center justify-center shadow-lg"
                          style={{
                            background: `linear-gradient(to right, #1f2937, ${student.accentColor}, #111827)`,
                            boxShadow: `0 0 10px ${student.glowColor}`,
                          }}
                        >
                          <span
                            className="w-2 h-0.5 rounded-full bg-white opacity-80"
                          />
                        </div>

                        {/* 4. Ground Shadow on Belt */}
                        <div
                          className="w-12 h-2 rounded-full blur-[2px] -mt-0.5 opacity-70"
                          style={{
                            background: `radial-gradient(ellipse at center, ${student.glowColor} 0%, transparent 80%)`,
                          }}
                        />
                      </button>
                    </div>
                  );
                })}

                {/* 🏛️ Center MCU Innovation Temple Hub Node */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-25 cursor-pointer"
                  style={{ left: "61%", top: "42%" }}
                  onClick={() =>
                    setSelectedStudent({
                      id: "mcu-hub",
                      category: "ordained",
                      categoryTh: "ศูนย์กลางวิชาการ มจร",
                      categoryEn: "MCU Academic Core",
                      nameTh: "มหาวิหารปัญญาวิทยาลัยสงฆ์พุทธโสธร",
                      nameEn: "Phutthasothon Buddhist College Academic Hub",
                      degreeTh: "ศูนย์นวัตกรรมแห่งการเรียนรู้",
                      degreeEn: "Center of Innovation & Buddhist Governance",
                      quoteTh: "“สายพานแห่งปัญญา ที่เชื่อมโยงอุดมการณ์พระพุทธศาสนากับการรับใช้สังคมในศตวรรษที่ 21”",
                      quoteEn: "“The wisdom conveyor connecting Buddhist philosophy with 21st-century societal leadership.”",
                      trackTh: "Smart Classroom & ดิจิทัลเพื่อการศึกษา",
                      trackEn: "Smart Classroom & EdTech Infrastructure",
                      benefitsTh: ["ห้องเรียนอัจฉริยะเชื่อมต่อโครงข่ายสากล", "ห้องสมุดดิจิทัลและฐานข้อมูลวิจัย", "เวทีสัมมนาระดับชาติ"],
                      benefitsEn: ["Smart Connected Classrooms", "Digital Library & Research Databases", "National Academic Symposiums"],
                      badgeColor: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40",
                      accentColor: "#c084fc",
                      glowColor: "rgba(192, 132, 252, 0.6)",
                      baseOffset: 0,
                      pillTextTh: "ศูนย์กลาง มจร • นวัตกรรม",
                      pillTextEn: "MCU Hub • Innovation",
                      avatarType: "monk",
                    })
                  }
                >
                  <button
                    type="button"
                    className="relative flex items-center justify-center group/mcu focus:outline-none"
                    aria-label="มหาวิหารปัญญา มจร"
                  >
                    <span className="w-7 h-7 rounded-full bg-purple-600/80 border-2 border-purple-300 text-white flex items-center justify-center shadow-lg shadow-purple-500/60 group-hover/mcu:scale-110 transition-transform">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: "8s" }} />
                    </span>
                    <span className="absolute bottom-full mb-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-black/80 text-purple-200 border border-purple-400/40 opacity-0 group-hover/mcu:opacity-100 transition-opacity whitespace-nowrap">
                      MCU Campus Hub
                    </span>
                  </button>
                </div>

                {/* Bottom Tip Bar */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-gray-400 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>
                      {locale === "th"
                        ? "สายพานกำลังเลื่อนอัตโนมัติ • ชี้เมาส์เพื่อหยุด หรือคลิกนิสิตเพื่อดูประวัติ"
                        : "Conveyor in motion • Hover to pause, click to inspect"}
                    </span>
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {selectedStudent ? (locale === "th" ? selectedStudent.nameTh : selectedStudent.nameEn) : "MCU 2026"}
                  </span>
                </div>
              </div>

              {/* 🔍 ACTIVE STUDENT HUD DETAIL DRAWER / CARD */}
              {selectedStudent && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 backdrop-blur-lg transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
                            selectedStudent.badgeColor
                          )}
                        >
                          {locale === "th" ? selectedStudent.categoryTh : selectedStudent.categoryEn}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {locale === "th" ? selectedStudent.degreeTh : selectedStudent.degreeEn}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                        <span>{locale === "th" ? selectedStudent.nameTh : selectedStudent.nameEn}</span>
                      </h3>
                      <p className="text-xs text-purple-300 font-medium">
                        {locale === "th"
                          ? `สาขาวิชา: ${selectedStudent.trackTh}`
                          : `Track: ${selectedStudent.trackEn}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Close inspection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-300/90 italic my-2.5 pl-2.5 border-l-2 border-purple-400/60">
                    {locale === "th" ? selectedStudent.quoteTh : selectedStudent.quoteEn}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-white/10 text-[11px]">
                    {(locale === "th" ? selectedStudent.benefitsTh : selectedStudent.benefitsEn).map(
                      (benefit, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{benefit}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM CONTINUOUS CONVEYOR RIBBON (Infinite Moving Track) ═══ */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300 font-mono">
                {locale === "th"
                  ? "เส้นทางการเติบโตของบัณฑิตบนสายพานการเรียนรู้ (Curriculum Conveyor Stream)"
                  : "Continuous Graduate Conveyor Stream"}
              </h2>
            </div>
            <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1">
              <Compass className="w-3 h-3 text-purple-400" />
              <span>{locale === "th" ? "เลื่อนดูอย่างต่อเนื่อง • พักเมื่อชี้เมาส์" : "Hover to pause track"}</span>
            </div>
          </div>

          {/* Continuous Running Conveyor Belt Track */}
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-3"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={cn(
                "flex gap-4 w-max",
                !isPaused && "animate-[conveyorSlide_35s_linear_infinite]"
              )}
            >
              {[...STUDENTS_ON_BELT, ...STUDENTS_ON_BELT].map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => setSelectedStudent(item)}
                  className={cn(
                    "flex-shrink-0 w-72 sm:w-80 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer group/card",
                    selectedStudent?.id === item.id
                      ? "bg-purple-950/40 border-purple-400 shadow-md shadow-purple-500/20 scale-[1.02]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/25"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        item.badgeColor
                      )}
                    >
                      {locale === "th" ? item.categoryTh : item.categoryEn}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1 group-hover/card:text-cyan-300">
                      <span>{locale === "th" ? "ดูรายละเอียด" : "Inspect"}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover/card:text-cyan-300 transition-colors">
                    {locale === "th" ? item.nameTh : item.nameEn}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {locale === "th" ? item.trackTh : item.trackEn}
                  </p>

                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10 text-[11px] text-gray-300">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {locale === "th" ? item.benefitsTh[0] : item.benefitsEn[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
