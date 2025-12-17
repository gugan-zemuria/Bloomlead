# 🔍 Session ID & Guest Detection Guide

## How to See if a Guest Visits Your Website

### 1. **Quick Check Methods**

#### Browser Console (Easiest Way)
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Type these commands:

```javascript
// Check if visitor is a guest
isGuest()  // Returns true/false

// Get session ID
getSessionId()  // Returns the session ID string

// Get full session information
getSessionInfo()  // Returns complete session object

// Show all cookies
guestDetection.showAllCookies()  // Shows all cookies in alert
```

#### Browser Developer Tools
1. Press `F12` → **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Click **Cookies** in left sidebar
3. Look for these cookies:
   - `session_id` - The session identifier
   - `cookie_consent_status` - User's consent choice
   - `client_id` - Client identifier for load balancing

### 2. **Where is the Session ID?**

The session ID is stored in multiple places:

#### A. Cookie Storage
- **Cookie Name:** `session_id`
- **Format:** `sess_[timestamp]_[random1][random2]`
- **Example:** `sess_1k2l3m4n_abc123def456ghi789`
- **Duration:** Session (deleted when browser closes)

#### B. Session Storage
- **Key:** `current_session_id`
- **Access:** `sessionStorage.getItem('current_session_id')`

#### C. JavaScript Variable
- **Access:** `window.guestDetection.getSessionId()`

### 3. **Guest Detection Logic**

A visitor is considered a **guest** if:
- ❌ No existing `session_id` cookie
- ❌ No `user_token` cookie (for logged-in users)
- ❌ No visit history in localStorage
- ✅ First time visiting the website

A visitor is **NOT a guest** if:
- ✅ Has existing session cookie
- ✅ Has user authentication token
- ✅ Has previous visit history
- ✅ Is a returning visitor

### 4. **Session Information Available**

```javascript
{
  sessionId: "sess_1k2l3m4n_abc123def456ghi789",
  isGuest: true,           // true = guest, false = returning/logged in
  visitCount: 1,           // Number of visits
  firstVisit: "2024-01-15T10:30:00.000Z",
  lastVisit: null,         // Previous visit (null for first visit)
  currentVisit: "2024-01-15T10:30:00.000Z"
}
```

### 5. **Practical Examples**

#### Check Guest Status on Page Load
```javascript
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (window.isGuest && window.isGuest()) {
      console.log('👋 New guest visitor!');
      // Show welcome message for guests
      showWelcomeMessage();
    } else {
      console.log('👤 Returning visitor or logged in user');
      // Show personalized content
      showPersonalizedContent();
    }
  }, 1000);
});
```

#### Track Guest Behavior
```javascript
// Check if this is their first visit
if (window.guestDetection && window.guestDetection.isFirstVisit()) {
  // Show onboarding tour
  startOnboardingTour();
}

// Get visit count
const visitCount = window.guestDetection.getVisitCount();
if (visitCount > 3) {
  // Suggest registration after 3 visits
  showRegistrationPrompt();
}
```

### 6. **Debug Panel (Development Mode)**

When in development mode, a debug panel appears in the top-right corner showing:
- Current session ID
- Guest status (👋 Guest or 👤 User)
- Visit number
- First visit date
- Last visit date
- Button to show all cookies

### 7. **Server-Side Detection**

If you have a backend, you can also detect guests server-side:

#### PHP Example
```php
<?php
$sessionId = $_COOKIE['session_id'] ?? null;
$isGuest = empty($sessionId) || !isset($_COOKIE['user_token']);

if ($isGuest) {
    echo "Guest visitor detected";
} else {
    echo "Returning visitor or logged in user";
}
?>
```

#### Node.js Example
```javascript
app.get('/', (req, res) => {
  const sessionId = req.cookies.session_id;
  const userToken = req.cookies.user_token;
  const isGuest = !sessionId || !userToken;
  
  if (isGuest) {
    console.log('Guest visitor detected');
  } else {
    console.log('Returning visitor or logged in user');
  }
});
```

### 8. **Testing Different Scenarios**

#### Test as New Guest
1. Open **Incognito/Private** browser window
2. Visit your website
3. Check console: `isGuest()` should return `true`

#### Test as Returning Visitor
1. Visit website normally
2. Close and reopen browser
3. Visit again - `isGuest()` should return `false`

#### Clear Session (Reset to Guest)
```javascript
// Clear all session data
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### 9. **Demo Page**

Visit `session-demo.html` to see a live demonstration of:
- Current session information
- Guest detection status
- All cookies
- Interactive testing tools

### 10. **Troubleshooting**

#### Session ID Not Found
- Check if scripts are loaded: `window.guestDetection`
- Wait for initialization: Scripts load after DOM ready
- Check browser console for errors

#### Guest Detection Not Working
- Ensure `js/guest-detection.js` is included
- Check if cookies are enabled in browser
- Verify scripts load in correct order

#### Debug Mode Not Showing
- Set `window.CookieConsentConfig.development.debug = true`
- Or visit from `localhost` or `127.0.0.1`

---

## Summary

- **Session ID Location:** `session_id` cookie or `getSessionId()` function
- **Guest Check:** `isGuest()` function returns true/false
- **Full Info:** `getSessionInfo()` returns complete session object
- **Debug:** Use browser Developer Tools or the debug panel
- **Demo:** Open `session-demo.html` for interactive testing