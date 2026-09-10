import { listDocuments } from "@/features/documents/server";
import { PortalDocumentsClient } from "./portal-documents-client";

export const revalidate = 60;

export default async function PublicDocumentsPage() {
  const publicDocuments = await listDocuments(undefined, { isPublic: true });

  return <PortalDocumentsClient initialDocuments={publicDocuments} />;
}
