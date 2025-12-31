/**
 * Enhanced Google Analytics Tracking for BloomLead
 * Provides detailed user interaction tracking
 */

class EnhancedAnalytics {
    constructor() {
        this.scrollThresholds = [25, 50, 75, 90];
        this.scrollTracked = new Set();
        this.timeOnPageStart = Date.now();
        this.maxScrollDepth = 0;
        
        this.init();
    }

    init() {
        // Wait for GA to be available
        if (typeof gtag === 'undefined') {
            setTimeout(() => this.init(), 500);
            return;
        }

        this.setupScrollTracking();
        this.setupTimeTracking();
        this.setupFormTracking();
        this.setupEmailTracking();
        this.setupVideoTracking();
        
        console.log('✅ Enhanced Analytics initialized');
    }

    // ==========================================
    // SCROLL DEPTH TRACKING
    // ==========================================
    setupScrollTracking() {
        let ticking = false;
        
        const trackScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            // Update max scroll depth
            this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
            
            // Track threshold milestones
            this.scrollThresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !this.scrollTracked.has(threshold)) {
                    this.scrollTracked.add(threshold);
                    
                    gtag('event', 'scroll_depth', {
                        event_category: 'engagement',
                        event_label: `${threshold}%`,
                        value: threshold,
                        page_title: document.title,
                        page_location: window.location.href
                    });
                    
                    console.log(`📊 Scroll depth: ${threshold}%`);
                }
            });
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(trackScroll);
                ticking = true;
            }
        });
    }

    // ==========================================
    // TIME ON PAGE TRACKING
    // ==========================================
    setupTimeTracking() {
        const timeThresholds = [30, 60, 120, 300]; // seconds
        const timeTracked = new Set();

        const checkTimeOnPage = () => {
            const timeOnPage = Math.round((Date.now() - this.timeOnPageStart) / 1000);
            
            timeThresholds.forEach(threshold => {
                if (timeOnPage >= threshold && !timeTracked.has(threshold)) {
                    timeTracked.add(threshold);
                    
                    gtag('event', 'time_on_page', {
                        event_category: 'engagement',
                        event_label: `${threshold}s`,
                        value: threshold,
                        page_title: document.title
                    });
                }
            });
        };

        // Check every 15 seconds
        setInterval(checkTimeOnPage, 15000);

        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.round((Date.now() - this.timeOnPageStart) / 1000);
            
            gtag('event', 'page_exit', {
                event_category: 'engagement',
                event_label: 'time_spent',
                value: totalTime,
                max_scroll_depth: this.maxScrollDepth
            });
        });
    }

    // ==========================================
    // FORM INTERACTION TRACKING
    // ==========================================
    setupFormTracking() {
        // Track email form interactions
        document.addEventListener('click', (e) => {
            // Email modal opens
            if (e.target.closest('[onclick*="openEmailOptions"]')) {
                gtag('event', 'email_modal_open', {
                    event_category: 'lead_generation',
                    event_label: 'footer_email_click'
                });
            }

            // Email client selection
            if (e.target.closest('.email-option')) {
                const emailClient = e.target.textContent.trim();
                gtag('event', 'email_client_selected', {
                    event_category: 'lead_generation',
                    event_label: emailClient.toLowerCase()
                });
            }

            // Module selection (home page)
            if (e.target.closest('.module-option')) {
                const moduleType = e.target.textContent.includes('single') ? 'single_module' : 'whole_package';
                gtag('event', 'module_selection', {
                    event_category: 'lead_generation',
                    event_label: moduleType
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.closest('form')) {
                const formType = e.target.id || 'unknown_form';
                gtag('event', 'form_submit', {
                    event_category: 'lead_generation',
                    event_label: formType
                });
            }
        });
    }

    // ==========================================
    // EMAIL TRACKING
    // ==========================================
    setupEmailTracking() {
        // Track email input focus (shows interest)
        document.addEventListener('focus', (e) => {
            if (e.target.type === 'email') {
                gtag('event', 'email_input_focus', {
                    event_category: 'lead_generation',
                    event_label: 'email_interest'
                });
            }
        }, true);
    }

    // ==========================================
    // VIDEO TRACKING
    // ==========================================
    setupVideoTracking() {
        document.addEventListener('click', (e) => {
            // Video container clicks
            if (e.target.closest('.video-container')) {
                const video = e.target.closest('.video-container').querySelector('video');
                if (video) {
                    const action = video.paused ? 'play' : 'pause';
                    gtag('event', 'video_interaction', {
                        event_category: 'engagement',
                        event_label: action,
                        video_title: video.title || 'unnamed_video'
                    });
                }
            }
        });
    }

    // ==========================================
    // BLOG ENGAGEMENT TRACKING
    // ==========================================
    trackBlogEngagement() {
        // Track blog reading progress
        if (window.location.pathname.includes('/blogs/')) {
            const blogTitle = document.title;
            
            gtag('event', 'blog_view', {
                event_category: 'content',
                event_label: blogTitle,
                page_location: window.location.href
            });

            // Track reading completion (90% scroll on blog)
            const originalScrollTracked = this.scrollTracked;
            window.addEventListener('scroll', () => {
                if (this.maxScrollDepth >= 90 && !originalScrollTracked.has('blog_read_complete')) {
                    originalScrollTracked.add('blog_read_complete');
                    
                    gtag('event', 'blog_read_complete', {
                        event_category: 'content',
                        event_label: blogTitle,
                        value: 1
                    });
                }
            });
        }
    }

    // ==========================================
    // COOKIE CONSENT TRACKING
    // ==========================================
    trackCookieConsent() {
        // Track cookie banner interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cookie-consent-banner')) {
                let action = 'unknown';
                
                if (e.target.closest('.accept-all')) action = 'accept_all';
                else if (e.target.closest('.reject-all')) action = 'reject_all';
                else if (e.target.closest('.customize')) action = 'customize';
                else if (e.target.closest('.save-preferences')) action = 'save_preferences';
                
                gtag('event', 'cookie_consent', {
                    event_category: 'privacy',
                    event_label: action
                });
            }
        });
    }
}

// Initialize enhanced analytics when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for GA to load
    setTimeout(() => {
        window.enhancedAnalytics = new EnhancedAnalytics();
        
        // Track blog engagement if on blog page
        if (window.location.pathname.includes('/blogs/')) {
            window.enhancedAnalytics.trackBlogEngagement();
        }
        
        // Track cookie consent
        window.enhancedAnalytics.trackCookieConsent();
    }, 2000);
});