// Main Application Logic

// Authentication Check
function checkAuth() {
    const isAuthenticated = localStorage.getItem('expenseflow_authenticated');
    const currentPage = window.location.pathname.split('/').pop();
    
    const protectedPages = ['dashboard.html', 'expenses.html', 'budget.html', 'analytics.html', 'insights.html', 'categories.html', 'notifications.html', 'settings.html'];
    
    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = 'login.html';
    }
}

// Run auth check on page load
if (typeof window !== 'undefined') {
    checkAuth();
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
        type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-indigo-600'
    } text-white`;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(150%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Logout Handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('expenseflow_authenticated');
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// Navigation Functions
function showLogin() {
    window.location.href = 'login.html';
}

function showSignup() {
    window.location.href = 'signup.html';
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
    }
}

// Load Sidebar for Dashboard Pages
function loadSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    const user = dataManager.getUser();
    const unreadNotifications = dataManager.getNotifications().filter(n => !n.read).length;
    
    const currentPage = window.location.pathname.split('/').pop();
    
    const sidebarHTML = `
        <div class="p-6">
            <div class="flex items-center mb-8">
                <i class="fas fa-wallet text-indigo-600 text-2xl mr-3"></i>
                <span class="text-xl font-bold text-gray-900">ExpenseFlow</span>
            </div>
            
            <nav class="space-y-2">
                <a href="dashboard.html" class="nav-link ${currentPage === 'dashboard.html' ? 'active' : ''}">
                    <i class="fas fa-home w-5"></i>
                    <span class="ml-3">Dashboard</span>
                </a>
                <a href="expenses.html" class="nav-link ${currentPage === 'expenses.html' ? 'active' : ''}">
                    <i class="fas fa-receipt w-5"></i>
                    <span class="ml-3">Expenses</span>
                </a>
                <a href="budget.html" class="nav-link ${currentPage === 'budget.html' ? 'active' : ''}">
                    <i class="fas fa-chart-pie w-5"></i>
                    <span class="ml-3">Budgets</span>
                </a>
                <a href="analytics.html" class="nav-link ${currentPage === 'analytics.html' ? 'active' : ''}">
                    <i class="fas fa-chart-line w-5"></i>
                    <span class="ml-3">Analytics</span>
                </a>
                <a href="insights.html" class="nav-link ${currentPage === 'insights.html' ? 'active' : ''}">
                    <i class="fas fa-lightbulb w-5"></i>
                    <span class="ml-3">AI Insights</span>
                </a>
                <a href="categories.html" class="nav-link ${currentPage === 'categories.html' ? 'active' : ''}">
                    <i class="fas fa-tags w-5"></i>
                    <span class="ml-3">Categories</span>
                </a>
                <a href="notifications.html" class="nav-link ${currentPage === 'notifications.html' ? 'active' : ''} relative">
                    <i class="fas fa-bell w-5"></i>
                    <span class="ml-3">Notifications</span>
                    ${unreadNotifications > 0 ? `<span class="absolute right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${unreadNotifications}</span>` : ''}
                </a>
                <a href="settings.html" class="nav-link ${currentPage === 'settings.html' ? 'active' : ''}">
                    <i class="fas fa-cog w-5"></i>
                    <span class="ml-3">Settings</span>
                </a>
            </nav>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-6 border-t">
            <div class="flex items-center">
                <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-indigo-600"></i>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-semibold text-gray-900">${user.fullName}</p>
                    <p class="text-xs text-gray-500">${user.plan} Plan</p>
                </div>
                <button onclick="handleLogout()" class="text-gray-400 hover:text-red-500 transition">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
    `;
    
    sidebar.innerHTML = sidebarHTML;
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Get Payment Mode Display
function getPaymentModeDisplay(mode) {
    const modes = {
        'cash': '💵 Cash',
        'credit_card': '💳 Credit Card',
        'debit_card': '💳 Debit Card',
        'upi': '📱 UPI',
        'net_banking': '🏦 Net Banking',
        'wallet': '👛 Wallet'
    };
    return modes[mode] || mode;
}

// Generate Unique ID
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Expense Modal Functions
function showAddExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (!modal) return;
    
    document.getElementById('modal-title').textContent = 'Add New Expense';
    document.getElementById('expense-form').reset();
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Populate categories
    const categories = dataManager.getCategories();
    const categorySelect = document.getElementById('expense-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option);
    });
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleExpenseSubmit(event) {
    event.preventDefault();
    
    const expense = {
        id: generateId('exp'),
        date: document.getElementById('expense-date').value,
        title: document.getElementById('expense-title').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        categoryId: document.getElementById('expense-category').value,
        payment: document.getElementById('expense-payment').value,
        merchant: document.getElementById('expense-merchant').value || '',
        description: document.getElementById('expense-description').value || '',
        tags: document.getElementById('expense-tags').value.split(',').map(t => t.trim()).filter(t => t),
        recurring: document.getElementById('expense-recurring').checked
    };
    
    dataManager.addExpense(expense);
    showToast('Expense added successfully!', 'success');
    closeExpenseModal();
    
    // Reload page data
    if (typeof loadExpenses === 'function') {
        loadExpenses();
    }
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
}

// Toggle recurring options
document.addEventListener('DOMContentLoaded', () => {
    const recurringCheckbox = document.getElementById('expense-recurring');
    const recurringOptions = document.getElementById('recurring-options');
    
    if (recurringCheckbox && recurringOptions) {
        recurringCheckbox.addEventListener('change', () => {
            if (recurringCheckbox.checked) {
                recurringOptions.classList.remove('hidden');
            } else {
                recurringOptions.classList.add('hidden');
            }
        });
    }
});

// Scan Receipt (Mock)
function scanReceipt() {
    showToast('Receipt scanning coming soon! This feature requires camera access.', 'info');
}

// Load sidebar on dashboard pages
document.addEventListener('DOMContentLoaded', () => {
    if (typeof dataManager !== 'undefined') {
        loadSidebar();
    }
});