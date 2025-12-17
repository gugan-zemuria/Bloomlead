/**
 * Guest Detection and Session Management
 * Detects if a visitor is a guest and manages session information
 */

class GuestDetectionManager {
    constructor() {
        this.sessionInfo = {
            sessionId: null,
            isGuest: true,
            visitCount: 0,
            firstVisit: null,
            lastVisit: null,
            currentVisit: new Date().toISOString()
        };
        
        this.init();
    }

    init() {
        // Detect guest status
        this.detectGuestStatus();
        
        // Get or create session ID
        this.manageSessionId();
        
        // Track visit information
        this.trackVisitInfo();
        
        // Display session information (for debugging)
        this.displaySessionInfo();
        
        // Setup session monitoring
        this.setupSessionMonitoring();
    }

    /**
     * Detect if visitor is a guest or returning user
     */
    detectGuestStatus() {
        // Check for existing session cookie
        const existingSession = this.getCookie('session_id');
        
        // Check for user identification cookies
        const userToken = this.getCookie('user_token') || localStorage.getItem('user_id');
        
        // Check for previous visits
        const visitHistory = localStorage.getItem('visit_history');
        
        if (existingSession && visitHistory) {
            this.sessionInfo.isGuest = false;
            console.log('🔄 Returning visitor detected');
        } else if (userToken) {
            this.sessionInfo.isGuest = false;
            console.log('👤 Logged in user detected');
        } else {
            this.sessionInfo.isGuest = true;
            console.log('👋 New guest visitor detected');
        }
    }

    /**
     * Get or create session ID
     */
    manageSessionId() {
        // Try to get existing session ID
        let sessionId = this.getCookie('session_id');
        
        if (!sessionId) {
            // Create new session ID for guest
            sessionId = this.generateSessionId();
            this.setCookie('session_id', sessionId, null, true); // Session cookie
            console.log('🆔 New session ID created:', sessionId);
        } else {
            console.log('🔍 Existing session ID found:', sessionId);
        }
        
        this.sessionInfo.sessionId = sessionId;
        
        // Store in sessionStorage for easy access
        sessionStorage.setItem('current_session_id', sessionId);
    }

    /**
     * Track visit information
     */
    trackVisitInfo() {
        const visitHistory = this.getVisitHistory();
        
        // Update visit count
        visitHistory.count = (visitHistory.count || 0) + 1;
        this.sessionInfo.visitCount = visitHistory.count;
        
        // Set first visit if new
        if (!visitHistory.firstVisit) {
            visitHistory.firstVisit = this.sessionInfo.currentVisit;
            this.sessionInfo.firstVisit = visitHistory.firstVisit;
        } else {
            this.sessionInfo.firstVisit = visitHistory.firstVisit;
        }
        
        // Update last visit
        this.sessionInfo.lastVisit = visitHistory.lastVisit || null;
        visitHistory.lastVisit = this.sessionInfo.currentVisit;
        
        // Save visit history
        this.saveVisitHistory(visitHistory);
        
        console.log(`📊 Visit #${this.sessionInfo.visitCount} tracked`);
    }

