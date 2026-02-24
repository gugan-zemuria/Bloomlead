<?php
/**
 * BloomLead Email Sending Script
 * Handles email submissions from website forms
 * Robust JSON error handling wrapper
 */

// Prevent any whitespace/output from causing JSON parse errors
while (ob_get_level()) {
    ob_end_clean();
}
ob_start();

// Error handling - catch all errors and return JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Force JSON content type immediately
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://bloomlead.io',
    'https://www.bloomlead.io',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000'
];
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Helper function to output JSON and exit
function jsonResponse($data, $httpCode = 200) {
    while (ob_get_level()) {
        ob_end_clean();
    }
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'METHOD_NOT_ALLOWED', 'message' => 'Method not allowed'], 405);
}

// Clear any output buffer and include configuration
ob_clean();

try {
    // Include configuration
    if (!file_exists(__DIR__ . '/config.php')) {
        jsonResponse(['success' => false, 'error' => 'CONFIG_NOT_FOUND', 'message' => 'Configuration file not found'], 500);
    }

    require_once __DIR__ . '/config.php';

    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse(['success' => false, 'error' => 'INVALID_JSON', 'message' => 'Invalid JSON data'], 400);
    }
    
    // Required fields
    $userEmail = sanitizeEmail($input['email'] ?? '');
    $requestType = sanitizeString($input['type'] ?? '');
    $subject = sanitizeString($input['subject'] ?? '');
    $message = sanitizeString($input['message'] ?? '');
    
    // Validate required fields
    if (empty($userEmail) || empty($requestType) || empty($subject) || empty($message)) {
        jsonResponse(['success' => false, 'error' => 'MISSING_FIELDS', 'message' => 'All fields are required'], 400);
    }
    
    if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['success' => false, 'error' => 'INVALID_EMAIL', 'message' => 'Invalid email address'], 400);
    }
    
    // Get optional fields
    $userName = sanitizeString($input['name'] ?? '');
    $customerType = sanitizeString($input['customerType'] ?? '');
    
    // Prepare email content
    $emailSubject = $subject;
    $emailBody = buildEmailBody($userEmail, $userName, $requestType, $message, $customerType);
    
    // Send email - wrapped in try-catch to ensure JSON response even on SMTP failure
    try {
        $success = sendToAllRecipients($emailSubject, $emailBody, $userEmail);
    } catch (Exception $mailEx) {
        error_log('SMTP Error: ' . $mailEx->getMessage());
        jsonResponse(['success' => false, 'error' => 'SMTP_FAIL', 'message' => 'Failed to send email. Please try again later.'], 500);
    }
    
    if (!$success) {
        jsonResponse(['success' => false, 'error' => 'SMTP_FAIL', 'message' => 'Failed to send email. Please try again later.'], 500);
    }
    
    // Send auto-reply if enabled
    $noAutoReplyTypes = ['module-order', 'package-order'];
    
    if (SEND_AUTO_REPLY && !in_array($requestType, $noAutoReplyTypes)) {
        try {
            sendAutoReply($userEmail, $requestType);
        } catch (Exception $autoReplyEx) {
            // Don't fail the request if auto-reply fails - just log it
            error_log('Auto-reply failed: ' . $autoReplyEx->getMessage());
        }
    }
    
    // Log successful submission
    logSubmission($userEmail, $requestType);
    
    // Return success response
    jsonResponse([
        'success' => true,
        'message' => 'Tilauksesi on käsittelyssä. Otamme sinuun yhteyttä pian!'
    ]);
    
} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'error' => 'SERVER_ERROR',
        'message' => $e->getMessage()
    ], 500);
} catch (Error $e) {
    jsonResponse([
        'success' => false,
        'error' => 'PHP_ERROR',
        'message' => 'Server error occurred'
    ], 500);
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
function buildEmailBody($userEmail, $userName, $requestType, $message, $customerType = '') {
    $timestamp = date('Y-m-d H:i:s');
    
    // Set email header and type based on request type
     if ($requestType === 'module-order') {
        // Course details page - Module order
        $header = "BloomLead webinaarimoduuli 1 tilaus";
        $type = "webinaarimoduuli 1";
    } elseif ($requestType === 'package-order') {
        // Courses page - Package order
        $header = "BloomLead webinaaripaketin tilaus";
        $type = "BloomLead webinaaripaketti";
    } elseif ($requestType === 'module') {
        // Home page - Module inquiry
        $header = "BloomLead webinaarimoduuli 1 lisätietokysely & knoppilista";
        $type = "webinaarimoduuli 1";
    } elseif ($requestType === 'package') {
        // Home page - Package inquiry
        $header = "bloomlead webinaaripaketti lisätietokysely ja knoppilista";
        $type = "webinaaripaketti";
    } else {
        $header = "BloomLead website inquiry";
        $type = $requestType;
    }
    
    $body = "$header\n";
    $body .= "Aika: $timestamp\n";
    $body .= "Lähettäjän sähköposti: $userEmail\n";
    
    // Add name if provided
    if (!empty($userName)) {
        $body .= "Nimesi: $userName\n";
    }
    
    $body .= "Tyyppi: $type\n";
    
    // Add customer type if provided
    if (!empty($customerType)) {
        $body .= "Tilaan: $customerType\n";
        
        // Add note for module orders
        if ($requestType === 'module-order') {
            $body .= "Huomioithan, että yksittäisten webinaarimoduulien tilaaminen on mahdollista vain järjestyksessä\n";
        }
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
function sendAutoReply($userEmail, $requestType) {
    $subject = AUTO_REPLY_SUBJECT;
    
    // HTML email headers
    $headers = [
        'From: ' . EMAIL_FROM_NAME . ' <' . EMAIL_FROM . '>',
        'Reply-To: ' . EMAIL_FROM,
        'X-Mailer: PHP/' . phpversion(),
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8'
    ];
    $headerString = implode("\r\n", $headers);

    // PDF link
    $pdfLink = 'https://drive.google.com/file/d/1dm8TPu4RuhtSC0ZNlrOA01oRcSqO7Rat/view?usp=drive_link';

    // Determine content based on request type
    if (strpos($requestType, 'module') !== false) {
        $moduleText = "Laitamme sinulle 1–2 päivän sisään lisää tietoa BloomLead webinaarimoduuli 1:stä.";
    } else {
        $moduleText = "Laitamme sinulle 1–2 päivän sisään lisää tietoa BloomLead webinaaripaketista.";
    }
    
    // HTML email body with upgraded visual hierarchy and better spacing
    $body = '
<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BloomLead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #eef1f6;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">
        Kiitos kiinnostuksestasi BloomLeadiin - löydät viestistä Projektipäällikön knoppilistan.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: radial-gradient(circle at top right, #f8fbff 0%, #eef1f6 55%, #e6ebf2 100%); padding: 24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 640px; background-color: #ffffff; border: 1px solid #dbe3ee; border-radius: 14px; overflow: hidden;">
                    <tr>
                        <td style="padding: 0; height: 6px; background: #a571aa; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td style="padding: 34px 40px 24px 40px; font-family: Segoe UI, Tahoma, Arial, sans-serif; background: linear-gradient(180deg, #f9fcff 0%, #ffffff 100%); border-bottom: 1px solid #e9eef5;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 16px; letter-spacing: 0.14em; text-transform: uppercase; color: #769757; font-weight: 700;">
                                BloomLead
                            </p>
                            <h1 style="margin: 0; font-size: 34px; line-height: 1.1; color: #11324d; font-weight: 700;">
                                Kiitos kiinnostuksestasi
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 34px 40px 36px 40px; font-family: Segoe UI, Tahoma, Arial, sans-serif; color: #1f2b3a;">
                            <p style="margin: 0 0 22px 0; font-size: 18px; line-height: 1.55; color: #0f1e2f;">
                                Hei,
                            </p>

                            <p style="margin: 0 0 18px 0; font-size: 16px; line-height: 1.72; color: #2c3b4a;">
                                Hienoa, että kehittyminen projektinhallinnassa ja muutosjohtamisessa sekä itsensä ja muiden johtamisessa kiinnostaa sinua. Olemme mielellämme mukana tukemassa oppimismatkaasi omalla osaamisellamme, sillä jatkuva oppiminen on antoisaa kaikille.
                            </p>

                            <p style="margin: 0 0 22px 0; font-size: 16px; line-height: 1.72; color: #2c3b4a;">
                                Olemme liittäneet tähän mukaan Projektipäällikön knoppilistan. Oman kokemuksemme mukaan nämä asiat ovat sellaisia, joita on hyvä kuljettaa projektin mukana koko elinkaaren ajan. Ne auttavat vahvasti projektin tavoitteiden saavuttamisessa.
                            </p>

                          
                                        <p style="margin-bottom: 22px; font-size: 15px; line-height: 1.6;">
                                            ' . $moduleText . '
                                        </p>
                                  

                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 30px auto;">
                                <tr>
                                    <td align="center" style="border-radius: 9px; background: #a571aa;">
                                        <a href="' . $pdfLink . '" target="_blank" style="display: inline-block; padding: 16px 30px; font-size: 16px; line-height: 1.2; font-weight: 700; color: #ffffff; text-decoration: none; font-family: Segoe UI, Tahoma, Arial, sans-serif;">
                                            Lataa Projektipäällikön knoppilista (PDF)
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 16px; line-height: 1.72; color: #2c3b4a;">
                                Ystävällisin terveisin,<br>
                                <span style="font-weight: 700; color: #0f1e2f;">Marke ja Johanna</span>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 22px 40px 28px 40px; text-align: center; background-color: #f7f9fc; border-top: 1px solid #e6ecf3; font-family: Segoe UI, Tahoma, Arial, sans-serif;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #5d6f84;">
                                Tähän sähköpostiin ei voi vastata
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5; color: #8da0b6;">
                                © ' . date('Y') . ' BloomLead. Kaikki oikeudet pidätetään.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';
    
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
