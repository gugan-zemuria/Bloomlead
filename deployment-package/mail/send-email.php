<?php
/**
 * BloomLead Email Sending Script
 * Handles email submissions from website forms
 */

// Include configuration
require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json');

// CORS headers for your domain
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }
    
    // Required fields
    $userEmail = sanitizeEmail($input['email'] ?? '');
    $requestType = sanitizeString($input['type'] ?? '');
    $subject = sanitizeString($input['subject'] ?? '');
    $message = sanitizeString($input['message'] ?? '');
    
    // Validate required fields
    if (empty($userEmail) || empty($requestType) || empty($subject) || empty($message)) {
        throw new Exception('All fields are required');
    }
    
    if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }
    
    // Rate limiting check
    if (!checkRateLimit()) {
        throw new Exception('Too many requests. Please try again later.');
    }
    
    // Prepare email content
    $emailSubject = $subject;
    $emailBody = buildEmailBody($userEmail, $requestType, $message);
    
    // Send email to all recipients
    $success = sendToAllRecipients($emailSubject, $emailBody, $userEmail);
    
    if (!$success) {
        throw new Exception('Failed to send email');
    }
    
    // Send auto-reply if enabled
    if (SEND_AUTO_REPLY) {
        sendAutoReply($userEmail, $requestType);
    }
    
    // Log successful submission (optional)
    logSubmission($userEmail, $requestType);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully! We will contact you soon.'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Sanitize email input
 */
function sanitizeEmail($email) {
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

/**
 * Sanitize string input
 */
function sanitizeString($string) {
    return trim($string);
}

/**
 * Build email body with all information
 */
function buildEmailBody($userEmail, $requestType, $message) {
    $timestamp = date('Y-m-d H:i:s');
    
    // Get customer type from input if available
    $input = json_decode(file_get_contents('php://input'), true);
    $customerType = $input['customerType'] ?? 'yksityishenkilönä';
    
    // Set email header based on request type
    if ($requestType === 'module') {
        $header = "BLOOMLEAD WEBINAARIMODULI 1 LISÄTIETOKYSELY";
        $type = "webinaarimoduli 1";
    } elseif ($requestType === 'package') {
        $header = "BLOOMLEAD WEBINAARIPAKETTI LISÄTIETOKYSELY";
        $type = "webinaaripaketti";
    } elseif ($requestType === 'package-order') {
        $header = "BLOOMLEAD WEBINAARIPAKETIN TILAUS";
        $type = "BloomLead webinaaripaketti";
    } else {
        $header = "BLOOMLEAD WEBSITE INQUIRY";
        $type = $requestType;
    }
    
    $body = "$header\n";
    $body .= "Aika: $timestamp\n";
    $body .= "Lähettäjän sähköposti: $userEmail\n";
    $body .= "Tyyppi: $type\n";
    
    // Add customer type for package orders
    if ($requestType === 'package-order') {
        $body .= "Tilaan: $customerType\n";
    }
    
    $body .= "\n$message\n\n";
    
    return $body;
}

/**
 * Send email to all recipients
 */
function sendToAllRecipients($subject, $body, $replyTo) {
    $headers = [
        'From: ' . EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'Reply-To: ' . $replyTo,
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    $headerString = implode("\r\n", $headers);
    $success = true;
    
    // Send to each recipient
    foreach (EMAIL_RECIPIENTS as $recipient) {
        $result = mail($recipient, $subject, $body, $headerString);
        if (!$result) {
            $success = false;
            error_log("Failed to send email to: $recipient");
        }
    }
    
    return $success;
}

/**
 * Send auto-reply to user
 */
function sendAutoReply($userEmail) {
    $subject = AUTO_REPLY_SUBJECT;
    
    $body = "Hei,\n\n";
    $body .= "Hienoa, että johtaminen ja projektinhallinta kiinnostavat ja haluat kehittyä meidän kanssamme osana BloomLead yhteisöä!\n\n";
    $body .= "Olemme mielellämme mukana tukemassa kehitystäsi meidän osaamisellamme, sillä
jatkuva oppiminen on antoisaa kaikille.\n\n";
    $body .= "Laitamme sinulle 1–2 päivän kuluessa lisää tietoa ja ohjeita sähköpostiisi
webinaaritilaukseesi liittyen. Pysy siis kuulolla.\n\n";
    $body .= "Jos sinulla on jotakin kiireellistä, voit olla meihin yhteydessä sähköpostitse:contact@bloomlead.io. tai puhelinaikana ti ja to klo 17-18 numeroon +358 44
3883188.\n\n";
    $body .= "Ystävällisin terveisin,\n";
    $body .= "Marke ja Johanna\n\n";
    $body .= "Tähän sähköpostiin ei voi vastata\n";
    
    
    
    $headers = [
        'From: ' . EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    $headerString = implode("\r\n", $headers);
    
    return mail($userEmail, $subject, $body, $headerString);
}

/**
 * Simple rate limiting
 */
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $hourAgo = $now - 3600;
    
    // Load existing rate limit data
    $rateLimitData = [];
    if (file_exists(RATE_LIMIT_FILE)) {
        $rateLimitData = json_decode(file_get_contents(RATE_LIMIT_FILE), true) ?: [];
    }
    
    // Clean old entries
    $rateLimitData = array_filter($rateLimitData, function($timestamp) use ($hourAgo) {
        return $timestamp > $hourAgo;
    });
    
    // Count requests from this IP in the last hour
    $ipRequests = array_filter($rateLimitData, function($timestamp, $key) use ($ip, $hourAgo) {
        return strpos($key, $ip . '_') === 0 && $timestamp > $hourAgo;
    }, ARRAY_FILTER_USE_BOTH);
    
    if (count($ipRequests) >= MAX_EMAILS_PER_HOUR) {
        return false;
    }
    
    // Add current request
    $rateLimitData[$ip . '_' . $now] = $now;
    
    // Save rate limit data
    file_put_contents(RATE_LIMIT_FILE, json_encode($rateLimitData));
    
    return true;
}

/**
 * Log submission for tracking (optional)
 */
function logSubmission($userEmail, $requestType) {
    $logFile = __DIR__ . '/submissions.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    
    $logEntry = "[$timestamp] $userEmail | $requestType | $ip\n";
    
    // Append to log file
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

?>