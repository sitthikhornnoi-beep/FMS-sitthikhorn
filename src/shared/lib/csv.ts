/**
 * ยูทิลิตี้สำหรับสร้างและอ่านไฟล์ CSV (Comma-Separated Values)
 * รองรับภาษาไทย 100% ด้วย UTF-8 BOM สำหรับ Microsoft Excel
 */

export interface CsvColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
}

/**
 * แปลงค่าให้อยู่ในรูปแบบที่ปลอดภัยสำหรับ CSV:
 * - ห่อด้วยเครื่องหมายคำพูดคู่ (") หากมีเครื่องหมายจุลภาค (,), เครื่องหมายคำพูดคู่ ("), หรือการขึ้นบรรทัดใหม่
 * - ทำการ Escape เครื่องหมายคำพูดคู่ภายในด้วยการเบิ้ล ("")
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * สร้างข้อความ CSV จาก Array of Objects
 * โดยใส่ Byte Order Mark (\uFEFF) นำหน้า เพื่อให้โปรแกรม Microsoft Excel
 * เปิดอ่านไฟล์ที่มีตัวอักษรภาษาไทยได้ถูกต้องโดยไม่เป็นภาษาต่างดาว (Mojibake)
 */
export function generateCsv<T extends Record<string, unknown>>(
  columns: CsvColumn<T>[],
  data: T[]
): string {
  const headerLine = columns.map((col) => escapeCsvCell(col.label)).join(",");
  const dataLines = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key as keyof T];
        return escapeCsvCell(val);
      })
      .join(",")
  );

  // UTF-8 BOM (\uFEFF) + Content
  return `\uFEFF${[headerLine, ...dataLines].join("\r\n")}`;
}

/**
 * แยกและประมวลผลข้อความ CSV ให้กลายเป็น Headers และ Rows (Array of Objects)
 * รองรับเครื่องหมายคำพูดคู่ การขึ้นบรรทัดใหม่ในเซลล์ และการตัด UTF-8 BOM
 */
export function parseCsv(csvText: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  // ลบ UTF-8 BOM ถ้ามี
  let text = csvText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  // Tokenize CSV character by character
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i++; // ข้ามตัวถัดไป
        } else {
          // สิ้นสุดการอยู่ใน quote
          insideQuote = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++; // ข้าม \n
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  // แถวสุดท้าย
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0];
  const headers = rawHeaders.map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    const rowObj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      rowObj[header] = (line[c] ?? "").trim();
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}
