/**
 * Marketing Platforms Integration for BloomLead
 * Handles Facebook Pixel, Google Ads, LinkedIn, and other marketing tools
 */

class MarketingPlatforms {
    constructor() {
        this.platforms = {};
        this.initialized = false;
        
        // Wait for Config to be available before initializing
        this.waitForConfig().then(() => {
            this.init();
        });
    }

    async waitForConfig() {
        // Wait for Config to be available and initialized
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (!window.Config && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.Config) {
            console.warn('Config system not available, using fallback values');
            this.initializeFallbackPlatforms();
        } else {
            this.initializePlatforms();
        }
    }

    initializePlatforms() {
        // Load credentials from Config system
        this.platforms = {
            facebook: {
                pixelId: window.Config.getFacebookPixelId() || 'YOUR_FACEBOOK_PIXEL_ID',
                enabled: false
            },
            googleAds: {
                conversionId: window.Config.getGoogleAdsId(),
                enabled: false,
                disabled: !window.Config.getGoogleAdsId()
            },
            linkedin: {
                partnerId: window.Config.getLinkedInPartnerId(),
                enabled: false,
                disabled: !window.Config.getLinkedInPartnerId()
            }
        };
    }

    initializeFallbackPlatforms() {
        // Fallback values if Config system is not available
        this.platforms = {
            facebook: {
                pixelId: 'YOUR_FACEBOOK_PIXEL_ID',
                enabled: false
            },
            googleAds: {
                conversionId: null,
                enabled: false,
                disabled: true
            },
            linkedin: {
                partnerId: null,
                enabled: false,
                disabled: true
            }
        };
    }

    init() {
        // Check if marketing cookies are allowed
        if (this.hasMarketingConsent()) {
            this.loadAllPlatforms();
        }
        
        // Listen for consent changes
        window.addEventListener('cookieConsentUpdated', (event) => {
            if (event.detail.categories.marketing) {
                this.loadAllPlatforms();
            } else {
                this.unloadAllPlatforms();
            }
        });
        
        this.initialized = true;
        console.log('✅ Marketing Platforms initialized');
    }

    hasMarketingConsent() {
        const consent = localStorage.getItem('bloomlead_cookie_consent');
        if (!consent) return false;
        
        try {
            const consentData = JSON.parse(consent);
            return consentData.categories && consentData.categories.marketing;
        } catch (e) {
            return false;
        }
    }

    loadAllPlatforms() {
        // Only load Facebook Pixel for now
        this.loadFacebookPixel();
        
        // Other platforms temporarily disabled
        // this.loadGoogleAds();
        // this.loadLinkedInInsight();
        
        console.log('Marketing platforms loaded: Facebook Pixel only');
    }

    unloadAllPlatforms() {
        // Clear marketing cookies when consent is withdrawn
        this.clearMarketingCookies();
    }

    // Facebook Pixel Implementation (Safe Version)
    loadFacebookPixel() {
        if (this.platforms.facebook.enabled) {
            return; // Already loaded
        }

        try {
            // Use safe Facebook Pixel loader
            if (typeof SafeFacebookPixel !== 'undefined') {
                this.facebookPixel = new SafeFacebookPixel(this.platforms.facebook.pixelId);
                this.facebookPixel.init();
                this.platforms.facebook.enabled = true;
            } else {
                console.warn('SafeFacebookPixel not available, loading standard version');
                this.loadStandardFacebookPixel();
            }
        } catch (error) {
            console.warn('Facebook Pixel loading error:', error);
        }
    }

    // Fallback to standard Facebook Pixel if safe version fails
    loadStandardFacebookPixel() {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        setTimeout(() => {
            if (typeof fbq !== 'undefined') {
                fbq('init', this.platforms.facebook.pixelId);
                fbq('track', 'PageView');
                this.platforms.facebook.enabled = true;
                console.log('Standard Facebook Pixel loaded:', this.platforms.facebook.pixelId);
            }
        }, 100);
    }

