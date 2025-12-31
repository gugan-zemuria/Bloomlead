/**
 * Cookie Consent Configuration
 * Customize cookie consent settings for your webinar site
 */

window.CookieConsentConfig = {
    // Basic Settings
    version: '1.0.0',
    language: 'en',
    
    // Legal Requirements
    gdprCompliant: true,
    requireExplicitConsent: true,
    allowWithdrawal: true,
    
    // UI Settings
    theme: {
        primaryColor: '#a571aa',
        secondaryColor: '#769757',
        bannerPosition: 'bottom', // 'top' or 'bottom'
        bannerStyle: 'bar', // 'bar', 'box', or 'modal'
        showCloseButton: true,
        animationDuration: 300
    },
    
    // Text Customization
    texts: {
        en: {
            banner: {
                title: 'Cookie Usage',
                description: 'We use cookies to enable our interactive webinars, live chat support, and video streaming features. Choose which you allow.',
                acceptAll: 'Accept All',
                rejectAll: 'Reject All',
                acceptNecessary: 'Necessary Only',
                settings: 'Cookie Settings',
                privacyPolicy: 'Privacy Policy'
            },
            categories: {
                necessary: {
                    name: 'Necessary Cookies',
                    description: 'These cookies are essential for the website to function and cannot be disabled.'
                },
                functional: {
                    name: 'Functional Cookies',
                    description: 'These cookies enable the website to remember your preferences and improve your experience.'
                },
                analytics: {
                    name: 'Analytics Cookies',
                    description: 'These cookies help us understand how visitors use our website.'
                },
                marketing: {
                    name: 'Marketing Cookies',
                    description: 'These cookies enable targeted advertising and social media integration.'
                }
            }
        },
        fi: {
            banner: {
                title: 'Evästeiden käyttö',
                description: 'Käytämme evästeitä interaktiivisten webinaarien, live-chat-tuen ja videostreamin mahdollistamiseksi. Valitse mitä sallit.',
                acceptAll: 'Hyväksy kaikki',
                rejectAll: 'Hylkää kaikki',
                acceptNecessary: 'Vain välttämättömät',
                settings: 'Evästeasetukset',
                privacyPolicy: 'Tietosuojaseloste'
            },
            categories: {
                necessary: {
                    name: 'Välttämättömät evästeet',
                    description: 'Nämä evästeet ovat välttämättömiä sivuston toiminnalle ja niitä ei voi poistaa käytöstä.'
                },
                functional: {
                    name: 'Toiminnalliset evästeet',
                    description: 'Nämä evästeet mahdollistavat sivuston toimintojen muistamisen ja parantavat käyttökokemusta.'
                },
                analytics: {
                    name: 'Analytiikka-evästeet',
                    description: 'Nämä evästeet auttavat meitä ymmärtämään, miten vierailijat käyttävät sivustoa.'
                },
                marketing: {
                    name: 'Markkinointi-evästeet',
                    description: 'Nämä evästeet mahdollistavat kohdistetun mainonnan ja sosiaalisen median integraation.'
                }
            }
        }
    },
    
    // Cookie Categories Configuration
    categories: {
        necessary: {
            required: true,
            cookies: [
                'session_id',
                'csrf_token',
                'cookie_consent',
                'load_balancer'
            ],
            scripts: [],
            purposes: [
                'Session management',
                'Security (CSRF protection)',
                'Load balancing',
                'Basic site functionality'
            ]
        },
        functional: {
            required: false,
            cookies: [
                'video_quality',
                'video_volume',
                'language_preference',
                'ui_theme',
                'remember_login'
            ],
            scripts: [
                'video-preferences',
                'language-selection',
                'ui-customization'
            ],
            purposes: [
                'Video player preferences',
                'Language selection',
                'Interface customization',
                'Login preferences'
            ]
        },
        analytics: {
            required: false,
            cookies: [
                '_ga',
                '_ga_*',
                '_gid',
                '_gat',
                'video_analytics',
                'user_journey'
            ],
            scripts: [
                'google-analytics',
                'video-analytics',
                'user-journey',
                'conversion-tracking'
            ],
            purposes: [
                'Website usage analytics',
                'Video engagement tracking',
                'User journey analysis',
                'Conversion tracking',
                'A/B testing'
            ]
        },
        marketing: {
            required: false,
            cookies: [
                'marketing_user_id',
                'first_touch_campaign',
                'last_touch_campaign',
                'user_conversions',
                'user_interests',
                'webinar_topics',
                'user_segment',
                'last_ad_click',
                'email_campaign_click',
                'ab_tests',
                'social_media_source',
                '_fbp',
                '_fbc',
                'linkedin_oauth',
                'retargeting_pixel',
                'ad_personalization'
            ],
            scripts: [
                'facebook-pixel',
                'google-ads',
                'linkedin-insight',
                'retargeting',
                'affiliate-tracking'
            ],
            purposes: [
                'Campaign attribution tracking',
                'Conversion tracking',
                'User behavior analysis',
                'Retargeting campaigns',
                'Social media integration',
                'Affiliate tracking',
                'Ad personalization',
                'Cross-platform tracking',
                'A/B testing',
                'Customer journey mapping'
            ]
        }
    },
    
    // Third-party Services Configuration
    services: {
        googleAnalytics: {
            enabled: true,
            measurementId: function() {
                return window.Config ? window.Config.getGoogleAnalyticsId() : 'G-T4HP0LG8Z3';
            }, // Dynamic loading from Config
            category: 'analytics',
            config: {
                anonymize_ip: true,
                cookie_expires: 63072000, // 2 years
                send_page_view: true
            }
        },
        facebookPixel: {
            enabled: false,
            pixelId: 'YOUR_PIXEL_ID', // Replace with your Facebook Pixel ID
            category: 'marketing',
            config: {
                autoConfig: true,
                debug: false
            }
        },
        linkedinInsight: {
            enabled: false,
            partnerId: 'YOUR_PARTNER_ID', // Replace with your LinkedIn Partner ID
            category: 'marketing'
        },
        hotjar: {
            enabled: false,
            hjid: 'YOUR_HOTJAR_ID', // Replace with your Hotjar ID
            category: 'analytics'
        }
    },
    
    // Consent Management
    consent: {
        // How long to store consent (in days)
        storageExpiry: 365,
        
        // Re-consent requirements
        requireReconsentAfter: 365, // days
        requireReconsentOnPolicyChange: true,
        
        // Default consent state for new users
        defaultConsent: {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false
        },
        
        // Consent modes for different regions
        regionalSettings: {
            EU: {
                requireExplicitConsent: true,
                showBannerOnFirstVisit: true,
                blockScriptsUntilConsent: true
            },
            US: {
                requireExplicitConsent: false,
                showBannerOnFirstVisit: true,
                blockScriptsUntilConsent: false
            },
            default: {
                requireExplicitConsent: true,
                showBannerOnFirstVisit: true,
                blockScriptsUntilConsent: true
            }
        }
    },
    
    // Analytics Configuration
    analytics: {
        // Custom analytics endpoint
        endpoint: null, // Set to your analytics API endpoint
        
        // Events to track
        trackEvents: {
            pageViews: true,
            videoEngagement: true,
            formSubmissions: true,
            buttonClicks: true,
            scrollDepth: true,
            timeOnPage: true
        },
        
        // Video analytics settings
        videoTracking: {
            trackMilestones: [25, 50, 75, 100],
            trackQualityChanges: true,
            trackPlaybackSpeed: true,
            trackFullscreen: true
        }
    },
    
    // Development Settings
    development: {
        debug: false, // Set to true for console logging
        testMode: false, // Set to true to bypass actual consent requirements
        mockConsent: null // Set to object to mock consent state
    },
    
    // Callbacks
    callbacks: {
        onConsentGiven: function(consent) {
            console.log('Consent given:', consent);
        },
        onConsentWithdrawn: function() {
            console.log('Consent withdrawn');
        },
        onConsentChanged: function(oldConsent, newConsent) {
            console.log('Consent changed:', { old: oldConsent, new: newConsent });
        },
        onScriptBlocked: function(scriptSrc) {
            console.log('Script blocked:', scriptSrc);
        },
        onScriptUnblocked: function(scriptSrc) {
            console.log('Script unblocked:', scriptSrc);
        }
    }
};

// Auto-detect user region (simplified)
window.CookieConsentConfig.detectRegion = function() {
    // This is a simplified region detection
    // In production, you might want to use a more sophisticated method
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
        'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome',
        'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
        'Europe/Stockholm', 'Europe/Helsinki', 'Europe/Copenhagen', 'Europe/Oslo',
        'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest', 'Europe/Bucharest',
        'Europe/Sofia', 'Europe/Athens', 'Europe/Dublin', 'Europe/Lisbon'
    ];
    
    if (euTimezones.includes(timezone)) {
        return 'EU';
    }
    
    // You can add more region detection logic here
    return 'default';
};

// Initialize region-specific settings
window.CookieConsentConfig.currentRegion = window.CookieConsentConfig.detectRegion();
window.CookieConsentConfig.regionalConfig = window.CookieConsentConfig.consent.regionalSettings[window.CookieConsentConfig.currentRegion];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CookieConsentConfig;
}