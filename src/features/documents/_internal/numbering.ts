import type { Prisma } from "@/generated/prisma";
import type { DocType } from "./validations";

export function getCurrentDocYear(): number {
  return new Date().getFullYear() + 543;
}

export function formatDocumentNumber(docType: DocType, seq: number, year: number): string {
  const padded = String(seq).padStart(4, "0");
  switch (docType) {
    case "MEMO":
      return `อว 0604.01/ว ${padded}/${year}`;
    case "INCOMING":
      return `รับ ${padded}/${year}`;
    case "OUTGOING":
      return `อว 0604.01/${padded}/${year}`;
    case "COMMAND":
      return `คำสั่งคณะ ที่ ${seq}/${year}`;
    case "ANNOUNCEMENT":
      return `ประกาศคณะ ที่ ${seq}/${year}`;
    default:
      return `${padded}/${year}`;
  }
}

/**
 * ออกเลขทะเบียนสารบรรณแบบ Atomic Running Number ภายใน Transaction
 */
export async function getNextDocumentNumber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  docType: DocType,
  year: number = getCurrentDocYear()
): Promise<{ docNumber: string; sequenceNumber: number; docYear: number }> {
  const record = await tx.documentSequence.upsert({
    where: {
      tenantId_docType_year: {
        tenantId,
        docType,
        year,
      },
    },
    create: {
      tenantId,
      docType,
      year,
      lastNumber: 1,
    },
    update: {
      lastNumber: {
        increment: 1,
      },
    },
  });

  const sequenceNumber = record.lastNumber;
  const docNumber = formatDocumentNumber(docType, sequenceNumber, year);

  return {
    docNumber,
    sequenceNumber,
    docYear: year,
  };
}
