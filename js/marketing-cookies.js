/**
 * Marketing Cookies System for BloomLead Webinar Platform
 * Tracks campaign attribution, conversions, user behavior, and ad performance
 * Complies with GDPR and integrates with existing cookie consent system
 */

// ==========================================
// COOKIE UTILITY FUNCTIONS
// ==========================================
const CookieManager = {
    set(name, value, days = 365) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    },

    get(name) {
        const matches = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`));
        return matches ? decodeURIComponent(matches[1]) : null;
    },

    delete(name) {
        this.set(name, '', -1);
    }
};

// ==========================================
// MARKETING COOKIES - For Webinar Website
// ==========================================
const MarketingCookies = {
    // Generate or retrieve marketing user ID
    getMarketingUserId() {
        let marketingId = CookieManager.get('marketing_user_id');
        if (!marketingId) {
            marketingId = 'mkt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
            CookieManager.set('marketing_user_id', marketingId, 390); // 13 months (standard)
        }
        return marketingId;
    },

    // Store campaign data from UTM parameters
    saveCampaignData() {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignData = {
            source: urlParams.get('utm_source') || null,
            medium: urlParams.get('utm_medium') || null,
            campaign: urlParams.get('utm_campaign') || null,
            term: urlParams.get('utm_term') || null,
            content: urlParams.get('utm_content') || null,
            referrer: document.referrer || null,
            landingPage: window.location.href,
            timestamp: new Date().toISOString()
        };

        // Save first-touch attribution (doesn't overwrite)
        if (!CookieManager.get('first_touch_campaign')) {
            CookieManager.set('first_touch_campaign', JSON.stringify(campaignData), 90);
        }

        // Always update last-touch attribution
        CookieManager.set('last_touch_campaign', JSON.stringify(campaignData), 30);
        return campaignData;
    },

    getFirstTouchCampaign() {
        const data = CookieManager.get('first_touch_campaign');
        return data ? JSON.parse(data) : null;
    },

    getLastTouchCampaign() {
        const data = CookieManager.get('last_touch_campaign');
        return data ? JSON.parse(data) : null;
    },

    // Track conversion events
    trackConversion(conversionType, conversionValue = null, metadata = {}) {
        const conversion = {
            marketingUserId: this.getMarketingUserId(),
            conversionType: conversionType, // 'registration', 'purchase', 'download', etc.
            conversionValue: conversionValue,
            firstTouchCampaign: this.getFirstTouchCampaign(),
            lastTouchCampaign: this.getLastTouchCampaign(),
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href,
            ...metadata
        };

        // Send to marketing analytics endpoint
        this.sendMarketingEvent('conversion', conversion);

        // Store conversion for retargeting
        this.addConversion(conversionType);
        return conversion;
    },

    // Store conversion history
    addConversion(conversionType) {
        let conversions = this.getConversions();
        conversions.push({
            type: conversionType,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 conversions
        if (conversions.length > 10) {
            conversions = conversions.slice(-10);
        }
        CookieManager.set('user_conversions', JSON.stringify(conversions), 90);
    },

    getConversions() {
        const data = CookieManager.get('user_conversions');
        return data ? JSON.parse(data) : [];
    },

    // Track user interests based on behavior
    addInterest(interest) {
        let interests = this.getInterests();
        if (!interests.includes(interest)) {
            interests.push(interest);
            // Keep only last 20 interests
            if (interests.length > 20) {
                interests = interests.slice(-20);
            }
            CookieManager.set('user_interests', JSON.stringify(interests), 90);
        }
    },

    getInterests() {
        const data = CookieManager.get('user_interests');
        return data ? JSON.parse(data) : [];
    },

    // Track webinar topics viewed (for retargeting)
    addWebinarTopic(topic) {
        let topics = this.getWebinarTopics();
        if (!topics.includes(topic)) {
            topics.push(topic);
            if (topics.length > 15) {
                topics = topics.slice(-15);
            }
            CookieManager.set('webinar_topics', JSON.stringify(topics), 60);
        }
    },

    getWebinarTopics() {
        const data = CookieManager.get('webinar_topics');
        return data ? JSON.parse(data) : [];
    },

    // Store user segment for targeted marketing
    setUserSegment(segment) {
        CookieManager.set('user_segment', segment, 90);
        console.log(`User segment set to: ${segment}`);
    },

    getUserSegment() {
        return CookieManager.get('user_segment') || 'unknown';
    },

    // Track ad clicks
    trackAdClick(adId, adName, adPlatform) {
        const adData = {
            marketingUserId: this.getMarketingUserId(),
            adId: adId,
            adName: adName,
            adPlatform: adPlatform,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };

        CookieManager.set('last_ad_click', JSON.stringify(adData), 30);
        this.sendMarketingEvent('ad_click', adData);
    },

    getLastAdClick() {
        const data = CookieManager.get('last_ad_click');
        return data ? JSON.parse(data) : null;
    },

    // Track retargeting pixel views
    fireRetargetingPixel(pixelId, eventType, eventData = {}) {
        const pixelData = {
            marketingUserId: this.getMarketingUserId(),
            pixelId: pixelId,
            eventType: eventType,
            eventData: eventData,
            pageUrl: window.location.href,
            timestamp: new Date().toISOString()
        };

        this.sendMarketingEvent('retargeting_pixel', pixelData);
    },

    // Track email campaign clicks
    trackEmailClick(campaignId, linkId) {
        const emailData = {
            marketingUserId: this.getMarketingUserId(),
            campaignId: campaignId,
            linkId: linkId,
            timestamp: new Date().toISOString()
        };

        CookieManager.set('email_campaign_click', JSON.stringify(emailData), 30);
        this.sendMarketingEvent('email_click', emailData);
    },

    // Store A/B test variant
    setABTestVariant(testName, variant) {
        let tests = this.getABTests();
        tests[testName] = {
            variant: variant,
            timestamp: new Date().toISOString()
        };
        CookieManager.set('ab_tests', JSON.stringify(tests), 30);
    },

    getABTestVariant(testName) {
        const tests = this.getABTests();
        return tests[testName] ? tests[testName].variant : null;
    },

    getABTests() {
        const data = CookieManager.get('ab_tests');
        return data ? JSON.parse(data) : {};
    },

    // Track social media source
    saveSocialMediaSource() {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = document.referrer.toLowerCase();
        let socialSource = null;

        // Check URL parameters
        if (urlParams.get('utm_source')) {
            const source = urlParams.get('utm_source').toLowerCase();
            if (['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'].includes(source)) {
                socialSource = source;
            }
        }

        // Check referrer
        if (!socialSource) {
            if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
                socialSource = 'facebook';
            } else if (referrer.includes('instagram.com')) {
                socialSource = 'instagram';
            } else if (referrer.includes('twitter.com') || referrer.includes('t.co')) {
                socialSource = 'twitter';
            } else if (referrer.includes('linkedin.com')) {
                socialSource = 'linkedin';
            } else if (referrer.includes('youtube.com')) {
                socialSource = 'youtube';
            } else if (referrer.includes('tiktok.com')) {
                socialSource = 'tiktok';
            }
        }

        if (socialSource && !CookieManager.get('social_media_source')) {
            CookieManager.set('social_media_source', socialSource, 30);
        }
        return socialSource;
    },

    getSocialMediaSource() {
        return CookieManager.get('social_media_source');
    },

    // Calculate customer journey touchpoints
    getCustomerJourney() {
        return {
            marketingUserId: this.getMarketingUserId(),
            firstTouch: this.getFirstTouchCampaign(),
            lastTouch: this.getLastTouchCampaign(),
            conversions: this.getConversions(),
            interests: this.getInterests(),
            webinarTopics: this.getWebinarTopics(),
            segment: this.getUserSegment(),
            lastAdClick: this.getLastAdClick(),
            socialSource: this.getSocialMediaSource(),
            abTests: this.getABTests()
        };
    },

    // Send marketing event to server/third-party platforms
    sendMarketingEvent(eventType, data) {
        // Send to your marketing analytics endpoint
        fetch('/api/marketing-analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventType: eventType,
                data: data
            })
        }).catch(err => console.error('Marketing analytics error:', err));

        console.log('Marketing Event:', eventType, data);
    },

    // Clear all marketing cookies (GDPR compliance)
    clearAllMarketing() {
        CookieManager.delete('marketing_user_id');
        CookieManager.delete('first_touch_campaign');
        CookieManager.delete('last_touch_campaign');
        CookieManager.delete('user_conversions');
        CookieManager.delete('user_interests');
        CookieManager.delete('webinar_topics');
        CookieManager.delete('user_segment');
        CookieManager.delete('last_ad_click');
        CookieManager.delete('email_campaign_click');
        CookieManager.delete('ab_tests');
        CookieManager.delete('social_media_source');
        console.log('All marketing cookies cleared');
    }
};

// ==========================================
// THIRD-PARTY INTEGRATIONS
// ==========================================
const ThirdPartyMarketing = {
    // Google Ads Conversion Tracking
    initGoogleAds(conversionId) {
        if (!window.gtag) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', conversionId);
        }
    },

    trackGoogleAdsConversion(conversionLabel, conversionValue = null) {
        if (window.gtag) {
            window.gtag('event', 'conversion', {
                'send_to': conversionLabel,
                'value': conversionValue,
                'currency': 'USD'
            });
        }
    },

    // Facebook Pixel
    initFacebookPixel(pixelId) {
        if (!window.fbq) {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
        }
    },

    trackFacebookEvent(eventName, parameters = {}) {
        if (window.fbq) {
            window.fbq('track', eventName, parameters);
        }
    },

    trackFacebookCustomEvent(eventName, parameters = {}) {
        if (window.fbq) {
            window.fbq('trackCustom', eventName, parameters);
        }
    },

    // LinkedIn Insight Tag
    initLinkedInTag(partnerId) {
        if (!window._linkedin_data_partner_ids) {
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(partnerId);

            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
            document.head.appendChild(script);
        }
    },

    trackLinkedInConversion(conversionId) {
        if (window.lintrk) {
            window.lintrk('track', { conversion_id: conversionId });
        }
    },

    // Twitter Pixel
    initTwitterPixel(pixelId) {
        if (!window.twq) {
            !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            window.twq('config', pixelId);
        }
    },

    trackTwitterEvent(eventName, parameters = {}) {
        if (window.twq) {
            window.twq('event', eventName, parameters);
        }
    }
};

// ==========================================
// WEBINAR-SPECIFIC TRACKING FUNCTIONS
// ==========================================
const WebinarMarketing = {
    // Track webinar registration conversion
    trackWebinarRegistration(webinarId, webinarName, webinarPrice = 0) {
        // Track in your system
        MarketingCookies.trackConversion('webinar_registration', webinarPrice, {
            webinarId: webinarId,
            webinarName: webinarName
        });

        // Add interest/topic
        MarketingCookies.addInterest('webinar_attendee');
        MarketingCookies.addWebinarTopic(this.extractTopic(webinarName));

        // Track in third-party platforms
        ThirdPartyMarketing.trackFacebookEvent('Lead', {
            content_name: webinarName,
            content_category: 'Webinar',
            value: webinarPrice,
            currency: 'USD'
        });

        // ThirdPartyMarketing.trackGoogleAdsConversion('AW-XXXXXXX/XXXXXX', webinarPrice);
    },

    // Track webinar video view (for retargeting)
    trackWebinarView(webinarId, webinarName, topic) {
        MarketingCookies.addWebinarTopic(topic);
        MarketingCookies.addInterest('video_viewer');

        ThirdPartyMarketing.trackFacebookCustomEvent('ViewWebinar', {
            content_name: webinarName,
            content_type: 'webinar'
        });
    },

    // Track webinar completion (high-value event)
    trackWebinarCompletion(webinarId, webinarName) {
        MarketingCookies.trackConversion('webinar_completed', null, {
            webinarId: webinarId,
            webinarName: webinarName
        });

        MarketingCookies.setUserSegment('engaged_viewer');

        ThirdPartyMarketing.trackFacebookCustomEvent('CompleteWebinar', {
            content_name: webinarName
        });
    },

    // Track download (lead magnet)
    trackDownload(resourceName, resourceType) {
        MarketingCookies.trackConversion('download', null, {
            resourceName: resourceName,
            resourceType: resourceType
        });

        ThirdPartyMarketing.trackFacebookEvent('Lead', {
            content_name: resourceName,
            content_category: resourceType
        });
    },

    // Track email signup
    trackEmailSignup(email) {
        MarketingCookies.trackConversion('email_signup', null, {
            hashedEmail: this.hashEmail(email) // Hash for privacy
        });

        ThirdPartyMarketing.trackFacebookEvent('CompleteRegistration');
    },

    // A/B Test Example
    assignABTestVariant(testName) {
        let variant = MarketingCookies.getABTestVariant(testName);
        if (!variant) {
            variant = Math.random() < 0.5 ? 'A' : 'B';
            MarketingCookies.setABTestVariant(testName, variant);
        }
        return variant;
    },

    // Helper functions
    extractTopic(webinarName) {
        // Extract topic from webinar name
        return webinarName.split(':')[0] || 'General';
    },

    hashEmail(email) {
        // Implement email hashing for privacy
        return btoa(email); // Simple example - use proper hashing in production
    }
};

// ==========================================
// INTEGRATION WITH EXISTING COOKIE CONSENT
// ==========================================
const MarketingIntegration = {
    // Initialize marketing tracking when consent is given
    initialize() {
        // Check if marketing cookies are allowed
        if (this.hasMarketingConsent()) {
            // Initialize marketing tracking
            MarketingCookies.saveCampaignData();
            MarketingCookies.saveSocialMediaSource();

            // Initialize third-party pixels (uncomment and add your IDs)
            // ThirdPartyMarketing.initGoogleAds('AW-XXXXXXXXX');
            // ThirdPartyMarketing.initFacebookPixel('XXXXXXXXXXXXXXX');
            // ThirdPartyMarketing.initLinkedInTag('XXXXXX');
            // ThirdPartyMarketing.initTwitterPixel('XXXXX');

            console.log('Marketing cookies initialized');
        }
    },

    // Check marketing consent using existing cookie consent system
    hasMarketingConsent() {
        // Integration with existing cookie consent system
        if (typeof window.cookieManager !== 'undefined' && window.cookieManager) {
            return window.cookieManager.hasConsent('marketing');
        }
        
        // Fallback check
        const consent = localStorage.getItem('bloomlead_cookie_consent');
        if (consent) {
            try {
                const consentData = JSON.parse(consent);
                return consentData.categories && consentData.categories.marketing === true;
            } catch (e) {
                return false;
            }
        }
        
        return false;
    },

    // Clear marketing cookies when consent is withdrawn
    clearMarketingData() {
        MarketingCookies.clearAllMarketing();
        console.log('Marketing data cleared due to consent withdrawal');
    },

    // Get complete customer journey data
    getMarketingData() {
        if (this.hasMarketingConsent()) {
            const journey = MarketingCookies.getCustomerJourney();
            console.log('Customer Journey:', journey);
            return journey;
        }
        return null;
    }
};

// ==========================================
// AUTO-INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    MarketingIntegration.initialize();
});

// Listen for consent changes
document.addEventListener('cookieConsentChanged', (event) => {
    if (event.detail && event.detail.marketing) {
        MarketingIntegration.initialize();
    } else {
        MarketingIntegration.clearMarketingData();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarketingCookies, ThirdPartyMarketing, WebinarMarketing, MarketingIntegration };
}

// Make available globally
window.MarketingCookies = MarketingCookies;
window.ThirdPartyMarketing = ThirdPartyMarketing;
window.WebinarMarketing = WebinarMarketing;
window.MarketingIntegration = MarketingIntegration;