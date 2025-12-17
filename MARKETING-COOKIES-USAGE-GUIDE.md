# Marketing Cookies Usage Guide

## Overview
The marketing cookies system tracks user behavior, campaign attribution, conversions, and enables retargeting for the BloomLead webinar platform. It integrates seamlessly with your existing cookie consent system.

## What Gets Tracked

### 1. Campaign Attribution
- **First-Touch Attribution**: The first marketing source that brought the user
- **Last-Touch Attribution**: The most recent marketing source before conversion
- **UTM Parameters**: source, medium, campaign, term, content
- **Multi-Touch Journey**: All touchpoints in the customer journey

### 2. Conversion Tracking
- Webinar registrations
- Email signups
- Downloads (slides, resources)
- Webinar completions
- Contact form submissions

### 3. User Behavior & Interests
- Webinar topics viewed
- Content interests
- User segments (engaged viewer, casual browser, etc.)
- Conversion history

### 4. Ad Performance
- Ad clicks and sources
- Social media origins
- Email campaign clicks
- Retargeting pixel fires

### 5. A/B Testing
- Test variants assigned
- User experiment groups

## Implementation

### Automatic Tracking
The system automatically tracks:
- Page views with UTM parameters
- Video engagement (play, pause, milestones, completion)
- Form submissions (when properly marked)
- Download clicks (when properly marked)

### Manual Tracking Functions

#### Track Webinar Registration
```javascript
trackWebinarRegistration('webinar-123', 'Leadership Webinar', 'user@example.com', 49.99);
```

#### Track Video Engagement
```javascript
trackVideoEngagement('webinar-123', 'Leadership Webinar', 'play', 120, 3600);
```

#### Track Resource Download
```javascript
trackResourceDownload('Leadership Guide PDF', 'pdf', 'webinar-123');
```

#### Track Contact Form
```javascript
trackContactForm('general', { source: 'pricing-page' });
```

#### Track Newsletter Signup
```javascript
trackNewsletterSignup('user@example.com', 'footer');
```

## HTML Attributes for Automatic Tracking

### Newsletter Forms
```html
<form data-form-type="newsletter" data-source="hero-section">
    <input type="email" name="email" required>
    <button type="submit">Subscribe</button>
</form>
```

### Webinar Registration Forms
```html
<form data-form-type="webinar-registration" 
      data-webinar-id="webinar-123" 
      data-webinar-title="Leadership Webinar">
    <input type="email" name="email" required>
    <input type="hidden" name="price" value="49.99">
    <button type="submit">Register</button>
</form>
```

### Contact Forms
```html
<form data-form-type="contact" data-form-subtype="general">
    <input type="email" name="email" required>
    <textarea name="message"></textarea>
    <button type="submit">Send</button>
</form>
```

### Download Links
```html
<a href="/resources/guide.pdf" 
   data-track="download" 
   data-resource-name="Leadership Guide" 
   data-resource-type="pdf" 
   data-webinar-id="webinar-123">
   Download Guide
</a>
```

### Video Elements
```html
<video data-webinar-id="webinar-123" 
       data-webinar-title="Leadership Webinar">
    <source src="video.mp4" type="video/mp4">
</video>
```

### Page Tracking
```html
<div data-webinar-page 
     data-webinar-id="leadership-page" 
     data-webinar-title="Leadership Training" 
     data-webinar-topic="Leadership" 
     style="display: none;"></div>
```

## Third-Party Integration

### Google Ads
```javascript
// Initialize (add your conversion ID)
ThirdPartyMarketing.initGoogleAds('AW-XXXXXXXXX');

// Track conversion
ThirdPartyMarketing.trackGoogleAdsConversion('AW-XXXXXXX/XXXXXX', 49.99);
```

### Facebook Pixel
```javascript
// Initialize (add your pixel ID)
ThirdPartyMarketing.initFacebookPixel('XXXXXXXXXXXXXXX');

// Track events
ThirdPartyMarketing.trackFacebookEvent('Lead', {
    content_name: 'Leadership Webinar',
    value: 49.99,
    currency: 'USD'
});
```

### LinkedIn Insight Tag
```javascript
// Initialize (add your partner ID)
ThirdPartyMarketing.initLinkedInTag('XXXXXX');

// Track conversion
ThirdPartyMarketing.trackLinkedInConversion('CONVERSION_ID');
```

## A/B Testing

