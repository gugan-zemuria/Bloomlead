/**
 * Webinar Marketing Integration
 * Integrates marketing cookies with BloomLead webinar functionality
 */

// ==========================================
// WEBINAR EVENT TRACKING
// ==========================================
const WebinarEventTracking = {
    // Track when user visits webinar page
    trackWebinarPageView(webinarId, webinarTitle, webinarTopic) {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            // Add webinar topic to user interests
            MarketingCookies.addWebinarTopic(webinarTopic);
            MarketingCookies.addInterest('webinar_interested');
            
            // Track page view event
            MarketingCookies.sendMarketingEvent('webinar_page_view', {
                webinarId: webinarId,
                webinarTitle: webinarTitle,
                webinarTopic: webinarTopic,
                timestamp: new Date().toISOString()
            });
            
            console.log(`Tracked webinar page view: ${webinarTitle}`);
        }
    },

    // Track webinar registration
    trackWebinarRegistration(webinarId, webinarTitle, userEmail, webinarPrice = 0) {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            // Track conversion
            WebinarMarketing.trackWebinarRegistration(webinarId, webinarTitle, webinarPrice);
            
            // Set user segment
            MarketingCookies.setUserSegment('webinar_registrant');
            
            // Track email signup if provided
            if (userEmail) {
                WebinarMarketing.trackEmailSignup(userEmail);
            }
            
            console.log(`Tracked webinar registration: ${webinarTitle}`);
        }
    },

    // Track video play/pause events
    trackVideoEngagement(webinarId, webinarTitle, action, currentTime = 0, totalDuration = 0) {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            const engagementData = {
                webinarId: webinarId,
                webinarTitle: webinarTitle,
                action: action, // 'play', 'pause', 'seek', 'ended'
                currentTime: currentTime,
                totalDuration: totalDuration,
                engagementPercentage: totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0,
                timestamp: new Date().toISOString()
            };
            
            MarketingCookies.sendMarketingEvent('video_engagement', engagementData);
            
            // Track milestones
            if (action === 'play' || action === 'seek') {
                this.trackVideoMilestones(webinarId, webinarTitle, currentTime, totalDuration);
            }
            
            // Track completion
            if (action === 'ended' || engagementData.engagementPercentage >= 90) {
                WebinarMarketing.trackWebinarCompletion(webinarId, webinarTitle);
            }
        }
    },

    // Track video viewing milestones
    trackVideoMilestones(webinarId, webinarTitle, currentTime, totalDuration) {
        const percentage = (currentTime / totalDuration) * 100;
        const milestones = [25, 50, 75];
        
        milestones.forEach(milestone => {
            const storageKey = `milestone_${webinarId}_${milestone}`;
            if (percentage >= milestone && !sessionStorage.getItem(storageKey)) {
                sessionStorage.setItem(storageKey, 'true');
                
                MarketingCookies.sendMarketingEvent('video_milestone', {
                    webinarId: webinarId,
                    webinarTitle: webinarTitle,
                    milestone: milestone,
                    timestamp: new Date().toISOString()
                });
                
                // Update user segment based on engagement
                if (milestone >= 75) {
                    MarketingCookies.setUserSegment('highly_engaged_viewer');
                } else if (milestone >= 50) {
                    MarketingCookies.setUserSegment('engaged_viewer');
                }
            }
        });
    },

    // Track resource downloads
    trackResourceDownload(resourceName, resourceType, webinarId = null) {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            WebinarMarketing.trackDownload(resourceName, resourceType);
            
            // Add interest based on resource type
            MarketingCookies.addInterest(`${resourceType}_downloader`);
            
            if (webinarId) {
                MarketingCookies.sendMarketingEvent('webinar_resource_download', {
                    webinarId: webinarId,
                    resourceName: resourceName,
                    resourceType: resourceType,
                    timestamp: new Date().toISOString()
                });
            }
        }
    },

    // Track contact form submissions
    trackContactFormSubmission(formType, formData = {}) {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            MarketingCookies.trackConversion('contact_form_submission', null, {
                formType: formType,
                ...formData
            });
            
            MarketingCookies.addInterest('contact_interested');
            
            // Track in third-party platforms
            ThirdPartyMarketing.trackFacebookEvent('Contact');
        }
    },

    // Track newsletter signup
    trackNewsletterSignup(email, source = 'website') {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            WebinarMarketing.trackEmailSignup(email);
            
            MarketingCookies.sendMarketingEvent('newsletter_signup', {
                source: source,
                timestamp: new Date().toISOString()
            });
            
            MarketingCookies.addInterest('newsletter_subscriber');
        }
    }
};

