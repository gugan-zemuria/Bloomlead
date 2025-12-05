# Implementation Plan

- [ ] 1. Create hamburger menu CSS file with base styles
  - Create `css/hamburger-menu.css` file
  - Define CSS custom properties for colors, dimensions, and timing
  - Implement hamburger button base styles (48x48px, rounded, bordered)
  - Implement three hamburger line styles (24x2px, positioned)
  - Add responsive media query to hide/show based on viewport
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 9.1_

- [ ] 1.1 Write property test for button dimensions and styling
  - **Property 3: Button dimensions and styling**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 2. Implement hamburger button animation styles
  - Add `.hamburger-btn.active` class with active state
  - Implement top line rotation and translation (45deg, translate down)
  - Implement middle line fade out (opacity 0)
  - Implement bottom line rotation and translation (-45deg, translate up)
  - Set transition duration to 300ms with ease-in-out timing
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 2.1 Write property test for icon animation
  - **Property 6: Icon animation on open**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**

- [ ] 2.2 Write property test for icon animation reversal
  - **Property 7: Icon animation reversal**
  - **Validates: Requirements 3.4, 3.5**

- [ ] 3. Implement mobile menu panel styles
  - Add `.mobile-menu-panel` container styles with positioning
  - Implement slide-down animation with transform and transition (500ms)
  - Style `.mobile-menu-list` as vertical list
  - Style `.mobile-menu-item` links (18px font, medium weight, dark gray)
  - Add staggered animation delays using nth-child selectors (75ms increments)
  - Implement link hover effects (light green background, 8px right shift)
  - _Requirements: 4.1, 4.4, 5.1, 5.2, 5.3, 5.4, 9.3_

- [ ]* 3.1 Write property test for menu panel animation
  - **Property 8: Menu panel slide animation**
  - **Validates: Requirements 4.1, 4.4**

- [ ]* 3.2 Write property test for link styling
  - **Property 13: Link styling consistency**
  - **Validates: Requirements 5.3**

- [ ]* 3.3 Write property test for staggered animations
  - **Property 12: Staggered link animations**
  - **Validates: Requirements 5.2**

- [ ] 4. Implement backdrop styles
  - Add `.mobile-menu-backdrop` full-screen overlay styles
  - Set background to rgba(0, 0, 0, 0.4) with backdrop-filter blur
  - Implement fade-in/out transition (500ms)
  - Position backdrop below header but above page content
  - _Requirements: 4.2_

- [ ]* 4.1 Write property test for backdrop appearance
  - **Property 9: Backdrop appearance**
  - **Validates: Requirements 4.2**

- [ ] 5. Add interactive state styles
  - Implement `:hover` state for hamburger button (light green background)
  - Implement `:focus` state for hamburger button (visible focus ring)
  - Implement `:hover` state for navigation links
  - Add touch-friendly active states for mobile devices
  - _Requirements: 2.3, 2.4, 5.4, 10.5_

- [ ]* 5.1 Write property test for interactive states
  - **Property 4: Interactive state styling**
  - **Validates: Requirements 2.3, 2.4**

- [ ]* 5.2 Write property test for link hover effects
  - **Property 14: Link hover effects**
  - **Validates: Requirements 5.4**

- [ ] 6. Create hamburger menu JavaScript file structure
  - Create `js/hamburger-menu.js` file
  - Define MenuConfig object with all configuration constants
  - Define MenuState object for state management
  - Create HamburgerMenuController class skeleton
  - _Requirements: 7.2, 7.3_

- [ ] 7. Implement HamburgerButton class
  - Create constructor that accepts button element
  - Implement `toggle()` method to switch active class
  - Implement `open()` method to add active class
  - Implement `close()` method to remove active class
  - Implement `isOpen()` method to return current state
  - Implement `updateAriaExpanded(state)` method
  - _Requirements: 2.5, 8.5_

- [ ]* 7.1 Write property test for ARIA attributes
  - **Property 5: ARIA attribute presence**
  - **Validates: Requirements 2.5**

- [ ]* 7.2 Write property test for ARIA state synchronization
  - **Property 23: ARIA state synchronization**
  - **Validates: Requirements 8.5**

- [ ] 8. Implement MobileMenuPanel class
  - Create constructor that accepts panel element
  - Implement `show()` method to add show class and trigger animation
  - Implement `hide()` method to remove show class
  - Implement `isVisible()` method to return visibility state
  - Implement `addStaggeredAnimations()` to set animation delays
  - _Requirements: 4.1, 4.4, 5.2_

- [ ] 9. Implement MenuBackdrop class
  - Create constructor that accepts backdrop element
  - Implement `show()` method to add show class and fade in
  - Implement `hide()` method to remove show class and fade out
  - Implement `onClick(callback)` method to register click handler
  - _Requirements: 4.2, 6.1_

- [ ]* 9.1 Write property test for backdrop click behavior
  - **Property 16: Backdrop click closes menu**
  - **Validates: Requirements 6.1, 6.3**

- [ ] 10. Implement HamburgerMenuController initialization
  - Create constructor that initializes all components
  - Implement `init()` method to set up event listeners
  - Query and store references to DOM elements
  - Initialize HamburgerButton, MobileMenuPanel, and MenuBackdrop instances
  - Attach click listener to hamburger button
  - Attach click listener to backdrop
  - Attach click listeners to navigation links
  - _Requirements: 7.4_

- [ ]* 10.1 Write property test for automatic initialization
  - **Property 19: Automatic initialization**
  - **Validates: Requirements 7.4**

