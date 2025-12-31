/**
 * Safe Facebook Pixel Loader
 * Prevents permissions policy violations by using pagehide instead of unload events
 */

class SafeFacebookPixel {
    constructor(pixelId) {
        this.pixelId = pixelId;
        this.loaded = false;
        this.queue = [];
    }

    init() {
        if (this.loaded) return;

        // Create fbq function
        window.fbq = window.fbq || function() {
            if (window.fbq.loaded) {
                window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
            } else {
                this.queue.push(arguments);
            }
        }.bind(this);

        window.fbq.queue = this.queue;
        window.fbq.loaded = false;
        window.fbq.version = '2.0';

        // Load Facebook Pixel script safely
        this.loadScript();
    }

    loadScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        script.onload = () => {
            // Replace any unload events with pagehide events
            this.replaceUnloadEvents();
            
            // Initialize pixel
            window.fbq('init', this.pixelId);
            window.fbq('track', 'PageView');
            
            this.loaded = true;
            window.fbq.loaded = true;
            
            console.log('Safe Facebook Pixel loaded:', this.pixelId);
        };

        script.onerror = () => {
            console.warn('Facebook Pixel failed to load');
        };

        document.head.appendChild(script);
    }

    replaceUnloadEvents() {
        // Override addEventListener to replace unload with pagehide
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Replace unload events with pagehide for compliance
            if (type === 'unload') {
                console.log('Replaced unload event with pagehide for compliance');
                return originalAddEventListener.call(this, 'pagehide', listener, options);
            }
            if (type === 'beforeunload') {
                console.log('Replaced beforeunload event with pagehide for compliance');
                return originalAddEventListener.call(this, 'pagehide', listener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        // Also override window.addEventListener specifically
        const originalWindowAddEventListener = window.addEventListener;
        window.addEventListener = function(type, listener, options) {
            // Replace unload events with pagehide for compliance
            if (type === 'unload') {
                console.log('Replaced window unload event with pagehide for compliance');
                return originalWindowAddEventListener.call(this, 'pagehide', listener, options);
            }
            if (type === 'beforeunload') {
                console.log('Replaced window beforeunload event with pagehide for compliance');
                return originalWindowAddEventListener.call(this, 'pagehide', listener, options);
            }
            return originalWindowAddEventListener.call(this, type, listener, options);
        };

        // Add our own pagehide event for tracking
        window.addEventListener('pagehide', (event) => {
            // This is the compliant way to handle page unload tracking
            if (this.loaded && window.fbq) {
                try {
                    // Send any pending tracking data
                    window.fbq('track', 'PageLeave', {
                        timestamp: Date.now(),
                        persisted: event.persisted
                    });
                } catch (error) {
                    console.warn('Facebook pagehide tracking error:', error);
                }
            }
        });
    }

    track(eventName, parameters = {}) {
        if (window.fbq) {
            try {
                window.fbq('track', eventName, parameters);
                console.log('Facebook event tracked:', eventName, parameters);
            } catch (error) {
                console.warn('Facebook tracking error:', error);
            }
        } else {
            console.warn('Facebook Pixel not loaded yet');
        }
    }

    trackCustom(eventName, parameters = {}) {
        if (window.fbq) {
            try {
                window.fbq('trackCustom', eventName, parameters);
                console.log('Facebook custom event tracked:', eventName, parameters);
            } catch (error) {
                console.warn('Facebook custom tracking error:', error);
            }
        } else {
            console.warn('Facebook Pixel not loaded yet');
        }
    }
}

// Export for use
window.SafeFacebookPixel = SafeFacebookPixel;