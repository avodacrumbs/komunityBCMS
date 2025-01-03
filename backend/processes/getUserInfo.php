<?php
session_start();

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000"); // Ensure this matches your React app's URL
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Check if session variables are set
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    $response = [
        'complete_name' => $user['complete_name'] ?? 'Guest', // Default if not set
        'role' => $user['role'] ?? 'Guest' // Default if not set
    ];
} else {
    // If no session, return Guest information
    $response = [
        'error' => 'No active session',
        'complete_name' => 'Guest',
        'role' => 'Guest'
    ];
}

// Output response as JSON
echo json_encode($response);
?>