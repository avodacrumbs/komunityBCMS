<?php
require_once '../dao/crudDao.php';

session_start();

// Set content-type header for JSON response
header('Content-Type: application/json');

// Allow requests from your React app's origin
header("Access-Control-Allow-Origin: http://localhost:3000"); // Replace with your React app's origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Handle preflight requests
    exit();
}

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Optionally delete the session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'],
        $params['secure'], $params['httponly']
    );
}

// Respond with JSON to indicate logout success
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
exit();
?>
