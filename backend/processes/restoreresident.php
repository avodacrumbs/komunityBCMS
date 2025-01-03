<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Read the raw POST data and decode it as JSON
$data = json_decode(file_get_contents("php://input"), true);

error_log("Raw POST Data: " . print_r($data, true));  // Log the parsed data

// Check if the 'id' and 'type' parameters are being sent
$id = isset($data['id']) ? $data['id'] : null;
$type = isset($data['type']) ? $data['type'] : null;

if ($id === null) {
    echo json_encode(['success' => false, 'message' => 'ID is required.']);
    exit;
}

if ($type === null || !in_array($type, ['resident', 'user'])) {
    echo json_encode(['success' => false, 'message' => 'Valid type is required (resident or user).']);
    exit;
}

// Create an instance of the DAO
$residentDAO = new crudDao();

// Handle the restore operation based on the type
$response = null;

if ($type === 'resident') {
    // Call the restoreResident method
    $response = $residentDAO->restoreResident($id);
} elseif ($type === 'user') {
    // Call the restoreUser method (you need to define this in crudDao.php)
    $response = $residentDAO->restoreUser($id);
}

// Log the response from the restore function
error_log("Restore Response: " . print_r($response, true));

// Return the response
echo json_encode($response);
?>
