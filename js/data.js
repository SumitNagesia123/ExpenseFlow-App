// Demo Data and Data Management
const DEMO_DATA = {
    user: {
        id: 'demo-user-001',
        fullName: 'John Doe',
        email: 'demo@expenseflow.com',
        monthlyIncome: 5000,
        currency: 'USD',
        plan: 'Pro'
    },
    
    categories: [
        { id: 'cat-001', name: 'Food & Dining', icon: '🍔', color: '#6366F1' },
        { id: 'cat-002', name: 'Transportation', icon: '🚗', color: '#F59E0B' },
        { id: 'cat-003', name: 'Bills & Utilities', icon: '🏠', color: '#10B981' },
        { id: 'cat-004', name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
        { id: 'cat-005', name: 'Shopping', icon: '🛍️', color: '#EC4899' },
        { id: 'cat-006', name: 'Healthcare', icon: '💊', color: '#EF4444' },
        { id: 'cat-007', name: 'Education', icon: '📚', color: '#3B82F6' },
        { id: 'cat-008', name: 'Travel', icon: '✈️', color: '#14B8A6' },
        { id: 'cat-009', name: 'Insurance', icon: '🛡️', color: '#6B7280' },
        { id: 'cat-010', name: 'Other', icon: '📌', color: '#9CA3AF' }
    ],
    
    expenses: [
        { id: 'exp-001', date: '2026-01-12', title: 'Starbucks Coffee', amount: 5.75, categoryId: 'cat-001', payment: 'credit_card', merchant: 'Starbucks', description: 'Morning coffee', tags: ['coffee', 'beverage'] },
        { id: 'exp-002', date: '2026-01-11', title: 'Shell Gas Station', amount: 45.00, categoryId: 'cat-002', payment: 'credit_card', merchant: 'Shell', description: 'Weekly gas refill', tags: ['fuel'] },
        { id: 'exp-003', date: '2026-01-10', title: 'Amazon Prime Subscription', amount: 14.99, categoryId: 'cat-004', payment: 'credit_card', merchant: 'Amazon', description: 'Monthly subscription', tags: ['subscription'], recurring: true },
        { id: 'exp-004', date: '2026-01-10', title: 'Grocery Shopping', amount: 156.50, categoryId: 'cat-001', payment: 'credit_card', merchant: 'Walmart', description: 'Weekly groceries', tags: ['groceries', 'food'] },
        { id: 'exp-005', date: '2026-01-09', title: 'Movie Tickets', amount: 32.00, categoryId: 'cat-004', payment: 'credit_card', merchant: 'AMC Theaters', description: 'Date night', tags: ['entertainment', 'movies'] },
        { id: 'exp-006', date: '2026-01-08', title: 'Electric Bill', amount: 125.00, categoryId: 'cat-003', payment: 'net_banking', merchant: 'Power Company', description: 'Monthly electric bill', tags: ['utilities'], recurring: true },
        { id: 'exp-007', date: '2026-01-08', title: 'Uber Ride', amount: 18.50, categoryId: 'cat-002', payment: 'upi', merchant: 'Uber', description: 'Ride to work', tags: ['transport'] },
        { id: 'exp-008', date: '2026-01-07', title: 'Restaurant Dinner', amount: 85.00, categoryId: 'cat-001', payment: 'credit_card', merchant: 'Olive Garden', description: 'Family dinner', tags: ['dining', 'family'] },
        { id: 'exp-009', date: '2026-01-06', title: 'Gym Membership', amount: 45.00, categoryId: 'cat-006', payment: 'credit_card', merchant: 'Planet Fitness', description: 'Monthly gym fee', tags: ['fitness', 'health'], recurring: true },
        { id: 'exp-010', date: '2026-01-05', title: 'Clothing Purchase', amount: 120.00, categoryId: 'cat-005', payment: 'credit_card', merchant: 'H&M', description: 'New shirts', tags: ['clothes', 'shopping'] },
        { id: 'exp-011', date: '2026-01-05', title: 'Internet Bill', amount: 65.00, categoryId: 'cat-003', payment: 'net_banking', merchant: 'ISP Provider', description: 'Monthly internet', tags: ['utilities'], recurring: true },
        { id: 'exp-012', date: '2026-01-04', title: 'Coffee Shop', amount: 8.50, categoryId: 'cat-001', payment: 'cash', merchant: 'Local Cafe', description: 'Afternoon coffee', tags: ['coffee'] },
        { id: 'exp-013', date: '2026-01-04', title: 'Parking Fee', amount: 12.00, categoryId: 'cat-002', payment: 'cash', merchant: 'City Parking', description: 'Downtown parking', tags: ['parking'] },
        { id: 'exp-014', date: '2026-01-03', title: 'Netflix Subscription', amount: 15.99, categoryId: 'cat-004', payment: 'credit_card', merchant: 'Netflix', description: 'Streaming service', tags: ['subscription', 'entertainment'], recurring: true },
        { id: 'exp-015', date: '2026-01-03', title: 'Phone Bill', amount: 55.00, categoryId: 'cat-003', payment: 'net_banking', merchant: 'Telecom', description: 'Monthly phone bill', tags: ['utilities'], recurring: true },
        { id: 'exp-016', date: '2026-01-02', title: 'Lunch at Work', amount: 15.00, categoryId: 'cat-001', payment: 'credit_card', merchant: 'Subway', description: 'Quick lunch', tags: ['food', 'lunch'] },
        { id: 'exp-017', date: '2026-01-02', title: 'Gas Station', amount: 42.00, categoryId: 'cat-002', payment: 'credit_card', merchant: 'Chevron', description: 'Gas refill', tags: ['fuel'] },
        { id: 'exp-018', date: '2026-01-01', title: 'Rent Payment', amount: 780.00, categoryId: 'cat-003', payment: 'net_banking', merchant: 'Landlord', description: 'Monthly rent', tags: ['rent', 'housing'], recurring: true },
        { id: 'exp-019', date: '2026-01-01', title: 'Spotify Premium', amount: 9.99, categoryId: 'cat-004', payment: 'credit_card', merchant: 'Spotify', description: 'Music streaming', tags: ['subscription', 'music'], recurring: true },
        { id: 'exp-020', date: '2025-12-31', title: 'New Year Celebration', amount: 150.00, categoryId: 'cat-004', payment: 'credit_card', merchant: 'Restaurant', description: 'New year party', tags: ['celebration'] }
    ],
    
    budgets: [
        { id: 'bud-001', categoryId: 'cat-001', amount: 800, period: 'monthly', alertThreshold: 80 },
        { id: 'bud-002', categoryId: 'cat-002', amount: 300, period: 'monthly', alertThreshold: 80 },
        { id: 'bud-003', categoryId: 'cat-003', amount: 1200, period: 'monthly', alertThreshold: 80 },
        { id: 'bud-004', categoryId: 'cat-004', amount: 400, period: 'monthly', alertThreshold: 80 },
        { id: 'bud-005', categoryId: 'cat-005', amount: 500, period: 'monthly', alertThreshold: 80 }
    ],
    
    insights: [
        {
            id: 'ins-001',
            type: 'saving_opportunity',
            title: 'Save $250/month by Optimizing Subscriptions',
            description: 'You have 5 active subscriptions totaling $141.96/month. Consider canceling rarely used services.',
            impact: 85,
            category: null,
            details: {
                subscriptions: [
                    { name: 'Amazon Prime', cost: 14.99, usage: 'low' },
                    { name: 'Spotify Premium', cost: 9.99, usage: 'high' }
                ],
                potentialSavings: 14.99
            }
        },
        {
            id: 'ins-002',
            type: 'spending_pattern',
            title: 'Your Food Spending is Up 25%',
            description: 'You spent $645 on food this month compared to $516 last month.',
            impact: 78,
            category: 'cat-001',
            details: {
                currentMonth: 645,
                lastMonth: 516,
                change: 25,
                suggestion: 'Consider meal prepping to save ~$150/month'
            }
        },
        {
            id: 'ins-003',
            type: 'budget_advice',
            title: 'Adjust Your Entertainment Budget',
            description: 'Your Entertainment spending consistently exceeds budget. Consider increasing it.',
            impact: 65,
            category: 'cat-004',
            details: {
                currentBudget: 400,
                averageSpending: 485,
                suggestedBudget: 500
            }
        }
    ],
    
    notifications: [
        { id: 'not-001', type: 'budget_alert', title: 'Entertainment Budget Exceeded', message: "You've exceeded your Entertainment budget by $120", priority: 'high', read: false, date: '2026-01-12' },
        { id: 'not-002', type: 'budget_warning', title: 'Transportation Warning', message: '95% of budget used. Only $14.50 remaining.', priority: 'medium', read: false, date: '2026-01-11' },
        { id: 'not-003', type: 'insight', title: 'New Insight Available', message: 'Check out your personalized savings recommendations', priority: 'low', read: false, date: '2026-01-10' },
        { id: 'not-004', type: 'payment_reminder', title: 'Rent Due Soon', message: 'Your monthly rent payment is due in 3 days', priority: 'high', read: true, date: '2026-01-08' }
    ]
};

// LocalStorage Management
class DataManager {
    constructor() {
        this.initializeData();
    }
    
    initializeData() {
        if (!localStorage.getItem('expenseflow_user')) {
            localStorage.setItem('expenseflow_user', JSON.stringify(DEMO_DATA.user));
        }
        if (!localStorage.getItem('expenseflow_categories')) {
            localStorage.setItem('expenseflow_categories', JSON.stringify(DEMO_DATA.categories));
        }
        if (!localStorage.getItem('expenseflow_expenses')) {
            localStorage.setItem('expenseflow_expenses', JSON.stringify(DEMO_DATA.expenses));
        }
        if (!localStorage.getItem('expenseflow_budgets')) {
            localStorage.setItem('expenseflow_budgets', JSON.stringify(DEMO_DATA.budgets));
        }
        if (!localStorage.getItem('expenseflow_insights')) {
            localStorage.setItem('expenseflow_insights', JSON.stringify(DEMO_DATA.insights));
        }
        if (!localStorage.getItem('expenseflow_notifications')) {
            localStorage.setItem('expenseflow_notifications', JSON.stringify(DEMO_DATA.notifications));
        }
    }
    
    // User
    getUser() {
        return JSON.parse(localStorage.getItem('expenseflow_user'));
    }
    
    updateUser(user) {
        localStorage.setItem('expenseflow_user', JSON.stringify(user));
    }
    
    // Categories
    getCategories() {
        return JSON.parse(localStorage.getItem('expenseflow_categories'));
    }
    
    getCategoryById(id) {
        const categories = this.getCategories();
        return categories.find(cat => cat.id === id);
    }
    
    addCategory(category) {
        const categories = this.getCategories();
        categories.push(category);
        localStorage.setItem('expenseflow_categories', JSON.stringify(categories));
    }
    
    // Expenses
    getExpenses() {
        return JSON.parse(localStorage.getItem('expenseflow_expenses'));
    }
    
    getExpenseById(id) {
        const expenses = this.getExpenses();
        return expenses.find(exp => exp.id === id);
    }
    
    addExpense(expense) {
        const expenses = this.getExpenses();
        expenses.unshift(expense);
        localStorage.setItem('expenseflow_expenses', JSON.stringify(expenses));
    }
    
    updateExpense(id, updatedExpense) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(exp => exp.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updatedExpense };
            localStorage.setItem('expenseflow_expenses', JSON.stringify(expenses));
        }
    }
    
    deleteExpense(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(exp => exp.id !== id);
        localStorage.setItem('expenseflow_expenses', JSON.stringify(filtered));
    }
    
    // Budgets
    getBudgets() {
        return JSON.parse(localStorage.getItem('expenseflow_budgets'));
    }
    
    getBudgetByCategory(categoryId) {
        const budgets = this.getBudgets();
        return budgets.find(bud => bud.categoryId === categoryId);
    }
    
    addBudget(budget) {
        const budgets = this.getBudgets();
        budgets.push(budget);
        localStorage.setItem('expenseflow_budgets', JSON.stringify(budgets));
    }
    
    updateBudget(categoryId, amount) {
        const budgets = this.getBudgets();
        const index = budgets.findIndex(bud => bud.categoryId === categoryId);
        if (index !== -1) {
            budgets[index].amount = amount;
        } else {
            budgets.push({ id: `bud-${Date.now()}`, categoryId, amount, period: 'monthly', alertThreshold: 80 });
        }
        localStorage.setItem('expenseflow_budgets', JSON.stringify(budgets));
    }
    
    // Insights
    getInsights() {
        return JSON.parse(localStorage.getItem('expenseflow_insights'));
    }
    
    // Notifications
    getNotifications() {
        return JSON.parse(localStorage.getItem('expenseflow_notifications'));
    }
    
    markNotificationRead(id) {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            localStorage.setItem('expenseflow_notifications', JSON.stringify(notifications));
        }
    }
    
    // Analytics
    getMonthlyTotal(month, year) {
        const expenses = this.getExpenses();
        return expenses
            .filter(exp => {
                const date = new Date(exp.date);
                return date.getMonth() === month && date.getFullYear() === year;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    }
    
    getCategoryTotal(categoryId, startDate, endDate) {
        const expenses = this.getExpenses();
        return expenses
            .filter(exp => {
                const date = new Date(exp.date);
                return exp.categoryId === categoryId && 
                       (!startDate || date >= new Date(startDate)) &&
                       (!endDate || date <= new Date(endDate));
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
    }
    
    getCategoryBreakdown() {
        const expenses = this.getExpenses();
        const categories = this.getCategories();
        const breakdown = {};
        
        categories.forEach(cat => {
            breakdown[cat.id] = {
                category: cat,
                total: 0,
                count: 0
            };
        });
        
        expenses.forEach(exp => {
            const expDate = new Date(exp.date);
            const now = new Date();
            if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
                if (breakdown[exp.categoryId]) {
                    breakdown[exp.categoryId].total += exp.amount;
                    breakdown[exp.categoryId].count += 1;
                }
            }
        });
        
        return Object.values(breakdown).filter(item => item.total > 0);
    }
}

// Initialize DataManager
const dataManager = new DataManager();