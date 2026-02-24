<?php
/**
 * BloomLead Secure Configuration API
 * PHP 8.2 Compatible with Domain Lock and Security Features
 * 
 * SECURITY FEATURES:
 * - Domain lock (only your website can access)
 * - CSRF protection
 * - Rate limiting
 * - Secure headers
 * - Input validation
 */

// Prevent any whitespace/output from causing JSON parse errors
while (ob_get_level()) {
    ob_end_clean();
}
ob_start();

// Security headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

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

// CORS and Domain Lock Configuration
$allowedDomains = [
    'https://bloomlead.io',
    'https://www.bloomlead.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
];

// Domain Lock Check
function checkDomainAccess(): bool {
    global $allowedDomains;
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    
    // Check Origin header
    if ($origin && in_array($origin, $allowedDomains)) {
        header("Access-Control-Allow-Origin: $origin");
        return true;
    }
    
    // Check Referer header
    foreach ($allowedDomains as $domain) {
        if ($referer && str_starts_with($referer, $domain)) {
            $parsedDomain = parse_url($domain, PHP_URL_SCHEME) . '://' . parse_url($domain, PHP_URL_HOST);
            header("Access-Control-Allow-Origin: $parsedDomain");
            return true;
        }
    }
    
    // Check Host header for same-origin requests
    $currentScheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $currentDomain = "$currentScheme://$host";
    
    if (in_array($currentDomain, $allowedDomains)) {
        header("Access-Control-Allow-Origin: $currentDomain");
        return true;
    }
    
    return false;
}

// Rate Limiting (simple file-based)
function checkRateLimit(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = sys_get_temp_dir() . '/bloomlead_rate_' . md5($ip);
    $maxRequests = 60; // requests per minute
    $timeWindow = 60; // seconds
    
    $currentTime = time();
    $requests = [];
    
    if (file_exists($rateLimitFile)) {
        $data = file_get_contents($rateLimitFile);
        $requests = json_decode($data, true) ?: [];
    }
    
    // Remove old requests
    $requests = array_filter($requests, fn($timestamp) => ($currentTime - $timestamp) < $timeWindow);
    
    // Check if limit exceeded
    if (count($requests) >= $maxRequests) {
        return false;
    }
    
    // Add current request
    $requests[] = $currentTime;
    file_put_contents($rateLimitFile, json_encode($requests));
    
    return true;
}

// CSRF Token validation
function validateCSRFToken(): bool {
    $token = $_POST['csrf_token'] ?? $_GET['csrf_token'] ?? '';
    $sessionToken = $_SESSION['csrf_token'] ?? '';
    
    return !empty($token) && !empty($sessionToken) && hash_equals($sessionToken, $token);
}

// Generate CSRF Token
function generateCSRFToken(): string {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

// Main security check
function performSecurityChecks(): bool {
    // Check domain access
    if (!checkDomainAccess()) {
        jsonResponse(['error' => 'Access denied: Invalid domain'], 403);
    }

    // Check rate limit
    if (!checkRateLimit()) {
        jsonResponse(['error' => 'Rate limit exceeded'], 429);
    }

    // For POST requests, validate CSRF token
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && !validateCSRFToken()) {
        jsonResponse(['error' => 'Invalid CSRF token'], 403);
    }

    return true;
}

// Configuration data (from your .env file)
$config = [
    // ==========================================
    // ANALYTICS CREDENTIALS
    // ==========================================
    'analytics' => [
        'google_analytics' => [
            'measurement_id' => 'G-T4HP0LG8Z3',
            'enabled' => true
        ],
        'google_tag_manager' => [
            'container_id' => 'GTM-XXXXXXX',
            'enabled' => false
        ],
        'hotjar' => [
            'site_id' => '1234567',
            'enabled' => false
        ],
        'microsoft_clarity' => [
            'project_id' => 'abcdefghij',
            'enabled' => false
        ]
    ],

    // ==========================================
    // MARKETING CREDENTIALS
    // ==========================================
    'marketing' => [
        'facebook_pixel' => [
            'pixel_id' => 'YOUR_FACEBOOK_PIXEL_ID',
            'enabled' => false
        ],
        'google_ads' => [
            'conversion_id' => 'AW-CONVERSION_ID',
            'enabled' => false
        ],
        'linkedin' => [
            'partner_id' => 'YOUR_LINKEDIN_PARTNER_ID',
            'enabled' => false
        ],
        'twitter' => [
            'pixel_id' => 'o1234',
            'enabled' => false
        ],
        'tiktok' => [
            'pixel_id' => 'C4A1B2C3D4E5F6',
            'enabled' => false
        ],
        'pinterest' => [
            'tag_id' => '2612345678901',
            'enabled' => false
        ],
        'snapchat' => [
            'pixel_id' => '12345678-1234-1234-1234-123456789012',
            'enabled' => false
        ]
    ],

    // ==========================================
    // FUNCTIONAL CREDENTIALS
    // ==========================================
    'functional' => [
        'intercom' => [
            'app_id' => 'abcd1234',
            'enabled' => false
        ],
        'zendesk' => [
            'key' => 'your-zendesk-key',
            'enabled' => false
        ],
        'hubspot' => [
            'portal_id' => '1234567',
            'enabled' => false
        ],
        'mailchimp' => [
            'audience_id' => 'abcd123456',
            'enabled' => false
        ]
    ],

    // ==========================================
    // ENVIRONMENT SETTINGS
    // ==========================================
    'environment' => [
        'mode' => 'production',
        'debug' => false,
        'version' => '1.0.0'
    ]
];

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

// Perform security checks
if (!performSecurityChecks()) {
    exit;
}

// Handle different request types
$action = $_GET['action'] ?? $_POST['action'] ?? 'get_config';

switch ($action) {
    case 'get_config':
        // Return configuration
        jsonResponse([
            'success' => true,
            'data' => $config,
            'csrf_token' => generateCSRFToken(),
            'timestamp' => time()
        ]);
        
    case 'get_analytics':
        // Return only analytics configuration
        jsonResponse([
            'success' => true,
            'data' => $config['analytics'],
            'csrf_token' => generateCSRFToken(),
            'timestamp' => time()
        ]);
        
    case 'get_marketing':
        // Return only marketing configuration
        jsonResponse([
            'success' => true,
            'data' => $config['marketing'],
            'csrf_token' => generateCSRFToken(),
            'timestamp' => time()
        ]);
        
    case 'health_check':
        // Health check endpoint
        jsonResponse([
            'success' => true,
            'status' => 'healthy',
            'php_version' => PHP_VERSION,
            'timestamp' => time()
        ]);
        
    default:
        jsonResponse([
            'success' => false,
            'error' => 'Invalid action'
        ], 400);
}