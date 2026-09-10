import "server-only";

export {
  listDocuments,
  getDocumentById,
  getDocumentStats,
  trackDocumentByNumber,
  type DocumentDto,
  type DocumentDetailDto,
  type DocumentRoutingDto,
  type DocumentStatsDto,
} from "./_internal/services";

export { DOCUMENTS_P, DOCUMENTS_PERMISSIONS } from "./permissions";
