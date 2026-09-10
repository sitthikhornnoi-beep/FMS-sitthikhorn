import { listStaffProfiles, listDepartments } from "@/features/personnel/server";
import { PersonnelDirectory } from "./personnel-directory";

export const revalidate = 60;

export default async function PersonnelPublicPage() {
  const [staff, departments] = await Promise.all([
    listStaffProfiles(undefined, { activeOnly: true }),
    listDepartments(undefined, true),
  ]);

  return <PersonnelDirectory initialStaff={staff} departments={departments} />;
}
