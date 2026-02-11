/**
 * BloomLead Email Handler
 * Enhanced JavaScript for real email sending via PHP backend
 */

class BloomLeadEmailHandler {
    constructor() {
        this.apiEndpoint = '/mail/send-email.php'; // Adjust path as needed
        this.isSubmitting = false;
    }

    /**
     * Send email via PHP backend
     */
    async sendEmail(emailData) {
        if (this.isSubmitting) {
            throw new Error('Email is already being sent. Please wait.');
        }

        this.isSubmitting = true;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to send email');
            }

            return result;

        } catch (error) {
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your connection and try again.');
            }
            throw error;
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Prepare email data based on request type
     */
    prepareEmailData(type, userEmail, customMessage = null, customerType = null) {
        let subject, message;

        switch (type) {
            case 'info':
                subject = 'Tiedustelu: Lisätietoja BloomLead webinaarista';
                message = customMessage || this.getInfoRequestMessage();
                break;

            case 'module':
                subject = 'BloomLead webinaarimoduuli 1 lisätietokysely';
                message = customMessage || this.getModuleRequestMessage();
                break;

            case 'package':
                subject = 'BloomLead webinaaripaketti lisätietokysely';
                message = customMessage || this.getPackageRequestMessage();
                break;

            case 'package-order':
                subject = 'BloomLead webinaaripaketin tilaus';
                message = customMessage || this.getPackageOrderMessage(customerType);
                break;

            case 'module-order':
                subject = 'BloomLead webinaarimoduuli 1 tilaus';
                message = customMessage || this.getModuleRequestMessage();
                break;

            default:
                subject = 'Yhteydenotto BloomLead-sivustolta';
                message = customMessage || 'Yleinen yhteydenotto sivustolta.';
        }

        return {
            email: userEmail,
            type: type,
            subject: subject,
            message: message,
            customerType: customerType,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Default message templates
     */
    getInfoRequestMessage() {
        return `Hei,

Olen kiinnostunut BloomLead-webinaarista ja haluaisin lisätietoja seuraavista:

• Webinaarien sisällöt ja aikataulut
• Hintatiedot ja maksutavat
• Miten pääsen mukaan webinaareihin
• Saanko tallenteet käyttööni

Odotan yhteydenottoanne.`;
    }

    getModuleRequestMessage() {
        return `Hei,

Haluan lisää tietoa seuraavista:

Moduuli: BloomLead webinaarimoduuli 1
Aihe: Projektin taustoitus ja määrittely & Johtaja luo suunnan
Julkaistu: 6.2.2026
Kesto: 1,5 h + harjoitukset
Hinta: 125 € sis.alv tai 125 € + alv yrityshinta

BloomLead webinaarimoduuli 1 sisältää:

• Webinaarimoduuli 1 tallenne, kun maksu on saapunut tilillemme (1-2 päivää maksusta)
• Webinaarimoduulin tallenne ja omaan tahtiin tehtäviä harjoituksia
• Webinaarimoduulin materiaalit
• Sähköpostituki
• Puhelintuki ti ja to klo 17–18
• Mahdollisuus ostaa edullisesti oma coaching-tunti

Odotan tilauksen vahvistamista, maksutietoja ja ohjeita!`;
    }

    getPackageRequestMessage() {
        return `Hei,

Haluan tilata BloomLead webinaaripaketin seuraavasti

Moduuli: BloomLead webinaaripaketti
Aihe: Projektinhallinta ja muutosjohtaminen sekä itsensä ja muiden johtaminen
Julkaistu: 6.2.2026-6/2026
Kesto: 1,5 h + harjoitukset/webinaari
Hinta: 650 € sis. alv tai 650 € + alv yrityshinta

BloomLead webinaaripaketti sisältää:

- Kuuden webinaarimoduulin paketin
- Webinaarimoduuli 1 tallenne, kun maksu on saapunut tilillemme (1-2 päivää maksusta)
- Uusi webinaaripaketti joka kuukausi kuuden kuukauden ajan
- Yksi yhteinen coaching-tunti ohjelman aikana
- Lisäartikkeleita ja materiaalia sähköpostitse ohjelman aikana
- Jokaiseen webinaarimoduliin kuuluvan tallenteen ja omaan tahtiin tehtäviä harjoituksia
- Kuuden webinaarin materiaalit
- Sähköpostituki
- Puhelintuki ti ja to klo 17–18
- Todistuksen ohjelman suorittamisesta

Odotan tilauksen vahvistamista, maksutietoja ja ohjeita!`;
    }

    getPackageOrderMessage(customerType = 'yksityishenkilönä') {
        return `Hei,

Haluan tilata BloomLead webinaaripaketin seuraavasti

Moduuli: BloomLead webinaaripaketti
Aihe: Projektinhallinta ja muutosjohtaminen sekä itsensä ja muiden johtaminen
Julkaistu: 6.2.2026-6/2026
Kesto: 1,5 h + harjoitukset/webinaari
Hinta: 650 € sis. alv tai 650 € + alv yrityshinta

BloomLead webinaaripaketti sisältää:

- Kuuden webinaarimoduulin paketin
- Webinaarimoduuli 1 tallenne, kun maksu on saapunut tilillemme (1-2 päivää maksusta)
- Uusi webinaaripaketti joka kuukausi kuuden kuukauden ajan
- Yksi yhteinen coaching-tunti ohjelman aikana
- Lisäartikkeleita ja materiaalia sähköpostitse ohjelman aikana
- Jokaiseen webinaarimoduliin kuuluvan tallenteen ja omaan tahtiin tehtäviä harjoituksia
- Kuuden webinaarin materiaalit
- Sähköpostituki
- Puhelintuki ti ja to klo 17–18
- Todistuksen ohjelman suorittamisesta

Odotan tilauksen vahvistamista, maksutietoja ja ohjeita!`;
    }
}

// Create global instance
window.BloomLeadEmailHandler = new BloomLeadEmailHandler();

/**
 * Enhanced Email Subscription Manager
 * Handles the UI for email subscription popups
 */
class EmailSubscriptionManager {
    constructor() {
        this.emailPopup = document.getElementById('emailSubscriptionPopup');
        this.emailOverlay = document.getElementById('emailPopupOverlay');
        this.emailCloseBtn = document.getElementById('emailCloseBtn');
        this.editEmailBtn = document.getElementById('editEmailBtn');
        this.sendEmailBtn = document.getElementById('sendEmailBtn');
        this.contactEmail = document.getElementById('contactEmail');
        this.contactName = document.getElementById('contactName');
        this.emailStatusIcon = document.getElementById('emailStatusIcon');
        this.emailMessage = document.getElementById('emailMessage');
        this.emailStatus = document.getElementById('emailStatus');
        this.emailTitle = document.getElementById('emailPopupTitle');
        this.customerTypeHeaderDisplay = document.getElementById('customerTypeHeaderDisplay');
        this.senderEmailDisplay = document.getElementById('senderEmailDisplay');
        
        // Optional elements (might not exist on all pages)
        this.emailSubjectDisplay = document.getElementById('emailSubjectDisplay');
        
        this.isEditing = false;
        this.currentType = null;
        
        if (this.emailPopup) {
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
        if (this.emailCloseBtn) this.emailCloseBtn.addEventListener('click', () => this.closeEmailPopup());
        if (this.emailOverlay) this.emailOverlay.addEventListener('click', () => this.closeEmailPopup());
        if (this.editEmailBtn) this.editEmailBtn.addEventListener('click', () => this.toggleEditMode());
        if (this.sendEmailBtn) this.sendEmailBtn.addEventListener('click', () => this.sendEmail());
        
        // Auto-resize textarea
        if (this.emailMessage) this.emailMessage.addEventListener('input', () => this.autoResizeTextarea());
        
        // Email validation on input
        if (this.contactEmail) {
            this.contactEmail.addEventListener('input', () => {
                this.validateEmail();
                if (this.updateSenderEmailDisplay) this.updateSenderEmailDisplay();
            });
            this.contactEmail.addEventListener('blur', () => this.validateEmail());
        }
        
        // Customer type change
        const customerTypeRadios = document.querySelectorAll('input[name="customerType"]');
        customerTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateCustomerTypeDisplay();
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.emailPopup && this.emailPopup.classList.contains('active')) {
                this.closeEmailPopup();
            }
        });
    }

    validateEmail() {
        if (!this.contactEmail) return;
        
        const email = this.contactEmail.value.trim();
        const emailField = this.contactEmail.parentElement;
        
        // Remove existing validation classes
        emailField.classList.remove('valid', 'invalid');
        
        if (email === '') {
            // Empty field - hide icon and reset styling
            if (this.emailStatusIcon) this.emailStatusIcon.style.display = 'none';
        } else if (this.isValidEmail(email)) {
            // Valid email - show green checkmark
            if (this.emailStatusIcon) {
                this.emailStatusIcon.style.display = 'block';
                this.emailStatusIcon.className = 'fas fa-check-circle status-icon';
                this.emailStatusIcon.style.color = '#10b981';
            }
            emailField.classList.add('valid');
        } else {
            // Invalid email - show red X
            if (this.emailStatusIcon) {
                this.emailStatusIcon.style.display = 'block';
                this.emailStatusIcon.className = 'fas fa-times-circle status-icon';
                this.emailStatusIcon.style.color = '#ef4444';
            }
            emailField.classList.add('invalid');
        }
    }

    updateCustomerTypeDisplay() {
        const customerTypeRadio = document.querySelector('input[name="customerType"]:checked');
        const customerType = customerTypeRadio ? customerTypeRadio.value : 'yksityishenkilönä';
        if (this.customerTypeHeaderDisplay) {
            this.customerTypeHeaderDisplay.textContent = customerType;
        }
    }

    updateSenderEmailDisplay() {
        if (!this.contactEmail) return;
        const email = this.contactEmail.value.trim();
        if (this.senderEmailDisplay) {
            this.senderEmailDisplay.textContent = email || '[Syötä sähköpostisi yllä]';
        }
    }

    autoResizeTextarea() {
        if (!this.emailMessage) return;
        this.emailMessage.style.height = 'auto';
        this.emailMessage.style.height = Math.max(200, this.emailMessage.scrollHeight) + 'px';
    }

    showEmailPopup(type) {
        if (!this.emailPopup) return;
        
        this.currentType = type;
        this.setupEmailContent(type);
        this.emailPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetEditMode();
        
        // Update displays
        this.updateCustomerTypeDisplay();
        this.updateSenderEmailDisplay();
        
        // Auto-resize on show
        setTimeout(() => this.autoResizeTextarea(), 100);
    }

    closeEmailPopup() {
        if (!this.emailPopup) return;
        
        this.emailPopup.classList.remove('active');
        document.body.style.overflow = '';
        this.resetEditMode();
        this.hideStatus();
    }

    setupEmailContent(type) {
        // Clear contact fields
        if (this.contactEmail) this.contactEmail.value = '';
        if (this.contactName) this.contactName.value = '';
        this.validateEmail(); // Reset validation state
        
        // Default logic for subjects/titles if elements exist
        if (type === 'package-order') {
            if (this.emailTitle) this.emailTitle.textContent = 'Tarkista tilaus';
            if (this.emailMessage) {
                 this.emailMessage.value = window.BloomLeadEmailHandler.getPackageOrderMessage('yksityishenkilönä');
            }
        } else if (type === 'module-order') {
            if (this.emailTitle) this.emailTitle.textContent = 'Tarkista tilaus';
            if (this.emailSubjectDisplay) this.emailSubjectDisplay.textContent = 'BloomLead webinaarimoduuli 1 tilaus';
            if (this.emailMessage) {
                this.emailMessage.value = window.BloomLeadEmailHandler.getModuleRequestMessage();
            }
        }
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        
        if (this.isEditing) {
            this.emailMessage.readOnly = false;
            this.editEmailBtn.innerHTML = '<i class="fas fa-save"></i> SAVE';
            this.editEmailBtn.classList.add('editing');
            this.emailMessage.focus();
        } else {
            this.emailMessage.readOnly = true;
            this.editEmailBtn.innerHTML = '<i class="fas fa-edit"></i> EDIT';
            this.editEmailBtn.classList.remove('editing');
            this.showStatus('Changes saved!', 'success', 2000);
        }
        
        // Auto-resize after toggle
        setTimeout(() => this.autoResizeTextarea(), 100);
    }

    resetEditMode() {
        this.isEditing = false;
        if (this.emailMessage) this.emailMessage.readOnly = true;
        if (this.editEmailBtn) {
            this.editEmailBtn.innerHTML = '<i class="fas fa-edit"></i> EDIT';
            this.editEmailBtn.classList.remove('editing');
        }
    }

    async sendEmail() {
        const contactEmail = this.contactEmail ? this.contactEmail.value.trim() : '';
        const contactName = this.contactName ? this.contactName.value.trim() : '';
        const message = this.emailMessage ? this.emailMessage.value.trim() : '';
        
        // Determine subject
        let subject = 'Yhteydenotto';
        if (this.emailSubjectDisplay) {
            subject = this.emailSubjectDisplay.textContent.trim();
        } else if (this.currentType === 'package-order') {
             subject = 'BloomLead webinaaripaketin tilaus';
        } else if (this.currentType === 'module-order') {
             subject = 'BloomLead webinaarimoduuli 1 tilaus';
        }
        
        // Get customer type selection
        const customerTypeRadio = document.querySelector('input[name="customerType"]:checked');
        const customerType = customerTypeRadio ? customerTypeRadio.value : 'yksityishenkilönä';
        
        if (!contactEmail || !contactName || !message) {
            this.showStatus('Täytä kaikki kentät ennen lähettämistä.', 'error');
            return;
        }

        if (!this.isValidEmail(contactEmail)) {
            this.showStatus('Anna kelvollinen sähköpostiosoite.', 'error');
            return;
        }

        this.showStatus('Lähetetään sähköpostia...', 'loading');
        if (this.sendEmailBtn) this.sendEmailBtn.disabled = true;

        try {
            // Prepare email data using unified handler which ensures auto-reply logic
            const emailData = {
                email: contactEmail,
                name: contactName,
                type: this.currentType,
                subject: subject,
                message: message,
                customerType: customerType,
                timestamp: new Date().toISOString()
            };

            // Use the global handler to send
            const result = await window.BloomLeadEmailHandler.sendEmail(emailData);
            
            this.showStatus(result.message || 'Sähköposti lähetetty onnistuneesti! Otamme sinuun yhteyttä pian.', 'success');
            
            // Close popup after successful send
            setTimeout(() => {
                this.closeEmailPopup();
            }, 2000);
            
        } catch (error) {
            console.error('Email sending error:', error);
            this.showStatus(error.message || 'Sähköpostin lähetys epäonnistui. Yritä uudelleen.', 'error');
        } finally {
            if (this.sendEmailBtn) this.sendEmailBtn.disabled = false;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showStatus(message, type, duration = null) {
        if (!this.emailStatus) return;
        
        this.emailStatus.textContent = message;
        this.emailStatus.className = `email-status ${type}`;
        this.emailStatus.style.display = 'block';
        
        // Auto-scroll to show the status message a bit higher
        setTimeout(() => {
            if (this.emailStatus) {
                this.emailStatus.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }, 100);
        
        if (duration) {
            setTimeout(() => this.hideStatus(), duration);
        }
    }

    hideStatus() {
        if (this.emailStatus) this.emailStatus.style.display = 'none';
    }
}

/**
 * Simple email form handler for basic forms
 */
function handleSimpleEmailForm(formElement, requestType = 'info') {
    formElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = formElement.querySelector('input[type="email"]');
        const messageInput = formElement.querySelector('textarea');
        const submitBtn = formElement.querySelector('button[type="submit"]');
        
        if (!emailInput) {
            alert('Email field not found in form');
            return;
        }
        
        const userEmail = emailInput.value.trim();
        const customMessage = messageInput ? messageInput.value.trim() : null;
        
        if (!userEmail) {
            alert('Please enter your email address');
            emailInput.focus();
            return;
        }
        
        if (!window.BloomLeadEmailHandler.isValidEmail(userEmail)) {
            alert('Please enter a valid email address');
            emailInput.focus();
            return;
        }
        
        // Disable submit button
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Lähetetään...';
        
        try {
            const emailData = window.BloomLeadEmailHandler.prepareEmailData(
                requestType, 
                userEmail, 
                customMessage
            );
            
            const result = await window.BloomLeadEmailHandler.sendEmail(emailData);
            
            // Show success message
            alert(result.message || 'Sähköposti lähetetty onnistuneesti! Otamme sinuun yhteyttä pian.');
            
            // Reset form
            formElement.reset();
            
        } catch (error) {
            console.error('Email sending error:', error);
            alert(error.message || 'Sähköpostin lähetys epäonnistui. Yritä uudelleen.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Find and initialize simple email forms (only those with data-email-type attribute)
    const emailForms = document.querySelectorAll('form[data-email-type]');
    emailForms.forEach(form => {
        const requestType = form.getAttribute('data-email-type') || 'info';
        handleSimpleEmailForm(form, requestType);
    });
    
    // Initialize EmailSubscriptionManager after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (document.getElementById('emailSubscriptionPopup')) {
            window.EmailSubscriptionManagerInstance = new EmailSubscriptionManager();
            
            // Expose global helper
            window.showEmailPopup = function(type) {
                if (window.EmailSubscriptionManagerInstance) {
                    window.EmailSubscriptionManagerInstance.showEmailPopup(type);
                }
            };
        }
    }, 100);
    
    console.log('BloomLead Email Handler initialized');
});