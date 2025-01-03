<?php
session_start();

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

require_once '../dao/crudDao.php';
require_once '../dao/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$user = new crudDao();
$data = json_decode(file_get_contents("php://input"));

$username = $data->username ?? '';
$action = $data->action ?? '';

$response = array();

if ($action === 'delete') {
    if (empty($username)) {
        $response['success'] = false;
        $response['message'] = 'Username is required for deletion.';
        http_response_code(400); // Bad Request
        echo json_encode($response);
        exit();
    }

    try {
        // Debugging: Check if username is being received correctly
        error_log("Attempting to delete user: $username");
        
        $result = $user->softDeleteUser($username);
        if ($result) {
            $response['success'] = true;
            $response['message'] = 'User soft deleted successfully.';
        } else {
            $response['success'] = false;
            $response['message'] = 'Deletion failed or no changes made.';
            http_response_code(500); // Internal Server Error
        }
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = 'Deletion failed: ' . $e->getMessage();
        http_response_code(500); // Internal Server Error
    }
} else {
    $response['success'] = false;
    $response['message'] = 'Invalid action specified.';
    http_response_code(400); // Bad Request
}

echo json_encode($response);
?>
