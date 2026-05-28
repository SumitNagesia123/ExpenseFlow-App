// Analytics page logic

function loadAnalytics() {
    loadSidebar();
    loadTrendsChart();
    loadDistributionChart();
    loadComparisonTable();
}

function loadTrendsChart() {
    const ctx = document.getElementById('trends-chart');
    if (!ctx) return;
    
    if (window.trendsChartInstance) {
        window.trendsChartInstance.destroy();
    }
    
    const labels = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const data = [2856, 3120, 2945, 3350, 2985, 3251];
    
    window.trendsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Spending',
                data: data,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function loadDistributionChart() {
    const ctx = document.getElementById('distribution-chart');
    if (!ctx) return;
    
    if (window.distributionChartInstance) {
        window.distributionChartInstance.destroy();
    }
    
    const breakdown = dataManager.getCategoryBreakdown();
    const labels = breakdown.map(item => item.category.name);
    const data = breakdown.map(item => item.total);
    const colors = breakdown.map(item => item.category.color);
    
    window.distributionChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function loadComparisonTable() {
    const tbody = document.getElementById('comparison-table');
    if (!tbody) return;
    
    const comparison = [
        { category: '🍔 Food & Dining', thisMonth: 645, lastMonth: 516, change: 25 },
        { category: '🏠 Bills & Utilities', thisMonth: 780, lastMonth: 780, change: 0 },
        { category: '🎬 Entertainment', thisMonth: 520, lastMonth: 385, change: 35 },
        { category: '🚗 Transportation', thisMonth: 285, lastMonth: 320, change: -11 },
        { category: '🛍️ Shopping', thisMonth: 420, lastMonth: 385, change: 9 }
    ];
    
    tbody.innerHTML = comparison.map(item => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-4 text-sm text-gray-900">${item.category}</td>
            <td class="py-3 px-4 text-sm font-semibold text-gray-900 text-right">${formatCurrency(item.thisMonth)}</td>
            <td class="py-3 px-4 text-sm text-gray-600 text-right">${formatCurrency(item.lastMonth)}</td>
            <td class="py-3 px-4 text-sm text-right">
                <span class="${item.change > 0 ? 'text-red-600' : item.change < 0 ? 'text-green-600' : 'text-gray-600'} font-semibold">
                    ${item.change > 0 ? '↑' : item.change < 0 ? '↓' : ''} ${Math.abs(item.change)}%
                </span>
            </td>
        </tr>
    `).join('');
}

function exportReport() {
    showToast('Downloading report...', 'info');
    setTimeout(() => {
        showToast('Report exported successfully!', 'success');
    }, 1500);
}

document.addEventListener('DOMContentLoaded', loadAnalytics);