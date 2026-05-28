export function exportToCSV(data, filename = "expenses.csv") {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers
        .map(field => `"${String(row[field] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
