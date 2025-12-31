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
// FUNCTIONAL COOKIES - For Webinar Website
// ==========================================
const FunctionalCookies = {
    // Check if functional cookies are allowed
    hasConsentFor(category = 'functional') {
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
            console.warn('Failed to check consent:', e);
        }
        
        return false;
    },

    // Save video playback position
    saveVideoProgress(videoId, currentTime) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - video progress not saved');
            return false;
        }
        CookieManager.set(`video_progress_${videoId}`, currentTime, 30);
        return true;
    },

    getVideoProgress(videoId) {
        if (!this.hasConsentFor('functional')) {
            return 0;
        }
        return parseFloat(CookieManager.get(`video_progress_${videoId}`)) || 0;
    },

    // Save video quality preference
    saveVideoQuality(quality) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - video quality not saved');
            return false;
        }
        CookieManager.set('video_quality', quality, 365);
        return true;
    },

    getVideoQuality() {
        if (!this.hasConsentFor('functional')) {
            return 'auto';
        }
        return CookieManager.get('video_quality') || 'auto';
    },

    // Save video volume
    saveVolume(volume) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - volume not saved');
            return false;
        }
        CookieManager.set('video_volume', volume, 365);
        return true;
    },

    getVolume() {
        if (!this.hasConsentFor('functional')) {
            return 1.0;
        }
        return parseFloat(CookieManager.get('video_volume')) || 1.0;
    },

    // Save playback speed
    savePlaybackSpeed(speed) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - playback speed not saved');
            return false;
        }
        CookieManager.set('playback_speed', speed, 365);
        return true;
    },

    getPlaybackSpeed() {
        if (!this.hasConsentFor('functional')) {
            return 1.0;
        }
        return parseFloat(CookieManager.get('playback_speed')) || 1.0;
    },

    // Save subtitle preference
    saveSubtitlePreference(enabled) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - subtitle preference not saved');
            return false;
        }
        CookieManager.set('subtitles_enabled', enabled, 365);
        return true;
    },

    getSubtitlePreference() {
        if (!this.hasConsentFor('functional')) {
            return false;
        }
        return CookieManager.get('subtitles_enabled') === 'true';
    },

    // Save last watched webinar
    saveLastWatched(webinarId) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - last watched not saved');
            return false;
        }
        CookieManager.set('last_webinar', webinarId, 30);
        return true;
    },

    getLastWatched() {
        if (!this.hasConsentFor('functional')) {
            return null;
        }
        return CookieManager.get('last_webinar');
    },

    // Save language preference
    saveLanguage(lang) {
        if (!this.hasConsentFor('functional')) {
            console.log('Functional cookies not allowed - language not saved');
            return false;
        }
        CookieManager.set('language', lang, 365);
        return true;
    },

    getLanguage() {
        if (!this.hasConsentFor('functional')) {
            return 'en';
        }
        return CookieManager.get('language') || 'en';
    },

    // Clear all functional cookies (when consent is withdrawn)
    clearAllFunctionalCookies() {
        const functionalCookies = [
            'video_quality', 'video_volume', 'playback_speed', 'subtitles_enabled', 
            'last_webinar', 'language'
        ];
        
        functionalCookies.forEach(cookieName => {
            CookieManager.delete(cookieName);
        });
        
        // Clear video progress cookies (they have dynamic names)
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();
            if (cookieName.startsWith('video_progress_')) {
                CookieManager.delete(decodeURIComponent(cookieName));
            }
        });
        
        console.log('All functional cookies cleared');
    }
};

// ==========================================
// USAGE EXAMPLES FOR WEBINAR WEBSITE
// ==========================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved preferences if available and consent is granted
    if (FunctionalCookies.hasConsentFor('functional')) {
        const savedLanguage = FunctionalCookies.getLanguage();
        if (savedLanguage && savedLanguage !== 'en') {
            // Apply language preference to page
            document.documentElement.lang = savedLanguage;
        }
    }
    
    // Listen for consent changes
    window.addEventListener('cookieConsentUpdated', (event) => {
        const consent = event.detail;
        
        if (consent.categories.functional) {
            console.log('Functional cookies enabled - preferences will be saved');
            // Restore any saved preferences
            restoreFunctionalPreferences();
        } else {
            console.log('Functional cookies disabled - clearing all functional data');
            // Clear all functional cookies
            FunctionalCookies.clearAllFunctionalCookies();
        }
    });
});

// Function to restore functional preferences when consent is granted
function restoreFunctionalPreferences() {
    // Apply language preference
    const savedLanguage = FunctionalCookies.getLanguage();
    if (savedLanguage && savedLanguage !== 'en') {
        document.documentElement.lang = savedLanguage;
    }
    
    // If there are video elements on the page, restore their preferences
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const savedVolume = FunctionalCookies.getVolume();
        const savedSpeed = FunctionalCookies.getPlaybackSpeed();
        
        if (savedVolume !== 1.0) {
            video.volume = savedVolume;
        }
        
        if (savedSpeed !== 1.0) {
            video.playbackRate = savedSpeed;
        }
    });
}

// Example: Video player with saved preferences
function initializeVideoPlayer(videoElement, videoId) {
    // Only restore settings if functional cookies are allowed
    if (FunctionalCookies.hasConsentFor('functional')) {
        // Restore saved settings
        videoElement.volume = FunctionalCookies.getVolume();
        videoElement.playbackRate = FunctionalCookies.getPlaybackSpeed();
        videoElement.currentTime = FunctionalCookies.getVideoProgress(videoId);
    }

    // Save progress every 5 seconds (only if consent is given)
    const progressInterval = setInterval(() => {
        if (!videoElement.paused && FunctionalCookies.hasConsentFor('functional')) {
            FunctionalCookies.saveVideoProgress(videoId, videoElement.currentTime);
        }
    }, 5000);

    // Save volume changes (only if consent is given)
    videoElement.addEventListener('volumechange', () => {
        if (FunctionalCookies.hasConsentFor('functional')) {
            FunctionalCookies.saveVolume(videoElement.volume);
        }
    });

    // Save playback speed changes (only if consent is given)
    videoElement.addEventListener('ratechange', () => {
        if (FunctionalCookies.hasConsentFor('functional')) {
            FunctionalCookies.savePlaybackSpeed(videoElement.playbackRate);
        }
    });

    // Mark as last watched when video starts (only if consent is given)
    videoElement.addEventListener('play', () => {
        if (FunctionalCookies.hasConsentFor('functional')) {
            FunctionalCookies.saveLastWatched(videoId);
        }
    });
    
    // Clean up interval when video is removed (using pagehide for compliance)
    window.addEventListener('pagehide', () => {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
    });
    
    // Return the interval ID so it can be cleared externally if needed
    return progressInterval;
}

// Example: Language selector
function changeLanguage(lang) {
    FunctionalCookies.saveLanguage(lang);
    // Reload page or update content with new language
    location.reload();
}

// Example: Video quality selector
function changeVideoQuality(quality) {
    FunctionalCookies.saveVideoQuality(quality);
    // Apply quality change to current video
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // Implementation depends on your video player
        if (video.setQuality) {
            video.setQuality(quality);
        }
    });
}

// Example: Subtitle toggle
function toggleSubtitles(enabled) {
    FunctionalCookies.saveSubtitlePreference(enabled);
    // Apply to current videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const tracks = video.textTracks;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = enabled ? 'showing' : 'hidden';
        }
    });
}

// Example: Get last watched webinar for "Continue Watching" feature
function getLastWatchedWebinar() {
    return FunctionalCookies.getLastWatched();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FunctionalCookies, CookieManager };
}