    // Google Ads Implementation (TEMPORARILY DISABLED)
    loadGoogleAds() {
        if (this.platforms.googleAds.disabled) {
            console.log('Google Ads temporarily disabled');
            return;
        }
        
        if (this.platforms.googleAds.enabled || !this.platforms.googleAds.conversionId.startsWith('AW-')) {
            return; // Already loaded or no valid conversion ID
        }

        // Google Ads uses gtag which should already be loaded with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', this.platforms.googleAds.conversionId);
            this.platforms.googleAds.enabled = true;
            console.log('Google Ads loaded');
        }
    }

    // LinkedIn Insight Tag Implementation (TEMPORARILY DISABLED)
    loadLinkedInInsight() {
        if (this.platforms.linkedin.disabled) {
            console.log('LinkedIn Insight Tag temporarily disabled');
            return;
        }
        
        if (this.platforms.linkedin.enabled || !this.platforms.linkedin.partnerId.startsWith('YOUR_')) {
            return; // Already loaded or no valid partner ID
        }

        window._linkedin_partner_id = this.platforms.linkedin.partnerId;
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(this.platforms.linkedin.partnerId);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
        document.head.appendChild(script);

        this.platforms.linkedin.enabled = true;
        console.log('LinkedIn Insight Tag loaded');
    }

    // Track Events (Facebook Only)
    trackEvent(eventName, eventData = {}) {
        if (!this.hasMarketingConsent()) return;

        // Facebook Pixel Events (ACTIVE) - with timing check
        if (this.platforms.facebook.enabled) {
            // Wait for fbq to be available
            const trackFacebookEvent = () => {
                if (typeof fbq !== 'undefined') {
                    try {
                        fbq('track', eventName, eventData);
                        console.log('Facebook event tracked:', eventName, eventData);
                    } catch (error) {
                        console.warn('Facebook tracking error:', error);
                    }
                } else {
                    // Retry after a short delay
                    setTimeout(trackFacebookEvent, 100);
                }
            };
            trackFacebookEvent();
        }

        // Google Ads Events (DISABLED)
        // if (this.platforms.googleAds.enabled && typeof gtag !== 'undefined') {
        //     gtag('event', eventName.toLowerCase(), {
        //         'send_to': this.platforms.googleAds.conversionId,
        //         ...eventData
        //     });
        // }

        // LinkedIn Events (DISABLED)
        // if (this.platforms.linkedin.enabled && eventName === 'Purchase') {
        //     window.lintrk && window.lintrk('track', { conversion_id: eventData.conversion_id });
        // }
    }

    // Predefined Event Tracking Methods
    trackPurchase(value, currency = 'EUR') {
        this.trackEvent('Purchase', {
            value: value,
            currency: currency,
            content_type: 'webinar_course'
        });
    }

    trackLead() {
        this.trackEvent('Lead', {
            content_category: 'webinar_signup'
        });
    }

    trackViewContent(contentType, contentName) {
        this.trackEvent('ViewContent', {
            content_type: contentType,
            content_name: contentName
        });
    }

    trackAddToCart(contentId, value) {
        this.trackEvent('AddToCart', {
            content_ids: [contentId],
            value: value,
            currency: 'EUR'
        });
    }

    // Clear marketing cookies
    clearMarketingCookies() {
        const marketingCookies = [
            '_fbp', '_fbc', // Facebook
            '_gcl_au', '_gcl_aw', // Google Ads
            'li_fat_id', 'lidc', // LinkedIn
            'marketing_user_id', 'campaign_data' // Custom marketing cookies
        ];

        marketingCookies.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    }
}

// Initialize Marketing Platforms (async to wait for Config)
let marketingPlatforms;

document.addEventListener('DOMContentLoaded', () => {
    marketingPlatforms = new MarketingPlatforms();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketingPlatforms;
}