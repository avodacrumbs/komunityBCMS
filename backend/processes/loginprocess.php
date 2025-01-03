<?php
session_start();
require_once __DIR__ . '/../dao/config.php';
require_once __DIR__ . '/../dao/crudDao.php';
require_once __DIR__ . '/../utils/utils.php';

// Set appropriate headers for CORS and content type
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $encryptedData = $_POST['data'] ?? null;
    if (!$encryptedData) {
        echo json_encode(['success' => false, 'message' => 'No data received.']);
        exit;
    }

    $secretKey = getenv('REACT_APP_SECRET_KEY') ?: 'E1FrJ8ZBfELRaR/DMjxtRlEtC/lou5swRoryBZ+YrH8=';
    if (!$secretKey) {
        echo json_encode(['success' => false, 'message' => 'Encryption key missing.']);
        exit;
    }

    $decryptedData = SecurityUtils::decryptData($encryptedData, $secretKey);
    if (!$decryptedData) {
        echo json_encode(['success' => false, 'message' => 'Decryption error.']);
        exit;
    }

    $credentials = json_decode($decryptedData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON format.']);
        exit;
    }

    $email = $credentials['email'] ?? '';
    $password = $credentials['password'] ?? '';
    
    $crudDao = $GLOBALS['crudDao'] ?? new crudDao();

    $user = $crudDao->login($email, $password);
    if ($user && $user['deleted_at'] !== null) {
        echo json_encode(['success' => false, 'message' => 'Your account was deleted. Ask Admin for account recovery.']);
        exit;
    }
    
    if ($user) {


        $_SESSION['user'] = [
            'id' => $user['id'],
            'complete_name' => $user['complete_name'],
            'role' => $user['role_name'],
            'permissions' => $crudDao->getPermissionsForRole($user['role_id']), 
        ];

        echo json_encode([
            'success' => true,
            'complete_name' => $user['complete_name'],
            'role_name' => $user['role_name'],
            'permissions' => $_SESSION['user']['permissions'],
            'redirectUrl' => '/dashboard',
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Incorrect email or password.']);
    }
}
?>
