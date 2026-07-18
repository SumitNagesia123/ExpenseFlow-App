import { autoCategorize } from "./autoCategorize";

/* ==========================================
   Smart column detection (same as Excel parser)
   ========================================== */
function detectColumns(headers) {
  const h = headers.map((h) => (h || "").toLowerCase().trim());

  const dateIdx = h.findIndex((c) =>
    /date|time|txn date|transaction date|value date/.test(c)
  );
  const titleIdx = h.findIndex((c) =>
    /description|narration|merchant|details|particulars|remarks|title|name|transaction/.test(c)
  );
  // Prefer "debit" for expenses, else fall back to "amount"
  const amountIdx = h.findIndex((c) =>
    /debit|withdrawal|dr amount/.test(c)
  ) !== -1
    ? h.findIndex((c) => /debit|withdrawal|dr amount/.test(c))
    : h.findIndex((c) => /amount|credit/.test(c));

  return {
    dateIdx: dateIdx >= 0 ? dateIdx : 0,
    titleIdx: titleIdx >= 0 ? titleIdx : 1,
    amountIdx: amountIdx >= 0 ? amountIdx : 2,
  };
}

/* ==========================================
   Parse a CSV row handling quoted fields
   ========================================== */
function parseCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/* ==========================================
   Main export: CSV → preview rows
   ========================================== */
export function parseCSVPreview(file, previewLimit = 5) {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file selected");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const rows = e.target.result
          .split("\n")
          .map((r) => r.replace(/\r/g, ""))
          .filter((r) => r.trim().length > 0);

        if (rows.length < 2) return reject("CSV has no data rows");

        const headers = parseCSVRow(rows[0]);
        const { dateIdx, titleIdx, amountIdx } = detectColumns(headers);

        const preview = rows
          .slice(1)
          .map((row, idx) => {
            const values = parseCSVRow(row);
            if (!values.some((v) => v)) return null; // skip blank rows

            const rawAmount = parseFloat(
              (values[amountIdx] || "0").replace(/[^0-9.\-]/g, "")
            );
            if (isNaN(rawAmount) || rawAmount <= 0) return null; // skip zero / credits

            const title =
              values[titleIdx]?.replace(/^"|"$/g, "").trim() ||
              "Imported Expense";
            const category = autoCategorize(title);

            // Normalize date from dd-mm-yyyy / dd/mm/yyyy
            let date = (values[dateIdx] || "").trim().replace(/^"|"$/g, "");
            const dmy = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
            if (dmy) {
              const [, d, m, y] = dmy;
              const year = y.length === 2 ? `20${y}` : y;
              date = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            } else {
              const parsed = new Date(date);
              if (!isNaN(parsed)) date = parsed.toISOString().split("T")[0];
            }

            return { id: idx, title, category, amount: rawAmount, date };
          })
          .filter(Boolean);

        if (preview.length === 0)
          return reject(
            "No valid expense rows found. Make sure the CSV has Date, Description and Amount/Debit columns."
          );

        resolve(preview.slice(0, previewLimit));
      } catch (err) {
        reject("Failed to parse CSV: " + err.message);
      }
    };

    reader.onerror = () => reject("File read error");
    reader.readAsText(file);
  });
}
