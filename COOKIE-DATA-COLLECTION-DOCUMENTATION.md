# Cookie Data Collection Documentation
## BloomLead Webinar Platform

This document provides a comprehensive overview of all cookies used on the BloomLead webinar platform, what data they collect, and their purposes.

---

## 🍪 Cookie Categories Overview

### 1. Strictly Necessary Cookies (Always Active)
These cookies are essential for the website to function and cannot be disabled.

### 2. Functional Cookies (Requires Consent)
These cookies enhance your experience by remembering your preferences.

### 3. Analytics Cookies (Requires Consent)
These cookies help us understand how you use our website.

### 4. Marketing Cookies (Requires Consent)
These cookies enable targeted advertising and social media features.

---

## 🎥 Video Functionality: Functional vs Analytics

| Aspect | Functional Cookies | Analytics Cookies |
|--------|-------------------|-------------------|
| **Purpose** | User experience & convenience | Business intelligence & insights |
| **Video Progress** | Save where user left off | Track engagement patterns |
| **Volume/Speed** | Remember user preferences | Analyze usage patterns |
| **Data Focus** | Individual user convenience | Aggregate behavior analysis |
| **Examples** | "Resume at 2:30", "80% volume" | "50% drop-off at 5min", "Mobile users prefer 1.25x speed" |
| **Consent Category** | Functional | Analytics |
| **Data Retention** | Until user changes preference | Sent to analytics, not stored locally |

---

## 📋 Detailed Cookie Inventory

### STRICTLY NECESSARY COOKIES

#### `webinar_session`
- **Purpose**: Session management and user identification
- **Data Collected**:
  - Unique session identifier (e.g., `sess_Kj8mN2pQ9rT5vX7zA3bC1dE6fG8hI0jK`)
  - Session creation timestamp
- **Duration**: Session only (deleted when browser closes)
- **Security**: Secure, SameSite=Strict
- **Legal Basis**: Legitimate interest (essential for website functionality)

#### `x-csrf-token`
- **Purpose**: Cross-Site Request Forgery (CSRF) protection
- **Data Collected**:
  - Cryptographically secure random token (e.g., `dGltZXN0YW1wLjEyMzQ1Njc4OTA`)
  - Token generation timestamp
- **Duration**: 24 hours
- **Security**: Secure, SameSite=Strict
- **Legal Basis**: Legitimate interest (security protection)

#### `cookie_consent_status`
- **Purpose**: Remembers your cookie consent choices
- **Data Collected**:
  - Consent status: `pending`, `accepted`, `rejected`, or `partial`
  - Consent timestamp
- **Duration**: 365 days
- **Security**: Secure, SameSite=Lax
- **Legal Basis**: Legal obligation (GDPR compliance)

#### `bloomlead_cookie_consent`
- **Purpose**: Detailed cookie consent preferences
- **Data Collected**:
  ```json
  {
    "categories": {
      "necessary": true,
      "functional": false,
      "analytics": false,
      "marketing": false
    },
    "timestamp": "2024-12-12T10:30:00.000Z",
    "version": "1.0.0",
    "userAgent": "Mozilla/5.0..."
  }
  ```
- **Duration**: 365 days
- **Security**: Stored in localStorage
- **Legal Basis**: Legal obligation (GDPR compliance)

---

### FUNCTIONAL COOKIES (Requires User Consent)

#### `video_progress_{videoId}`
- **Purpose**: Remembers where you left off watching videos
- **Data Collected**:
  - Video playback position in seconds (e.g., `127.5`)
  - Video identifier (e.g., `module-1-webinar`)
- **Example**: `video_progress_module-1-webinar: "127.5"`
- **Duration**: 30 days
- **Legal Basis**: Consent

#### `video_volume`
- **Purpose**: Remembers your preferred video volume
- **Data Collected**:
  - Volume level as decimal (0.0 to 1.0)
  - Example: `0.8` (80% volume)
- **Duration**: 365 days
- **Legal Basis**: Consent

#### `video_quality`
- **Purpose**: Remembers your preferred video quality
- **Data Collected**:
  - Quality setting: `auto`, `720p`, `1080p`, `480p`
- **Duration**: 365 days
- **Legal Basis**: Consent

#### `playback_speed`
- **Purpose**: Remembers your preferred video playback speed
- **Data Collected**:
  - Speed multiplier: `0.5`, `0.75`, `1.0`, `1.25`, `1.5`, `2.0`
- **Duration**: 365 days
- **Legal Basis**: Consent

#### `subtitles_enabled`
- **Purpose**: Remembers if you prefer subtitles on or off
- **Data Collected**:
  - Boolean value: `true` or `false`
- **Duration**: 365 days
- **Legal Basis**: Consent

