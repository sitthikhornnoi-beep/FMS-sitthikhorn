"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
  ExternalLink,
  X,
  User,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { StaffProfileDto, DepartmentDto } from "@/features/personnel";

interface PersonnelDirectoryProps {
  initialStaff: StaffProfileDto[];
  departments: DepartmentDto[];
}

export function PersonnelDirectory({ initialStaff, departments }: PersonnelDirectoryProps) {
  const locale = useLocale();
  const t = useT();

  const [activeTab, setActiveTab] = useState<"ALL" | "EXECUTIVE" | "ACADEMIC" | "SUPPORT">("ALL");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffProfileDto | null>(null);

  const filteredStaff = useMemo(() => {
    return initialStaff.filter((s) => {
      // Tab filter
      if (activeTab === "EXECUTIVE" && !s.isExecutive) return false;
      if (activeTab === "ACADEMIC" && s.staffType !== "ACADEMIC") return false;
      if (activeTab === "SUPPORT" && s.staffType !== "SUPPORT") return false;

      // Department filter
      if (selectedDeptId !== "ALL" && s.departmentId !== selectedDeptId) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName =
          s.fullNameTh.toLowerCase().includes(query) ||
          s.fullNameEn.toLowerCase().includes(query);
        const matchPos =
          (s.positionTh && s.positionTh.toLowerCase().includes(query)) ||
          (s.positionEn && s.positionEn.toLowerCase().includes(query));
        const matchRoom = s.roomNumber && s.roomNumber.toLowerCase().includes(query);
        const matchEmail = s.email && s.email.toLowerCase().includes(query);
        const matchResearch = s.researchInterests.some((r) => r.toLowerCase().includes(query));

        if (!matchName && !matchPos && !matchRoom && !matchEmail && !matchResearch) {
          return false;
        }
      }

      return true;
    });
  }, [initialStaff, activeTab, selectedDeptId, searchQuery]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{locale === "th" ? "คณาจารย์และบุคลากร" : "Faculty & Staff Directory"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("personnel.publicTitle")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          {t("personnel.publicSubtitle")}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => { setActiveTab("ALL"); setSelectedDeptId("ALL"); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            activeTab === "ALL"
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-card hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          {locale === "th" ? "ทั้งหมด" : "All"} ({initialStaff.length})
        </button>

        <button
          onClick={() => { setActiveTab("EXECUTIVE"); setSelectedDeptId("ALL"); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            activeTab === "EXECUTIVE"
              ? "bg-amber-600 text-white shadow-amber-600/20"
              : "bg-card hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          <Award className="w-4 h-4" />
          {t("personnel.tab.executive")}
        </button>

        <button
          onClick={() => setActiveTab("ACADEMIC")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            activeTab === "ACADEMIC"
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-card hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          {t("personnel.tab.academic")}
        </button>

        <button
          onClick={() => setActiveTab("SUPPORT")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            activeTab === "SUPPORT"
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-card hover:bg-muted text-muted-foreground border border-border"
          }`}
        >
          <User className="w-4 h-4" />
          {t("personnel.tab.support")}
        </button>
      </div>

      {/* Search and Department Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Department Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setSelectedDeptId("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedDeptId === "ALL"
                  ? "bg-muted font-bold text-foreground border border-border"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {t("personnel.allDepartments")}
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDeptId === dept.id
                    ? "bg-primary/10 text-primary font-bold border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {locale === "th" ? dept.nameTh : dept.nameEn}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("personnel.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-16 bg-card/50 rounded-2xl border border-dashed border-border text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">{t("personnel.noStaff")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className={`group bg-card rounded-2xl border transition-all hover:shadow-lg flex flex-col overflow-hidden ${
                staff.isExecutive
                  ? "border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-b from-amber-500/5 to-card"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* Card Header & Avatar */}
              <div className="p-5 flex flex-col items-center text-center flex-1">
                <div className="relative mb-4">
                  <div className={`w-28 h-28 rounded-2xl overflow-hidden border-2 shadow-md relative bg-muted flex items-center justify-center ${
                    staff.isExecutive ? "border-amber-500/50" : "border-border"
                  }`}>
                    {staff.avatarUrl ? (
                      <Image
                        src={staff.avatarUrl}
                        alt={locale === "th" ? staff.fullNameTh : staff.fullNameEn}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground/50" />
                    )}
                  </div>
                  {staff.isExecutive && (
                    <span className="absolute -bottom-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {t("personnel.field.staffType.EXECUTIVE")}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                  {locale === "th" ? staff.fullNameTh : staff.fullNameEn}
                </h3>
                {locale === "th" && staff.fullNameEn && (
                  <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                    {staff.fullNameEn}
                  </p>
                )}

                {/* Position & Department */}
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs font-medium text-primary">
                    {locale === "th" ? staff.positionTh : (staff.positionEn || staff.positionTh)}
                  </p>
                  {staff.department && (
                    <p className="text-[11px] text-muted-foreground">
                      {locale === "th" ? staff.department.nameTh : staff.department.nameEn}
                    </p>
                  )}
                </div>

                {/* Research Interests preview */}
                {staff.researchInterests.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1">
                    {staff.researchInterests.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact Information */}
                <div className="mt-4 pt-3 border-t border-border/60 w-full text-xs text-muted-foreground space-y-1 text-left">
                  {staff.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate hover:text-foreground">{staff.email}</span>
                    </div>
                  )}
                  {staff.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                  {staff.roomNumber && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{t("personnel.room")} {staff.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* View Profile Action */}
              <div className="p-3 bg-muted/40 border-t border-border/60 text-center">
                <button
                  onClick={() => setSelectedStaff(staff)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-background hover:bg-card border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>{t("personnel.viewProfile")}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between relative bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-border bg-muted flex items-center justify-center shadow-sm">
                  {selectedStaff.avatarUrl ? (
                    <Image
                      src={selectedStaff.avatarUrl}
                      alt={selectedStaff.fullNameTh}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground/50" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {locale === "th" ? selectedStaff.fullNameTh : selectedStaff.fullNameEn}
                  </h2>
                  <p className="text-sm font-medium text-primary">
                    {locale === "th" ? selectedStaff.positionTh : (selectedStaff.positionEn || selectedStaff.positionTh)}
                  </p>
                  {selectedStaff.department && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {locale === "th" ? selectedStaff.department.nameTh : selectedStaff.department.nameEn}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  {t("personnel.contact")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl border border-border/60">
                  {selectedStaff.email && (
                    <div>
                      <span className="text-xs text-muted-foreground">{t("personnel.email")}:</span>
                      <p className="font-medium text-foreground">{selectedStaff.email}</p>
                    </div>
                  )}
                  {selectedStaff.phone && (
                    <div>
                      <span className="text-xs text-muted-foreground">{t("personnel.phone")}:</span>
                      <p className="font-medium text-foreground">{selectedStaff.phone}</p>
                    </div>
                  )}
                  {selectedStaff.roomNumber && (
                    <div>
                      <span className="text-xs text-muted-foreground">{t("personnel.room")}:</span>
                      <p className="font-medium text-foreground">{selectedStaff.roomNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              {selectedStaff.education.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {t("personnel.education")}
                  </h4>
                  <ul className="space-y-1.5 bg-muted/30 p-3 rounded-xl border border-border/60">
                    {selectedStaff.education.map((edu, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Research Interests */}
              {selectedStaff.researchInterests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5" />
                    {t("personnel.research")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStaff.researchInterests.map((r, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary font-medium border border-primary/20"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications */}
              {selectedStaff.publications && selectedStaff.publications.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Award className="w-3.5 h-3.5" />
                    {t("personnel.publications")}
                  </h4>
                  <div className="space-y-2">
                    {selectedStaff.publications.map((pub) => (
                      <div
                        key={pub.id}
                        className="p-3 bg-muted/20 border border-border rounded-xl text-xs space-y-1"
                      >
                        <p className="font-semibold text-foreground text-sm">{pub.title}</p>
                        <p className="text-muted-foreground">
                          {pub.journalName && <span className="italic">{pub.journalName}, </span>}
                          <span>{pub.year}</span>
                          {pub.authors && <span> — {pub.authors}</span>}
                        </p>
                        {pub.doiUrl && (
                          <a
                            href={pub.doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] pt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            DOI / Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Links */}
              {(selectedStaff.scopusUrl || selectedStaff.scholarUrl || selectedStaff.websiteUrl) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {selectedStaff.scopusUrl && (
                    <a
                      href={selectedStaff.scopusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Scopus
                    </a>
                  )}
                  {selectedStaff.scholarUrl && (
                    <a
                      href={selectedStaff.scholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Google Scholar
                    </a>
                  )}
                  {selectedStaff.websiteUrl && (
                    <a
                      href={selectedStaff.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Personal Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-muted/40 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t("personnel.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
