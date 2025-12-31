/**
 * Strictly Necessary Cookies Manager
 * Core functionality only - no UI, just essential cookie operations
 * Mimics backend session/CSRF management in frontend
 */

class NecessaryCookiesManager {
    constructor() {
        this.secretKey = this.generateSecret();
        this.init();
    }

    init() {
        // 1. Session Cookie (Identity)
        this.initSession();
        
        // 2. CSRF Token (Security)
        this.initCSRF();
        
        // 3. Consent Status Cookie (Legal)
        this.initConsentStatus();
    }

    /**
     * 1. SESSION COOKIE (Strictly Necessary: Identity)
     * Like Express session - encrypted session ID
     */
    initSession() {
        if (!this.getCookie('webinar_session')) {
            const sessionId = 'sess_' + this.generateSecureId(32);
            this.setCookie('webinar_session', sessionId, null, true, {
                httpOnly: false, // Frontend needs access
                secure: location.protocol === 'https:',
                sameSite: 'Strict'
            });
            sessionStorage.setItem('session_start', Date.now());
        }
    }

    /**
     * 2. CSRF TOKEN (Strictly Necessary: Security)
     * Like doubleCsrf - prevents CSRF attacks
     */
    initCSRF() {
        if (!this.getCookie('x-csrf-token')) {
            const csrfToken = this.generateCSRFToken();
            this.setCookie('x-csrf-token', csrfToken, 1, false, {
                httpOnly: false, // Forms need access
                secure: location.protocol === 'https:',
                sameSite: 'Strict'
            });
            this.setCSRFMetaTag(csrfToken);
            this.setupCSRFProtection(csrfToken);
        }
    }

    /**
     * 3. CONSENT STATUS COOKIE (Strictly Necessary: Legal)
     * Remembers user's cookie choice
     */
    initConsentStatus() {
        if (!this.getCookie('cookie_consent_status')) {
            this.setCookie('cookie_consent_status', 'pending', 365, false, {
                secure: location.protocol === 'https:',
                sameSite: 'Lax'
            });
        }
    }

    /**
     * Generate CSRF token using double-submit pattern
     */
    generateCSRFToken() {
        const timestamp = Date.now().toString(36);
        const random = this.generateSecureId(32);
        return btoa(timestamp + '.' + random).replace(/[+/=]/g, '');
    }

    /**
     * Setup CSRF protection (like doubleCsrf middleware)
     */
    setupCSRFProtection(token) {
        // Add to all forms
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('form').forEach(form => {
                if (!form.querySelector('input[name="_csrf"]')) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = '_csrf';
                    input.value = token;
                    form.appendChild(input);
                }
            });
        });

        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (options.method && !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method.toUpperCase())) {
                options.headers = options.headers || {};
                options.headers['X-CSRF-Token'] = token;
            }
            return originalFetch(url, options);
        };
    }

    /**
     * Set CSRF token in meta tag
     */
    setCSRFMetaTag(token) {
        let meta = document.querySelector('meta[name="csrf-token"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'csrf-token';
            document.head.appendChild(meta);
        }
        meta.content = token;
    }

    /**
     * Generate cryptographically secure secret
     */
    generateSecret() {
        return this.generateSecureId(64);
    }



    /**
     * Generate cryptographically secure random ID
     */
    generateSecureId(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Use crypto.getRandomValues if available
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            for (let i = 0; i < length; i++) {
                result += chars[array[i] % chars.length];
            }
        } else {
            // Fallback to Math.random (less secure)
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        return result;
    }

    /**
     * Set cookie with security options (like Express session)
     */
    setCookie(name, value, days = null, sessionOnly = false, options = {}) {
        let cookieString = `${name}=${value}`;
        
        if (!sessionOnly && days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            cookieString += `; expires=${date.toUTCString()}`;
        }
        
        cookieString += '; path=/';
        
        if (options.secure !== false) {
            cookieString += options.secure ? '; Secure' : '';
        }
        
        if (options.sameSite) {
            cookieString += `; SameSite=${options.sameSite}`;
        }
        
        document.cookie = cookieString;
    }

    /**
     * Get cookie value
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Update consent status
     */
    updateConsentStatus(status) {
        this.setCookie('cookie_consent_status', status, 365, false, {
            secure: location.protocol === 'https:',
            sameSite: 'Lax'
        });
    }

    /**
     * Get current consent status
     */
    getConsentStatus() {
        return this.getCookie('cookie_consent_status') || 'pending';
    }

    /**
     * Get session ID
     */
    getSessionId() {
        return this.getCookie('webinar_session');
    }

    /**
     * Get CSRF token for forms/AJAX
     */
    getCSRFToken() {
        return this.getCookie('x-csrf-token');
    }
}

// Initialize immediately (like Express middleware)
const necessaryCookies = new NecessaryCookiesManager();

// Expose minimal API
window.NecessaryCookies = {
    getSessionId: () => necessaryCookies.getSessionId(),
    getCSRFToken: () => necessaryCookies.getCSRFToken(),
    updateConsentStatus: (status) => necessaryCookies.updateConsentStatus(status),
    getConsentStatus: () => necessaryCookies.getConsentStatus()
};