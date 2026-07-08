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
    'https://bloomlead.io',
    'https://www.bloomlead.io',
    'http://localhost',        // For local testing
    'https://localhost'        // For local testing with SSL
]);

// Auto-reply settings (optional)
define('SEND_AUTO_REPLY', true);
define('AUTO_REPLY_SUBJECT', 'Kiitos yhteydenotostasi - BloomLead');

?>