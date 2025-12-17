/**
 * Webinar Analytics Integration
 * Handles video engagement tracking and user journey analytics with consent
 */

class WebinarAnalytics {
    constructor() {
        this.isEnabled = false;
        this.videoEvents = [];
        this.userJourney = [];
        this.sessionStart = Date.now();
        this.currentVideo = null;
        this.scrollDepthTracked = new Set();
        this.pageLoadTime = Date.now();
        
        this.init();
    }

    init() {
        // Listen for consent updates
        window.addEventListener('cookieConsentUpdated', (event) => {
            this.handleConsentUpdate(event.detail);
        });
        
        // Check if analytics is already enabled
        if (this.hasConsentFor('analytics')) {
            this.enable();
        }
        
        // Track page view if consent exists
        this.trackPageView();
    }

    // Check if analytics cookies are allowed
    hasConsentFor(category = 'analytics') {
        // Check if cookie manager exists and has consent
        if (window.cookieManager && typeof window.cookieManager.hasConsent === 'function') {
            return window.cookieManager.hasConsent(category);
        }
        
        // Fallback: check localStorage for consent
        try {
            const consent = localStorage.getItem('bloomlead_cookie_consent');
            if (consent) {
                const consentData = JSON.parse(consent);
                return consentData.categories && consentData.categories[category];
            }
        } catch (e) {
            console.warn('Failed to check analytics consent:', e);
        }
        
        return false;
    }

    handleConsentUpdate(consentData) {
        if (consentData.categories.analytics) {
            this.enable();
        } else {
            this.disable();
            this.clearAllAnalyticsCookies();
        }
    }

    enable() {
        if (this.isEnabled) return;
        
        this.isEnabled = true;
        console.log('Webinar analytics enabled');
        
        // Initialize video tracking
        this.initVideoTracking();
        
        // Initialize user journey tracking
        this.initUserJourneyTracking();
        
        // Initialize form tracking
        this.initFormTracking();
        
        // Send any queued events
        this.sendQueuedEvents();
    }

    disable() {
        this.isEnabled = false;
        console.log('Webinar analytics disabled');
        
        // Clear event listeners
        this.removeEventListeners();
        
        // Clear stored data
        this.videoEvents = [];
        this.userJourney = [];
    }

