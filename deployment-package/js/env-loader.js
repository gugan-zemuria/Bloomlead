/**
 * Environment Variables Loader for Client-Side
 * Loads credentials from .env file for cookie systems
 * DEPRECATED: This approach doesn't work in production since .env files aren't served by web servers
 * Use Config system instead which has hardcoded production values
 */

class EnvLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
        console.warn('EnvLoader is deprecated. Use Config system instead.');
    }

    async loadEnv() {
        if (this.loaded) return this.env;

        // .env files cannot be loaded directly in browsers for security reasons
        // Web servers don't serve .env files, and they shouldn't for security
        console.warn('Cannot load .env file in browser. Using fallback values.');
        this.loadFallbackEnv();
        
        return this.env;
    }

    parseEnv(envText) {
        const lines = envText.split('\n');
        
        lines.forEach(line => {
            // Skip comments and empty lines
            if (line.trim() === '' || line.trim().startsWith('#')) {
                return;
            }

            // Parse KEY=VALUE format
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                this.env[key.trim()] = value;
            }
        });
    }

    loadFallbackEnv() {
        // Production values (these are the actual credentials to use)
        this.env = {
            // Analytics
            GOOGLE_ANALYTICS_ID: 'G-T4HP0LG8Z3',
            GOOGLE_TAG_MANAGER_ID: 'GTM-XXXXXXX',
            HOTJAR_SITE_ID: '1234567',
            MICROSOFT_CLARITY_PROJECT_ID: 'abcdefghij',

            // Marketing
            FACEBOOK_PIXEL_ID: 'YOUR_FACEBOOK_PIXEL_ID',
            GOOGLE_ADS_CONVERSION_ID: 'AW-CONVERSION_ID',
            LINKEDIN_PARTNER_ID: 'YOUR_LINKEDIN_PARTNER_ID',
            TWITTER_PIXEL_ID: 'o1234',
            TIKTOK_PIXEL_ID: 'C4A1B2C3D4E5F6',
            PINTEREST_TAG_ID: '2612345678901',
            SNAPCHAT_PIXEL_ID: '12345678-1234-1234-1234-123456789012',

            // Functional
            INTERCOM_APP_ID: 'abcd1234',
            ZENDESK_KEY: 'your-zendesk-key',
            HUBSPOT_PORTAL_ID: '1234567',
            MAILCHIMP_AUDIENCE_ID: 'abcd123456',

            // Environment
            NODE_ENV: 'production',
            DEBUG_MODE: 'false'
        };
        this.loaded = true;
    }

    get(key, defaultValue = null) {
        return this.env[key] || defaultValue;
    }

    isProduction() {
        return this.get('NODE_ENV') === 'production';
    }

    isDebugMode() {
        return this.get('DEBUG_MODE') === 'true';
    }

    // Validation methods
    isValidCredential(value) {
        const placeholders = [
            'YOUR_', 'XXXXXXX', 'CONVERSION_ID', 'PARTNER_ID', 
            'PIXEL_ID', 'TAG_ID', 'APP_ID', 'KEY', 'abcd1234'
        ];
        
        return value && !placeholders.some(placeholder => 
            value.toString().includes(placeholder)
        );
    }

    // Get all environment variables
    getAll() {
        return { ...this.env };
    }

    // Check if a specific service is configured
    isServiceConfigured(service) {
        const serviceKeys = {
            googleAnalytics: ['GOOGLE_ANALYTICS_ID'],
            facebookPixel: ['FACEBOOK_PIXEL_ID'],
            googleAds: ['GOOGLE_ADS_CONVERSION_ID'],
            linkedin: ['LINKEDIN_PARTNER_ID'],
            hotjar: ['HOTJAR_SITE_ID'],
            intercom: ['INTERCOM_APP_ID']
        };

        const keys = serviceKeys[service];
        if (!keys) return false;

        return keys.every(key => this.isValidCredential(this.get(key)));
    }

    // Print status for debugging
    printStatus() {
        console.log('🔧 EnvLoader Status (DEPRECATED - Use Config instead):');
        console.log('==================================');
        
        const services = ['googleAnalytics', 'facebookPixel', 'googleAds', 'linkedin', 'hotjar', 'intercom'];
        
        services.forEach(service => {
            const configured = this.isServiceConfigured(service);
            console.log(`${configured ? '✅' : '❌'} ${service}: ${configured ? 'Configured' : 'Not configured'}`);
        });
        
        console.log('\n⚠️  IMPORTANT: Use Config system instead of EnvLoader');
        console.log('   Config.getGoogleAnalyticsId() instead of EnvLoader.get("GOOGLE_ANALYTICS_ID")');
    }
}

// Create global instance (but recommend using Config instead)
window.EnvLoader = new EnvLoader();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await window.EnvLoader.loadEnv();
    
    if (window.EnvLoader.isDebugMode()) {
        window.EnvLoader.printStatus();
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvLoader;
}
   