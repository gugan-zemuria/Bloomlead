# Lumina Auth System

A modern, responsive authentication system built with vanilla HTML, CSS, and JavaScript, styled with Tailwind CSS.

## Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Real-time client-side validation with error messages
- **Password Toggle**: Show/hide password functionality
- **Form Switching**: Smooth transition between login and signup forms
- **Loading States**: Visual feedback during form submission
- **Social Authentication**: UI for Google and GitHub login (ready for integration)
- **Accessibility**: Proper labels, focus states, and keyboard navigation

## File Structure

```
auth/
├── index.html          # Main HTML file with both login and signup forms
├── css/
│   └── auth-styles.css # Custom CSS styles and animations
├── js/
│   └── auth.js         # JavaScript functionality and form handling
└── README.md           # This file
```

## Usage

1. Open `index.html` in a web browser
2. The login form is displayed by default
3. Click "Sign up for free" to switch to the signup form
4. Click "Sign in" to switch back to the login form

## Form Validation

### Login Form
- Email: Required, must be valid email format
- Password: Required

### Signup Form
- Full Name: Required
- Email: Required, must be valid email format
- Password: Required, minimum 8 characters
- Confirm Password: Must match password
- Terms Agreement: Must be checked

## Customization

### Colors
The design uses Tailwind CSS with a custom primary color palette. You can modify the colors in the `tailwind.config` section of `index.html`.

### Styling
Additional custom styles are in `css/auth-styles.css`. You can modify:
- Animations and transitions
- Custom scrollbar styling
- Focus states
- Error/success states

### JavaScript
The `js/auth.js` file contains all the functionality. Key features:
- Form validation
- Password visibility toggle
- Form switching
- Simulated API calls
- Real-time field validation

## Integration

To integrate with a real backend:

1. Replace the `simulateApiCall()` method in `auth.js` with actual API calls
2. Update the form submission handlers to send data to your endpoints
3. Add proper error handling for network requests
4. Implement social authentication callbacks

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## Dependencies

- Tailwind CSS (loaded via CDN)
- Google Fonts (Inter font family)
- No additional JavaScript libraries required