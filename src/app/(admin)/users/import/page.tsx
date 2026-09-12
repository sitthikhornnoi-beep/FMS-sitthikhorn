import { requirePermission, P } from "@/features/identity/server";
import { listRolesForPickerAction } from "@/features/identity/actions";
import { UsersImportClient } from "./_components/users-import-client";

export const metadata = {
  title: "นำเข้าผู้ใช้งานจากไฟล์ CSV | FMS",
};

export default async function UsersImportPage() {
  await requirePermission(P.usersManage);
  const rolesRes = await listRolesForPickerAction();
  const roles = rolesRes.ok ? rolesRes.data : [];

  return <UsersImportClient roles={roles} />;
}
