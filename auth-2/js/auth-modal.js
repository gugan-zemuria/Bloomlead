// Auth Modal Manager
class AuthModalManager {
    constructor() {
        this.currentMode = 'login';
        this.isLoading = false;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupElements();
    }

    setupElements() {
        // Get all DOM elements
        this.modal = document.getElementById('authModal');
        this.backdrop = document.getElementById('modalBackdrop');
        this.closeBtn = document.getElementById('closeModal');
        this.loginBtn = document.getElementById('loginBtn');
        this.openAuthBtn = document.getElementById('openAuthModal');
        
        // Debug: Check if elements are found
        console.log('Login button found:', !!this.loginBtn);
        console.log('Modal found:', !!this.modal);
        this.loginTab = document.getElementById('loginTab');
        this.signupTab = document.getElementById('signupTab');
        this.authForm = document.getElementById('authForm');
        this.successMessage = document.getElementById('successMessage');
        this.modalTitle = document.getElementById('modalTitle');
        this.nameField = document.getElementById('nameField');
        this.forgotPassword = document.getElementById('forgotPassword');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.submitIcon = document.getElementById('submitIcon');
        
        // Form inputs
        this.nameInput = document.getElementById('nameInput');
        this.emailInput = document.getElementById('emailInput');
        this.passwordInput = document.getElementById('passwordInput');
    }

