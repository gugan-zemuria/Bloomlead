# GDPR-Compliant Cookie Consent System for BloomLead

## Overview

This comprehensive cookie consent system provides full GDPR compliance for the BloomLead webinar platform. It includes granular cookie control, script blocking, analytics integration, and a complete audit trail.

## Features

### ✅ EU Legal Compliance
- **GDPR & ePrivacy Directive compliant**
- Explicit consent required BEFORE non-essential cookies
- Clear categorization of cookies
- Easy consent withdrawal
- Granular control (not just accept all)
- Privacy policy link integration
- Script blocking until consent given

### 🍪 Cookie Categories
- **Necessary (Always Active)**: Session management, authentication, CSRF protection
- **Functional**: Video preferences, language selection, UI customization
- **Analytics**: Video engagement tracking, user journey analysis, conversion tracking
- **Marketing**: Retargeting pixels, social media integration, affiliate tracking

### 🏗️ Architecture
```
CookieConsentManager
├── Consent Storage (localStorage + cookie)
├── Banner UI (first visit)
├── Preference Center (detailed settings)
├── Script Blocker (prevent loading until consent)
├── Integration Hooks
│   ├── Video Analytics
│   ├── Payment Gateway
│   └── Marketing Tools
└── Audit Log
```

## Installation

### 1. Include CSS and JavaScript Files

Add to your HTML `<head>`:
```html
<link rel="stylesheet" href="css/cookie-consent.css">
```

Add before other scripts:
```html
<!-- Cookie Consent Scripts - Load Early -->
<script src="js/cookie-config.js"></script>
<script src="js/script-blocker.js"></script>
```

Add before closing `</body>`:
```html
<!-- Cookie Consent System -->
<script src="js/cookie-consent-manager.js"></script>
<script src="js/webinar-analytics.js"></script>
```

### 2. Configuration

Edit `js/cookie-config.js` to customize:

```javascript
window.CookieConsentConfig = {
    version: '1.0.0',
    language: 'fi',
    gdprCompliant: true,
    
    // Customize your Google Analytics ID
    services: {
        googleAnalytics: {
            enabled: true,
            measurementId: 'GA_MEASUREMENT_ID' // Replace with your GA4 ID
        },
        facebookPixel: {
            enabled: true,
            pixelId: 'YOUR_PIXEL_ID' // Replace with your Facebook Pixel ID
        }
    }
};
```

## File Structure

```
├── css/
│   └── cookie-consent.css          # All styling for consent system
├── js/
│   ├── cookie-config.js            # Configuration settings
│   ├── cookie-consent-manager.js   # Core consent management
│   ├── script-blocker.js           # Script blocking functionality
│   └── webinar-analytics.js        # Video and user analytics
├── cookie-admin.html               # Admin interface
└── COOKIE-CONSENT-README.md        # This documentation
```

## Usage

### Basic Implementation

The system initializes automatically when the page loads. No additional code is required for basic functionality.

### Checking Consent Status

```javascript
// Check if user has given consent
if (window.cookieManager && window.cookieManager.hasConsent()) {
    console.log('User has given consent');
}

// Check specific category consent
if (window.cookieManager && window.cookieManager.hasConsent('analytics')) {
    // Load analytics scripts
    loadGoogleAnalytics();
}
```

### Programmatic Consent Management

```javascript
// Show consent banner
window.cookieManager.showBanner();

// Show preferences center
window.cookieManager.showPreferences();

// Accept all cookies
window.cookieManager.acceptAll();

// Accept only necessary cookies
window.cookieManager.acceptNecessary();

// Withdraw consent
window.cookieManager.withdrawConsent();
```

### Event Listeners

```javascript
// Listen for consent changes
window.addEventListener('cookieConsentUpdated', function(event) {
    const consent = event.detail;
    console.log('Consent updated:', consent);
    
    if (consent.categories.analytics) {
        // Enable analytics
        enableAnalytics();
    }
    
    if (consent.categories.marketing) {
        // Enable marketing tools
        enableMarketing();
    }
});
```

## Analytics Integration

### Video Analytics

The system automatically tracks:
- Video play/pause events
- Viewing milestones (25%, 50%, 75%, 100%)
- Video quality changes
- Fullscreen usage
- Video completion rates

### User Journey Tracking

- Page views and time on page
- Scroll depth milestones
- Form interactions
- Button clicks
- Conversion events

