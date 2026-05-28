import { autoCategorize } from "./autoCategorize";

export function parseCSVPreview(file, previewLimit = 5) {
  return new Promise((resolve, reject) => {
    if (!file) reject("No file selected");

    const reader = new FileReader();

    reader.onload = (e) => {
      const rows = e.target.result.split("\n").filter(Boolean);
      if (rows.length < 2) reject("Invalid CSV");

      const headers = rows[0].split(",").map(h => h.trim());

      const preview = rows.slice(1, previewLimit + 1).map((row, index) => {
        const values = row.split(",").map(v => v.trim());
        const record = {};

        headers.forEach((h, i) => {
          record[h] = values[i];
        });

        return {
          id: index,
          title: record.title || "Imported Expense",
          category:
            record.category ||
            autoCategorize(record.title || ""),
          amount: Number(record.amount || 0),
          date: record.date || "",
        };
      });

      resolve(preview);
    };

    reader.onerror = () => reject("File read error");
    reader.readAsText(file);
  });
}
