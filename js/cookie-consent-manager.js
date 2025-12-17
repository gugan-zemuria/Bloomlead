/**
 * GDPR-Compliant Cookie Consent Manager for BloomLead Webinar Site
 * Handles EU legal requirements with granular control and script blocking
 */

class CookieConsentManager {
    constructor() {
        this.version = '1.0.0';
        this.consentKey = 'bloomlead_cookie_consent';
        this.versionKey = 'bloomlead_consent_version';
        this.categories = {
            necessary: {
                name: 'Necessary Cookies',
                description: 'These cookies are essential for the website to function and cannot be disabled.',
                required: true,
                scripts: []
            },
            functional: {
                name: 'Functional Cookies',
                description: 'These cookies enable the website to remember your preferences and improve your experience.',
                required: false,
                scripts: ['video-preferences', 'language-selection', 'ui-customization']
            },
            analytics: {
                name: 'Analytics Cookies',
                description: 'These cookies help us understand how visitors use our website.',
                required: false,
                scripts: ['google-analytics', 'video-analytics', 'user-journey']
            },
            marketing: {
                name: 'Marketing Cookies',
                description: 'These cookies enable targeted advertising and social media integration.',
                required: false,
                scripts: ['facebook-pixel', 'google-ads', 'linkedin-insight', 'retargeting']
            }
        };
        
        this.blockedScripts = new Set();
        this.consentGiven = false;
        this.currentConsent = null;
        
        this.init();
    }

    init() {
        // Check for existing consent
        this.loadConsent();
        
        // Check if consent is needed
        if (!this.hasValidConsent()) {
            this.showBanner();
        } else {
            this.applyConsent();
        }
        
        // Block scripts until consent
        this.blockScripts();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    hasValidConsent() {
        const consent = localStorage.getItem(this.consentKey);
        const version = localStorage.getItem(this.versionKey);
        
        if (!consent || version !== this.version) {
            return false;
        }
        
        try {
            const consentData = JSON.parse(consent);
            return consentData && consentData.timestamp && consentData.categories;
        } catch (e) {
            return false;
        }
    }

    loadConsent() {
        try {
            const consent = localStorage.getItem(this.consentKey);
            if (consent) {
                this.currentConsent = JSON.parse(consent);
                this.consentGiven = true;
            }
        } catch (e) {
            console.warn('Failed to load consent data:', e);
        }
    }

    saveConsent(categories) {
        const consentData = {
            categories: categories,
            timestamp: new Date().toISOString(),
            version: this.version,
            userAgent: navigator.userAgent
        };
        
        localStorage.setItem(this.consentKey, JSON.stringify(consentData));
        localStorage.setItem(this.versionKey, this.version);
        
        // Also set a simple cookie for server-side detection
        this.setCookie('cookie_consent', 'granted', 365);
        
        this.currentConsent = consentData;
        this.consentGiven = true;
        
        // Log consent for audit
        this.logConsent(consentData);
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    logConsent(consentData) {
        // Log consent for audit purposes
        console.log('Cookie consent granted:', consentData);
        
        // You can extend this to send to your analytics or audit system
        if (window.gtag && consentData.categories.analytics) {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    showBanner() {
        if (document.getElementById('cookie-consent-banner')) {
            return; // Banner already exists
        }

        const banner = this.createBanner();
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3>Cookie Usage</h3>
                    <p>We use cookies to enable our interactive webinars, live chat support, and video streaming features. Choose which you allow.</p>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn-cookie-settings" onclick="cookieManager.showPreferences()">
                        Cookie Settings
                    </button>
                    <button class="btn-cookie-reject-all" onclick="cookieManager.rejectAll()">
                        Reject All
                    </button>
                    <button class="btn-cookie-accept-all" onclick="cookieManager.acceptAll()">
                        Accept All
                    </button>
                </div>
                <div class="cookie-banner-links">
                    <a href="privacy-policy.html" target="_blank">Privacy Policy</a>
                </div>
            </div>
        `;
        
        return banner;
    }

    showPreferences() {
        if (document.getElementById('cookie-preferences-modal')) {
            return; // Modal already exists
        }

        const modal = this.createPreferencesModal();
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    createPreferencesModal() {
        const modal = document.createElement('div');
        modal.id = 'cookie-preferences-modal';
        modal.className = 'cookie-preferences-modal';
        
        let categoriesHTML = '';
        Object.keys(this.categories).forEach(key => {
            const category = this.categories[key];
            const isChecked = this.currentConsent ? 
                (this.currentConsent.categories[key] || category.required) : 
                category.required;
            
            categoriesHTML += `
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <label class="cookie-toggle">
                            <input type="checkbox" 
                                   id="cookie-${key}" 
                                   ${isChecked ? 'checked' : ''} 
                                   ${category.required ? 'disabled' : ''}
                                   data-category="${key}">
                            <span class="cookie-toggle-slider"></span>
                        </label>
                        <div class="cookie-category-info">
                            <h4>${category.name}</h4>
                            ${category.required ? '<span class="required-badge">Always Active</span>' : ''}
                        </div>
                    </div>
                    <p class="cookie-category-description">${category.description}</p>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="cookie-modal-overlay" onclick="cookieManager.closePreferences()"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <h2>Cookie Settings</h2>
                    <button class="cookie-modal-close" onclick="cookieManager.closePreferences()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cookie-modal-body">
                    <p>You can manage cookie usage with the settings below. Necessary cookies are always active to ensure website functionality.</p>
                    <div class="cookie-categories">
                        ${categoriesHTML}
                    </div>
                </div>
                <div class="cookie-modal-footer">
                    <button class="btn-cookie-save" onclick="cookieManager.savePreferences()">
                        Save Settings
                    </button>
                    <button class="btn-cookie-accept-all" onclick="cookieManager.acceptAll()">
                        Accept All
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    closePreferences() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    acceptAll() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            categories[key] = true;
        });
        
        this.saveConsent(categories);
        this.hideBanner();
        this.closePreferences();
        this.applyConsent();
    }

    acceptNecessary() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            categories[key] = this.categories[key].required;
        });
        
