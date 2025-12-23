/**
 * Email Modal System for BloomLead
 * Provides cross-platform email functionality with marketing tracking
 * Mobile-optimized to open Gmail app directly
 */

// Mobile detection utility
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Email Modal Functions
function trackContactEmail(source) {
    // Track email click for marketing analytics
    if (typeof WebinarEventTracking !== 'undefined') {
        WebinarEventTracking.trackContactFormSubmission('email_click', {
            source: source,
            email: 'contact@bloomlead.io',
            action: 'mailto_click'
        });
    }
    
    // Also track as a marketing event
    if (typeof MarketingCookies !== 'undefined' && typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
        MarketingCookies.sendMarketingEvent('email_click', {
            source: source,
            email: 'contact@bloomlead.io',
            timestamp: new Date().toISOString()
        });
        
        // Track as conversion for marketing attribution
        MarketingCookies.trackConversion('email_contact', null, {
            source: source,
            contactMethod: 'email',
            page: window.location.pathname
        });
    }
}

function openEmailOptions(email, source) {
    // Track the click first
    trackContactEmail(source);
    
    // Always open Gmail directly (mobile-optimized)
    openGmailMobileOptimized(email);
}

function showEmailModal(email) {
    // Create modal HTML matching the provided design
    const modalHTML = `
        <div id="emailModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Jost', sans-serif;
            animation: fadeIn 0.3s ease-out;
        ">
            <div style="
                background: rgba(80, 80, 80, 0.95);
                border-radius: 12px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
                animation: slideUp 0.3s ease-out;
            ">
                <h3 style="
                    color: white;
                    margin-bottom: 8px;
                    font-size: 22px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                ">Send Email to BloomLead</h3>
                
                <p style="
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 25px;
                    font-size: 14px;
                    font-weight: 400;
                ">Choose how you'd like to send your email:</p>
                
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                    <button onclick="openDefaultEmail('${email}')" style="
                        background: rgba(70, 70, 70, 0.8);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 12px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-align: left;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: 500;
                    " onmouseover="this.style.background='rgba(90, 90, 90, 0.9)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'" 
                       onmouseout="this.style.background='rgba(70, 70, 70, 0.8)'; this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                        <i class="fas fa-envelope" style="font-size: 16px; width: 16px;"></i> Open Default Email Client
                    </button>
                    
                    <button onclick="openGmail('${email}')" style="
                        background: rgba(70, 70, 70, 0.8);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 12px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-align: left;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: 500;
                    " onmouseover="this.style.background='rgba(90, 90, 90, 0.9)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'" 
                       onmouseout="this.style.background='rgba(70, 70, 70, 0.8)'; this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                        <i class="fab fa-google" style="font-size: 16px; width: 16px; color: #ea4335;"></i> Send via Gmail
                    </button>
                    
                    <button onclick="openOutlook('${email}')" style="
                        background: rgba(70, 70, 70, 0.8);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 12px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-align: left;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: 500;
                    " onmouseover="this.style.background='rgba(90, 90, 90, 0.9)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'" 
                       onmouseout="this.style.background='rgba(70, 70, 70, 0.8)'; this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                        <i class="fab fa-microsoft" style="font-size: 16px; width: 16px; color: #0078d4;"></i> Send via Outlook.com
                    </button>
                    
                    <button onclick="openYahoo('${email}')" style="
                        background: rgba(70, 70, 70, 0.8);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 12px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-align: left;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: 500;
                    " onmouseover="this.style.background='rgba(90, 90, 90, 0.9)'; this.style.borderColor='rgba(255, 255, 255, 0.3)'" 
                       onmouseout="this.style.background='rgba(70, 70, 70, 0.8)'; this.style.borderColor='rgba(255, 255, 255, 0.2)'">
                        <i class="fab fa-yahoo" style="font-size: 16px; width: 16px; color: #6001d2;"></i> Send via Yahoo Mail
                    </button>
                    
                    <button onclick="copyToClipboard('${email}')" style="
                        background: #28a745;
                        color: white;
                        border: 1px solid #34ce57;
                        padding: 12px 20px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-align: left;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-weight: 500;
                    " onmouseover="this.style.background='#34ce57'" onmouseout="this.style.background='#28a745'">
                        <i class="fas fa-copy" style="font-size: 16px; width: 16px;"></i> Copy Email Address
                    </button>
                </div>
                
                <button onclick="closeEmailModal()" style="
                    background: rgba(60, 60, 60, 0.8);
                    color: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 8px 20px;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(80, 80, 80, 0.9)'; this.style.color='white'" 
                   onmouseout="this.style.background='rgba(60, 60, 60, 0.8)'; this.style.color='rgba(255, 255, 255, 0.8)'">
                    Cancel
                </button>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        </style>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function openDefaultEmail(email) {
    const subject = encodeURIComponent('Inquiry from BloomLead Website');
    const body = encodeURIComponent('Hello BloomLead Team,\n\nI am interested in learning more about your webinar services.\n\nBest regards');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    closeEmailModal();
}

function openGmail(email) {
    const subject = encodeURIComponent('Inquiry from BloomLead Website');
    const body = encodeURIComponent('Hello BloomLead Team,\n\nI am interested in learning more about your webinar services.\n\nBest regards');
    
    if (isMobileDevice()) {
        // On mobile, use mailto for better compatibility
        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
        const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        
        try {
            window.location.href = mailtoUrl;
        } catch (error) {
            window.open(gmailWebUrl, '_blank');
        }
    } else {
        // Desktop: open web Gmail
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
    }
}

function openGmailMobileOptimized(email) {
    const subject = encodeURIComponent('Inquiry from BloomLead Website');
    const body = encodeURIComponent('Hello BloomLead Team,\n\nI am interested in learning more about your webinar services.\n\nBest regards');
    
    if (isMobileDevice()) {
        // On mobile, prioritize mailto for better compatibility
        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
        const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        
        try {
            // Try mailto first (works with any installed mail app including Gmail)
            window.location.href = mailtoUrl;
        } catch (error) {
            // Fallback to web Gmail
            window.open(gmailWebUrl, '_blank');
        }
        
    } else {
        // Desktop: open web Gmail
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
    }
}

function handleNewsletterSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    
    try {
        const form = event.target;
        const emailInput = form.querySelector('input[type="email"]');
        const userEmail = emailInput.value.trim();
        
        if (!userEmail) {
            alert('Syötä sähköpostiosoitteesi ensin.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            alert('Syötä kelvollinen sähköpostiosoite.');
            return;
        }
        
        // Track the newsletter signup attempt
        if (typeof WebinarEventTracking !== 'undefined') {
            WebinarEventTracking.trackContactFormSubmission('newsletter_signup', {
                source: 'hero-section',
                userEmail: userEmail,
                action: 'gmail_compose'
            });
        }
        
        // Track as marketing event
        if (typeof MarketingCookies !== 'undefined' && typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            MarketingCookies.sendMarketingEvent('newsletter_signup', {
                source: 'hero-section',
                userEmail: userEmail,
                timestamp: new Date().toISOString()
            });
            
            MarketingCookies.trackConversion('newsletter_interest', null, {
                source: 'hero-section',
                contactMethod: 'email',
                page: window.location.pathname
            });
        }
        
        // Open Gmail with pre-filled content - mobile optimized
        const subject = encodeURIComponent('Webinaaritietojen tilaus - BloomLead');
        const body = encodeURIComponent(`Hei BloomLead-tiimi,

Haluaisin tilata webinaaritietoja ja saada lisätietoja palveluistanne.

Olen kiinnostunut erityisesti:
- Webinaarien aikatauluista ja sisällöstä
- Hinnoittelusta ja paketeista
- Räätälöidyistä ratkaisuista yritykselleni

Odotan innolla kuulevani teiltä!

Ystävällisin terveisin`);
        
        if (isMobileDevice()) {
            // On mobile, prioritize mailto for better compatibility
            const mailtoUrl = `mailto:contact@bloomlead.io?subject=${subject}&body=${body}`;
            const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=contact@bloomlead.io&from=${encodeURIComponent(userEmail)}&su=${subject}&body=${body}`;
            
            try {
                // Try mailto first (works with any installed mail app including Gmail)
                window.location.href = mailtoUrl;
            } catch (error) {
                // Fallback to web Gmail
                window.open(gmailWebUrl, '_blank');
            }
            
        } else {
            // Desktop: open web Gmail
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=contact@bloomlead.io&from=${encodeURIComponent(userEmail)}&su=${subject}&body=${body}`;
            window.open(gmailUrl, '_blank');
        }
        
        // Clear the form only - no success message
        emailInput.value = '';
        
    } catch (error) {
        console.error('Error handling newsletter submission:', error);
        alert('Tapahtui virhe. Yritä uudelleen tai ota yhteyttä suoraan osoitteeseen contact@bloomlead.io');
    }
}

function showNewsletterSuccess() {
    try {
        // Create a temporary success message
        const form = document.querySelector('[data-form-type="newsletter"]');
        if (!form) return;
        
        const originalContent = form.innerHTML;
        
        form.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 15px; color: #28a745;">✅</div>
                <h4 style="color: #28a745; margin-bottom: 10px; font-weight: 600;">Gmail avattu!</h4>
                <p style="color: #666; font-size: 14px; margin-bottom: 15px; line-height: 1.4;">
                    Gmail-ikkuna on avattu valmiiksi täytetyllä viestillä.<br>
                    Lähetä viesti saadaksesi webinaaritietoja.
                </p>
                <button onclick="resetNewsletterForm()" style="
                    background: #a571aa; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 5px; 
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s ease;
                " onmouseover="this.style.background='#8e5a96'" onmouseout="this.style.background='#a571aa'">
                    Takaisin lomakkeeseen
                </button>
            </div>
        `;
        
        // Store original content for reset
        form.setAttribute('data-original-content', originalContent);
        
        // Auto-reset after 10 seconds
        setTimeout(() => {
            if (form.getAttribute('data-original-content')) {
                resetNewsletterForm();
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error showing newsletter success:', error);
    }
}

function resetNewsletterForm() {
    try {
        const form = document.querySelector('[data-form-type="newsletter"]');
        if (!form) return;
        
        const originalContent = form.getAttribute('data-original-content');
        
        if (originalContent) {
            form.innerHTML = originalContent;
            form.removeAttribute('data-original-content');
            
            // Re-attach event listener
            form.addEventListener('submit', handleNewsletterSubmit);
        }
    } catch (error) {
        console.error('Error resetting newsletter form:', error);
        // Fallback: reload the page
        window.location.reload();
    }
}

function openOutlook(email) {
    const subject = encodeURIComponent('Inquiry from BloomLead Website');
    const body = encodeURIComponent('Hello BloomLead Team,\n\nI am interested in learning more about your webinar services.\n\nBest regards');
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank');
    closeEmailModal();
}

function openYahoo(email) {
    const subject = encodeURIComponent('Inquiry from BloomLead Website');
    const body = encodeURIComponent('Hello BloomLead Team,\n\nI am interested in learning more about your webinar services.\n\nBest regards');
    const yahooUrl = `https://compose.mail.yahoo.com/?to=${email}&subject=${subject}&body=${body}`;
    window.open(yahooUrl, '_blank');
    closeEmailModal();
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(text);
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showCopySuccess(text);
    } catch (err) {
        alert('Please copy this email address manually: ' + text);
    }
    document.body.removeChild(textArea);
}

function showCopySuccess(email) {
    // Update modal content to show success
    const modal = document.getElementById('emailModal');
    if (modal) {
        const modalContent = modal.querySelector('div > div');
        modalContent.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                <h3 style="color: #28a745; margin-bottom: 15px; font-weight: 600;">Email Address Copied!</h3>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 15px; font-size: 14px;">The email address has been copied to your clipboard:</p>
                <p style="
                    background: rgba(40, 40, 40, 0.8); 
                    padding: 12px; 
                    border-radius: 6px; 
                    font-family: monospace; 
                    color: #28a745; 
                    font-weight: bold;
                    border: 1px solid rgba(40, 167, 69, 0.3);
                    margin-bottom: 15px;
                ">${email}</p>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 13px; margin-bottom: 25px;">You can now paste it in your preferred email application.</p>
                <button onclick="closeEmailModal()" style="
                    background: #28a745;
                    color: white;
                    border: 1px solid #34ce57;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#34ce57'" onmouseout="this.style.background='#28a745'">
                    Done
                </button>
            </div>
        `;
    }
}

// Auto-initialize email links when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Find all spans containing email addresses and make them clickable
    const allSpans = document.querySelectorAll('span');
    allSpans.forEach(span => {
        if (span.textContent.trim() === 'contact@bloomlead.io' && !span.querySelector('a')) {
            // Convert plain text email to clickable link that directly opens Gmail
            const email = 'contact@bloomlead.io';
            const source = 'footer-auto';
            
            span.innerHTML = `<a href="mailto:${email}" 
                                 class="email-clickable"
                                 style="color: inherit; cursor: pointer; text-decoration: underline; text-decoration-color: #777777;"
                                 onclick="openEmailOptions('${email}', '${source}'); return false;">
                                 ${email}
                              </a>`;
        }
    });
    
    // Attach newsletter form handler
    const newsletterForm = document.querySelector('[data-form-type="newsletter"]');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
});

// Make functions globally available
window.openEmailOptions = openEmailOptions;
window.trackContactEmail = trackContactEmail;
window.handleNewsletterSubmit = handleNewsletterSubmit;
window.showNewsletterSuccess = showNewsletterSuccess;
window.resetNewsletterForm = resetNewsletterForm;
window.isMobileDevice = isMobileDevice;
window.openGmailMobileOptimized = openGmailMobileOptimized;

