/**
 * Cookie Credentials Configuration for BloomLead
 * Now uses centralized Config system for credential management
 */

const CookieCredentials = {
    // Delegate to Config system
    get analytics() {
        return window.Config ? window.Config.analytics : {};
    },

    get marketing() {
        return window.Config ? window.Config.marketing : {};
    },

    get functional() {
        return window.Config ? window.Config.functional : {};
    },

    // ==========================================
    // CREDENTIAL VALIDATION (Delegate to Config)
    // ==========================================
    validateCredentials() {
        if (!window.Config) {
            console.warn('Config system not loaded');
            return { valid: [], invalid: [], missing: [] };
        }
        
        return window.Config.getStatus();
    },

    isValidCredential(credential) {
        return window.Config ? window.Config.isValidCredential(credential) : false;
    },

    // ==========================================
    // CREDENTIAL SETUP HELPERS (Delegate to Config)
    // ==========================================
    setCredential(category, service, credentialType, value) {
        return window.Config ? 
            window.Config.setCredential(category, service, credentialType, value) : false;
    },

    enableService(category, service) {
        return window.Config ? window.Config.enableService(category, service) : false;
    },

    disableService(category, service) {
        return window.Config ? window.Config.disableService(category, service) : false;
    },

    // ==========================================
    // GET CREDENTIAL METHODS (Delegate to Config)
    // ==========================================
    getGoogleAnalyticsId() {
        return window.Config ? window.Config.getGoogleAnalyticsId() : null;
    },

    getFacebookPixelId() {
        return window.Config ? window.Config.getFacebookPixelId() : null;
    },

    getGoogleAdsId() {
        return window.Config ? window.Config.getGoogleAdsId() : null;
    },

    getLinkedInPartnerId() {
        return window.Config ? window.Config.getLinkedInPartnerId() : null;
    },

    // ==========================================
    // SETUP INSTRUCTIONS
    // ==========================================
    getSetupInstructions() {
        return {
            note: "Now using centralized Config system. Use Config.setCredential() instead.",
            analytics: {
                googleTagManager: {
                    steps: [
                        '1. Go to tagmanager.google.com',
                        '2. Create account and container',
                        '3. Copy Container ID (GTM-XXXXXXX)',
                        '4. Use: Config.setCredential("analytics", "googleTagManager", "containerId", "GTM-XXXXXXX")'
                    ]
                },
                hotjar: {
                    steps: [
                        '1. Go to hotjar.com',
                        '2. Create account and add site',
                        '3. Copy Site ID from tracking code',
                        '4. Use: Config.setCredential("analytics", "hotjar", "siteId", "1234567")'
                    ]
                }
            },
            marketing: {
                googleAds: {
                    steps: [
                        '1. Go to ads.google.com',
                        '2. Create conversion action',
                        '3. Copy Conversion ID (AW-1234567890)',
                        '4. Use: Config.setCredential("marketing", "googleAds", "conversionId", "AW-1234567890")'
                    ]
                },
                linkedinAds: {
                    steps: [
                        '1. Go to linkedin.com/campaignmanager',
                        '2. Go to Account Assets → Insight Tag',
                        '3. Copy Partner ID',
                        '4. Use: Config.setCredential("marketing", "linkedinAds", "partnerId", "1234567")'
                    ]
                }
            }
        };
    },

    // ==========================================
    // PRINT CURRENT STATUS (Delegate to Config)
    // ==========================================
    printStatus() {
        if (window.Config) {
            window.Config.printStatus();
        } else {
            console.warn('Config system not loaded. Please ensure config.js is loaded first.');
        }
    }
};

// Make available globally
window.CookieCredentials = CookieCredentials;

// Auto-print status on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        CookieCredentials.printStatus();
    }, 1000);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieCredentials;
}