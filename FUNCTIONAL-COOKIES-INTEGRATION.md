# Functional Cookies Integration Guide

## Overview
The functional cookies system is now fully integrated with your GDPR-compliant cookie consent manager. Functional cookies will only be saved and retrieved when the user has explicitly granted consent for functional cookies.

## How It Works

### 1. Consent Checking
Before any functional cookie is saved or retrieved, the system checks:
- If the cookie consent manager is available (`window.cookieManager`)
- If the user has granted consent for the 'functional' category
- Falls back to checking localStorage for consent data

### 2. Consent States

#### ✅ Consent Granted
- All functional cookies work normally
- Video preferences are saved and restored
- "Continue Watching" feature is available
- User preferences persist across sessions

#### ❌ Consent Denied/Withdrawn
- No functional cookies are saved
- All existing functional cookies are cleared
- Default values are returned for all preferences
- "Continue Watching" section is hidden
- Console logs show when saves are blocked

### 3. Dynamic Consent Changes
The system listens for consent changes via the `cookieConsentUpdated` event:
- When consent is granted: Preferences are restored
- When consent is withdrawn: All functional cookies are cleared immediately

## Integration Points

### Pages with Integration
1. **courses.html** - Shows/hides "Continue Watching" based on consent
2. **courses-details.html** - Video player with consent-aware preference saving

### Cookie Categories
All functional cookies are categorized under the 'functional' consent category:
- `video_progress_*` - Video playback positions
- `video_volume` - Volume preferences
- `video_quality` - Quality preferences  
- `playback_speed` - Playback speed preferences
- `subtitles_enabled` - Subtitle preferences
- `last_webinar` - Last watched webinar
- `language` - Language preferences

## Testing

### Manual Testing
1. **Without Consent**: 
   - Visit the site
   - Reject functional cookies
   - Try to use video player - preferences won't be saved
   - Check console for "not allowed" messages

2. **With Consent**:
   - Accept functional cookies
   - Use video player - preferences are saved
   - Refresh page - preferences are restored

3. **Consent Withdrawal**:
   - Grant consent and save some preferences
   - Withdraw consent via cookie settings
   - All functional cookies are immediately cleared

### Console Testing
Run in browser console:
```javascript
// Test current consent status
FunctionalCookies.hasConsentFor('functional')

// Test saving (will fail if no consent)
FunctionalCookies.saveVolume(0.8)

// Test clearing all functional cookies
FunctionalCookies.clearAllFunctionalCookies()
```

## Security & Privacy

### GDPR Compliance
- ✅ No functional cookies saved without explicit consent
- ✅ All functional cookies cleared when consent withdrawn
- ✅ Clear user control over functional cookie usage
- ✅ Transparent about what data is saved

### Data Minimization
- Only saves essential functional preferences
- Automatic cleanup when consent is withdrawn
- No tracking or analytics in functional cookies
- Short expiration times (30 days for progress, 365 for preferences)

## Files Modified

### Core Files
- `js/functional-cookies.js` - Main functional cookies implementation
- `js/cookie-consent-manager.js` - Cookie consent system (existing)
- `js/cookie-config.js` - Cookie configuration (existing)

### Pages Updated
- `courses.html` - Added consent-aware "Continue Watching"
- `courses-details.html` - Added consent-aware video player

### Testing
- `js/functional-cookies-demo.js` - Console testing utilities

## Usage Examples

### Video Player Integration
```javascript
// Initialize video with consent checking
const video = document.getElementById('myVideo');
const videoId = 'my-webinar';

// This automatically checks consent before saving
initializeVideoPlayer(video, videoId);
```

### Manual Preference Saving
```javascript
// These will only save if consent is granted
FunctionalCookies.saveVolume(0.8);
FunctionalCookies.savePlaybackSpeed(1.25);
FunctionalCookies.saveVideoProgress('video-id', 45.5);
```

### Checking Consent Status
```javascript
if (FunctionalCookies.hasConsentFor('functional')) {
    // User has granted functional cookie consent
    // Safe to save preferences
} else {
    // No consent - use defaults only
}
```

## Troubleshooting

### Common Issues
1. **Preferences not saving**: Check if functional consent is granted
2. **Continue watching not showing**: Verify consent and that progress exists
3. **Console errors**: Ensure cookie consent manager loads before functional cookies

### Debug Mode
Enable debug logging by setting:
```javascript
window.CookieConsentConfig.development.debug = true;
```

This will show detailed console logs about consent checking and cookie operations.