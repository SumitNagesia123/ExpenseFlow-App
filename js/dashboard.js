/*************************************************
 * FINAL DASHBOARD SCRIPT
 * Backend: http://localhost:5000
 * Budget: ₹6000 (fixed)
 *************************************************/

const API_BASE = "http://localhost:5000/api/dashboard";
const MONTHLY_BUDGET = 6000;

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
   Dashboard Summary
========================= */
async function loadDashboardSummary() {
  const res = await fetch(`${API_BASE}/summary`);
  const data = await res.json();

  const totalSpent = Number(data.totalSpent || 0);
  const remaining = MONTHLY_BUDGET - totalSpent;
  const percentUsed = Math.min((totalSpent / MONTHLY_BUDGET) * 100, 100);

  document.getElementById("total-spent").textContent = formatCurrency(totalSpent);
  document.getElementById("total-budget").textContent = formatCurrency(MONTHLY_BUDGET);
  document.getElementById("remaining-budget").textContent = formatCurrency(remaining);

  const progressBar = document
    .querySelector("#total-budget")
    ?.parentElement.querySelector(".bg-green-600");

  if (progressBar) {
    progressBar.style.width = `${percentUsed}%`;
  }
}

/* =========================
   Category Chart
========================= */
let categoryChart;

async function loadCategoryChart() {
  const res = await fetch(`${API_BASE}/category-breakdown`);
  const data = await res.json();

  const labels = data.map(d => d.category);
  const values = data.map(d => Number(d.total));

  const ctx = document.getElementById("category-chart");
  if (!ctx) return;

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#6366F1", "#22C55E", "#A855F7", "#F59E0B",
          "#EC4899", "#14B8A6", "#EF4444", "#64748B"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}

/* =========================
   Recent Transactions
========================= */
async function loadRecentTransactions() {
  const tbody = document.getElementById("recent-transactions");
  if (!tbody) return;

  const res = await fetch(`${API_BASE}/recent-transactions`);
  const data = await res.json();

  tbody.innerHTML = "";

  data.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="py-3 px-4 text-sm text-gray-600">${formatDate(tx.date)}</td>
      <td class="py-3 px-4 text-sm text-gray-900">${tx.title}</td>
      <td class="py-3 px-4 text-sm text-gray-600">${tx.category}</td>
      <td class="py-3 px-4 text-sm text-gray-600">—</td>
      <td class="py-3 px-4 text-sm font-semibold text-right text-gray-900">
        ${formatCurrency(tx.amount)}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* =========================
   Init
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardSummary();
  loadCategoryChart();
  loadRecentTransactions();
});
