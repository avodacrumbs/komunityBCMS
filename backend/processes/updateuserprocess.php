<?php
session_start();

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

require_once '../dao/crudDao.php';
require_once '../dao/config.php';

$user = new crudDao();

// Retrieve input data
$data = json_decode(file_get_contents("php://input"));

// Extract data from input
$username = $data->username ?? '';
$complete_name = $data->complete_name ?? '';
$contact_number = $data->contact_number ?? '';
$email = $data->email ?? '';
$role = $data->role ?? '';
$newPassword = $data->newPassword ?? null; // Extract newPassword if provided

// Initialize response array
$response = array();

// Validate required fields
if (empty($username) || empty($complete_name) || empty($contact_number) || empty($email) || empty($role)) {
    $response['success'] = false;
    $response['message'] = 'All fields are required.';
    echo json_encode($response);
    exit();
}

// Perform the update operation
try {
    $result = $user->updateUser($username, $complete_name, $contact_number, $email, $role, $newPassword);
    if ($result) {
        $response['success'] = true;
        $response['message'] = 'User updated successfully.';
    } else {
        $response['success'] = false;
        $response['message'] = 'Update failed or no changes made.';
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Update failed: ' . $e->getMessage();
}

// Return the response as JSON
echo json_encode($response);
?>
