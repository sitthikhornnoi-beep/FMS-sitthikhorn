"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  BookOpen,
  Search,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";
import type { ProgramDto, DegreeLevelType } from "@/features/curriculum";

interface DepartmentOption {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface Props {
  initialPrograms: ProgramDto[];
  departments: DepartmentOption[];
}

export function ProgramsDirectory({ initialPrograms, departments }: Props) {
  const locale = useLocale();

  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [search, setSearch] = useState("");

  const filteredPrograms = useMemo(() => {
    return initialPrograms.filter((p) => {
      if (selectedLevel !== "ALL" && p.degreeLevel !== selectedLevel) return false;
      if (selectedDept && p.departmentId !== selectedDept) return false;
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchCode = p.code.toLowerCase().includes(term);
        const matchNameTh = p.nameTh.toLowerCase().includes(term);
        const matchNameEn = p.nameEn.toLowerCase().includes(term);
        const matchDegree = p.degreeTh.toLowerCase().includes(term);
        if (!matchCode && !matchNameTh && !matchNameEn && !matchDegree) return false;
      }
      return true;
    });
  }, [initialPrograms, selectedLevel, selectedDept, search]);

  const levelTabs = [
    { id: "ALL", labelTh: "ทุกระดับการศึกษา", labelEn: "All Programs" },
    { id: "BACHELOR", labelTh: "ระดับปริญญาตรี", labelEn: "Undergraduate (Bachelor)" },
    { id: "MASTER", labelTh: "ระดับปริญญาโท", labelEn: "Graduate (Master)" },
    { id: "DOCTORATE", labelTh: "ระดับปริญญาเอก", labelEn: "Doctorate (Ph.D.)" },
  ];

  const getDegreeLevelBadge = (level: DegreeLevelType) => {
    switch (level) {
      case "BACHELOR":
        return {
          labelTh: "ปริญญาตรี",
          labelEn: "Bachelor",
          bg: "bg-blue-600 text-white dark:bg-blue-500",
        };
      case "MASTER":
        return {
          labelTh: "ปริญญาโท",
          labelEn: "Master",
          bg: "bg-purple-600 text-white dark:bg-purple-500",
        };
      case "DOCTORATE":
        return {
          labelTh: "ปริญญาเอก",
          labelEn: "Doctorate",
          bg: "bg-amber-600 text-white dark:bg-amber-500",
        };
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border p-8 sm:p-12 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="w-4 h-4" />
            <span>
              {locale === "th"
                ? "หลักสูตรมาตรฐานสากล ก้าวทันโลกดิจิทัล"
                : "World-Class Academic Programs"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {locale === "th" ? "หลักสูตรการศึกษา" : "Academic Programs"}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {locale === "th"
              ? "หลักสูตรรัฐศาสตรบัณฑิต มุ่งเน้นการผลิตบัณฑิตและนักวิจัยที่มีความรู้ความเชี่ยวชาญด้านการปกครอง นโยบายสาธารณะ และการบริหารรัฐกิจ เพื่อตอบโจทย์การพัฒนาสังคมและประเทศชาติ"
              : "Discover comprehensive degree curriculum designed to empower the next generation of public leaders, policy analysts, and governance innovators."}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Degree Level Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {levelTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLevel(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedLevel === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {locale === "th" ? tab.labelTh : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Department Pills & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              onClick={() => setSelectedDept("")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDept === ""
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "th" ? "ทุกภาควิชา" : "All Departments"}
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedDept === d.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.code} - {locale === "th" ? d.nameTh : d.nameEn}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={locale === "th" ? "ค้นหาชื่อหลักสูตร, วุฒิการศึกษา..." : "Search programs..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/50">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            {locale === "th" ? "ไม่พบหลักสูตรที่ตรงกับเงื่อนไข" : "No programs found"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {locale === "th" ? "โปรดลองเปลี่ยนคำค้นหาหรือระดับการศึกษา" : "Try adjusting your search criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            const badge = getDegreeLevelBadge(program.degreeLevel);
            return (
              <div
                key={program.id}
                className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                {/* Cover Image or Accent Header */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  {program.imageUrl ? (
                    <Image
                      src={program.imageUrl}
                      alt={program.nameTh}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary/20 via-primary/5 to-muted flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-primary/30" />
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs ${badge.bg}`}>
                      {locale === "th" ? badge.labelTh : badge.labelEn}
                    </span>

                    {program.departmentCode && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-background/90 backdrop-blur-xs text-foreground shadow-xs border border-border/40">
                        {program.departmentCode}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                      {program.code}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {locale === "th" ? program.nameTh : program.nameEn}
                    </h3>

                    <p className="text-xs text-primary font-semibold">
                      {locale === "th" ? program.degreeShortTh : program.degreeShortEn}
                    </p>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {locale === "th"
                        ? program.descriptionTh || program.philosophyTh
                        : program.descriptionEn || program.philosophyEn}
                    </p>
                  </div>

                  {/* Highlights / Meta Chips */}
                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{program.studyDuration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-mono">{program.totalCredits}</span>
                        <span>{locale === "th" ? "หน่วยกิต" : "Credits"}</span>
                      </div>
                    </div>

                    {program.tuitionFee && (
                      <div className="text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg">
                        <span className="font-medium text-foreground">{locale === "th" ? "ค่าธรรมเนียม: " : "Tuition: "}</span>
                        {program.tuitionFee}
                      </div>
                    )}

                    {/* Career paths snippet */}
                    {program.careerPaths.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {program.careerPaths.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
                          >
                            {c}
                          </span>
                        ))}
                        {program.careerPaths.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                            +{program.careerPaths.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href={`/programs/${program.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-2xs group/btn"
                    >
                      <span>{locale === "th" ? "ดูรายละเอียดหลักสูตร" : "View Curriculum"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