        this.saveConsent(categories);
        this.hideBanner();
        this.applyConsent();
    }

    rejectAll() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            categories[key] = this.categories[key].required;
        });
        
        this.saveConsent(categories);
        this.hideBanner();
        this.applyConsent();
    }

    savePreferences() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            const checkbox = document.getElementById(`cookie-${key}`);
            categories[key] = checkbox ? checkbox.checked : this.categories[key].required;
        });
        
        this.saveConsent(categories);
        this.closePreferences();
        this.hideBanner();
        this.applyConsent();
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    applyConsent() {
        if (!this.currentConsent) return;
        
        // Enable allowed scripts
        Object.keys(this.categories).forEach(categoryKey => {
            if (this.currentConsent.categories[categoryKey]) {
                this.enableCategoryScripts(categoryKey);
            }
        });
        
        // Trigger consent update event
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: this.currentConsent
        }));
    }

    enableCategoryScripts(category) {
        const scripts = this.categories[category].scripts;
        scripts.forEach(scriptId => {
            this.enableScript(scriptId);
        });
    }

    blockScripts() {
        // Block Google Analytics
        if (!this.hasConsentFor('analytics')) {
            this.blockScript('google-analytics');
        }
        
        // Block marketing scripts
        if (!this.hasConsentFor('marketing')) {
            this.blockScript('facebook-pixel');
            this.blockScript('google-ads');
        }
    }

    blockScript(scriptId) {
        this.blockedScripts.add(scriptId);
        
        // Remove existing script if present
        const existingScript = document.querySelector(`[data-script-id="${scriptId}"]`);
        if (existingScript) {
            existingScript.remove();
        }
    }

    enableScript(scriptId) {
        if (!this.blockedScripts.has(scriptId)) return;
        
        this.blockedScripts.delete(scriptId);
        
        // Load script based on ID
        switch (scriptId) {
            case 'google-analytics':
                this.loadGoogleAnalytics();
                break;
            case 'facebook-pixel':
                this.loadFacebookPixel();
                break;
            case 'video-analytics':
                this.enableVideoAnalytics();
                break;
            // Add more scripts as needed
        }
    }

    hasConsentFor(category) {
        return this.currentConsent && this.currentConsent.categories[category];
    }

    loadGoogleAnalytics() {
        // Example Google Analytics loading
        if (window.gtag) return; // Already loaded
        
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        script.setAttribute('data-script-id', 'google-analytics');
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    }

    loadFacebookPixel() {
        // Example Facebook Pixel loading
        if (window.fbq) return; // Already loaded
        
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
    }

    enableVideoAnalytics() {
        // Enable video tracking
        window.videoAnalyticsEnabled = true;
    }

    setupEventListeners() {
        // Listen for consent changes
        window.addEventListener('cookieConsentUpdated', (event) => {
            console.log('Cookie consent updated:', event.detail);
        });
        
        // Handle escape key for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreferences();
            }
        });
    }

    // Public API methods
    withdrawConsent() {
        localStorage.removeItem(this.consentKey);
        localStorage.removeItem(this.versionKey);
        this.currentConsent = null;
        this.consentGiven = false;
        
        // Remove consent cookie
        this.setCookie('cookie_consent', '', -1);
        
        // Show banner again
        this.showBanner();
        
        // Block all scripts
        this.blockScripts();
    }

    getConsent() {
        return this.currentConsent;
    }

    hasConsent(category = null) {
        if (!this.currentConsent) return false;
        
        if (category) {
            return this.currentConsent.categories[category] || false;
        }
        
        return this.consentGiven;
    }
}

// Initialize the cookie consent manager
let cookieManager;
document.addEventListener('DOMContentLoaded', function() {
    cookieManager = new CookieConsentManager();
    
    // Make it globally available
    window.cookieManager = cookieManager;
});