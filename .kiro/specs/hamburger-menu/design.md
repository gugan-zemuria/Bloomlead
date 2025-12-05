# Hamburger Menu Design Document

## Overview

This design document outlines the implementation of a responsive hamburger menu navigation system for the BloomLead website. The solution will provide mobile users with an animated, accessible navigation experience using vanilla HTML, CSS, and JavaScript. The design is inspired by modern React component patterns but implemented without framework dependencies to maintain compatibility with the existing static HTML site structure.

The hamburger menu will replace the desktop navigation on viewports below 992px, featuring smooth animations, keyboard accessibility, and touch-friendly interactions. All functionality will be contained in shared CSS and JavaScript files to ensure consistency across all 13 HTML pages.

## Architecture

### Component Structure

The hamburger menu system consists of three main components:

1. **Hamburger Button Component**: A clickable button with three animated lines that transforms into an X when active
2. **Mobile Menu Panel Component**: A dropdown panel containing navigation links with staggered animations
3. **Backdrop Component**: A semi-transparent overlay that provides visual separation and click-to-close functionality

### File Organization

```
css/
  └── hamburger-menu.css          # All hamburger menu styles
js/
  └── hamburger-menu.js           # All hamburger menu functionality
[page].html                       # Each page includes the above files
```

### Responsive Behavior

The system uses CSS media queries and JavaScript viewport detection to switch between mobile and desktop modes:

- **Mobile Mode** (< 992px): Hamburger button visible, desktop nav hidden, mobile menu available
- **Desktop Mode** (≥ 992px): Desktop nav visible, hamburger button hidden, mobile menu disabled

## Components and Interfaces

### 1. Hamburger Button Component

**HTML Structure:**
```html
<button class="hamburger-btn" aria-label="Open menu" aria-expanded="false">
  <span class="hamburger-line hamburger-line-top"></span>
  <span class="hamburger-line hamburger-line-middle"></span>
  <span class="hamburger-line hamburger-line-bottom"></span>
</button>
```

**CSS Classes:**
- `.hamburger-btn`: Base button styling (48x48px, rounded, bordered)
- `.hamburger-btn:hover`: Hover state with background tint
- `.hamburger-btn:focus`: Focus ring for accessibility
- `.hamburger-btn.active`: Active state when menu is open
- `.hamburger-line`: Base line styling (24x2px, green)
- `.hamburger-line-top.active`: Rotated 45° and translated down
- `.hamburger-line-middle.active`: Opacity 0
- `.hamburger-line-bottom.active`: Rotated -45° and translated up

**JavaScript Interface:**
```javascript
class HamburgerButton {
  constructor(buttonElement)
  toggle()                    // Toggle menu open/closed
  open()                      // Open menu
  close()                     // Close menu
  isOpen()                    // Return boolean state
  updateAriaExpanded(state)   // Update ARIA attribute
}
```

### 2. Mobile Menu Panel Component

**HTML Structure:**
```html
<div class="mobile-menu-panel">
  <nav class="mobile-menu-nav">
    <ul class="mobile-menu-list">
      <li class="mobile-menu-item"><a href="pricing.html">Webinaarivaihtoehdot & Hinnat</a></li>
      <li class="mobile-menu-item"><a href="coaches.html">Valmentajat</a></li>
      <li class="mobile-menu-item"><a href="blog.html">Blogi</a></li>
      <li class="mobile-menu-item"><a href="contact.html">Yhteystiedot</a></li>
    </ul>
  </nav>
</div>
```

**CSS Classes:**
- `.mobile-menu-panel`: Container with slide-down animation
- `.mobile-menu-panel.show`: Visible state with transform
- `.mobile-menu-nav`: Navigation wrapper
- `.mobile-menu-list`: Vertical list container
- `.mobile-menu-item`: Individual list item with border
- `.mobile-menu-item a`: Link styling with hover effects
- `.mobile-menu-item:nth-child(n) a`: Staggered animation delays

