/**
 * BloomLead Email Handler
 * Enhanced JavaScript for real email sending via PHP backend
 */

/**
 * BloomLead lead webhook (LLM Controls automation).
 * All page forms POST their lead here as JSON. The webhook processes
 * everything asynchronously and replies with HTTP 202 Accepted, which
 * we treat as a successful submission.
 */
const BLOOMLEAD_WEBHOOK_URL = 'https://dev-beta-api.llmcontrols.ai/api/v1/webhook/85af0161-8207-4859-b430-7b85c7520639';
const BLOOMLEAD_WEBHOOK_API_KEY = 'sk-w1hmWU3Y6P93wuzY6TvdDDydf4sipyTBjMDXcFuiZeg';
async function sendToBloomLeadWebhook(payload) {
    const response = await fetch(BLOOMLEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': BLOOMLEAD_WEBHOOK_API_KEY
        },
        body: JSON.stringify(payload)
    });

    // 202 Accepted = queued for async processing. Treat any 2xx as success.
    if (response.status === 202 || response.ok) {
        return true;
    }

    throw new Error('Webhook responded with status ' + response.status);
}

/**
 * Resolves the webhook "page_source" from the current URL.
 * IMPORTANT: check "courses-details" before "courses" (substring overlap).
 */
function getBloomLeadPageSource() {
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('courses-details')) return 'course_details';
    if (path.includes('courses')) return 'courses';
    return 'home';
}

/** Maps the Finnish radio value to the English customer_type the webhook expects. */
function mapCustomerType(value) {
    return value === 'yrityksenä' ? 'As a Company' : 'As an Individual';
}

/**
 * Returns the module the current page represents, resolved from the module
 * registry (js/module-config.js). Falls back to the legacy inline object or
 * Module 1 so the handler still works on pages that predate the registry.
 */
function getBloomLeadActiveModule() {
    if (typeof window.getBloomLeadModule === 'function') {
        return window.getBloomLeadModule();
    }
    return window.BLOOMLEAD_MODULE_DATA || null;
}

/**
 * Resolves the webhook "module_type" from the popup order type.
 * The user never picks a module — it's fixed per page/order:
 *   - package-order → the whole six-module package
 *   - module-order  → the module this page represents (from the registry)
 * A page can still force a value with window.BLOOMLEAD_MODULE_TYPE.
 */
function getBloomLeadModuleType(type) {
    if (window.BLOOMLEAD_MODULE_TYPE) return window.BLOOMLEAD_MODULE_TYPE;
    if (type === 'package-order') return 'Whole Package';
    if (type === 'module-order') {
        var module = getBloomLeadActiveModule();
        if (module && module.typeLabel) return module.typeLabel;
        return 'Module 1 - Projektin taustoitus ja määrittely & Johtaja luo suunnan';
    }
    return '';
}

