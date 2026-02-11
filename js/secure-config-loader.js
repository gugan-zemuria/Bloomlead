/**
 * BloomLead Secure Configuration Loader
 * JavaScript fetch() code to securely load configuration from PHP API
 */

class SecureConfigLoader {
    constructor() {
        this.config = null;
        this.csrfToken = null;
        this.baseUrl = window.location.origin;
        this.configEndpoint = '/config.php';
    }

    /**
     * Load configuration from secure PHP endpoint
     * @param {string} action - The action to perform (get_config, get_analytics, get_marketing)
     * @returns {Promise<Object>} Configuration data
     */
    async loadConfig(action = 'get_config') {
        try {
            const response = await fetch(`${this.baseUrl}${this.configEndpoint}?action=${action}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest', // Required by .htaccess
                    'Accept': 'application/json'
                },
                credentials: 'same-origin', // Include cookies for CSRF
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load configuration');
            }

            // Store CSRF token for future requests
            if (data.csrf_token) {
                this.csrfToken = data.csrf_token;
            }

            // Cache the configuration
            this.config = data.data;
            
            return data.data;
        } catch (error) {
            console.error('Failed to load configuration:', error);
            throw error;
        }
    }

    /**
     * Load only analytics configuration
     * @returns {Promise<Object>} Analytics configuration
     */
    async loadAnalyticsConfig() {
        return await this.loadConfig('get_analytics');
    }

    /**
     * Load only marketing configuration
     * @returns {Promise<Object>} Marketing configuration
     */
    async loadMarketingConfig() {
        return await this.loadConfig('get_marketing');
    }

    /**
     * Health check for the configuration API
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}${this.configEndpoint}?action=health_check`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    /**
     * Get cached configuration or load if not available
     * @returns {Object|null} Configuration data
     */
    getConfig() {
        return this.config;
    }

    /**
     * Get Google Analytics ID from configuration
     * @returns {string|null} Google Analytics measurement ID
     */
    getGoogleAnalyticsId() {
        return this.config?.analytics?.google_analytics?.measurement_id || null;
    }

    /**
     * Get Facebook Pixel ID from configuration
     * @returns {string|null} Facebook Pixel ID
     */
    getFacebookPixelId() {
        return this.config?.marketing?.facebook_pixel?.pixel_id || null;
    }

    /**
     * Check if a service is enabled
     * @param {string} category - Category (analytics, marketing, functional)
     * @param {string} service - Service name
     * @returns {boolean} True if enabled
     */
    isServiceEnabled(category, service) {
        return this.config?.[category]?.[service]?.enabled || false;
    }

    /**
     * Initialize configuration with retry logic
     * @param {number} maxRetries - Maximum number of retry attempts
     * @param {number} retryDelay - Delay between retries in milliseconds
     * @returns {Promise<Object>} Configuration data
     */
    async initialize(maxRetries = 3, retryDelay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Loading configuration (attempt ${attempt}/${maxRetries})...`);
                const config = await this.loadConfig();
                console.log('Configuration loaded successfully:', config);
                return config;
            } catch (error) {
                lastError = error;
                console.warn(`Configuration load attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    console.log(`Retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        
        console.error('Failed to load configuration after all attempts:', lastError);
        throw lastError;
    }
}

// Global instance
window.SecureConfigLoader = new SecureConfigLoader();

// Convenience functions for global access
window.loadBloomLeadConfig = async function(action = 'get_config') {
    return await window.SecureConfigLoader.loadConfig(action);
};

window.getBloomLeadConfig = function() {
    return window.SecureConfigLoader.getConfig();
};

window.isBloomLeadServiceEnabled = function(category, service) {
    return window.SecureConfigLoader.isServiceEnabled(category, service);
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.SecureConfigLoader.initialize();
        
        // Dispatch custom event when configuration is loaded
        const event = new CustomEvent('bloomleadConfigLoaded', {
            detail: { config: window.SecureConfigLoader.getConfig() }
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('Failed to initialize BloomLead configuration:', error);
        
        // Dispatch error event
        const errorEvent = new CustomEvent('bloomleadConfigError', {
            detail: { error: error.message }
        });
        document.dispatchEvent(errorEvent);
    }
});

// Example usage:
/*
// Wait for configuration to load
document.addEventListener('bloomleadConfigLoaded', function(event) {
    const config = event.detail.config;
    console.log('Configuration ready:', config);
    
    // Initialize analytics if enabled
    if (window.isBloomLeadServiceEnabled('analytics', 'google_analytics')) {
        const gaId = window.SecureConfigLoader.getGoogleAnalyticsId();
        console.log('Initializing Google Analytics with ID:', gaId);
        // Initialize GA here
    }
    
    // Initialize marketing pixels if enabled
    if (window.isBloomLeadServiceEnabled('marketing', 'facebook_pixel')) {
        const fbPixelId = window.SecureConfigLoader.getFacebookPixelId();
        console.log('Initializing Facebook Pixel with ID:', fbPixelId);
        // Initialize FB Pixel here
    }
});

// Handle configuration load errors
document.addEventListener('bloomleadConfigError', function(event) {
    console.error('Configuration failed to load:', event.detail.error);
    // Fallback to default configuration or show error message
});

// Manual usage
async function manualConfigLoad() {
    try {
        const config = await window.loadBloomLeadConfig();
        console.log('Manually loaded config:', config);
    } catch (error) {
        console.error('Manual config load failed:', error);
    }
}
*/