// Auth Form Manager
class AuthManager {
    constructor() {
        this.currentMode = 'login';
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPasswordToggles();
    }

    bindEvents() {
        // Form switching
        document.getElementById('switchToSignup').addEventListener('click', () => this.switchMode('signup'));
        document.getElementById('switchToLogin').addEventListener('click', () => this.switchMode('login'));
        
        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));
    }

    setupPasswordToggles() {
        // Login password toggle
        document.getElementById('toggleLoginPassword').addEventListener('click', () => {
            this.togglePassword('loginPassword', 'loginPasswordEye');
        });
        
        // Signup password toggles
        document.getElementById('toggleSignupPassword').addEventListener('click', () => {
            this.togglePassword('signupPassword', 'signupPasswordEye');
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
            this.togglePassword('confirmPassword', 'confirmPasswordEye');
        });
    }

    switchMode(mode) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (mode === 'signup') {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            this.currentMode = 'signup';
        } else {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            this.currentMode = 'login';
        }
        
        // Clear any existing errors
        this.clearErrors();
    }
    togglePassword(inputId, eyeId) {
        const input = document.getElementById(inputId);
        const eye = document.getElementById(eyeId);
        
        if (input.type === 'password') {
            input.type = 'text';
            eye.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
            `;
        } else {
            input.type = 'password';
            eye.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            `;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const formData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value,
            rememberMe: document.getElementById('rememberMe').checked
        };
        
        if (this.validateLogin(formData)) {
            this.setSubmitting(true, 'login');
            
            try {
                // Simulate API call
                await this.simulateApiCall();
                alert('Login successful! (Simulated)');
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            } finally {
                this.setSubmitting(false, 'login');
            }
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const formData = {
            name: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            agreeTerms: document.getElementById('agreeTerms').checked
        };
        
        if (this.validateSignup(formData)) {
            this.setSubmitting(true, 'signup');
            
            try {
                // Simulate API call
                await this.simulateApiCall();
                alert('Account created successfully! (Simulated)');
            } catch (error) {
                console.error('Signup error:', error);
                alert('Signup failed. Please try again.');
            } finally {
                this.setSubmitting(false, 'signup');
            }
        }
    }
    validateLogin(formData) {
        const errors = {};
        
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!this.isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        }
        
        this.displayErrors(errors, 'login');
        return Object.keys(errors).length === 0;
    }

    validateSignup(formData) {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        }
        
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!this.isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms and Conditions';
        }
        
        this.displayErrors(errors, 'signup');
        return Object.keys(errors).length === 0;
    }

    isValidEmail(email) {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    }

    displayErrors(errors, formType) {
        // Clear previous errors
        this.clearErrors(formType);
        
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${formType}${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
            const inputElement = document.getElementById(`${formType}${field.charAt(0).toUpperCase() + field.slice(1)}`);
            
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.remove('hidden');
            }
            
            if (inputElement) {
                inputElement.classList.add('error-border');
                inputElement.classList.remove('border-slate-200');
            }
        });
    }
    clearErrors(formType = null) {
        const forms = formType ? [formType] : ['login', 'signup'];
        
        forms.forEach(form => {
            const errorElements = document.querySelectorAll(`[id*="${form}"][id*="Error"]`);
            errorElements.forEach(element => {
                element.classList.add('hidden');
                element.textContent = '';
            });
            
            const inputElements = document.querySelectorAll(`[id*="${form}"]`);
            inputElements.forEach(element => {
                if (element.tagName === 'INPUT') {
                    element.classList.remove('error-border');
                    element.classList.add('border-slate-200');
                }
            });
        });
    }

    setSubmitting(isSubmitting, formType) {
        this.isSubmitting = isSubmitting;
        
        const submitBtn = document.getElementById(`${formType}SubmitBtn`);
        const btnText = document.getElementById(`${formType}BtnText`);
        const btnIcon = document.getElementById(`${formType}BtnIcon`);
        const spinner = document.getElementById(`${formType}Spinner`);
        
        if (isSubmitting) {
            submitBtn.disabled = true;
            btnText.textContent = formType === 'login' ? 'Signing in...' : 'Creating account...';
            btnIcon.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = formType === 'login' ? 'Sign In' : 'Create Account';
            btnIcon.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }

    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1500);
        });
    }
}

// Initialize the auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Additional utility functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Form field real-time validation
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            if (input.classList.contains('error-border')) {
                input.classList.remove('error-border');
                input.classList.add('border-slate-200');
                
                const errorElement = document.getElementById(input.id + 'Error');
                if (errorElement) {
                    errorElement.classList.add('hidden');
                }
            }
        });
    });
});

function validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (input.type === 'email' && value) {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    if (input.type === 'password' && value && input.id.includes('signup')) {
        if (value.length < 8) {
            isValid = false;
            errorMessage = 'Password must be at least 8 characters';
        }
    }
    
    const errorElement = document.getElementById(input.id + 'Error');
    if (!isValid && errorElement) {
        input.classList.add('error-border');
        input.classList.remove('border-slate-200');
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
    }
}