### Assign Test Variant
```javascript
const variant = WebinarMarketing.assignABTestVariant('pricing_test');
if (variant === 'B') {
    // Show variant B
}
```

### Get Test Data
```javascript
const testData = MarketingCookies.getABTests();
console.log('Active tests:', testData);
```

## Customer Journey Analysis

### Get Complete Journey
```javascript
const journey = MarketingIntegration.getMarketingData();
console.log('Customer journey:', journey);
```

### Example Journey Data
```javascript
{
    marketingUserId: "mkt_1639123456789_abc123def",
    firstTouch: {
        source: "google",
        medium: "cpc",
        campaign: "leadership_webinar",
        timestamp: "2023-12-15T10:30:00Z"
    },
    lastTouch: {
        source: "facebook",
        medium: "social",
        campaign: "retargeting",
        timestamp: "2023-12-15T14:20:00Z"
    },
    conversions: [
        { type: "email_signup", timestamp: "2023-12-15T10:35:00Z" },
        { type: "webinar_registration", timestamp: "2023-12-15T14:25:00Z" }
    ],
    interests: ["webinar_attendee", "leadership", "professional_development"],
    webinarTopics: ["Leadership", "Management", "Team Building"],
    segment: "engaged_viewer",
    socialSource: "facebook",
    abTests: {
        "pricing_test": { variant: "B", timestamp: "2023-12-15T10:30:00Z" }
    }
}
```

## UTM Parameter Examples

### Email Campaign
```
https://bloomlead.com/?utm_source=email&utm_medium=newsletter&utm_campaign=december_webinar&utm_content=cta_button
```

### Google Ads
```
https://bloomlead.com/?utm_source=google&utm_medium=cpc&utm_campaign=leadership_webinar&utm_term=leadership+training
```

### Facebook Ad
```
https://bloomlead.com/?utm_source=facebook&utm_medium=social&utm_campaign=retargeting&utm_content=video_ad
```

### LinkedIn Post
```
https://bloomlead.com/?utm_source=linkedin&utm_medium=social&utm_campaign=thought_leadership&utm_content=article_link
```

## Privacy & GDPR Compliance

### Check Consent
```javascript
const hasConsent = MarketingIntegration.hasMarketingConsent();
if (hasConsent) {
    // Track marketing events
}
```

### Clear Marketing Data
```javascript
MarketingIntegration.clearMarketingData();
```

### Consent Change Handling
The system automatically listens for consent changes and initializes or clears data accordingly.

## Configuration

### Enable Third-Party Services
Edit `js/cookie-config.js` to enable services:

```javascript
services: {
    googleAnalytics: {
        enabled: true,
        measurementId: 'GA_MEASUREMENT_ID'
    },
    facebookPixel: {
        enabled: true,
        pixelId: 'YOUR_PIXEL_ID'
    }
}
```

### Custom Analytics Endpoint
Set your analytics endpoint in the configuration:

```javascript
analytics: {
    endpoint: 'https://your-domain.com/api/marketing-analytics'
}
```

## Testing

### Debug Mode
Enable debug mode in development:

```javascript
development: {
    debug: true,
    testMode: true
}
```

### Mock Consent
For testing without cookie consent:

```javascript
development: {
    mockConsent: {
        marketing: true,
        analytics: true
    }
}
```

## Best Practices

1. **Always check consent** before tracking marketing events
2. **Use descriptive names** for webinar IDs and titles
3. **Include UTM parameters** in all marketing campaigns
4. **Test A/B variants** with meaningful sample sizes
5. **Monitor conversion funnels** regularly
6. **Respect user privacy** and provide clear opt-out options
7. **Keep tracking data** relevant and actionable

## Troubleshooting

### Common Issues

1. **Events not tracking**: Check if marketing consent is given
2. **UTM parameters not captured**: Ensure the page loads the marketing scripts
3. **Third-party pixels not firing**: Verify pixel IDs and consent status
4. **A/B tests not working**: Check variant assignment and application logic

### Debug Console
Use browser console to check:
```javascript
console.log('Marketing consent:', MarketingIntegration.hasMarketingConsent());
console.log('Customer journey:', MarketingIntegration.getMarketingData());
console.log('UTM data:', MarketingCookies.getLastTouchCampaign());
```

## Support

For technical support or questions about the marketing cookies implementation, refer to the code comments or contact the development team.