window.sendToBloomLeadWebhook = sendToBloomLeadWebhook;
window.getBloomLeadPageSource = getBloomLeadPageSource;
window.mapCustomerType = mapCustomerType;
window.getBloomLeadModuleType = getBloomLeadModuleType;
window.getBloomLeadActiveModule = getBloomLeadActiveModule;

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
        // Only meaningful for single-module orders/inquiries; sent to the PHP
        // backend so it can label the email with the real module (not always 1).
        let moduleNumber = null;

        switch (type) {
            case 'info':
                subject = 'Tiedustelu: Lisätietoja BloomLead webinaarista';
                message = customMessage || this.getInfoRequestMessage();
                break;

            case 'module': {
                const module = this.getActiveModule();
                moduleNumber = module && module.number ? module.number : 1;
                subject = `BloomLead webinaarimoduuli ${moduleNumber} lisätietokysely`;
                message = customMessage || this.getModuleRequestMessage(module);
                break;
            }

            case 'package':
                subject = 'BloomLead webinaaripaketti lisätietokysely'.toLowerCase();
                message = customMessage || this.getPackageRequestMessage();
                break;

            case 'package-order':
                subject = 'BloomLead webinaaripaketin tilaus';
                message = customMessage || this.getPackageOrderMessage(customerType);
                break;

            case 'module-order': {
                const module = this.getActiveModule();
                moduleNumber = module && module.number ? module.number : 1;
                subject = `BloomLead webinaarimoduuli ${moduleNumber} tilaus`;
                message = customMessage || this.getModuleOrderMessage(module);
                break;
            }

            default:
                subject = 'Yhteydenotto BloomLead-sivustolta';
                message = customMessage || 'Yleinen yhteydenotto sivustolta.';
        }

        return {
            email: userEmail,
            type: type,
            subject: subject,
            message: message,
            moduleNumber: moduleNumber,
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

    /**
     * Returns the module the current page represents (from the registry),
     * with a Module 1 fallback so message builders always have real values.
     */
    getActiveModule() {
        const module = window.getBloomLeadActiveModule
            ? window.getBloomLeadActiveModule()
            : (window.BLOOMLEAD_MODULE_DATA || null);

        return module || {
            number: 1,
            title: 'Projektin taustoitus ja määrittely & Johtaja luo suunnan',
            date: '6.2.2026',
            priceIndividual: '125 € sis.alv',
            priceCompany: '125 € + alv'
        };
    }

    getModuleRequestMessage(module = null) {
        const m = module || this.getActiveModule();
        return `Hei,

Haluan lisää tietoa seuraavista:

Moduuli: BloomLead webinaarimoduuli ${m.number}
Aihe: ${m.title}
Julkaistu: ${m.date}
Kesto: 1,5 h + harjoitukset
Hinta: ${m.priceIndividual} tai ${m.priceCompany} yrityshinta

BloomLead webinaarimoduuli ${m.number} sisältää:

• Webinaarimoduuli ${m.number} tallenne, kun maksu on saapunut tilillemme (1-2 päivää maksusta)
• Webinaarimoduulin tallenne ja omaan tahtiin tehtäviä harjoituksia
• Webinaarimoduulin materiaalit
• Sähköpostituki
• Mahdollisuus ostaa edullisesti oma coaching-tunti

Odotan tilauksen vahvistamista, maksutietoja ja ohjeita!`;
    }

    getModuleOrderMessage(module = null) {
        const m = module || this.getActiveModule();
        return `Hei,

Haluan tilata webinaari moduuli ${m.number} seuraavasti:

Moduuli: BloomLead webinaarimoduuli ${m.number}
Aihe: ${m.title}
Julkaistu: ${m.date}
Kesto: 1,5 h + harjoitukset
Hinta: ${m.priceIndividual} tai ${m.priceCompany} yrityshinta

BloomLead webinaarimoduuli ${m.number} sisältää:

• Webinaarimoduuli ${m.number} tallenne, kun maksu on saapunut tilillemme (1-2 päivää maksusta)
• Webinaarimoduulin tallenne ja omaan tahtiin tehtäviä harjoituksia
• Webinaarimoduulin materiaalit
• Sähköpostituki
• Mahdollisuus ostaa edullisesti oma coaching-tunti

Odotan tilauksen vahvistamista, maksutietoja ja ohjeita!`;
    }

    getPackageRequestMessage() {
        return `Hei,

Haluan lisää tietoa seuraavista:

Moduuli: BloomLead webinaaripaketti
Aihe: Projektinhallinta ja muutosjohtaminen sekä itsensä ja muiden johtaminen
Julkaistu: 6.2.2026-10/2026
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
- Todistuksen ohjelman suorittamisesta

Odotan tilauksen vahvistamista, maksutietoja ja ohjeita!`;
    }

    getPackageOrderMessage(customerType = 'yksityishenkilönä') {
        return `Hei,

Haluan tilata BloomLead webinaaripaketin seuraavasti

Moduuli: BloomLead webinaaripaketti
Aihe: Projektinhallinta ja muutosjohtaminen sekä itsensä ja muiden johtaminen
Julkaistu: 6.2.2026-10/2026
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

        if (type === 'package-order') {
            if (this.emailTitle) this.emailTitle.textContent = 'Tarkista tilaus';
        } else if (type === 'module-order') {
            if (this.emailTitle) this.emailTitle.textContent = 'Tarkista tilaus';
            const module = window.getBloomLeadModule ? window.getBloomLeadModule() : null;
            if (module && this.emailSubjectDisplay) {
                this.emailSubjectDisplay.textContent = `BloomLead webinaarimoduuli ${module.number} tilaus`;
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

        if (!contactEmail) {
            this.showStatus('Syötä sähköpostiosoite.', 'error');
            return;
        }

        if (!this.isValidEmail(contactEmail)) {
            this.showStatus('Anna kelvollinen sähköpostiosoite.', 'error');
            return;
        }

        // Get customer type selection
        const customerTypeRadio = document.querySelector('input[name="customerType"]:checked');
        const customerType = customerTypeRadio ? customerTypeRadio.value : 'yksityishenkilönä';
        const webhookCustomerType = customerType === 'yrityksenä' ? 'As a Company' : 'As an Individual';

        // Build module_type based on order type
        let webhookModuleType = 'Whole Package';
        if (this.currentType === 'module-order') {
            const orderedModule = window.getBloomLeadModule ? window.getBloomLeadModule() : null;
            const modNum = orderedModule && orderedModule.number ? orderedModule.number : 1;
            webhookModuleType = 'Module ' + modNum;
        }

        this.showStatus('Lähetetään...', 'loading');
        if (this.sendEmailBtn) this.sendEmailBtn.disabled = true;

        try {
            await window.sendToBloomLeadWebhook({
                email: contactEmail,
                page_source: 'courses',
                customer_type: webhookCustomerType,
                module_type: webhookModuleType
            });

            this.showStatus('Kiitos! Saat pian lisätietoja sähköpostiisi.', 'success');

            setTimeout(() => {
                this.closeEmailPopup();
            }, 2000);

        } catch (error) {
            console.error('Webhook submission error:', error);
            this.showStatus('Lähetys epäonnistui. Yritä uudelleen.', 'error');
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

            // Expose the instance as `emailManager` so inline handlers
            // (e.g. the Peruuta/Cancel button) can call it directly.
            window.emailManager = window.EmailSubscriptionManagerInstance;

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