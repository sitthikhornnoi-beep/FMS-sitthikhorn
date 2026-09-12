import React from "react";
import { getPortalTenantSettings } from "@/features/identity/server";
import { PortalClientLayout } from "./_components/portal-client-layout";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getPortalTenantSettings();

  return (
    <PortalClientLayout tenant={tenant}>
      {children}
    </PortalClientLayout>
  );
}
