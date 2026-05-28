import { autoCategorize } from "./autoCategorize";

export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file selected");

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").filter(Boolean);

      const headers = rows[0].split(",").map(h => h.trim());

      const data = rows.slice(1).map((row, index) => {
        const values = row.split(",").map(v => v.trim());

        const record = {};
        headers.forEach((h, i) => {
          record[h] = values[i];
        });

        return {
  id: `import-${Date.now()}-${index}`,
  title: record.title || "Imported Expense",
  category:
    record.category ||
    autoCategorize(record.title),
  amount: Number(record.amount || 0),
  date: record.date || new Date().toISOString(),
};

      });

      resolve(data);
    };

    reader.onerror = () => reject("Failed to read file");
    reader.readAsText(file);
  });
}
