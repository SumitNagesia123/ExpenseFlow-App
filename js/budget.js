// Budget page logic

function loadBudgetPage() {
    loadSidebar();
    calculateBudgetSummary();
    displayCategoryBudgets();
    displayBudgetInsights();
    populateBudgetCategories();
}

function calculateBudgetSummary() {
    const budgets = dataManager.getBudgets();
    const expenses = dataManager.getExpenses();
    const now = new Date();
    
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    
    const currentMonthExpenses = expenses.filter(exp => {
        const date = new Date(exp.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    
    const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = totalBudget - totalSpent;
    const percentage = (totalSpent / totalBudget * 100).toFixed(0);
    
    document.getElementById('total-budget-amount').textContent = formatCurrency(totalBudget);
    document.getElementById('total-spent-amount').textContent = formatCurrency(totalSpent);
    document.getElementById('remaining-amount').textContent = formatCurrency(remaining);
    document.getElementById('overall-progress').style.width = percentage + '%';
}

function displayCategoryBudgets() {
    const budgets = dataManager.getBudgets();
    const categories = dataManager.getCategories();
    const container = document.getElementById('budget-list');
    
    if (!container) return;
    
    const budgetItems = budgets.map(budget => {
        const category = dataManager.getCategoryById(budget.categoryId);
        if (!category) return '';
        
        const spent = dataManager.getCategoryTotal(budget.categoryId);
        const percentage = (spent / budget.amount * 100).toFixed(1);
        const remaining = budget.amount - spent;
        
        let statusClass = 'bg-green-500';
        let statusText = 'On Track';
        let statusIcon = 'fa-check-circle';
        
        if (percentage >= 100) {
            statusClass = 'bg-red-500';
            statusText = 'Exceeded';
            statusIcon = 'fa-exclamation-circle';
        } else if (percentage >= budget.alertThreshold) {
            statusClass = 'bg-amber-500';
            statusText = 'Warning';
            statusIcon = 'fa-exclamation-triangle';
        }
        
        return `
            <div class="border rounded-lg p-6 hover:shadow-md transition">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <span class="text-3xl mr-3">${category.icon}</span>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">${category.name}</h3>
                            <p class="text-sm text-gray-600">${formatCurrency(spent)} / ${formatCurrency(budget.amount)}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 ${statusClass} text-white text-xs font-semibold rounded-full flex items-center">
                            <i class="fas ${statusIcon} mr-1"></i>
                            ${statusText}
                        </span>
                        <button onclick="editBudget('${budget.categoryId}')" class="text-gray-400 hover:text-indigo-600">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">${percentage}% used</span>
                        <span class="font-semibold" style="color: ${percentage >= 100 ? '#EF4444' : percentage >= 80 ? '#F59E0B' : '#10B981'}">
                            ${remaining >= 0 ? formatCurrency(remaining) + ' remaining' : formatCurrency(Math.abs(remaining)) + ' over'}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="h-3 rounded-full transition-all" style="width: ${Math.min(percentage, 100)}%; background-color: ${category.color}"></div>
                    </div>
                </div>
                
                ${percentage >= budget.alertThreshold ? `
                    <div class="mt-3 text-sm ${percentage >= 100 ? 'text-red-600' : 'text-amber-600'}">
                        <i class="fas fa-info-circle mr-1"></i>
                        ${percentage >= 100 ? 
                            `You've exceeded this budget by ${formatCurrency(Math.abs(remaining))}` : 
                            `You're at ${percentage}% of your budget limit`
                        }
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = budgetItems || '<p class="text-gray-500 text-center py-8">No budgets set. Click "Set Budget" to get started.</p>';
}

function displayBudgetInsights() {
    const container = document.getElementById('budget-insights');
    if (!container) return;
    
    const insights = [
        {
            icon: 'fa-chart-line',
            color: 'text-green-600',
            text: "You're saving 35% of your income this month - Great job!"
        },
        {
            icon: 'fa-lightbulb',
            color: 'text-amber-600',
            text: 'Your Entertainment spending is 30% higher than last month'
        },
        {
            icon: 'fa-piggy-bank',
            color: 'text-indigo-600',
            text: 'Consider reducing dining out to save an extra $200/month'
        }
    ];
    
    container.innerHTML = insights.map(insight => `
        <div class="flex items-start">
            <i class="fas ${insight.icon} ${insight.color} text-xl mt-1 mr-3"></i>
            <p class="text-gray-700">${insight.text}</p>
        </div>
    `).join('');
}

function populateBudgetCategories() {
    const categories = dataManager.getCategories();
    const select = document.getElementById('budget-category');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
    });
}

function showBudgetModal() {
    const modal = document.getElementById('budget-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeBudgetModal() {
    const modal = document.getElementById('budget-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleBudgetSubmit(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    
    dataManager.updateBudget(categoryId, amount);
    showToast('Budget updated successfully!', 'success');
    closeBudgetModal();
    
    calculateBudgetSummary();
    displayCategoryBudgets();
}

function editBudget(categoryId) {
    const budget = dataManager.getBudgetByCategory(categoryId);
    if (budget) {
        document.getElementById('budget-category').value = categoryId;
        document.getElementById('budget-amount').value = budget.amount;
        document.getElementById('budget-alert').value = budget.alertThreshold;
    }
    showBudgetModal();
}

// Alert slider
document.addEventListener('DOMContentLoaded', () => {
    const alertSlider = document.getElementById('budget-alert');
    const alertValue = document.getElementById('alert-value');
    
    if (alertSlider && alertValue) {
        alertSlider.addEventListener('input', () => {
            alertValue.textContent = alertSlider.value + '%';
        });
    }
    
    loadBudgetPage();
});