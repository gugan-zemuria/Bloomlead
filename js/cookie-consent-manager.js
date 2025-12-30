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
                name: 'Välttämättömät evästeet',
                description: 'Nämä evästeet ovat välttämättömiä verkkosivuston toiminnalle, eikä niitä voi poistaa käytöstä.',
                required: true,
                scripts: []
            },
            functional: {
                name: 'Toiminnalliset evästeet',
                description: 'Nämä evästeet mahdollistavat verkkosivuston muistaa valintasi ja parantaa käyttökokemustasi.',
                required: false,
                scripts: ['video-preferences', 'language-selection', 'ui-customization']
            },
            analytics: {
                name: 'Analytiikkaevästeet',
                description: 'Nämä evästeet auttavat meitä ymmärtämään, miten kävijät käyttävät verkkosivustoamme.',
                required: false,
                scripts: ['google-analytics', 'video-analytics', 'user-journey']
            },
            marketing: {
                name: 'Markkinointievästeet',
                description: 'Nämä evästeet mahdollistavat kohdistetun mainonnan ja sosiaalisen median integraation.',
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
        // Check if we're on privacy or terms pages - don't show banner on these pages
        const currentPage = window.location.pathname.toLowerCase();
        const isLegalPage = currentPage.includes('privacy-policy.html') || 
                           currentPage.includes('terms-and-conditions.html');
        
        if (isLegalPage) {
            // On legal pages, don't show banner at all - users need to read these first
            console.log('Legal page detected - cookie banner disabled');
            return;
        }
        
        // Check for existing consent
        this.loadConsent();
        
        // Check if consent is needed
        if (!this.hasValidConsent()) {
            // Check if this is the home page (index.html or root)
            const isHomePage = currentPage.includes('index.html') || 
                              currentPage === '/' || 
                              currentPage === '' ||
                              window.location.pathname === '/' ||
                              window.location.pathname.endsWith('/index.html') ||
                              (window.location.pathname === '' && window.location.hash === '');
            
            if (isHomePage) {
                // Show banner after 3 seconds on home page for better UX
                // Don't block website immediately - let users browse for 1 second
                console.log('Home page detected - showing cookie banner after 0.5 second');
                setTimeout(() => {
                    this.showBanner(false); // Don't block immediately, blocking will be enabled when banner appears
                }, 500);
            } else {
                // Show banner immediately on other pages with blocking
                this.showBanner(true);
            }
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
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            url: window.location.href,
            consentMethod: 'explicit' // GDPR requirement
        };
        
        localStorage.setItem(this.consentKey, JSON.stringify(consentData));
        localStorage.setItem(this.versionKey, this.version);
        
        // Also set a simple cookie for server-side detection
        this.setCookie('cookie_consent', 'granted', 365);
        
        this.currentConsent = consentData;
        this.consentGiven = true;
        
        // Log consent for audit (GDPR compliance)
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

    showBanner(enableBlocking = true) {
        if (document.getElementById('cookie-consent-banner')) {
            return; // Banner already exists
        }

        // Add blocking overlay and blur effect only if requested
        if (enableBlocking) {
            this.enableWebsiteBlocking();
        }

        const banner = this.createBanner();
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
            // If blocking wasn't enabled initially, enable it now that banner is visible
            if (!enableBlocking) {
                this.enableWebsiteBlocking();
            }
        }, 100);
    }

    enableWebsiteBlocking() {
        // Check if we're on privacy or terms pages - don't block these
        const currentPage = window.location.pathname.toLowerCase();
        const isLegalPage = currentPage.includes('privacy-policy.html') || 
                           currentPage.includes('terms-and-conditions.html');
        
        if (isLegalPage) {
            // On legal pages, show banner but don't block content
            document.body.classList.add('cookie-consent-legal-page');
            return;
        }
        
        // Add body class to trigger CSS blocking
        document.body.classList.add('cookie-consent-required');
        
        // Create blocking overlay
        if (!document.getElementById('cookie-blocking-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'cookie-blocking-overlay';
            overlay.className = 'cookie-blocking-overlay active';
            document.body.appendChild(overlay);
        }
        
        // Disable scrolling and interactions
        document.body.style.overflow = 'hidden';
        
        // Block all clicks, keyboard events, and form submissions
        this.blockAllInteractions();
    }

    disableWebsiteBlocking() {
        // Remove body class
        document.body.classList.remove('cookie-consent-required');
        
        // Remove blocking overlay
        const overlay = document.getElementById('cookie-blocking-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Re-enable scrolling
        document.body.style.overflow = '';
        
        // Unblock interactions
        this.unblockAllInteractions();
    }

    blockAllInteractions() {
        // Prevent all clicks outside cookie banner and modal
        this.clickBlocker = (e) => {
            const banner = document.getElementById('cookie-consent-banner');
            const modal = document.getElementById('cookie-preferences-modal');
            
            // Allow clicks within cookie banner or modal
            if ((banner && banner.contains(e.target)) || (modal && modal.contains(e.target))) {
                return true; // Allow the click
            }
            
            // Block all other clicks
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // Prevent keyboard navigation outside cookie elements
        this.keyBlocker = (e) => {
            const banner = document.getElementById('cookie-consent-banner');
            const modal = document.getElementById('cookie-preferences-modal');
            
            // Allow keyboard navigation within cookie banner or modal
            if ((banner && banner.contains(document.activeElement)) || 
                (modal && modal.contains(document.activeElement))) {
                return true; // Allow keyboard navigation
            }
            
            // Allow only Tab, Enter, Space for cookie banner/modal navigation
            if (['Tab', 'Enter', ' '].includes(e.key)) {
                return true;
            }
            
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // Add event listeners with capture to block early
        document.addEventListener('click', this.clickBlocker, true);
        document.addEventListener('keydown', this.keyBlocker, true);
        // Note: Scroll blocking is handled by CSS overflow:hidden on body
    }

    unblockAllInteractions() {
        if (this.clickBlocker) {
            document.removeEventListener('click', this.clickBlocker, true);
            this.clickBlocker = null;
        }
        if (this.keyBlocker) {
            document.removeEventListener('keydown', this.keyBlocker, true);
            this.keyBlocker = null;
        }
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';

        banner.innerHTML = `
            <div class="cookie-popup-content">
                <div class="cookie-banner-text">
                    <h3>🍪 Evästeet</h3>
                    <p>BloomLead käyttää evästeitä ja vastaavia teknologioita sivuston toimivuuden varmistamiseen sekä analytiikkaan, webinaarien seurantaan ja markkinointiin. Välttämättömät evästeet ovat aina käytössä, ja muita evästeitä käytetään vain suostumuksellasi. Voit hyväksyä kaikki evästeet tai hylätä ei-välttämättömät evästeet.</p>
                    <p class="cookie-privacy-link">
                        <a href="privacy-policy.html" target="_blank">Lue lisää tietosuojaselosteesta</a> | 
                        <a href="terms-and-conditions.html" target="_blank">Käyttöehdot</a>
                    </p>
                </div>
                <div class="cookie-banner-actions">
                    <button class="btn-cookie-accept-all" onclick="cookieManager.acceptAll()">
                        Hyväksy kaikki
                    </button>
                    <button class="btn-cookie-reject-all" onclick="cookieManager.rejectAll()">
                        Hylkää ei-välttämättömät
                    </button>
                    <button class="btn-cookie-settings" onclick="cookieManager.showPreferences()">
                        Asetukset
                    </button>
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
        // Don't add overflow hidden here as it's already set by blocking
        
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
                            ${category.required ? '<span class="required-badge">Aina aktiivinen</span>' : ''}
                        </div>
                    </div>
                    <p class="cookie-category-description">${category.description}</p>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="cookie-modal-overlay" onclick="cookieManager.closePreferencesToBanner()"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <h2>Evästeasetukset</h2>
                    <button class="cookie-modal-close" onclick="cookieManager.closePreferencesToBanner()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cookie-modal-body">
                    <p>Voit hallita evästeiden käyttöä alla olevilla asetuksilla. Välttämättömät evästeet ovat aina aktiivisia verkkosivuston toimivuuden varmistamiseksi.</p>
                    <div class="cookie-categories">
                        ${categoriesHTML}
                    </div>
                    
                </div>
                <div class="cookie-modal-footer">
                    <button class="btn-cookie-save" onclick="cookieManager.savePreferences()">
                        Tallenna asetukset
                    </button>
                    <button class="btn-cookie-accept-all" onclick="cookieManager.acceptAll()">
                        Hyväksy kaikki
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    closePreferences() {
        // Only allow closing if consent has been given
        if (!this.hasValidConsent()) {
            return; // Prevent closing without consent
        }
        
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                // Only reset overflow if blocking is not active
                if (!document.body.classList.contains('cookie-consent-required')) {
                    document.body.style.overflow = '';
                }
            }, 300);
        }
    }

    closePreferencesToBanner() {
        // This method closes the modal and returns to the banner (doesn't require consent)
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                // Don't reset overflow as we're returning to the banner with blocking still active
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
        this.disableWebsiteBlocking(); // Remove blocking
        this.applyConsent();
    }

    acceptNecessary() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            categories[key] = this.categories[key].required;
        });
        
        this.saveConsent(categories);
        this.hideBanner();
        this.disableWebsiteBlocking(); // Remove blocking
        this.applyConsent();
    }

    rejectAll() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            categories[key] = this.categories[key].required;
        });
        
        this.saveConsent(categories);
        this.hideBanner();
        this.disableWebsiteBlocking(); // Remove blocking
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
        this.disableWebsiteBlocking(); // Remove blocking
        this.hideBanner();
        this.applyConsent();
    }

    saveCustomPreferences() {
        const categories = {};
        Object.keys(this.categories).forEach(key => {
            const checkbox = document.getElementById(`popup-cookie-${key}`);
            categories[key] = checkbox ? checkbox.checked : this.categories[key].required;
        });
        
        this.saveConsent(categories);
        this.hideBanner();
        this.disableWebsiteBlocking(); // Remove blocking
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
        
        // Ensure website blocking is disabled when applying consent
        this.disableWebsiteBlocking();
        
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
                const modal = document.getElementById('cookie-preferences-modal');
                if (modal && modal.classList.contains('show')) {
                    // If modal is open, close it and return to banner
                    this.closePreferencesToBanner();
                }
            }
        });
    }

    // Public API methods
    withdrawConsent() {
        // Log withdrawal for audit trail (GDPR requirement)
        const withdrawalData = {
            action: 'consent_withdrawn',
            timestamp: new Date().toISOString(),
            previousConsent: this.currentConsent,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('Cookie consent withdrawn:', withdrawalData);
        
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
        
        // Reload page to ensure all tracking stops
        setTimeout(() => {
            window.location.reload();
        }, 1000);
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