#### `last_webinar`
- **Purpose**: Tracks the last webinar you watched for "Continue Watching" feature
- **Data Collected**:
  - Webinar identifier (e.g., `module-1-webinar`)
- **Duration**: 30 days
- **Legal Basis**: Consent

#### `language`
- **Purpose**: Remembers your language preference
- **Data Collected**:
  - Language code: `en`, `fi`, `sv`, etc.
- **Duration**: 365 days
- **Legal Basis**: Consent

#### `ui_theme`
- **Purpose**: Remembers your preferred theme (light/dark)
- **Data Collected**:
  - Theme setting: `light`, `dark`
- **Duration**: 365 days
- **Legal Basis**: Consent

#### `ui_font_size`
- **Purpose**: Remembers your preferred font size
- **Data Collected**:
  - Font size in pixels: `14px`, `16px`, `18px`, `20px`
- **Duration**: 365 days
- **Legal Basis**: Consent

---

### ANALYTICS COOKIES (Requires User Consent)

#### Google Analytics Cookies (if enabled)

##### `_ga`
- **Purpose**: Distinguishes unique users
- **Data Collected**:
  - Randomly generated client ID
  - Example: `GA1.2.1234567890.1639123456`
- **Duration**: 2 years
- **Third Party**: Google
- **Legal Basis**: Consent

##### `_ga_*`
- **Purpose**: Google Analytics 4 property-specific cookie
- **Data Collected**:
  - Session information
  - User engagement data
- **Duration**: 2 years
- **Third Party**: Google
- **Legal Basis**: Consent

##### `_gid`
- **Purpose**: Distinguishes users for 24 hours
- **Data Collected**:
  - Randomly generated identifier
- **Duration**: 24 hours
- **Third Party**: Google
- **Legal Basis**: Consent

#### Custom Analytics Data

##### `analytics_user_id`
- **Purpose**: Anonymous user identification for analytics
- **Data Collected**:
  - Unique anonymous identifier (e.g., `user_1639123456789_Kj8mN2pQ`)
  - Creation timestamp
- **Duration**: 2 years
- **Legal Basis**: Consent

##### `analytics_session_id`
- **Purpose**: Session identification for analytics
- **Data Collected**:
  - Session identifier (e.g., `session_1639123456789_9rT5vX7z`)
  - Session start time
- **Duration**: 30 minutes
- **Legal Basis**: Consent

##### `page_view_count`
- **Purpose**: Count page views for user engagement
- **Data Collected**:
  - Number of pages viewed (e.g., `5`)
- **Duration**: 30 days
- **Legal Basis**: Consent

##### `traffic_source`
- **Purpose**: Track how users found the website
- **Data Collected**:
  ```json
  {
    "source": "google",
    "medium": "organic",
    "campaign": "webinar_promotion",
    "referrer": "https://google.com",
    "landingPage": "/courses.html",
    "timestamp": "2024-12-12T10:30:00Z"
  }
  ```
- **Duration**: 30 days
- **Legal Basis**: Consent

##### Video Engagement Analytics (Business Insights Only)
- **Purpose**: Analyze video engagement patterns for business intelligence
- **Note**: This is separate from functional cookies which save user preferences
- **Data Collected**:
  ```json
  {
    "type": "video_analytics",
    "action": "engagement_start|engagement_pause|completion|drop_off|engagement_milestone",
    "videoId": "module-1-webinar",
    "userId": "user_1639123456789_Kj8mN2pQ",
    "sessionId": "session_1639123456789_9rT5vX7z",
    "actualWatchTime": 95.2,
    "engagementRate": 87.5,
    "completionRate": 100,
    "dropOffPoint": 127.5,
    "deviceType": "desktop",
    "browserType": "chrome",
    "timestamp": 1639123456789
  }
  ```
- **Storage**: Temporary (sent to analytics server)
- **Legal Basis**: Consent
- **Difference from Functional**: Analytics tracks business metrics, functional saves user preferences

##### User Journey Analytics
- **Purpose**: Understand user behavior on the site
- **Data Collected**:
  ```json
  {
    "type": "user_action",
    "action": "scroll_milestone|button_click|form_focus|webinar_registration",
    "page": "/courses.html",
    "userId": "user_1639123456789_Kj8mN2pQ",
    "sessionId": "session_1639123456789_9rT5vX7z",
    "milestone": 50,
    "buttonText": "Accept All",
    "webinarId": "module-1-webinar",
    "timestamp": 1639123456789
  }
  ```
- **Storage**: Temporary (sent to analytics)
- **Legal Basis**: Consent

##### Page Analytics
- **Purpose**: Track page views and user engagement
- **Data Collected**:
  ```json
  {
    "page": "/courses-details.html",
    "title": "BloomLead - Module 1",
    "referrer": "https://google.com",
    "screenResolution": "1920x1080",
    "viewportSize": "1200x800",
    "timeOnPage": 45000,
    "scrollDepth": 75
  }
  ```