### Custom Analytics

```javascript
// Track custom events
if (window.webinarAnalytics && window.webinarAnalytics.isEnabled) {
    window.webinarAnalytics.trackEvent('custom_action', {
        category: 'webinar',
        action: 'module_completed',
        label: 'Module 1'
    });
}
```

## Customization

### Styling

Modify `css/cookie-consent.css` to match your brand:

```css
:root {
    --cookie-primary-color: #a571aa;
    --cookie-secondary-color: #769757;
    --cookie-banner-bg: #ffffff;
    --cookie-text-color: #333333;
}
```

### Text Customization

Edit the `texts` object in `js/cookie-config.js`:

```javascript
texts: {
    fi: {
        banner: {
            title: 'Your Custom Title',
            description: 'Your custom description...',
            acceptAll: 'Accept All',
            acceptNecessary: 'Necessary Only',
            settings: 'Settings'
        }
    }
}
```

### Adding New Cookie Categories

1. Add to configuration:
```javascript
categories: {
    newCategory: {
        required: false,
        cookies: ['cookie_name'],
        scripts: ['script-id'],
        purposes: ['Purpose description']
    }
}
```

2. Update text translations
3. Handle in consent logic

## Admin Interface

Access the admin panel at `cookie-admin.html` to:
- View consent statistics
- Manage cookie settings
- Export compliance data
- Monitor activity logs
- Generate GDPR reports

### Admin Features
- Real-time consent statistics
- Service enable/disable toggles
- Data export (CSV, JSON)
- Activity logging
- GDPR compliance reporting

## GDPR Compliance Features

### Data Subject Rights
- **Right to be informed**: Clear cookie information
- **Right of access**: View stored consent data
- **Right to rectification**: Update consent preferences
- **Right to erasure**: Delete all stored data
- **Right to restrict processing**: Granular consent control
- **Right to data portability**: Export consent data
- **Right to object**: Easy consent withdrawal

### Legal Requirements Met
- ✅ Explicit consent before non-essential cookies
- ✅ Clear and plain language
- ✅ Granular consent options
- ✅ Easy withdrawal mechanism
- ✅ Consent records and audit trail
- ✅ Privacy policy integration
- ✅ Cookie categorization and purposes
- ✅ Script blocking until consent

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Minimal impact**: ~15KB total (gzipped)
- **Lazy loading**: Scripts load only when needed
- **Efficient storage**: Uses localStorage with fallback
- **Non-blocking**: Doesn't delay page rendering

## Security

- **XSS protection**: All user inputs sanitized
- **CSRF protection**: Secure consent storage
- **Data minimization**: Only necessary data stored
- **Secure cookies**: SameSite and Secure flags
- **Content Security Policy**: Compatible with CSP

## Testing

### Manual Testing
1. Clear browser data
2. Visit the site
3. Verify banner appears
4. Test all consent options
5. Verify script blocking/unblocking
6. Test preferences center
7. Verify data export

### Automated Testing
```javascript
// Test consent functionality
describe('Cookie Consent', () => {
    it('should show banner on first visit', () => {
        // Test implementation
    });
    
    it('should block scripts until consent', () => {
        // Test implementation
    });
    
    it('should save consent preferences', () => {
        // Test implementation
    });
});
```

## Troubleshooting

### Common Issues

**Banner not showing:**
- Check if consent already exists in localStorage
- Verify CSS is loaded
- Check console for JavaScript errors

**Scripts not loading:**
- Verify consent is given for the category
- Check script blocker configuration
- Ensure proper script IDs are used

**Preferences not saving:**
- Check localStorage availability
- Verify no JavaScript errors
- Ensure proper form validation

### Debug Mode

Enable debug mode in configuration:
```javascript
development: {
    debug: true,
    testMode: true
}
```

## Support

For technical support or questions:
- Check browser console for errors
- Review configuration settings
- Test in incognito mode
- Verify all files are loaded correctly

## License

This cookie consent system is part of the BloomLead webinar platform. All rights reserved.

## Changelog

### Version 1.0.0 (2025-12-12)
- Initial release
- Full GDPR compliance
- Video analytics integration
- Admin interface
- Multi-language support
- Script blocking system
- Preferences center
- Audit logging

---

**Note**: Remember to update your privacy policy to reflect the cookie usage and obtain proper legal review for GDPR compliance in your jurisdiction.