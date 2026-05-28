export function filterExpensesByMonth(expenses, month, year) {
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

export function filterExpensesByCategory(expenses, category) {
  return expenses.filter((e) => e.category === category);
}