**JavaScript Interface:**
```javascript
class MobileMenuPanel {
  constructor(panelElement)
  show()                      // Show panel with animation
  hide()                      // Hide panel with animation
  isVisible()                 // Return boolean visibility
  addStaggeredAnimations()    // Apply animation delays to links
}
```

### 3. Backdrop Component

**HTML Structure:**
```html
<div class="mobile-menu-backdrop"></div>
```

**CSS Classes:**
- `.mobile-menu-backdrop`: Full-screen overlay with blur
- `.mobile-menu-backdrop.show`: Visible state with opacity transition

**JavaScript Interface:**
```javascript
class MenuBackdrop {
  constructor(backdropElement)
  show()                      // Show backdrop with fade-in
  hide()                      // Hide backdrop with fade-out
  onClick(callback)           // Register click handler
}
```

### 4. Menu Controller (Main Orchestrator)

**JavaScript Interface:**
```javascript
class HamburgerMenuController {
  constructor()
  init()                      // Initialize all components
  toggleMenu()                // Toggle menu state
  openMenu()                  // Open menu (button + panel + backdrop)
  closeMenu()                 // Close menu (button + panel + backdrop)
  handleResize()              // Handle viewport changes
  handleKeyboard(event)       // Handle keyboard interactions
  lockBodyScroll()            // Prevent body scrolling
  unlockBodyScroll()          // Restore body scrolling
}
```

## Data Models

### Menu State

```javascript
const MenuState = {
  isOpen: boolean,            // Current open/closed state
  isMobileViewport: boolean,  // Current viewport mode
  isAnimating: boolean        // Animation in progress flag
}
```

### Configuration