    /**
     * Generate secure session ID
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        const randomPart2 = Math.random().toString(36).substring(2, 15);
        
        return `sess_${timestamp}_${randomPart}${randomPart2}`;
    }

    /**
     * Get visit history from localStorage
     */
    getVisitHistory() {
        try {
            const history = localStorage.getItem('visit_history');
            return history ? JSON.parse(history) : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Save visit history to localStorage
     */
    saveVisitHistory(history) {
        try {
            localStorage.setItem('visit_history', JSON.stringify(history));
        } catch (e) {
            console.warn('Failed to save visit history:', e);
        }
    }

    /**
     * Display session information in console only (no UI panel)
     */
    displaySessionInfo() {
        // Only log to console if debug mode is explicitly enabled
        if (window.CookieConsentConfig?.development?.debug === true) {
            console.group('🔍 Session Information');
            console.log('Session ID:', this.sessionInfo.sessionId);
            console.log('Is Guest:', this.sessionInfo.isGuest ? 'Yes' : 'No');
            console.log('Visit Count:', this.sessionInfo.visitCount);
            console.log('First Visit:', this.sessionInfo.firstVisit);
            console.log('Last Visit:', this.sessionInfo.lastVisit);
            console.log('Current Visit:', this.sessionInfo.currentVisit);
            console.groupEnd();
        }
        
        // Debug panel is disabled - no UI shown
    }

    /**
     * Check if in development mode (disabled for production)
     */
    isDevelopmentMode() {
        // Always return false to disable debug UI
        return false;
    }

    /**
     * Create debug panel - DISABLED for production
     */
    createDebugPanel() {
        // Debug panel is disabled - no UI will be created
        return;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    }

    /**
     * Show all cookies in console
     */
    showAllCookies() {
        console.group('🍪 All Cookies');
        
        const cookies = document.cookie.split(';');
        if (cookies.length === 1 && cookies[0] === '') {
            console.log('No cookies found');
        } else {
            cookies.forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                console.log(`${name}: ${value}`);
            });
        }
        
        console.groupEnd();
        
        // Also show in alert for easy viewing
        const cookieList = cookies.length === 1 && cookies[0] === '' ? 
            'No cookies found' : 
            cookies.map(cookie => cookie.trim()).join('\n');
        
        alert('Current Cookies:\n\n' + cookieList);
    }

    /**
     * Setup session monitoring
     */
    setupSessionMonitoring() {
        // Monitor session changes
        setInterval(() => {
            const currentSessionId = this.getCookie('session_id');
            if (currentSessionId !== this.sessionInfo.sessionId) {
                console.log('🔄 Session ID changed:', currentSessionId);
                this.sessionInfo.sessionId = currentSessionId;
                sessionStorage.setItem('current_session_id', currentSessionId);
            }
        }, 5000); // Check every 5 seconds

        // Monitor page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ Page became visible - session active');
            } else {
                console.log('🙈 Page hidden - session may timeout');
            }
        });
    }

    /**
     * Get cookie value
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Set cookie
     */
    setCookie(name, value, days = null, sessionOnly = false) {
        let expires = '';
        
        if (!sessionOnly && days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        
        const secure = location.protocol === 'https:' ? '; Secure' : '';
        const sameSite = '; SameSite=Lax';
        
        document.cookie = `${name}=${value}${expires}; path=/${secure}${sameSite}`;
    }

    /**
     * Public API methods
     */
    getSessionInfo() {
        return { ...this.sessionInfo };
    }

    getSessionId() {
        return this.sessionInfo.sessionId;
    }

    isGuest() {
        return this.sessionInfo.isGuest;
    }

    getVisitCount() {
        return this.sessionInfo.visitCount;
    }

    /**
     * Check if this is the first visit ever
     */
    isFirstVisit() {
        return this.sessionInfo.visitCount === 1;
    }

    /**
     * Check if this is a returning visitor
     */
    isReturningVisitor() {
        return this.sessionInfo.visitCount > 1;
    }

    /**
     * Get time since first visit
     */
    getTimeSinceFirstVisit() {
        if (!this.sessionInfo.firstVisit) return null;
        
        const firstVisit = new Date(this.sessionInfo.firstVisit);
        const now = new Date();
        const diffMs = now - firstVisit;
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return { days, hours, totalMs: diffMs };
    }

    /**
     * Export session data
     */
    exportSessionData() {
        const data = {
            sessionInfo: this.getSessionInfo(),
            visitHistory: this.getVisitHistory(),
            cookies: document.cookie,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize guest detection
let guestDetection;
document.addEventListener('DOMContentLoaded', function() {
    guestDetection = new GuestDetectionManager();
    
    // Make it globally available
    window.guestDetection = guestDetection;
    
    // Add to window for easy console access
    window.getSessionId = () => guestDetection.getSessionId();
    window.isGuest = () => guestDetection.isGuest();
    window.getSessionInfo = () => guestDetection.getSessionInfo();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuestDetectionManager;
}