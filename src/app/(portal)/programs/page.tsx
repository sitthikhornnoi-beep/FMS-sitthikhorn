import { listPrograms } from "@/features/curriculum/server";
import { listDepartments } from "@/features/personnel/server";
import { ProgramsDirectory } from "./programs-directory";

export const revalidate = 60;

export default async function ProgramsPublicPage() {
  const [programs, departments] = await Promise.all([
    listPrograms(undefined, { isActive: true }),
    listDepartments(undefined, true),
  ]);

  return <ProgramsDirectory initialPrograms={programs} departments={departments} />;
}