    bindEvents() {
        // Modal open/close events
        document.addEventListener('click', (e) => {
            // Check if clicked element or its parent is the login button
            const loginBtn = e.target.closest('#loginBtn');
            const openAuthBtn = e.target.closest('#openAuthModal');
            
            if (loginBtn || openAuthBtn || e.target.id === 'loginBtn' || e.target.id === 'openAuthModal') {
                this.openModal('login');
            }
            if (e.target.id === 'closeModal' || e.target.id === 'modalBackdrop') {
                this.closeModal();
            }
        });

        // Tab switching
        document.addEventListener('click', (e) => {
            const loginTab = e.target.closest('#loginTab');
            const signupTab = e.target.closest('#signupTab');
            
            if (loginTab || e.target.id === 'loginTab') {
                this.switchMode('login');
            }
            if (signupTab || e.target.id === 'signupTab') {
                this.switchMode('signup');
            }
        });

        // Form submission
        document.getElementById('authForm').addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });

        // Direct button event listeners for more reliable handling
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('login');
            });
        }
        
        if (this.openAuthBtn) {
            this.openAuthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('login');
            });
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        if (this.backdrop) {
            this.backdrop.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        if (this.loginTab) {
            this.loginTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('login');
            });
        }
        
        if (this.signupTab) {
            this.signupTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchMode('signup');
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });

        // Social auth buttons
        document.querySelectorAll('[data-social]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSocialAuth(e.target.dataset.social);
            });
        });
    }

    openModal(mode = 'login') {
        console.log('Opening modal in mode:', mode);
        this.currentMode = mode;
        this.isOpen = true;
        
        // Show modal
        if (this.modal) {
            this.modal.classList.remove('hidden');
            document.body.classList.add('modal-open');
            
            // Set initial mode
            this.switchMode(mode);
            
            // Focus first input
            setTimeout(() => {
                if (mode === 'signup' && this.nameInput) {
                    this.nameInput.focus();
                } else if (this.emailInput) {
                    this.emailInput.focus();
                }
            }, 100);
        } else {
            console.error('Modal element not found!');
        }
    }

    closeModal() {
        this.isOpen = false;
        this.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        
        // Reset form
        this.resetForm();
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tabs
        if (mode === 'login') {
            this.loginTab.className = 'pb-2 text-sm font-semibold transition-colors relative text-brand-purple';
            this.loginTab.innerHTML = `
                Kirjaudu sisään
                <div class="absolute bottom-[-9px] left-0 w-full h-[2px] bg-brand-purple rounded-t-full"></div>
            `;
            this.signupTab.className = 'pb-2 text-sm font-semibold transition-colors relative text-gray-400 hover:text-gray-600';
            this.signupTab.innerHTML = 'Rekisteröidy';
            
            // Update content
            this.modalTitle.textContent = 'Tervetuloa takaisin.';
            this.nameField.classList.add('hidden');
            this.forgotPassword.classList.remove('hidden');
            this.submitText.textContent = 'Kirjaudu Sisään';
            
        } else {
            this.signupTab.className = 'pb-2 text-sm font-semibold transition-colors relative text-brand-purple';
            this.signupTab.innerHTML = `
                Rekisteröidy
                <div class="absolute bottom-[-9px] left-0 w-full h-[2px] bg-brand-purple rounded-t-full"></div>
            `;
            this.loginTab.className = 'pb-2 text-sm font-semibold transition-colors relative text-gray-400 hover:text-gray-600';
            this.loginTab.innerHTML = 'Kirjaudu sisään';
            
            // Update content
            this.modalTitle.textContent = 'Liity yhteisöön.';
            this.nameField.classList.remove('hidden');
            this.forgotPassword.classList.add('hidden');
            this.submitText.textContent = 'Luo Tili';
        }
        
        // Clear form
        this.clearErrors();
    }
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Get form data
        const formData = {
            email: this.emailInput.value,
            password: this.passwordInput.value,
            name: this.currentMode === 'signup' ? this.nameInput.value : ''
        };
        
        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }
        
        // Set loading state
        this.setLoading(true);
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Show success message
            this.showSuccess();
            
        } catch (error) {
            console.error('Auth error:', error);
            this.showError('Kirjautuminen epäonnistui. Yritä uudelleen.');
        } finally {
            this.setLoading(false);
        }
    }

    validateForm(formData) {
        let isValid = true;
        
        // Clear previous errors
        this.clearErrors();
        
        // Validate email
        if (!formData.email) {
            this.showFieldError('emailInput', 'Sähköposti on pakollinen');
            isValid = false;
        } else if (!this.isValidEmail(formData.email)) {
            this.showFieldError('emailInput', 'Anna kelvollinen sähköpostiosoite');
            isValid = false;
        }
        
        // Validate password
        if (!formData.password) {
            this.showFieldError('passwordInput', 'Salasana on pakollinen');
            isValid = false;
        } else if (formData.password.length < 6) {
            this.showFieldError('passwordInput', 'Salasanan tulee olla vähintään 6 merkkiä');
            isValid = false;
        }
        
        // Validate name for signup
        if (this.currentMode === 'signup' && !formData.name.trim()) {
            this.showFieldError('nameInput', 'Nimi on pakollinen');
            isValid = false;
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('border-red-300', 'focus:border-red-500');
        field.classList.remove('border-gray-200', 'focus:border-brand-purple');
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'error-message text-xs text-red-500 mt-1';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearErrors() {
        // Remove error classes from inputs
        [this.nameInput, this.emailInput, this.passwordInput].forEach(input => {
            if (input) {
                input.classList.remove('border-red-300', 'focus:border-red-500');
                input.classList.add('border-gray-200', 'focus:border-brand-purple');
            }
        });
        
        // Remove error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    showError(message) {
        // Create or show error notification
        let errorNotification = document.getElementById('errorNotification');
        if (!errorNotification) {
            errorNotification = document.createElement('div');
            errorNotification.id = 'errorNotification';
            errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            document.body.appendChild(errorNotification);
        }
        
        errorNotification.textContent = message;
        errorNotification.classList.remove('hidden');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            errorNotification.classList.add('hidden');
        }, 3000);
    }

    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('btn-loading');
            this.submitText.textContent = 'Käsitellään...';
            this.submitIcon.style.display = 'none';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('btn-loading');
            this.submitText.textContent = this.currentMode === 'login' ? 'Kirjaudu Sisään' : 'Luo Tili';
            this.submitIcon.style.display = 'block';
        }
    }

    showSuccess() {
        // Hide form and show success message
        this.authForm.classList.add('hidden');
        this.successMessage.classList.remove('hidden');
        
        // Auto close modal after 2 seconds
        setTimeout(() => {
            this.closeModal();
        }, 2000);
    }

    resetForm() {
        // Reset form fields
        this.authForm.reset();
        
        // Show form, hide success
        this.authForm.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
        
        // Clear errors
        this.clearErrors();
        
        // Reset loading state
        this.setLoading(false);
    }

    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1500);
        });
    }

    handleSocialAuth(provider) {
        console.log(`Social auth with ${provider}`);
        // Implement social authentication logic here
        alert(`${provider} kirjautuminen tulossa pian!`);
    }
}

// Initialize the auth modal manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthModalManager();
    
    // Fallback event listener for debugging
    document.body.addEventListener('click', (e) => {
        console.log('Clicked element:', e.target);
        console.log('Element ID:', e.target.id);
        console.log('Element classes:', e.target.className);
        
        // Check if we clicked on the login button or its children
        if (e.target.id === 'loginBtn' || e.target.closest('#loginBtn')) {
            console.log('Login button clicked - opening modal');
            authManager.openModal('login');
        }
    });
});

// Additional utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Trap focus within modal when open
        const modal = document.getElementById('authModal');
        if (!modal.classList.contains('hidden')) {
            const focusableElements = modal.querySelectorAll(
                'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

// Form field enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add form field animations
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentNode.classList.remove('focused');
            if (input.value) {
                input.parentNode.classList.add('has-value');
            } else {
                input.parentNode.classList.remove('has-value');
            }
        });
        
        // Real-time validation
        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-300')) {
                input.classList.remove('border-red-300', 'focus:border-red-500');
                input.classList.add('border-gray-200', 'focus:border-brand-purple');
                
                const errorMessage = input.parentNode.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
    });
});