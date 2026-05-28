// Authentication Logic

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Show loading
    const btn = document.getElementById('login-btn');
    const btnText = document.getElementById('login-btn-text');
    const spinner = document.getElementById('login-spinner');
    
    btn.disabled = true;
    btnText.textContent = 'Signing in...';
    spinner.classList.remove('hidden');
    
    // Simulate API call
    setTimeout(() => {
        // Demo credentials
        if (email === 'demo@expenseflow.com' && password === 'demo123') {
            localStorage.setItem('expenseflow_authenticated', 'true');
            if (remember) {
                localStorage.setItem('expenseflow_remember', 'true');
            }
            
            window.location.href = 'dashboard.html';
        } else {
            // Reset button
            btn.disabled = false;
            btnText.textContent = 'Sign In';
            spinner.classList.add('hidden');
            
            // Show error
            showError('email', 'Invalid email or password');
        }
    }, 1000);
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate
    let hasError = false;
    
    if (fullname.length < 3) {
        showError('fullname', 'Name must be at least 3 characters');
        hasError = true;
    }
    
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        hasError = true;
    }
    
    if (password.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        hasError = true;
    }
    
    if (password !== confirmPassword) {
        showError('confirm-password', 'Passwords do not match');
        hasError = true;
    }
    
    if (!terms) {
        alert('Please accept the Terms of Service and Privacy Policy');
        hasError = true;
    }
    
    if (hasError) return;
    
    // Show loading
    const btn = document.getElementById('signup-btn');
    const btnText = document.getElementById('signup-btn-text');
    const spinner = document.getElementById('signup-spinner');
    
    btn.disabled = true;
    btnText.textContent = 'Creating account...';
    spinner.classList.remove('hidden');
    
    // Simulate API call
    setTimeout(() => {
        // Update user data
        const user = {
            id: generateId('user'),
            fullName: fullname,
            email: email,
            monthlyIncome: 5000,
            currency: 'USD',
            plan: 'Free'
        };
        
        dataManager.updateUser(user);
        localStorage.setItem('expenseflow_authenticated', 'true');
        
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Toggle Password Visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(`${fieldId}-toggle-icon`);
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check Password Strength
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthText = document.getElementById('strength-text');
    const bars = [
        document.getElementById('strength-bar-1'),
        document.getElementById('strength-bar-2'),
        document.getElementById('strength-bar-3'),
        document.getElementById('strength-bar-4')
    ];
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Reset bars
    bars.forEach(bar => {
        bar.classList.remove('bg-red-500', 'bg-amber-500', 'bg-green-500');
        bar.classList.add('bg-gray-200');
    });
    
    // Update bars based on strength
    if (strength === 1) {
        bars[0].classList.remove('bg-gray-200');
        bars[0].classList.add('bg-red-500');
        strengthText.textContent = 'Weak password';
        strengthText.className = 'text-xs text-red-500';
    } else if (strength === 2) {
        bars[0].classList.remove('bg-gray-200');
        bars[0].classList.add('bg-amber-500');
        bars[1].classList.remove('bg-gray-200');
        bars[1].classList.add('bg-amber-500');
        strengthText.textContent = 'Fair password';
        strengthText.className = 'text-xs text-amber-500';
    } else if (strength === 3) {
        bars[0].classList.remove('bg-gray-200');
        bars[0].classList.add('bg-green-500');
        bars[1].classList.remove('bg-gray-200');
        bars[1].classList.add('bg-green-500');
        bars[2].classList.remove('bg-gray-200');
        bars[2].classList.add('bg-green-500');
        strengthText.textContent = 'Good password';
        strengthText.className = 'text-xs text-green-500';
    } else if (strength === 4) {
        bars.forEach(bar => {
            bar.classList.remove('bg-gray-200');
            bar.classList.add('bg-green-500');
        });
        strengthText.textContent = 'Strong password';
        strengthText.className = 'text-xs text-green-600 font-semibold';
    } else {
        strengthText.textContent = '';
    }
}

// Validation Helpers
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
    
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('border-red-500');
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
    
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('border-red-500');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach(el => {
        el.classList.add('hidden');
    });
    
    const fields = document.querySelectorAll('input');
    fields.forEach(field => {
        field.classList.remove('border-red-500');
    });
}

// Generate ID helper (if not in app.js)
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}