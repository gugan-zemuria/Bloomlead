/**
 * Dynamic Copyright Year Script
 * Automatically updates copyright year to current year
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Find all elements with id 'currentYear' and update them
    const yearElements = document.querySelectorAll('#currentYear');
    
    yearElements.forEach(function(element) {
        element.textContent = currentYear;
    });
    
    // Also update any elements with class 'current-year' (backup)
    const yearClassElements = document.querySelectorAll('.current-year');
    
    yearClassElements.forEach(function(element) {
        element.textContent = currentYear;
    });
});