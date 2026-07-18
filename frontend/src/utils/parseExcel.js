import * as XLSX from "xlsx";
import { autoCategorize } from "./autoCategorize";

/* ==========================================
   Smart column detection for bank statements
   ========================================== */
function detectColumns(headers) {
  const h = headers.map((h) => (h || "").toString().toLowerCase().trim());

  const dateCol = h.findIndex((c) =>
    /date|time|txn date|transaction date|value date/.test(c)
  );
  const titleCol = h.findIndex((c) =>
    /description|narration|merchant|details|particulars|remarks|title|name/.test(c)
  );
  // Prefer "debit" column for expenses, else fall back to "amount"
  const amountCol = h.findIndex((c) =>
    /debit|withdrawal|amount/.test(c)
  );

  return {
    dateIdx: dateCol >= 0 ? dateCol : 0,
    titleIdx: titleCol >= 0 ? titleCol : 1,
    amountIdx: amountCol >= 0 ? amountCol : 2,
  };
}

/* ==========================================
   Parse Excel date (serial number or string)
   ========================================== */
function parseExcelDate(val) {
  if (!val) return "";
  // Already a JS Date
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  // Numeric serial (Excel date)
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const mm = String(d.m).padStart(2, "0");
      const dd = String(d.d).padStart(2, "0");
      return `${d.y}-${mm}-${dd}`;
    }
  }
  // String date — try to normalize
  const str = val.toString().trim();
  // dd-mm-yyyy or dd/mm/yyyy
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Try native Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed)) return parsed.toISOString().split("T")[0];
  return str;
}

/* ==========================================
   Main parser: Excel → preview rows + CSV File blob
   ========================================== */
export function parseExcelFile(file, previewLimit = 5) {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file selected");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: false });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: true,
        });

        if (rows.length < 2) return reject("Excel sheet has no data rows");

        const headers = rows[0].map((h) => String(h || "").trim());
        const { dateIdx, titleIdx, amountIdx } = detectColumns(headers);

        // Build normalized rows
        const normalized = rows
          .slice(1)
          .map((row, idx) => {
            const rawAmount = parseFloat(
              String(row[amountIdx] || "0").replace(/[^0-9.\-]/g, "")
            );
            if (isNaN(rawAmount) || rawAmount <= 0) return null; // skip credits / zero

            const title = String(row[titleIdx] || "Imported Expense").trim() || "Imported Expense";
            const date = parseExcelDate(row[dateIdx]);
            const category = autoCategorize(title);

            return { id: idx, title, category, amount: rawAmount, date };
          })
          .filter(Boolean);

        if (normalized.length === 0) return reject("No valid expense rows found in Excel");

        // Build CSV string for backend upload (reuse /import/csv endpoint)
        const csvLines = [
          "title,category,amount,date",
          ...normalized.map(
            (r) =>
              `"${r.title.replace(/"/g, '""')}","${r.category}",${r.amount},${r.date}`
          ),
        ];
        const csvBlob = new Blob([csvLines.join("\n")], { type: "text/csv" });
        const csvFile = new File([csvBlob], "excel_import.csv", {
          type: "text/csv",
        });

        resolve({
          preview: normalized.slice(0, previewLimit),
          total: normalized.length,
          csvFile, // send this to importCSV()
        });
      } catch (err) {
        reject("Failed to parse Excel: " + err.message);
      }
    };

    reader.onerror = () => reject("File read error");
    reader.readAsArrayBuffer(file);
  });
}
