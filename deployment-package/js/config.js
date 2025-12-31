/**
 * Configuration Management for BloomLead
 * Centralized credential management for client-side applications
 */

const Config = {
    // ==========================================
    // ANALYTICS CREDENTIALS
    // ==========================================
    analytics: {
        googleAnalytics: {
            trackingId: 'G-T4HP0LG8Z3', // ✅ CONFIGURED - Production value
            enabled: true
        },
        googleTagManager: {
            containerId: 'GTM-XXXXXXX', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        hotjar: {
            siteId: '1234567', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        microsoftClarity: {
            projectId: 'abcdefghij', // ❌ NEEDS CREDENTIAL
            enabled: false
        }
    },

    // ==========================================
    // MARKETING CREDENTIALS
    // ==========================================
    marketing: {
        facebookPixel: {
            pixelId: 'YOUR_FACEBOOK_PIXEL_ID', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        googleAds: {
            conversionId: 'AW-CONVERSION_ID', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        linkedinAds: {
            partnerId: 'YOUR_LINKEDIN_PARTNER_ID', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        twitterAds: {
            pixelId: 'o1234', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        tiktokAds: {
            pixelId: 'C4A1B2C3D4E5F6', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        pinterestAds: {
            tagId: '2612345678901', // ❌ NEEDS CREDENTIAL
            enabled: false
        }
    },

    // ==========================================
    // FUNCTIONAL CREDENTIALS
    // ==========================================
    functional: {
        intercom: {
            appId: 'abcd1234', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        zendesk: {
            key: 'your-zendesk-key', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        hubspot: {
            portalId: '1234567', // ❌ NEEDS CREDENTIAL
            enabled: false
        },
        mailchimp: {
            audienceId: 'abcd123456', // ❌ NEEDS CREDENTIAL
            enabled: false
        }
    },

    // ==========================================
    // ENVIRONMENT SETTINGS
    // ==========================================
    environment: {
        nodeEnv: 'production', // Default to production for client-side
        debugMode: false, // Default to false for client-side
        isDevelopment: function() {
            return this.nodeEnv === 'development' || window.location.hostname === 'localhost';
        },
        isProduction: function() {
            return this.nodeEnv === 'production' && window.location.hostname !== 'localhost';
        }
    },

    // ==========================================
    // ENVIRONMENT LOADING (Client-Side)
    // ==========================================
    async loadEnvironmentVariables() {
        // Check localStorage for development overrides first
        const localConfig = localStorage.getItem('bloomlead_config');
        if (localConfig) {
            try {
                const envConfig = JSON.parse(localConfig);
                this.applyEnvironmentConfig(envConfig);
                console.log('Environment variables loaded from localStorage');
                return true;
            } catch (error) {
                console.warn('Invalid config in localStorage:', error);
            }
        }

        // Only try API endpoint if we're not on localhost/file protocol
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.protocol === 'file:';
        
        if (!isLocalDev) {
            try {
                const response = await fetch('/api/config', { 
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    const envConfig = await response.json();
                    this.applyEnvironmentConfig(envConfig);
                    console.log('Environment variables loaded from API');
                    return true;
                }
            } catch (error) {
                // Silently fail - API endpoint not available
            }
        }

        // Try to use EnvLoader as fallback (if available)
        if (window.EnvLoader && window.EnvLoader.loaded) {
            const envConfig = {
                GOOGLE_ANALYTICS_ID: window.EnvLoader.get('GOOGLE_ANALYTICS_ID'),
                FACEBOOK_PIXEL_ID: window.EnvLoader.get('FACEBOOK_PIXEL_ID'),
                GOOGLE_ADS_CONVERSION_ID: window.EnvLoader.get('GOOGLE_ADS_CONVERSION_ID'),
                LINKEDIN_PARTNER_ID: window.EnvLoader.get('LINKEDIN_PARTNER_ID'),
                HOTJAR_SITE_ID: window.EnvLoader.get('HOTJAR_SITE_ID'),
                GOOGLE_TAG_MANAGER_ID: window.EnvLoader.get('GOOGLE_TAG_MANAGER_ID')
            };
            this.applyEnvironmentConfig(envConfig);
            console.log('Environment variables loaded from EnvLoader (deprecated)');
            return true;
        }

        console.log('Using default configuration values');
        return false;
    },

    // ==========================================
    // INITIALIZATION METHOD
    // ==========================================
    async initialize() {
        console.log('🚀 Initializing BloomLead Config System...');
        
        // Load environment variables
        await this.loadEnvironmentVariables();
        
        // Print status in development
        if (this.environment.isDevelopment()) {
            this.printStatus();
        }
        
        console.log('✅ Config system initialized');
        return this;
    },

    applyEnvironmentConfig(envConfig) {
        // Apply environment variables to config
        if (envConfig.GOOGLE_ANALYTICS_ID) {
            this.analytics.googleAnalytics.trackingId = envConfig.GOOGLE_ANALYTICS_ID;
            this.analytics.googleAnalytics.enabled = this.isValidCredential(envConfig.GOOGLE_ANALYTICS_ID);
        }
        if (envConfig.GOOGLE_TAG_MANAGER_ID) {
            this.analytics.googleTagManager.containerId = envConfig.GOOGLE_TAG_MANAGER_ID;
            this.analytics.googleTagManager.enabled = this.isValidCredential(envConfig.GOOGLE_TAG_MANAGER_ID);
        }
        if (envConfig.HOTJAR_SITE_ID) {
            this.analytics.hotjar.siteId = envConfig.HOTJAR_SITE_ID;
            this.analytics.hotjar.enabled = this.isValidCredential(envConfig.HOTJAR_SITE_ID);
        }
        if (envConfig.FACEBOOK_PIXEL_ID) {
            this.marketing.facebookPixel.pixelId = envConfig.FACEBOOK_PIXEL_ID;
            this.marketing.facebookPixel.enabled = this.isValidCredential(envConfig.FACEBOOK_PIXEL_ID);
        }
        if (envConfig.GOOGLE_ADS_CONVERSION_ID) {
            this.marketing.googleAds.conversionId = envConfig.GOOGLE_ADS_CONVERSION_ID;
            this.marketing.googleAds.enabled = this.isValidCredential(envConfig.GOOGLE_ADS_CONVERSION_ID);
        }
        if (envConfig.LINKEDIN_PARTNER_ID) {
            this.marketing.linkedinAds.partnerId = envConfig.LINKEDIN_PARTNER_ID;
            this.marketing.linkedinAds.enabled = this.isValidCredential(envConfig.LINKEDIN_PARTNER_ID);
        }
        // Add more mappings as needed
    },

    // ==========================================
    // DEVELOPMENT HELPERS
    // ==========================================
    setLocalConfig(configObject) {
        localStorage.setItem('bloomlead_config', JSON.stringify(configObject));
        this.applyEnvironmentConfig(configObject);
        console.log('Local configuration updated');
    },

    clearLocalConfig() {
        localStorage.removeItem('bloomlead_config');
        console.log('Local configuration cleared');
    },
    isValidCredential(value) {
        const placeholders = [
            'YOUR_', 'XXXXXXX', 'CONVERSION_ID', 'PARTNER_ID', 
            'PIXEL_ID', 'TAG_ID', 'APP_ID', 'KEY', 'abcd1234', '1234567'
        ];
        
        return value && !placeholders.some(placeholder => 
            value.toString().includes(placeholder)
        );
    },

    // ==========================================
    // GETTER METHODS
    // ==========================================
    getGoogleAnalyticsId() {
        return this.analytics.googleAnalytics.enabled ? 
            this.analytics.googleAnalytics.trackingId : null;
    },

    getFacebookPixelId() {
        return this.marketing.facebookPixel.enabled ? 
            this.marketing.facebookPixel.pixelId : null;
    },

    getGoogleAdsId() {
        return this.marketing.googleAds.enabled && 
               this.isValidCredential(this.marketing.googleAds.conversionId) ? 
            this.marketing.googleAds.conversionId : null;
    },

    getLinkedInPartnerId() {
        return this.marketing.linkedinAds.enabled && 
               this.isValidCredential(this.marketing.linkedinAds.partnerId) ? 
            this.marketing.linkedinAds.partnerId : null;
    },

    // ==========================================
    // CREDENTIAL MANAGEMENT
    // ==========================================
    setCredential(category, service, credentialType, value) {
        if (this[category] && this[category][service]) {
            this[category][service][credentialType] = value;
            this[category][service].enabled = this.isValidCredential(value);
            console.log(`✅ ${category}.${service}.${credentialType} set to: ${value}`);
            return true;
        }
        console.error(`❌ Invalid path: ${category}.${service}.${credentialType}`);
        return false;
    },

    enableService(category, service) {
        if (this[category] && this[category][service]) {
            const credentialKey = Object.keys(this[category][service])
                .find(k => k.includes('Id') || k.includes('Key'));
            
            if (credentialKey && this.isValidCredential(this[category][service][credentialKey])) {
                this[category][service].enabled = true;
                console.log(`✅ ${category}.${service} enabled`);
                return true;
            } else {
                console.warn(`❌ Cannot enable ${category}.${service} - invalid credential`);
                return false;
            }
        }
        return false;
    },

    disableService(category, service) {
        if (this[category] && this[category][service]) {
            this[category][service].enabled = false;
            console.log(`❌ ${category}.${service} disabled`);
            return true;
        }
        return false;
    },

    // ==========================================
    // STATUS REPORTING
    // ==========================================
    getStatus() {
        const status = {
            configured: [],
            needsCredentials: [],
            disabled: []
        };

        // Check all categories
        ['analytics', 'marketing', 'functional'].forEach(category => {
            Object.entries(this[category]).forEach(([service, config]) => {
                const credentialKey = Object.keys(config)
                    .find(k => k.includes('Id') || k.includes('Key'));
                
                if (config.enabled && this.isValidCredential(config[credentialKey])) {
                    status.configured.push(`${category}.${service}`);
                } else if (!this.isValidCredential(config[credentialKey])) {
                    status.needsCredentials.push(`${category}.${service}`);
                } else {
                    status.disabled.push(`${category}.${service}`);
                }
            });
        });

        return status;
    },

    printStatus() {
        console.log('🔧 BloomLead Configuration Status:');
        console.log('==================================');
        
        const status = this.getStatus();
        
        console.log('✅ CONFIGURED & ACTIVE:');
        status.configured.forEach(item => console.log(`  ${item}`));
        
        console.log('\n❌ NEEDS CREDENTIALS:');
        status.needsCredentials.forEach(item => console.log(`  ${item}`));
        
        console.log('\n⏸️ DISABLED:');
        status.disabled.forEach(item => console.log(`  ${item}`));
        
        console.log('\n📖 To set credentials, use:');
        console.log('Config.setCredential(category, service, credentialType, value)');
        console.log('Example: Config.setCredential("marketing", "googleAds", "conversionId", "AW-1234567890")');
    }
};

// Make available globally
window.Config = Config;

// Initialize the config system when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await Config.initialize();
});

// Auto-print status on load (only in development)
if (Config.environment.isDevelopment()) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            Config.printStatus();
        }, 1000);
    });
}

// Export for use in other files (if module system is available)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}