- [ ] 11. Implement menu toggle functionality
  - Implement `toggleMenu()` method in controller
  - Implement `openMenu()` method that calls button.open(), panel.show(), backdrop.show()
  - Implement `closeMenu()` method that calls button.close(), panel.hide(), backdrop.hide()
  - Add animation state flag to prevent rapid toggling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.4_

- [ ]* 11.1 Write property test for link click behavior
  - **Property 15: Link click behavior**
  - **Validates: Requirements 5.5**

- [ ]* 11.2 Write property test for menu panel click preservation
  - **Property 17: Menu panel click preservation**
  - **Validates: Requirements 6.2**

- [ ] 12. Implement body scroll lock functionality
  - Implement `lockBodyScroll()` method to set body overflow to hidden
  - Implement `unlockBodyScroll()` method to restore body overflow
  - Call lockBodyScroll() when menu opens
  - Call unlockBodyScroll() when menu closes
  - _Requirements: 4.3, 4.5, 10.3_

- [ ]* 12.1 Write property test for body scroll prevention
  - **Property 10: Body scroll prevention**
  - **Validates: Requirements 4.3, 4.5**

- [ ]* 12.2 Write property test for touch scroll prevention
  - **Property 28: Touch scroll prevention**
  - **Validates: Requirements 10.3**

- [ ] 13. Implement responsive viewport handling
  - Implement `handleResize()` method with debouncing (250ms)
  - Detect viewport width and update isMobileViewport state
  - Close menu automatically if resizing from mobile to desktop
  - Attach resize event listener in init()
  - _Requirements: 1.3, 1.4_

- [ ]* 13.1 Write property test for viewport-based visibility
  - **Property 1: Viewport-based visibility toggle**
  - **Validates: Requirements 1.1, 1.2**

- [ ]* 13.2 Write property test for responsive layout switching
  - **Property 2: Responsive layout switching**
  - **Validates: Requirements 1.3**

- [ ] 14. Implement keyboard accessibility
  - Implement `handleKeyboard(event)` method
  - Handle Enter and Space keys on hamburger button to toggle menu
  - Handle Escape key to close menu when open
  - Handle Tab key to maintain focus within menu when open
  - Attach keydown event listener in init()
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 14.1 Write property test for keyboard focus navigation
  - **Property 20: Keyboard focus navigation**
  - **Validates: Requirements 8.1, 8.3**

- [ ]* 14.2 Write property test for keyboard menu toggle
  - **Property 21: Keyboard menu toggle**
  - **Validates: Requirements 8.2**

- [ ]* 14.3 Write property test for Escape key behavior
  - **Property 22: Escape key closes menu**
  - **Validates: Requirements 8.4**

- [ ] 15. Add error handling and fallbacks
  - Add try-catch blocks around DOM queries
  - Implement debouncing for resize and rapid click events
  - Add animation state timeout fallback (1 second)
  - Log warnings for missing elements
  - Add null checks before calling methods on components
  - _Requirements: Error Handling section_

- [ ] 16. Update HTML structure on index.html
  - Add hamburger button HTML inside header
  - Add mobile menu panel HTML structure
  - Add backdrop div element
  - Link hamburger-menu.css in head
  - Link hamburger-menu.js before closing body tag
  - Verify existing desktop navigation remains intact
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 17. Update HTML structure on all remaining pages
  - Apply same HTML changes to about.html
  - Apply same HTML changes to blog.html, blog-2.html, blog-3.html, blog-details.html
  - Apply same HTML changes to coaches.html
  - Apply same HTML changes to contact.html
  - Apply same HTML changes to courses.html, courses-details.html
  - Apply same HTML changes to events.html
  - Apply same HTML changes to pricing.html
  - Apply same HTML changes to services.html
  - _Requirements: 7.1_

- [ ]* 17.1 Write property test for cross-page consistency
  - **Property 18: Cross-page consistency**
  - **Validates: Requirements 7.1**

- [ ] 18. Implement touch device optimizations
  - Add touch event listeners (touchstart, touchend) alongside click events
  - Prevent default on touch events to avoid double-firing
  - Add active state feedback for touch interactions
  - Test and adjust touch target sizes (minimum 44x44px)
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [ ]* 18.1 Write property test for touch responsiveness
  - **Property 27: Touch responsiveness**
  - **Validates: Requirements 10.1, 10.2, 10.5**

- [ ]* 18.2 Write property test for gesture non-interference
  - **Property 29: Gesture non-interference**
  - **Validates: Requirements 10.4**

- [ ] 19. Verify brand consistency and design patterns
  - Verify all colors match brand colors (#769757, #a571aa)
  - Verify animations use consistent easing functions
  - Verify shadows match existing site patterns
  - Verify header height and logo positioning unchanged
  - Test hover states use brand purple
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 19.1 Write property test for brand color consistency
  - **Property 24: Brand color consistency**
  - **Validates: Requirements 9.1, 9.2**

- [ ]* 19.2 Write property test for design pattern consistency
  - **Property 25: Design pattern consistency**
  - **Validates: Requirements 9.3, 9.4**

- [ ]* 19.3 Write property test for layout preservation
  - **Property 26: Layout preservation**
  - **Validates: Requirements 9.5**

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 21. Write property test for navigation links display
  - **Property 11: Navigation links display**
  - **Validates: Requirements 5.1**

- [ ] 22. Final cross-browser and device testing
  - Test on Chrome, Firefox, Safari, Edge (desktop)
  - Test on iOS Safari (iPhone)
  - Test on Android Chrome
  - Test keyboard navigation on all browsers
  - Test with screen reader (basic verification)
  - Verify graceful degradation with CSS/JS disabled
  - _Requirements: All requirements_