```javascript
const MenuConfig = {
  breakpoint: 992,            // Mobile/desktop breakpoint in pixels
  animationDuration: {
    icon: 300,                // Hamburger icon animation (ms)
    panel: 500,               // Panel slide animation (ms)
    backdrop: 500,            // Backdrop fade animation (ms)
    linkStagger: 75           // Delay between link animations (ms)
  },
  colors: {
    brandGreen: '#769757',    // Primary brand color
    brandPurple: '#a571aa',   // Secondary brand color
    darkGray: '#374151',      // Text color
    backdropBg: 'rgba(0, 0, 0, 0.4)'  // Backdrop color
  },
  dimensions: {
    buttonSize: 48,           // Button width/height (px)
    lineWidth: 24,            // Hamburger line width (px)
    lineHeight: 2,            // Hamburger line height (px)
    borderWidth: 2            // Button border width (px)
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Viewport-based visibility toggle
*For any* viewport width, when the width is below 992px, the hamburger button should be visible and the desktop navigation should be hidden; when the width is 992px or above, the desktop navigation should be visible and the hamburger button should be hidden.
**Validates: Requirements 1.1, 1.2**

### Property 2: Responsive layout switching
*For any* initial viewport size, when the viewport is resized across the 992px breakpoint, the navigation layout should automatically switch between mobile and desktop modes.
**Validates: Requirements 1.3**

### Property 3: Button dimensions and styling
*For any* rendered hamburger button, the button should have dimensions of 48x48 pixels, a 2px border in brand green color (#769757), and contain three horizontal lines each 24px wide and 2px tall in brand green color.
**Validates: Requirements 2.1, 2.2**

### Property 4: Interactive state styling
*For any* user interaction (hover, focus) with the hamburger button, the appropriate visual feedback should be applied (background tint on hover, focus ring on focus).
**Validates: Requirements 2.3, 2.4**

### Property 5: ARIA attribute presence
*For any* rendered hamburger button, the element should have aria-label and aria-expanded attributes with appropriate values.
**Validates: Requirements 2.5**

### Property 6: Icon animation on open
*For any* hamburger button click to open the menu, the top line should rotate 45 degrees and translate downward, the middle line should fade to opacity 0, and the bottom line should rotate -45 degrees and translate upward, all within 300 milliseconds.
**Validates: Requirements 3.1, 3.2, 3.3, 3.5**

### Property 7: Icon animation reversal
*For any* hamburger button click to close the menu, all line transformations should reverse to return to the initial three-line state within 300 milliseconds.
**Validates: Requirements 3.4, 3.5**

### Property 8: Menu panel slide animation
*For any* menu toggle action, the mobile menu panel should slide down from below the header over 500 milliseconds when opening, and slide up over 500 milliseconds when closing.
**Validates: Requirements 4.1, 4.4**

### Property 9: Backdrop appearance
*For any* menu open action, a semi-transparent backdrop with 40% black opacity and blur effect should appear.
**Validates: Requirements 4.2**

### Property 10: Body scroll prevention
*For any* menu state, when the menu is open, the body element's overflow should be set to hidden; when the menu is closed, the overflow restriction should be removed.
**Validates: Requirements 4.3, 4.5**

### Property 11: Navigation links display
*For any* open mobile menu, all navigation links (Webinaarivaihtoehdot & Hinnat, Valmentajat, Blogi, Yhteystiedot) should be visible in a vertical list.
**Validates: Requirements 5.1**

### Property 12: Staggered link animations
*For any* mobile menu opening, navigation links should fade in with staggered delays of 75ms between each link.
**Validates: Requirements 5.2**

### Property 13: Link styling consistency
*For any* displayed navigation link, the link should use 18px font size, medium font weight, and dark gray color.
**Validates: Requirements 5.3**

### Property 14: Link hover effects
*For any* navigation link hover interaction, the link should apply a light green background and shift 8px to the right.
**Validates: Requirements 5.4**

### Property 15: Link click behavior
*For any* navigation link click, the mobile menu should close.
**Validates: Requirements 5.5**

### Property 16: Backdrop click closes menu
*For any* click on the backdrop when the menu is open, the menu should close with the same animation as clicking the hamburger button.
**Validates: Requirements 6.1, 6.3**

### Property 17: Menu panel click preservation
*For any* click inside the mobile menu panel, the menu should remain open.
**Validates: Requirements 6.2**

### Property 18: Cross-page consistency
*For any* HTML page in the site, the hamburger menu should function identically with the same behavior and appearance.
**Validates: Requirements 7.1**

### Property 19: Automatic initialization
*For any* page load, the hamburger menu functionality should initialize and work without requiring page-specific configuration code.
**Validates: Requirements 7.4**

### Property 20: Keyboard focus navigation
*For any* keyboard tab navigation, the hamburger button should be focusable and menu links should maintain proper focus order.
**Validates: Requirements 8.1, 8.3**

### Property 21: Keyboard menu toggle
*For any* focused hamburger button, pressing Enter or Space should toggle the menu open or closed.
**Validates: Requirements 8.2**

### Property 22: Escape key closes menu
*For any* open mobile menu, pressing the Escape key should close the menu.
**Validates: Requirements 8.4**

### Property 23: ARIA state synchronization
*For any* menu state change, the aria-expanded attribute should update to reflect the current state (true when open, false when closed).
**Validates: Requirements 8.5**

### Property 24: Brand color consistency
*For any* rendered hamburger menu elements, the brand green color (#769757) should be used for borders and icon lines, and brand purple (#a571aa) should be used for hover highlights.
**Validates: Requirements 9.1, 9.2**

### Property 25: Design pattern consistency
*For any* hamburger menu styling, the white background, shadows, and easing functions should match existing site design patterns.
**Validates: Requirements 9.3, 9.4**

### Property 26: Layout preservation
*For any* hamburger menu display, the existing header height and logo positioning should remain unchanged.
**Validates: Requirements 9.5**

### Property 27: Touch responsiveness
*For any* touch interaction on the hamburger button or navigation links, the system should respond immediately and provide visual feedback.
**Validates: Requirements 10.1, 10.2, 10.5**

### Property 28: Touch scroll prevention
*For any* open mobile menu on a touch device, scrolling of content behind the menu should be prevented.
**Validates: Requirements 10.3**

### Property 29: Gesture non-interference
*For any* swipe gesture on the backdrop, the gesture should not be prevented or interfered with.
**Validates: Requirements 10.4**

## Error Handling

### Viewport Resize Errors
- **Issue**: Rapid resize events causing animation conflicts
- **Solution**: Implement debouncing on resize handler (250ms delay)
- **Fallback**: If animation state is inconsistent, reset to closed state

### Missing DOM Elements
- **Issue**: Required elements not found during initialization
- **Solution**: Check for element existence before attaching event listeners
- **Fallback**: Log warning to console and gracefully degrade to desktop navigation

### Animation Interruption
- **Issue**: User clicks button during ongoing animation
- **Solution**: Set `isAnimating` flag and ignore clicks until animation completes
- **Fallback**: If flag gets stuck, reset after 1 second timeout

### Focus Trap Errors
- **Issue**: Focus escapes mobile menu when open
- **Solution**: Implement focus trap that cycles through menu elements
- **Fallback**: If focus is lost, return focus to hamburger button

### Touch Event Conflicts
- **Issue**: Touch and click events both firing
- **Solution**: Use `touchstart` with `preventDefault` to avoid duplicate events
- **Fallback**: Debounce rapid successive events (300ms window)

### CSS Not Loaded
- **Issue**: Hamburger menu CSS file fails to load
- **Solution**: Include critical inline styles as fallback
- **Fallback**: Display unstyled but functional navigation

### JavaScript Not Loaded
- **Issue**: Hamburger menu JS file fails to load
- **Solution**: Ensure desktop navigation remains accessible
- **Fallback**: Mobile users see desktop navigation (not ideal but functional)

## Testing Strategy

### Unit Testing Approach

The hamburger menu will be tested using a combination of unit tests and property-based tests. Since this is a vanilla JavaScript implementation without a framework, we'll use Jest as the testing framework with jsdom for DOM manipulation testing.

**Test Environment Setup:**
- Jest with jsdom for DOM testing
- Mock viewport dimensions for responsive testing
- Mock event objects for interaction testing
- CSS-in-JS or inline styles for style verification

**Unit Test Categories:**

1. **Component Initialization Tests**
   - Verify DOM elements are created correctly
   - Verify event listeners are attached
   - Verify initial state is correct

2. **State Management Tests**
   - Test menu open/close state transitions
   - Test viewport mode detection
   - Test animation state flags

3. **Interaction Tests**
   - Test button click toggles menu
   - Test backdrop click closes menu
   - Test link click closes menu
   - Test keyboard interactions (Enter, Space, Escape, Tab)

4. **Style Tests**
   - Test computed styles match specifications
   - Test hover/focus state styles
   - Test animation transforms and transitions

5. **Accessibility Tests**
   - Test ARIA attributes are present and updated
   - Test keyboard navigation works correctly
   - Test focus management

### Property-Based Testing Approach

Property-based testing will be implemented using fast-check library to verify universal properties across many randomly generated inputs.

**Property Test Framework:** fast-check for JavaScript

**Property Test Categories:**

1. **Viewport Properties**
   - Generate random viewport widths and verify correct layout mode
   - Generate resize sequences and verify smooth transitions

2. **Animation Properties**
   - Generate random menu toggle sequences and verify animations complete
   - Verify animation timing is within specified bounds

3. **Interaction Properties**
   - Generate random click sequences and verify state consistency
   - Generate random keyboard input sequences and verify correct behavior

4. **Style Properties**
   - Generate random states and verify styles are always correct
   - Verify color values always match brand colors

**Test Execution:**
- Unit tests run on every code change
- Property tests run with minimum 100 iterations per property
- Integration tests run on all 13 HTML pages to verify consistency

**Coverage Goals:**
- 90%+ code coverage for JavaScript
- 100% of correctness properties tested
- All 13 HTML pages tested for consistency

### Manual Testing Checklist

- [ ] Test on iOS Safari (iPhone)
- [ ] Test on Android Chrome (various devices)
- [ ] Test on desktop Chrome, Firefox, Safari, Edge
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test with keyboard only (no mouse)
- [ ] Test on slow network (throttled connection)
- [ ] Test with CSS disabled (graceful degradation)
- [ ] Test with JavaScript disabled (fallback to desktop nav)