// ==========================================
// AUTOMATIC EVENT LISTENERS
// ==========================================
const AutoTrackingSetup = {
    init() {
        this.setupVideoTracking();
        this.setupFormTracking();
        this.setupLinkTracking();
        this.setupPageTracking();
    },

    // Setup video event tracking
    setupVideoTracking() {
        document.addEventListener('DOMContentLoaded', () => {
            const videos = document.querySelectorAll('video');
            
            videos.forEach(video => {
                const webinarId = video.dataset.webinarId || 'unknown';
                const webinarTitle = video.dataset.webinarTitle || document.title;
                
                video.addEventListener('play', () => {
                    WebinarEventTracking.trackVideoEngagement(
                        webinarId, 
                        webinarTitle, 
                        'play', 
                        video.currentTime, 
                        video.duration
                    );
                });
                
                video.addEventListener('pause', () => {
                    WebinarEventTracking.trackVideoEngagement(
                        webinarId, 
                        webinarTitle, 
                        'pause', 
                        video.currentTime, 
                        video.duration
                    );
                });
                
                video.addEventListener('ended', () => {
                    WebinarEventTracking.trackVideoEngagement(
                        webinarId, 
                        webinarTitle, 
                        'ended', 
                        video.currentTime, 
                        video.duration
                    );
                });
                
                video.addEventListener('seeked', () => {
                    WebinarEventTracking.trackVideoEngagement(
                        webinarId, 
                        webinarTitle, 
                        'seek', 
                        video.currentTime, 
                        video.duration
                    );
                });
            });
        });
    },

    // Setup form tracking
    setupFormTracking() {
        document.addEventListener('DOMContentLoaded', () => {
            // Webinar registration forms
            const registrationForms = document.querySelectorAll('form[data-form-type="webinar-registration"]');
            registrationForms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const webinarId = form.dataset.webinarId;
                    const webinarTitle = form.dataset.webinarTitle;
                    const emailInput = form.querySelector('input[type="email"]');
                    const priceInput = form.querySelector('input[name="price"]');
                    
                    if (webinarId && webinarTitle) {
                        WebinarEventTracking.trackWebinarRegistration(
                            webinarId,
                            webinarTitle,
                            emailInput ? emailInput.value : null,
                            priceInput ? parseFloat(priceInput.value) : 0
                        );
                    }
                });
            });
            
            // Contact forms
            const contactForms = document.querySelectorAll('form[data-form-type="contact"]');
            contactForms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const formType = form.dataset.formSubtype || 'general';
                    WebinarEventTracking.trackContactFormSubmission(formType);
                });
            });
            
            // Newsletter forms
            const newsletterForms = document.querySelectorAll('form[data-form-type="newsletter"]');
            newsletterForms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const emailInput = form.querySelector('input[type="email"]');
                    const source = form.dataset.source || 'website';
                    
                    if (emailInput) {
                        WebinarEventTracking.trackNewsletterSignup(emailInput.value, source);
                    }
                });
            });
        });
    },

    // Setup download link tracking
    setupLinkTracking() {
        document.addEventListener('DOMContentLoaded', () => {
            const downloadLinks = document.querySelectorAll('a[data-track="download"]');
            
            downloadLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const resourceName = link.dataset.resourceName || link.textContent;
                    const resourceType = link.dataset.resourceType || 'document';
                    const webinarId = link.dataset.webinarId;
                    
                    WebinarEventTracking.trackResourceDownload(resourceName, resourceType, webinarId);
                });
            });
        });
    },

    // Setup page-specific tracking
    setupPageTracking() {
        document.addEventListener('DOMContentLoaded', () => {
            // Track webinar page views
            const webinarPageData = document.querySelector('[data-webinar-page]');
            if (webinarPageData) {
                const webinarId = webinarPageData.dataset.webinarId;
                const webinarTitle = webinarPageData.dataset.webinarTitle;
                const webinarTopic = webinarPageData.dataset.webinarTopic;
                
                if (webinarId && webinarTitle && webinarTopic) {
                    WebinarEventTracking.trackWebinarPageView(webinarId, webinarTitle, webinarTopic);
                }
            }
        });
    }
};

