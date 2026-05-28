const xlsx = require("xlsx");
const db = require("../db");

// Convert DD/MM/YYYY → YYYY-MM-DD
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m}-${d}`;
}

// Clean amount
function parseAmount(val) {
  const num = Number(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? null : num;
}

const importDataset = () => {
  const workbook = xlsx.readFile("data/paytm_statement.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  rows.forEach(row => {
    const amount = parseAmount(row.Amount);

    // Only expenses (negative values)
    if (!amount || amount >= 0) return;

    const sql = `
      INSERT INTO expenses (title, amount, category, date, source)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        row["Transaction Details"] || "UPI Payment",
        Math.abs(amount),
        row.Tags ? row.Tags.replace("#", "").trim() : "Uncategorized",
        parseDate(row.Date),
        "paytm_dataset"
      ],
      err => {
        if (err) console.error("Insert error:", err.message);
      }
    );
  });

  console.log("✅ Dataset imported into MySQL");
};

module.exports = importDataset;