- **Storage**: Temporary (sent to analytics)
- **Legal Basis**: Consent

---

### MARKETING COOKIES (Requires User Consent)

#### Facebook Pixel (if enabled)

##### `_fbp`
- **Purpose**: Facebook browser pixel for conversion tracking
- **Data Collected**:
  - Browser fingerprint for ad attribution
  - Example: `fb.1.1639123456789.1234567890`
- **Duration**: 90 days
- **Third Party**: Facebook/Meta
- **Legal Basis**: Consent

##### `_fbc`
- **Purpose**: Facebook click identifier
- **Data Collected**:
  - Click ID from Facebook ads
- **Duration**: 90 days
- **Third Party**: Facebook/Meta
- **Legal Basis**: Consent

#### LinkedIn Insight Tag (if enabled)

##### `linkedin_oauth`
- **Purpose**: LinkedIn conversion tracking
- **Data Collected**:
  - LinkedIn member identification data
- **Duration**: 30 days
- **Third Party**: LinkedIn
- **Legal Basis**: Consent

#### Retargeting Cookies

##### `retargeting_pixel`
- **Purpose**: Enable retargeting campaigns
- **Data Collected**:
  - Pages visited
  - Actions taken (video views, form submissions)
  - Timestamp of visits
- **Duration**: 30-90 days
- **Legal Basis**: Consent

---

## 🔒 Data Security & Privacy

### Encryption & Security
- All cookies use secure transmission (HTTPS)
- Sensitive cookies use `SameSite=Strict` protection
- CSRF tokens are cryptographically secure
- No personally identifiable information in functional cookies

### Data Minimization
- Only essential data is collected
- Automatic expiration of temporary data
- No cross-site tracking without consent
- Regular cleanup of expired data

### User Control
- Granular consent for each cookie category
- Easy withdrawal of consent
- Immediate deletion when consent is withdrawn
- Clear explanation of each cookie's purpose

---

## 📊 Data Processing Details

### Functional Cookies Processing
```javascript
// Example of how functional data is processed
{
  "video_progress_module-1": "127.5",     // Seconds watched
  "video_volume": "0.8",                  // Volume level (0-1)
  "playback_speed": "1.25",              // Speed multiplier
  "language": "fi",                       // Language code
  "last_webinar": "module-1-webinar"     // Last watched ID
}
```

### Analytics Data Processing
```javascript
// Example analytics event
{
  "event_type": "video_milestone",
  "video_id": "module-1-webinar",
  "milestone_percent": 50,
  "session_duration": 1200000,
  "user_agent_hash": "abc123...",        // Hashed for privacy
  "timestamp": "2024-12-12T10:30:00Z"
}
```

### Marketing Data Processing
```javascript
// Example marketing conversion
{
  "conversion_type": "webinar_signup",
  "source": "facebook_ad",
  "campaign_id": "campaign_123",
  "value": 125.00,                       // Course price
  "currency": "EUR"
}
```

---

## 🌍 International Compliance

### GDPR (EU) Compliance
- ✅ Explicit consent required for non-essential cookies
- ✅ Right to withdraw consent
- ✅ Data portability (export functionality)
- ✅ Right to erasure (delete functionality)
- ✅ Transparent information about processing

### CCPA (California) Compliance
- ✅ Clear disclosure of data collection
- ✅ Opt-out mechanisms available
- ✅ No sale of personal information
- ✅ Right to know what data is collected

### Other Jurisdictions
- Cookie consent adapts to user's detected region
- Stricter consent requirements for EU users
- Flexible consent model for other regions

---

## 🔄 Cookie Lifecycle

### Creation
1. User visits website
2. Necessary cookies created immediately
3. Consent banner shown for optional cookies
4. Functional/Analytics/Marketing cookies created only after consent

### Updates
1. User changes preferences → Cookies updated immediately
2. Consent withdrawn → Cookies deleted immediately
3. New features → User re-consented for new cookie types

### Deletion
1. **Automatic**: Cookies expire based on set duration
2. **User Action**: User withdraws consent → Immediate deletion
3. **Manual**: User clears browser data
4. **Programmatic**: Website clears cookies when consent changes

---

## 📞 Contact & Data Requests

For questions about cookies or to exercise your data rights:

**Email**: contact@bloomlead.io  
**Phone**: +358 44 388 3188 (Tue & Thu 17:00-18:00)

**Available Rights**:
- Access your cookie data
- Correct inaccurate data
- Delete your data
- Export your data
- Withdraw consent
- Object to processing

---

*Last Updated: December 12, 2024*  
*Version: 1.0.0*