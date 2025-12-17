/**
 * Script Blocker for Cookie Consent
 * Prevents non-essential scripts from loading until user consent is given
 */

class ScriptBlocker {
    constructor() {
        this.blockedScripts = new Map();
        this.originalCreateElement = document.createElement;
        this.originalAppendChild = Node.prototype.appendChild;
        this.originalInsertBefore = Node.prototype.insertBefore;
        
        this.init();
    }

    init() {
        // Override document.createElement to intercept script creation
        this.interceptScriptCreation();
        
        // Override appendChild and insertBefore to intercept script insertion
        this.interceptScriptInsertion();
        
        // Block inline scripts in existing HTML
        this.blockInlineScripts();
        
        // Listen for consent updates
        window.addEventListener('cookieConsentUpdated', (event) => {
            this.handleConsentUpdate(event.detail);
        });
    }

    interceptScriptCreation() {
        const self = this;
        
        document.createElement = function(tagName) {
            const element = self.originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                // Mark script for monitoring
                element._isMonitored = true;
                
                // Override src setter to check consent
                const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
                Object.defineProperty(element, 'src', {
                    get: originalSrcDescriptor.get,
                    set: function(value) {
                        if (self.shouldBlockScript(value)) {
                            this._blockedSrc = value;
                            this._isBlocked = true;
                            return;
                        }
                        originalSrcDescriptor.set.call(this, value);
                    }
                });
            }
            
            return element;
        };
    }

    interceptScriptInsertion() {
        const self = this;
        
        Node.prototype.appendChild = function(child) {
            if (child.tagName === 'SCRIPT' && child._isMonitored && child._isBlocked) {
                // Store blocked script for later execution
                self.storeBlockedScript(child);
                return child;
            }
            return self.originalAppendChild.call(this, child);
        };
        
        Node.prototype.insertBefore = function(newNode, referenceNode) {
            if (newNode.tagName === 'SCRIPT' && newNode._isMonitored && newNode._isBlocked) {
                // Store blocked script for later execution
                self.storeBlockedScript(newNode);
                return newNode;
            }
            return self.originalInsertBefore.call(this, newNode, referenceNode);
        };
    }

    blockInlineScripts() {
        // Find and block existing script tags
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (this.shouldBlockScript(src)) {
                script.type = 'text/blocked';
                script._originalType = 'text/javascript';
                script._originalSrc = src;
                script.removeAttribute('src');
            }
        });
    }

    shouldBlockScript(src) {
        if (!src) return false;
        
        // Check if we have consent
        if (window.cookieManager && window.cookieManager.hasConsent()) {
            return false; // Don't block if we have consent
        }
        
        // List of scripts to block until consent
        const blockedDomains = [
            'googletagmanager.com',
            'google-analytics.com',
            'facebook.net',
            'connect.facebook.net',
            'doubleclick.net',
            'googlesyndication.com',
            'linkedin.com',
            'twitter.com',
            'youtube.com/iframe_api',
            'vimeo.com',
            'hotjar.com',
            'crazyegg.com',
            'mouseflow.com'
        ];
        
        return blockedDomains.some(domain => src.includes(domain));
    }

    storeBlockedScript(script) {
        const id = 'blocked_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.blockedScripts.set(id, {
            element: script,
            src: script._blockedSrc,
            parent: script.parentNode,
            nextSibling: script.nextSibling,
            attributes: this.getScriptAttributes(script)
        });
        
        console.log('Blocked script:', script._blockedSrc);
    }

    getScriptAttributes(script) {
        const attributes = {};
        for (let i = 0; i < script.attributes.length; i++) {
            const attr = script.attributes[i];
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }

    handleConsentUpdate(consentData) {
        if (!consentData || !consentData.categories) return;
        
        // Unblock scripts based on consent
        if (consentData.categories.analytics) {
            this.unblockAnalyticsScripts();
        }
        
        if (consentData.categories.marketing) {
            this.unblockMarketingScripts();
        }
        
        if (consentData.categories.functional) {
            this.unblockFunctionalScripts();
        }
        
        // Restore blocked inline scripts
        this.restoreInlineScripts(consentData.categories);
    }

    unblockAnalyticsScripts() {
        this.unblockScriptsByPattern([
            'googletagmanager.com',
            'google-analytics.com',
            'hotjar.com',
            'mouseflow.com'
        ]);
    }

    unblockMarketingScripts() {
        this.unblockScriptsByPattern([
            'facebook.net',
            'connect.facebook.net',
            'doubleclick.net',
            'googlesyndication.com',
            'linkedin.com',
            'twitter.com'
        ]);
    }

    unblockFunctionalScripts() {
        this.unblockScriptsByPattern([
            'youtube.com/iframe_api',
            'vimeo.com'
        ]);
    }

    unblockScriptsByPattern(patterns) {
        this.blockedScripts.forEach((scriptData, id) => {
            const shouldUnblock = patterns.some(pattern => 
                scriptData.src && scriptData.src.includes(pattern)
            );
            
            if (shouldUnblock) {
                this.executeBlockedScript(id, scriptData);
                this.blockedScripts.delete(id);
            }
        });
    }

    executeBlockedScript(id, scriptData) {
        const newScript = document.createElement('script');
        
        // Restore attributes
        Object.keys(scriptData.attributes).forEach(name => {
            if (name !== 'src') {
                newScript.setAttribute(name, scriptData.attributes[name]);
            }
        });
        
        // Set src to trigger loading
        newScript.src = scriptData.src;
        
        // Insert into DOM
        if (scriptData.parent) {
            if (scriptData.nextSibling) {
                scriptData.parent.insertBefore(newScript, scriptData.nextSibling);
            } else {
                scriptData.parent.appendChild(newScript);
            }
        } else {
            document.head.appendChild(newScript);
        }
        
        console.log('Unblocked script:', scriptData.src);
    }

    restoreInlineScripts(categories) {
        const blockedScripts = document.querySelectorAll('script[type="text/blocked"]');
        
        blockedScripts.forEach(script => {
            const src = script._originalSrc;
            let shouldRestore = false;
            
            // Check if script should be restored based on consent
            if (categories.analytics && this.isAnalyticsScript(src)) {
                shouldRestore = true;
            } else if (categories.marketing && this.isMarketingScript(src)) {
                shouldRestore = true;
            } else if (categories.functional && this.isFunctionalScript(src)) {
                shouldRestore = true;
            }
            
            if (shouldRestore) {
                script.type = script._originalType || 'text/javascript';
                script.src = src;
                console.log('Restored inline script:', src);
            }
        });
    }

    isAnalyticsScript(src) {
        const analyticsPatterns = [
            'googletagmanager.com',
            'google-analytics.com',
            'hotjar.com',
            'mouseflow.com'
        ];
        return analyticsPatterns.some(pattern => src && src.includes(pattern));
    }

    isMarketingScript(src) {
        const marketingPatterns = [
            'facebook.net',
            'connect.facebook.net',
            'doubleclick.net',
            'googlesyndication.com',
            'linkedin.com',
            'twitter.com'
        ];
        return marketingPatterns.some(pattern => src && src.includes(pattern));
    }

    isFunctionalScript(src) {
        const functionalPatterns = [
            'youtube.com/iframe_api',
            'vimeo.com'
        ];
        return functionalPatterns.some(pattern => src && src.includes(pattern));
    }

    // Public API
    addBlockedDomain(domain) {
        // Allow dynamic addition of blocked domains
        if (!this.customBlockedDomains) {
            this.customBlockedDomains = [];
        }
        this.customBlockedDomains.push(domain);
    }

    removeBlockedDomain(domain) {
        if (this.customBlockedDomains) {
            const index = this.customBlockedDomains.indexOf(domain);
            if (index > -1) {
                this.customBlockedDomains.splice(index, 1);
            }
        }
    }

    getBlockedScripts() {
        return Array.from(this.blockedScripts.values()).map(script => script.src);
    }
}

// Initialize script blocker as early as possible
if (document.readyState === 'loading') {
    // DOM is still loading, initialize immediately
    window.scriptBlocker = new ScriptBlocker();
} else {
    // DOM is already loaded, initialize on next tick
    setTimeout(() => {
        window.scriptBlocker = new ScriptBlocker();
    }, 0);
}