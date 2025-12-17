# BloomLead Auth Modal System

A Finnish-language modal-based authentication system built with vanilla HTML, CSS, and JavaScript, styled with Tailwind CSS. This system features a modal overlay design with smooth animations and Finnish localization.

## Features

- **Modal-Based Design**: Overlay authentication modal with backdrop blur
- **Finnish Localization**: All text and labels in Finnish language
- **Smooth Animations**: Fade-in, bounce, and slide animations
- **Tab Switching**: Seamless switching between login and signup modes
- **Form Validation**: Real-time client-side validation with Finnish error messages
- **Loading States**: Visual feedback during form submission with loading animations
- **Success Animation**: Animated success message with auto-close
- **Social Authentication**: UI for Google and Microsoft login (ready for integration)
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation, focus trapping, and ARIA compliance
- **BloomLead Branding**: Custom colors and styling matching the brand

## File Structure

```
auth-2/
├── index.html              # Main page with header and modal
├── css/
│   └── auth-modal.css      # Modal animations and custom styles
├── js/
│   └── auth-modal.js       # Modal functionality and form handling
└── README.md               # This file
```

## Usage

1. Open `index.html` in a web browser
2. Click "Kirjaudu" in the header or "Aloita tänään" button to open the modal
3. Switch between "Kirjaudu sisään" (Login) and "Rekisteröidy" (Signup) tabs
4. Fill in the form and submit to see the success animation

## Finnish Text Content

### Login Mode
- **Title**: "Tervetuloa takaisin." (Welcome back)
- **Tab**: "Kirjaudu sisään" (Sign in)
- **Button**: "Kirjaudu Sisään" (Sign In)
- **Forgot Password**: "Unohditko?" (Forgot?)

### Signup Mode
- **Title**: "Liity yhteisöön." (Join the community)
- **Tab**: "Rekisteröidy" (Register)
- **Button**: "Luo Tili" (Create Account)

### Form Fields
- **Nimi**: Name
- **Sähköposti**: Email
- **Salasana**: Password

### Messages
- **Success**: "Onnistui! Olet nyt kirjautunut sisään." (Success! You are now logged in)
- **Loading**: "Käsitellään..." (Processing...)
- **Social**: "Tai jatka palvelulla" (Or continue with)

## Brand Colors

The system uses BloomLead's brand colors:
- **Purple**: `#a66eb0` (Primary brand color)
- **Dark Purple**: `#8a5594` (Hover states)
- **Green**: `#7da35e` (Accent color)
- **Background**: `#fdfbff` (Light purple tint)

## Modal Features

### Visual Design
- **Left Panel**: Decorative circles, title, description, and office image
- **Right Panel**: Form with tab navigation and social auth options
- **Backdrop**: Blurred background with click-to-close functionality

### Animations
- **Modal Entry**: Fade-in with scale animation
- **Success State**: Bounce-in animation with checkmark icon
- **Loading State**: Spinning loader with disabled form
- **Tab Switching**: Smooth transitions between login/signup modes

### Form Validation
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters
- **Name**: Required for signup mode
- **Real-time**: Errors clear as user types

## Customization

### Colors
Modify the Tailwind config in `index.html` to change brand colors:
```javascript
colors: {
    brand: {
        purple: '#a66eb0',
        darkPurple: '#8a5594',
        green: '#7da35e',
        // ... other colors
    }
}
```

### Text Content
All Finnish text is in the HTML and JavaScript files. Search for Finnish text to customize:
- Modal titles and descriptions
- Form labels and placeholders
- Button text and messages
- Error messages

### Animations
Modify `auth-modal.css` to customize:
- Modal entry/exit animations
- Success message animations
- Loading states
- Hover effects

## Integration

To integrate with a real backend:

1. Replace `simulateApiCall()` in `auth-modal.js` with actual API calls
2. Update form submission handlers to send data to your endpoints
3. Add proper error handling for network requests
4. Implement social authentication callbacks for Google/Microsoft
5. Add proper session management and redirect logic

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- CSS Grid and Flexbox support required

## Dependencies

- Tailwind CSS (loaded via CDN)
- Google Fonts (Inter and Jost font families)
- No additional JavaScript libraries required

## Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Trapping**: Focus stays within modal when open
- **ARIA Labels**: Proper labeling for screen readers
- **Escape Key**: Close modal with Escape key
- **Focus Management**: Auto-focus on first input when modal opens