// ==========================================
// UTM PARAMETER HANDLING
// ==========================================
const UTMHandler = {
    // Extract and store UTM parameters
    processUTMParameters() {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            const urlParams = new URLSearchParams(window.location.search);
            const utmParams = {};
            
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
                const value = urlParams.get(param);
                if (value) {
                    utmParams[param] = value;
                }
            });
            
            // If we have UTM parameters, save campaign data
            if (Object.keys(utmParams).length > 0) {
                MarketingCookies.saveCampaignData();
                
                // Track campaign click
                MarketingCookies.sendMarketingEvent('campaign_click', {
                    utmParams: utmParams,
                    landingPage: window.location.href,
                    timestamp: new Date().toISOString()
                });
            }
        }
    },

    // Handle email campaign clicks
    handleEmailCampaign() {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = urlParams.get('email_campaign');
        const linkId = urlParams.get('link_id');
        
        if (campaignId && typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            MarketingCookies.trackEmailClick(campaignId, linkId);
        }
    }
};

// ==========================================
// A/B TESTING INTEGRATION
// ==========================================
const ABTestingIntegration = {
    // Initialize A/B tests
    initializeTests() {
        if (typeof MarketingIntegration !== 'undefined' && MarketingIntegration.hasMarketingConsent()) {
            // Example: Test different CTA button colors
            const ctaButtonTest = WebinarMarketing.assignABTestVariant('cta_button_color');
            this.applyCTAButtonTest(ctaButtonTest);
            
            // Example: Test different pricing displays
            const pricingTest = WebinarMarketing.assignABTestVariant('pricing_display');
            this.applyPricingTest(pricingTest);
        }
    },

    // Apply CTA button test
    applyCTAButtonTest(variant) {
        const ctaButtons = document.querySelectorAll('.btn-primary');
        
        if (variant === 'B') {
            ctaButtons.forEach(button => {
                button.style.backgroundColor = '#769757'; // Green variant
                button.dataset.abTest = 'cta_button_color_b';
            });
        }
    },

    // Apply pricing test
    applyPricingTest(variant) {
        const pricingElements = document.querySelectorAll('.pricing-card');
        
        if (variant === 'B') {
            pricingElements.forEach(element => {
                element.classList.add('pricing-variant-b');
                element.dataset.abTest = 'pricing_display_b';
            });
        }
    }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Process UTM parameters
    UTMHandler.processUTMParameters();
    UTMHandler.handleEmailCampaign();
    
    // Setup automatic tracking
    AutoTrackingSetup.init();
    
    // Initialize A/B tests
    ABTestingIntegration.initializeTests();
});

// Export for global use
window.WebinarEventTracking = WebinarEventTracking;
window.UTMHandler = UTMHandler;
window.ABTestingIntegration = ABTestingIntegration;

// Make functions available globally for manual tracking
window.trackWebinarRegistration = WebinarEventTracking.trackWebinarRegistration.bind(WebinarEventTracking);
window.trackVideoEngagement = WebinarEventTracking.trackVideoEngagement.bind(WebinarEventTracking);
window.trackResourceDownload = WebinarEventTracking.trackResourceDownload.bind(WebinarEventTracking);
window.trackContactForm = WebinarEventTracking.trackContactFormSubmission.bind(WebinarEventTracking);
window.trackNewsletterSignup = WebinarEventTracking.trackNewsletterSignup.bind(WebinarEventTracking);