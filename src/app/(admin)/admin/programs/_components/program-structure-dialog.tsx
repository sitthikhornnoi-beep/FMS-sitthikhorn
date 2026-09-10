"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Award, Briefcase, BookOpen, Layers } from "lucide-react";
import type { ProgramDto, PloInput, CourseGroupInput, SemesterPlanInput } from "@/features/curriculum";
import { updateProgramStructureAction } from "@/features/curriculum/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramDto | null;
  onSaved: (program: ProgramDto) => void;
}

interface InnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramDto;
  onSaved: (program: ProgramDto) => void;
}

export function ProgramStructureDialog({ open, onOpenChange, program, onSaved }: Props) {
  if (!open || !program) return null;
  return (
    <ProgramStructureDialogInner
      key={program.id}
      open={open}
      onOpenChange={onOpenChange}
      program={program}
      onSaved={onSaved}
    />
  );
}

function ProgramStructureDialogInner({ open, onOpenChange, program, onSaved }: InnerProps) {
  const [activeTab, setActiveTab] = useState<"structure" | "plos" | "plan" | "careers">("structure");
  const [loading, setLoading] = useState(false);

  // 1. Structure Groups
  const [courseStructure, setCourseStructure] = useState<CourseGroupInput[]>(() =>
    program.courseStructure ? [...program.courseStructure] : []
  );

  // 2. PLOs
  const [plos, setPlos] = useState<PloInput[]>(() =>
    program.plos ? [...program.plos] : []
  );

  // 3. Career Paths
  const [careerPaths, setCareerPaths] = useState<string[]>(() =>
    program.careerPaths ? [...program.careerPaths] : []
  );
  const [newCareer, setNewCareer] = useState("");

  // 4. Study Plan
  const [studyPlan, setStudyPlan] = useState<SemesterPlanInput[]>(() =>
    program.studyPlan ? [...program.studyPlan] : []
  );

  // --- Handlers for Structure ---
  const addCourseGroup = () => {
    setCourseStructure((prev) => [
      ...prev,
      { groupName: "กลุ่มวิชาใหม่", credits: 30, description: "" },
    ]);
  };

  const removeCourseGroup = (idx: number) => {
    setCourseStructure((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- Handlers for PLOs ---
  const addPlo = () => {
    setPlos((prev) => [
      ...prev,
      {
        code: `PLO${prev.length + 1}`,
        titleTh: "ผลลัพธ์การเรียนรู้ใหม่",
        titleEn: "",
        description: "",
      },
    ]);
  };

  const removePlo = (idx: number) => {
    setPlos((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- Handlers for Careers ---
  const addCareer = () => {
    if (!newCareer.trim()) return;
    setCareerPaths((prev) => [...prev, newCareer.trim()]);
    setNewCareer("");
  };

  const removeCareer = (idx: number) => {
    setCareerPaths((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- Handlers for Study Plan ---
  const addSemesterPlan = () => {
    setStudyPlan((prev) => [
      ...prev,
      {
        year: prev.length > 0 ? prev[prev.length - 1].year : 1,
        semester: prev.length > 0 && prev[prev.length - 1].semester === 1 ? 2 : 1,
        courses: [],
      },
    ]);
  };

  const removeSemesterPlan = (idx: number) => {
    setStudyPlan((prev) => prev.filter((_, i) => i !== idx));
  };

  const addCourseToSemester = (semIdx: number) => {
    setStudyPlan((prev) => {
      const updated = [...prev];
      updated[semIdx] = {
        ...updated[semIdx],
        courses: [
          ...updated[semIdx].courses,
          { code: "CSxxx", nameTh: "วิชาตัวอย่าง", nameEn: "", credits: 3, type: "วิชาบังคับ" },
        ],
      };
      return updated;
    });
  };

  const removeCourseFromSemester = (semIdx: number, courseIdx: number) => {
    setStudyPlan((prev) => {
      const updated = [...prev];
      updated[semIdx] = {
        ...updated[semIdx],
        courses: updated[semIdx].courses.filter((_, i) => i !== courseIdx),
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateProgramStructureAction({
        id: program.id,
        courseStructure,
        plos,
        careerPaths,
        studyPlan,
      });

      if (res.ok) {
        toast.success("บันทึกโครงสร้างหลักสูตรสำเร็จ");
        onSaved(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <div className="w-full max-w-4xl">
        <LiyonDialogHeader
          title={`จัดการโครงสร้างและแผนการเรียน: ${program.code} - ${program.degreeShortTh}`}
          description="กำหนดกลุ่มวิชา, ผลลัพธ์การเรียนรู้ (PLOs), แผนการศึกษา และสายงานอาชีพ"
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-6 pt-2 bg-muted/20 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === "structure"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>โครงสร้างหน่วยกิต ({courseStructure.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plos")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === "plos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>ผลลัพธ์การเรียนรู้ PLOs ({plos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plan")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === "plan"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>แผนการศึกษา ({studyPlan.length} เทอม)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("careers")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === "careers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>อาชีพที่สามารถประกอบได้ ({careerPaths.length})</span>
          </button>
        </div>

        <LiyonDialogBody className="max-h-[62vh] overflow-y-auto space-y-4 py-4 pr-2">
          {/* TAB 1: Course Structure */}
          {activeTab === "structure" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  กำหนดกลุ่มวิชาและจำนวนหน่วยกิต เช่น หมวดศึกษาทั่วไป, หมวดวิชาแกน, หมวดวิชาเลือก
                </span>
                <Button type="button" size="sm" variant="outline" onClick={addCourseGroup} className="h-7 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  เพิ่มกลุ่มวิชา
                </Button>
              </div>

              {courseStructure.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  ยังไม่มีกลุ่มวิชา คลิก &quot;เพิ่มกลุ่มวิชา&quot; เพื่อเริ่มต้น
                </div>
              ) : (
                <div className="space-y-2">
                  {courseStructure.map((group, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-card border border-border rounded-xl">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="ชื่อกลุ่มวิชา เช่น หมวดวิชาศึกษาทั่วไป"
                            value={group.groupName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCourseStructure((prev) => {
                                const arr = [...prev];
                                arr[idx] = { ...arr[idx], groupName: val };
                                return arr;
                              });
                            }}
                            className="flex-1 px-2.5 py-1 text-xs bg-background border border-border rounded-lg"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={300}
                              placeholder="หน่วยกิต"
                              value={group.credits}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setCourseStructure((prev) => {
                                  const arr = [...prev];
                                  arr[idx] = { ...arr[idx], credits: val };
                                  return arr;
                                });
                              }}
                              className="w-20 px-2 py-1 text-xs bg-background border border-border rounded-lg font-mono text-center"
                            />
                            <span className="text-xs text-muted-foreground">นก.</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="คำอธิบายกลุ่มวิชา (ไม่บังคับ)"
                          value={group.description || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCourseStructure((prev) => {
                              const arr = [...prev];
                              arr[idx] = { ...arr[idx], description: val };
                              return arr;
                            });
                          }}
                          className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-lg text-muted-foreground"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourseGroup(idx)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLOs */}
          {activeTab === "plos" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (Program Learning Outcomes)
                </span>
                <Button type="button" size="sm" variant="outline" onClick={addPlo} className="h-7 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  เพิ่ม PLO
                </Button>
              </div>

              {plos.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  ยังไม่มีข้อมูล PLO คลิก &quot;เพิ่ม PLO&quot; เพื่อเริ่มต้น
                </div>
              ) : (
                <div className="space-y-2">
                  {plos.map((plo, idx) => (
                    <div key={idx} className="p-3 bg-card border border-border rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="PLO1"
                          value={plo.code}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPlos((prev) => {
                              const arr = [...prev];
                              arr[idx] = { ...arr[idx], code: val };
                              return arr;
                            });
                          }}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold bg-background border border-border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlo(idx)}
                          className="text-destructive hover:bg-destructive/10 h-7 w-7"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <input
                        type="text"
                        placeholder="คำอธิบายผลลัพธ์การเรียนรู้ (ภาษาไทย) *"
                        value={plo.titleTh}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlos((prev) => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], titleTh: val };
                            return arr;
                          });
                        }}
                        className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Learning Outcome Description (English)"
                        value={plo.titleEn || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlos((prev) => {
                            const arr = [...prev];
                            arr[idx] = { ...arr[idx], titleEn: val };
                            return arr;
                          });
                        }}
                        className="w-full px-2.5 py-1 text-xs bg-background border border-border rounded-lg text-muted-foreground"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Study Plan */}
          {activeTab === "plan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  แผนการศึกษาตามชั้นปีและภาคเรียน (Semester-by-Semester Study Plan)
                </span>
                <Button type="button" size="sm" variant="outline" onClick={addSemesterPlan} className="h-7 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  เพิ่มภาคการศึกษา
                </Button>
              </div>

              {studyPlan.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  ยังไม่มีแผนการเรียน คลิก &quot;เพิ่มภาคการศึกษา&quot; เพื่อเริ่มต้น
                </div>
              ) : (
                <div className="space-y-4">
                  {studyPlan.map((sem, semIdx) => (
                    <div key={semIdx} className="p-3 bg-card border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-foreground">
                            ชั้นปีที่:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={8}
                            value={sem.year}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              setStudyPlan((prev) => {
                                const arr = [...prev];
                                arr[semIdx] = { ...arr[semIdx], year: val };
                                return arr;
                              });
                            }}
                            className="w-14 px-2 py-0.5 text-xs text-center font-bold bg-background border border-border rounded"
                          />
                          <span className="text-xs font-bold text-foreground ml-2">
                            ภาคการศึกษาที่:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={3}
                            value={sem.semester}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1;
                              setStudyPlan((prev) => {
                                const arr = [...prev];
                                arr[semIdx] = { ...arr[semIdx], semester: val };
                                return arr;
                              });
                            }}
                            className="w-14 px-2 py-0.5 text-xs text-center font-bold bg-background border border-border rounded"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => addCourseToSemester(semIdx)}
                            className="h-6 text-[11px] px-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            เพิ่มวิชา
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSemesterPlan(semIdx)}
                            className="text-destructive hover:bg-destructive/10 h-6 w-6"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Course items */}
                      <div className="space-y-1.5">
                        {sem.courses.length === 0 ? (
                          <div className="text-[11px] text-muted-foreground italic py-1">
                            ยังไม่มีรายวิชาในภาคการศึกษานี้
                          </div>
                        ) : (
                          sem.courses.map((c, cIdx) => (
                            <div key={cIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="รหัสวิชา"
                                value={c.code}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudyPlan((prev) => {
                                    const arr = [...prev];
                                    const courses = [...arr[semIdx].courses];
                                    courses[cIdx] = { ...courses[cIdx], code: val };
                                    arr[semIdx] = { ...arr[semIdx], courses };
                                    return arr;
                                  });
                                }}
                                className="w-24 px-2 py-0.5 text-xs font-mono font-semibold bg-background border border-border rounded"
                              />
                              <input
                                type="text"
                                placeholder="ชื่อวิชา (ไทย)"
                                value={c.nameTh}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudyPlan((prev) => {
                                    const arr = [...prev];
                                    const courses = [...arr[semIdx].courses];
                                    courses[cIdx] = { ...courses[cIdx], nameTh: val };
                                    arr[semIdx] = { ...arr[semIdx], courses };
                                    return arr;
                                  });
                                }}
                                className="flex-1 px-2 py-0.5 text-xs bg-background border border-border rounded"
                              />
                              <input
                                type="number"
                                min={1}
                                max={10}
                                placeholder="นก."
                                value={c.credits}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 3;
                                  setStudyPlan((prev) => {
                                    const arr = [...prev];
                                    const courses = [...arr[semIdx].courses];
                                    courses[cIdx] = { ...courses[cIdx], credits: val };
                                    arr[semIdx] = { ...arr[semIdx], courses };
                                    return arr;
                                  });
                                }}
                                className="w-14 px-1.5 py-0.5 text-xs text-center font-mono bg-background border border-border rounded"
                              />
                              <input
                                type="text"
                                placeholder="หมวด/ประเภท"
                                value={c.type || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudyPlan((prev) => {
                                    const arr = [...prev];
                                    const courses = [...arr[semIdx].courses];
                                    courses[cIdx] = { ...courses[cIdx], type: val };
                                    arr[semIdx] = { ...arr[semIdx], courses };
                                    return arr;
                                  });
                                }}
                                className="w-24 px-2 py-0.5 text-xs text-muted-foreground bg-background border border-border rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeCourseFromSemester(semIdx, cIdx)}
                                className="text-destructive hover:opacity-75 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Career Paths */}
          {activeTab === "careers" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground font-medium">
                อาชีพหรือสายงานที่บัณฑิตสามารถประกอบได้หลังสำเร็จการศึกษา
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="เช่น Software Engineer, AI Research Scientist, Data Analyst..."
                  value={newCareer}
                  onChange={(e) => setNewCareer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCareer();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
                />
                <Button type="button" size="sm" onClick={addCareer}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  เพิ่มอาชีพ
                </Button>
              </div>

              {careerPaths.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  ยังไม่มีสายงานอาชีพ พิมพ์ชื่ออาชีพด้านบนแล้วกด &quot;เพิ่มอาชีพ&quot;
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {careerPaths.map((career, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg font-medium"
                    >
                      <Briefcase className="w-3 h-3" />
                      <span>{career}</span>
                      <button
                        type="button"
                        onClick={() => removeCareer(idx)}
                        className="text-primary hover:text-destructive transition-colors ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูลโครงสร้าง"}
          </Button>
        </LiyonDialogFooter>
      </div>
    </LiyonDialog>
  );
}
