/*************************************************
 * EXPENSES PAGE SCRIPT
 * Backend: http://localhost:5000
 * Data Source: MySQL via /api/expenses
 *************************************************/

const API_URL = "http://localhost:5000/api/expenses";

let allExpenses = [];
let filteredExpenses = [];

/* =========================
   Helpers
========================= */
function formatCurrency(val) {
  return `₹${Number(val).toFixed(2)}`;
}

function formatDate(val) {
  return new Date(val).toLocaleDateString();
}

/* =========================
   Fetch Expenses
========================= */
async function loadExpenses() {
  const res = await fetch(API_URL);
  const data = await res.json();

  allExpenses = data;
  filteredExpenses = [...allExpenses];

  populateCategoryFilter();
  applyFilters();
}

/* =========================
   Populate Category Filter
========================= */
function populateCategoryFilter() {
  const select = document.getElementById("category-filter");
  if (!select) return;

  const categories = [...new Set(allExpenses.map(e => e.category).filter(Boolean))];

  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

/* =========================
   Apply Filters
========================= */
function applyFilters() {
  const dateFilter = document.getElementById("date-filter").value;
  const category = document.getElementById("category-filter").value;
  const minAmount = Number(document.getElementById("min-amount").value) || 0;
  const maxAmount = Number(document.getElementById("max-amount").value) || Infinity;
  const search = document.getElementById("search-expenses").value.toLowerCase();
  const sortField = document.getElementById("sort-field").value;
  const sortOrder = document.getElementById("sort-order").value;

  const now = new Date();

  filteredExpenses = allExpenses.filter(e => {
    const expenseDate = new Date(e.date);

    let dateMatch = true;
    if (dateFilter === "today") {
      dateMatch = expenseDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      dateMatch = expenseDate >= weekAgo;
    } else if (dateFilter === "month") {
      dateMatch =
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === "year") {
      dateMatch = expenseDate.getFullYear() === now.getFullYear();
    }

    const categoryMatch = category === "all" || e.category === category;
    const amountMatch = e.amount >= minAmount && e.amount <= maxAmount;
    const searchMatch =
      e.title.toLowerCase().includes(search) ||
      (e.category || "").toLowerCase().includes(search) ||
      (e.source || "").toLowerCase().includes(search);

    return dateMatch && categoryMatch && amountMatch && searchMatch;
  });

  filteredExpenses.sort((a, b) => {
    const valA = sortField === "amount" ? a.amount : new Date(a.date);
    const valB = sortField === "amount" ? b.amount : new Date(b.date);
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  renderTable();
  updateSummary();
}

/* =========================
   Render Table
========================= */
function renderTable() {
  const tbody = document.getElementById("expenses-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  filteredExpenses.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="py-3 px-4 text-sm">${formatDate(e.date)}</td>
      <td class="py-3 px-4 text-sm">${e.title}</td>
      <td class="py-3 px-4 text-sm">${e.category || "-"}</td>
      <td class="py-3 px-4 text-sm">${e.source || "-"}</td>
      <td class="py-3 px-4 text-sm font-semibold text-right">
        ${formatCurrency(e.amount)}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* =========================
   Summary Cards
========================= */
function updateSummary() {
  const total = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const count = filteredExpenses.length;
  const avg = count ? total / count : 0;
  const highest = count ? Math.max(...filteredExpenses.map(e => e.amount)) : 0;

  document.getElementById("filtered-total").textContent = formatCurrency(total);
  document.getElementById("filtered-count").textContent = count;
  document.getElementById("filtered-average").textContent = formatCurrency(avg);
  document.getElementById("filtered-highest").textContent = formatCurrency(highest);
}

/* =========================
   Event Listeners
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadExpenses();

  [
    "date-filter",
    "category-filter",
    "min-amount",
    "max-amount",
    "search-expenses",
    "sort-field",
    "sort-order"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", applyFilters);
  });
});
