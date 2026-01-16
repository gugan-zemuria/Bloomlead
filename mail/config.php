<?php
/**
 * BloomLead Email Configuration
 * Simple PHP mail configuration for shared hosting
 */

// Email Recipients - ALL will receive every email
define('EMAIL_RECIPIENTS', [
    'contact@bloomlead.io',
    'marke.tyrvainen@elisanet.fi', 
    'jkartilamalmivaara@gmail.com'
]);

// Email Settings
define('EMAIL_FROM', 'noreply@bloomlead.io'); // Change to your domain
define('EMAIL_FROM_NAME', 'BloomLead Website');
define('EMAIL_REPLY_TO', ''); // Will be set to user's email

// Security Settings
define('ALLOWED_ORIGINS', [
    'https://yourdomain.com',  // Replace with your actual domain
    'http://localhost',        // For local testing
    'https://localhost'        // For local testing with SSL
]);

// Rate limiting (simple file-based)
define('RATE_LIMIT_FILE', __DIR__ . '/rate_limit.json');
define('MAX_EMAILS_PER_HOUR', 50); // Increased for testing - Per IP address

// Auto-reply settings (optional)
define('SEND_AUTO_REPLY', true);
define('AUTO_REPLY_SUBJECT', 'Kiitos yhteydenotostasi - BloomLead');

?>