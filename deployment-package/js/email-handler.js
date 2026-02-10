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

Haluan tilata BloomLead webinaarimoduuli 1 seuraavasti

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
 * Extends the existing system with real email sending
 */
if (typeof EmailSubscriptionManager !== 'undefined') {
    // Extend the existing EmailSubscriptionManager class
    const originalSendEmail = EmailSubscriptionManager.prototype.sendEmail;
    
    EmailSubscriptionManager.prototype.sendEmail = async function() {
        const contactEmail = this.contactEmail.value.trim();
        const subject = this.emailSubjectDisplay.textContent.trim();
        const message = this.emailMessage.value.trim();
        
        if (!contactEmail || !subject || !message) {
            this.showStatus('Please fill all fields before sending.', 'error');
            return;
        }

        if (!window.BloomLeadEmailHandler.isValidEmail(contactEmail)) {
            this.showStatus('Please enter a valid email address.', 'error');
            return;
        }

        this.showStatus('Sending email...', 'loading');
        this.sendEmailBtn.disabled = true;

        try {
            // Prepare email data
            const emailData = window.BloomLeadEmailHandler.prepareEmailData(
                this.currentType, 
                contactEmail, 
                message
            );

            // Send via PHP backend
            const result = await window.BloomLeadEmailHandler.sendEmail(emailData);
            
            this.showStatus(result.message || 'Email sent successfully! We will contact you soon.', 'success');
            
            // Close popup after successful send
            setTimeout(() => {
                this.closeEmailPopup();
            }, 2000);
            
        } catch (error) {
            console.error('Email sending error:', error);
            this.showStatus(error.message || 'Failed to send email. Please try again.', 'error');
        } finally {
            this.sendEmailBtn.disabled = false;
        }
    };
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
        submitBtn.textContent = 'Sending...';
        
        try {
            const emailData = window.BloomLeadEmailHandler.prepareEmailData(
                requestType, 
                userEmail, 
                customMessage
            );
            
            const result = await window.BloomLeadEmailHandler.sendEmail(emailData);
            
            // Show success message
            alert(result.message || 'Email sent successfully! We will contact you soon.');
            
            // Reset form
            formElement.reset();
            
        } catch (error) {
            console.error('Email sending error:', error);
            alert(error.message || 'Failed to send email. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Auto-initialize email forms on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find and initialize simple email forms (only those with data-email-type attribute)
    const emailForms = document.querySelectorAll('form[data-email-type]');
    emailForms.forEach(form => {
        const requestType = form.getAttribute('data-email-type') || 'info';
        handleSimpleEmailForm(form, requestType);
    });
    
    console.log('BloomLead Email Handler initialized - found', emailForms.length, 'email forms');
});