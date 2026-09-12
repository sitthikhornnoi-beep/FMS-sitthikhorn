export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
export { messages as curriculumMessages } from "./messages";
export type {
  ProgramDto,
  DepartmentWithProgramsDto,
  DepartmentProgramSummaryDto,
} from "./_internal/services";
export type {
  CreateProgramInput,
  UpdateProgramInput,
  UpdateProgramStructureInput,
  CreateCurriculumDeptInput,
  UpdateCurriculumDeptInput,
  DepartmentType,
  DegreeLevelType,
  PloInput,
  CourseItemInput,
  SemesterPlanInput,
  CourseGroupInput,
} from "./_internal/validations";
export {
  exportProgramToJson,
  parseProgramJson,
  type ProgramJson,
  type ProgramExportData,
  type ParseProgramJsonResult,
} from "./_internal/json-helpers";