    initVideoTracking() {
        // Track custom video player events
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            this.attachVideoListeners(video);
        });
        
        // Track video card interactions
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.trackVideoCardClick(card);
            });
        });
    }

    attachVideoListeners(video) {
        if (video._analyticsAttached) return;
        video._analyticsAttached = true;
        
        const videoId = video.id || video.src || 'unknown';
        
        video.addEventListener('play', () => {
            this.trackVideoEvent('play', videoId, {
                currentTime: video.currentTime,
                duration: video.duration
            });
        });
        
        video.addEventListener('pause', () => {
            this.trackVideoEvent('pause', videoId, {
                currentTime: video.currentTime,
                duration: video.duration,
                watchedPercentage: (video.currentTime / video.duration) * 100
            });
        });
        
        video.addEventListener('ended', () => {
            this.trackVideoEvent('completed', videoId, {
                duration: video.duration,
                watchedPercentage: 100
            });
        });
        
        // Track viewing milestones (25%, 50%, 75%)
        video.addEventListener('timeupdate', () => {
            const percentage = (video.currentTime / video.duration) * 100;
            
            if (!video._milestones) {
                video._milestones = new Set();
            }
            
            [25, 50, 75].forEach(milestone => {
                if (percentage >= milestone && !video._milestones.has(milestone)) {
                    video._milestones.add(milestone);
                    this.trackVideoEvent('milestone', videoId, {
                        milestone: milestone,
                        currentTime: video.currentTime,
                        duration: video.duration
                    });
                }
            });
        });
        
        // Track quality changes if available
        if (video.videoTracks && video.videoTracks.length > 0) {
            video.videoTracks[0].addEventListener('change', () => {
                this.trackVideoEvent('quality_change', videoId, {
                    quality: video.videoTracks[0].label,
                    currentTime: video.currentTime
                });
            });
        }
    }

    trackVideoEvent(action, videoId, data = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            type: 'video',
            action: action,
            videoId: videoId,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            ...data
        };
        
        this.videoEvents.push(event);
        this.sendEvent(event);
    }

    // Analytics-focused video tracking (business insights, not user preferences)
    setupVideoAnalytics(videoElement, videoId, videoName) {
        if (!this.isEnabled) return;
        
        const milestones = [0.25, 0.5, 0.75];
        const tracked = new Set();
        let sessionStartTime = null;
        let totalWatchTime = 0;
        let lastUpdateTime = null;
        
        // Track video engagement start (analytics only)
        videoElement.addEventListener('play', () => {
            sessionStartTime = Date.now();
            lastUpdateTime = videoElement.currentTime;
            
            this.trackVideoEvent('engagement_start', videoId, {
                videoName: videoName,
                userId: this.getUserId(),
                sessionId: this.getAnalyticsSessionId(),
                deviceType: this.getDeviceType(),
                browserType: this.getBrowserType()
            });
        });
        
        // Track engagement patterns (not preferences)
        videoElement.addEventListener('pause', () => {
            if (lastUpdateTime !== null) {
                totalWatchTime += (videoElement.currentTime - lastUpdateTime);
            }
            
            this.trackVideoEvent('engagement_pause', videoId, {
                videoName: videoName,
                watchedDuration: totalWatchTime,
                engagementRate: (totalWatchTime / videoElement.currentTime) * 100,
                pausePoint: videoElement.currentTime
            });
        });
        
        // Track completion for business metrics
        videoElement.addEventListener('ended', () => {
            this.trackVideoEvent('completion', videoId, {
                videoName: videoName,
                totalDuration: videoElement.duration,
                actualWatchTime: totalWatchTime,
                completionRate: 100,
                sessionDuration: sessionStartTime ? Date.now() - sessionStartTime : 0
            });
        });
        
        // Track drop-off points (analytics insight)
        videoElement.addEventListener('timeupdate', () => {
            const progress = videoElement.currentTime / videoElement.duration;
            
            // Update watch time
            if (lastUpdateTime !== null && !videoElement.paused) {
                totalWatchTime += (videoElement.currentTime - lastUpdateTime);
            }
            lastUpdateTime = videoElement.currentTime;
            
            // Track engagement milestones (business metrics)
            milestones.forEach(milestone => {
                if (progress >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackVideoEvent('engagement_milestone', videoId, {
                        videoName: videoName,
                        milestone: `${milestone * 100}%`,
                        actualWatchTime: totalWatchTime,
                        engagementQuality: this.calculateEngagementQuality(totalWatchTime, videoElement.currentTime)
                    });
                }
            });
        });
        
        // Track when user leaves video (drop-off analysis)
        window.addEventListener('beforeunload', () => {
            if (!videoElement.ended && videoElement.currentTime > 0) {
                this.trackVideoEvent('drop_off', videoId, {
                    videoName: videoName,
                    dropOffPoint: videoElement.currentTime,
                    dropOffPercentage: (videoElement.currentTime / videoElement.duration) * 100,
                    totalWatchTime: totalWatchTime
                });
            }
        });
    }

    // Helper methods for analytics insights
    calculateEngagementQuality(actualWatchTime, currentTime) {
        if (currentTime === 0) return 0;
        return Math.min((actualWatchTime / currentTime) * 100, 100);
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    getBrowserType() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'chrome';
        if (userAgent.includes('Firefox')) return 'firefox';
        if (userAgent.includes('Safari')) return 'safari';
        if (userAgent.includes('Edge')) return 'edge';
        return 'other';
    }

    trackVideoCardClick(card) {
        if (!this.isEnabled) return;
        
        const moduleNumber = card.querySelector('.module-number')?.textContent || 'unknown';
        const title = card.querySelector('h5')?.textContent || 'unknown';
        
        this.trackEvent('video_card_click', {
            module: moduleNumber,
            title: title,
            cardType: card.classList.contains('module-active') ? 'active' : 'inactive'
        });
    }

    initUserJourneyTracking() {
        // Track page interactions
        this.trackScrollDepth();
        this.trackTimeOnPageAuto();
        this.trackClickEvents();
        this.trackFormInteractions();
        this.trackPageLoad();
    }

    trackPageLoad() {
        window.addEventListener('load', () => {
            this.pageLoadTime = Date.now();
            this.trackPageViewAnalytics();
            this.saveTrafficSource();
        });
    }

    trackTimeOnPageAuto() {
        // Track time spent on page before leaving
        window.addEventListener('beforeunload', () => {
            if (this.pageLoadTime) {
                const duration = Math.round((Date.now() - this.pageLoadTime) / 1000);
                this.trackTimeOnPage(document.title, duration);
            }
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        let scrollMilestones = new Set();
        
        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
            
            // Track scroll milestones
            [25, 50, 75, 90].forEach(milestone => {
                if (scrollPercent >= milestone && !scrollMilestones.has(milestone)) {
                    scrollMilestones.add(milestone);
                    this.trackEvent('scroll_milestone', {
                        milestone: milestone,
                        maxScroll: maxScroll
                    });
                }
            });
        };
        
        window.addEventListener('scroll', this.throttle(trackScroll, 1000));
    }

    trackTimeOnPage() {
        // Track time spent on page
        setInterval(() => {
            if (this.isEnabled && document.visibilityState === 'visible') {
                const timeOnPage = Date.now() - this.sessionStart;
                this.trackEvent('time_on_page', {
                    duration: timeOnPage,
                    timestamp: Date.now()
                });
            }
        }, 30000); // Every 30 seconds
    }

    trackClickEvents() {
        // Track important button clicks
        const importantSelectors = [
            '.btn-cookie-accept-all',
            '.btn-cookie-accept-necessary',
            '.btn-cookie-settings',
            '.btn.ss-btn',
            '.btn-outline-primary',
            '.header-btn',
            '.subscribe-submit-btn'
        ];
        
        importantSelectors.forEach(selector => {
            document.addEventListener('click', (e) => {
                if (e.target.matches(selector)) {
                    this.trackEvent('button_click', {
                        buttonText: e.target.textContent.trim(),
                        buttonClass: e.target.className,
                        page: window.location.pathname
                    });
                }
            });
        });
    }

    initFormTracking() {
        // Track form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.trackFormSubmission(form);
            });
        });
        
        // Track email signup form specifically
        const emailForm = document.querySelector('.contact-form');
        if (emailForm) {
            const emailInput = emailForm.querySelector('input[type="text"], input[name="email2"]');
            if (emailInput) {
                emailInput.addEventListener('focus', () => {
                    this.trackEvent('email_form_focus', {
                        formType: 'newsletter_signup'
                    });
                });
            }
        }
    }

    trackFormSubmission(form) {
        if (!this.isEnabled) return;
        
        const formData = new FormData(form);
        const formFields = {};
        
        // Collect non-sensitive form data
        for (let [key, value] of formData.entries()) {
            // Don't track actual email addresses or sensitive data
            if (key.includes('email')) {
                formFields[key] = value ? 'provided' : 'empty';
            } else if (key.length < 50) { // Avoid tracking large text fields
                formFields[key] = value;
            }
        }
        
        this.trackEvent('form_submission', {
            formId: form.id || 'unknown',
            formClass: form.className,
            fields: Object.keys(formFields),
            page: window.location.pathname
        });
    }

    trackFormInteractions() {
        // Track form field interactions
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.trackEvent('form_field_focus', {
                    fieldType: input.type,
                    fieldName: input.name || input.id,
                    page: window.location.pathname
                });
            });
        });
    }

    trackPageView() {
        if (!this.isEnabled) return;
        
        this.trackPageViewAnalytics();
    }

    trackEvent(action, data = {}) {
        if (!this.isEnabled) return;
        
        const event = {
            type: 'user_action',
            action: action,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            page: window.location.pathname,
            ...data
        };
        
        this.userJourney.push(event);
        this.sendEvent(event);
    }

    // Analytics Cookie Management
    getUserId() {
        if (!this.hasConsentFor('analytics')) return null;
        
        let userId = this.getCookie('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            this.setCookie('analytics_user_id', userId, 730); // 2 years
        }
        return userId;
    }

    getAnalyticsSessionId() {
        if (!this.hasConsentFor('analytics')) return null;
        
        let sessionId = this.getCookie('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            this.setCookie('analytics_session_id', sessionId, 0.0208); // 30 minutes
        }
        return sessionId;
    }

    // Track page views with analytics cookies
    trackPageViewAnalytics(pageName, pageUrl) {
        if (!this.hasConsentFor('analytics')) return;
        
        const data = {
            userId: this.getUserId(),
            sessionId: this.getAnalyticsSessionId(),
            pageName: pageName || document.title,
            pageUrl: pageUrl || window.location.href,
            referrer: document.referrer,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent
        };
        
        this.trackEvent('page_view', data);
        this.saveTrafficSource();
        this.incrementPageViews();
    }

    // Track webinar registration
    trackRegistration(webinarId, webinarName) {
        if (!this.hasConsentFor('analytics')) return;
        
        const data = {
            userId: this.getUserId(),
            sessionId: this.getAnalyticsSessionId(),
            webinarId: webinarId,
            webinarName: webinarName
        };
        
        this.trackEvent('webinar_registration', data);
    }

    // Track search queries
    trackSearch(query, resultsCount) {
        if (!this.hasConsentFor('analytics')) return;
        
        const data = {
            userId: this.getUserId(),
            sessionId: this.getAnalyticsSessionId(),
            searchQuery: query,
            resultsCount: resultsCount
        };
        
        this.trackEvent('search', data);
    }

    // Save traffic source information
    saveTrafficSource() {
        if (!this.hasConsentFor('analytics')) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('utm_source') || 'direct';
        const medium = urlParams.get('utm_medium') || 'none';
        const campaign = urlParams.get('utm_campaign') || 'none';
        
        if (!this.getCookie('traffic_source')) {
            const trafficData = {
                source: source,
                medium: medium,
                campaign: campaign,
                referrer: document.referrer,
                landingPage: window.location.href,
                timestamp: new Date().toISOString()
            };
            this.setCookie('traffic_source', JSON.stringify(trafficData), 30);
        }
    }

    // Increment page view counter
    incrementPageViews() {
        if (!this.hasConsentFor('analytics')) return;
        
        let count = parseInt(this.getCookie('page_view_count') || '0');
        count++;
        this.setCookie('page_view_count', count.toString(), 30);
    }

    // Track time on page
    trackTimeOnPage(pageName, duration) {
        if (!this.hasConsentFor('analytics')) return;
        
        const data = {
            userId: this.getUserId(),
            sessionId: this.getAnalyticsSessionId(),
            pageName: pageName || document.title,
            duration: duration // in seconds
        };
        
        this.trackEvent('time_on_page', data);
    }

    // Clear all analytics cookies (GDPR compliance)
    clearAllAnalyticsCookies() {
        const analyticsCookies = [
            'analytics_user_id', 'analytics_session_id', 'page_view_count',
            'traffic_source', 'last_visit', 'previous_visit'
        ];
        
        analyticsCookies.forEach(cookieName => {
            this.deleteCookie(cookieName);
        });
        
        console.log('All analytics cookies cleared');
    }

    sendEvent(event) {
        // Send to Google Analytics if available
        if (window.gtag) {
            gtag('event', event.action, {
                event_category: event.type,
                event_label: event.videoId || event.page,
                custom_parameter: JSON.stringify(event)
            });
        }
        
        // Send to custom analytics endpoint if needed
        if (this.analyticsEndpoint) {
            this.sendToCustomEndpoint(event);
        }
        
        // Log for debugging
        console.log('Analytics event:', event);
    }

    sendToCustomEndpoint(event) {
        fetch(this.analyticsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        }).catch(error => {
            console.warn('Failed to send analytics event:', error);
        });
    }

    sendQueuedEvents() {
        // Send any events that were queued before consent was given
        [...this.videoEvents, ...this.userJourney].forEach(event => {
            this.sendEvent(event);
        });
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        }
        return this.sessionId;
    }

    // Cookie utility methods for analytics
    setCookie(name, value, days) {
        if (!this.hasConsentFor('analytics')) return false;
        
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        
        const secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax${secure}`;
        return true;
    }

    getCookie(name) {
        if (!this.hasConsentFor('analytics')) return null;
        
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    removeEventListeners() {
        // Remove event listeners when analytics is disabled
        // This is a simplified version - in production you'd want to track and remove specific listeners
        console.log('Removing analytics event listeners');
    }

    // Public API
    setAnalyticsEndpoint(endpoint) {
        this.analyticsEndpoint = endpoint;
    }

    getVideoEvents() {
        return this.videoEvents;
    }

    getUserJourney() {
        return this.userJourney;
    }

    exportData() {
        return {
            videoEvents: this.videoEvents,
            userJourney: this.userJourney,
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            sessionDuration: Date.now() - this.sessionStart,
            analyticsData: this.getUserAnalyticsData()
        };
    }

    // Get comprehensive analytics data
    getUserAnalyticsData() {
        if (!this.hasConsentFor('analytics')) return null;
        
        return {
            userId: this.getUserId(),
            sessionId: this.getAnalyticsSessionId(),
            pageViewCount: parseInt(this.getCookie('page_view_count') || '0'),
            trafficSource: this.getTrafficSource(),
            isReturningVisitor: this.isReturningVisitor()
        };
    }

    getTrafficSource() {
        const source = this.getCookie('traffic_source');
        return source ? JSON.parse(source) : null;
    }

    isReturningVisitor() {
        return this.getCookie('analytics_user_id') !== null;
    }

    // Public API for manual tracking
    getAPI() {
        return {
            // Video analytics (business insights only - not user preferences)
            setupVideoAnalytics: (videoElement, videoId, videoName) => this.setupVideoAnalytics(videoElement, videoId, videoName),
            trackVideoEngagement: (videoId, action, data) => this.trackVideoEvent(action, videoId, data),
            
            // Business event tracking
            trackRegistration: (webinarId, webinarName) => this.trackRegistration(webinarId, webinarName),
            trackSearch: (query, resultsCount) => this.trackSearch(query, resultsCount),
            trackButtonClick: (buttonName, buttonId, context) => this.trackEvent('button_click', {
                buttonName, buttonId, ...context
            }),
            trackFormSubmit: (formName, formData) => this.trackEvent('form_submit', {
                formName, formFields: Object.keys(formData || {})
            }),
            
            // Data management
            getUserData: () => this.getUserAnalyticsData(),
            exportData: () => this.exportData(),
            hasConsent: () => this.hasConsentFor('analytics'),
            clearData: () => this.clearAllAnalyticsCookies()
        };
    }
}

// Initialize webinar analytics
document.addEventListener('DOMContentLoaded', function() {
    const analytics = new WebinarAnalytics();
    
    // Expose both the full instance and the public API
    window.webinarAnalytics = analytics;
    window.AnalyticsCookies = analytics.getAPI();
});