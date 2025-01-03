<?php
// Enable error reporting for debugging during development (remove in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include the CRUD operation functions (Ensure the correct path)
require_once '../dao/crudDao.php';  // Check this path

// CORS Configuration
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Respond OK for preflight
    exit;
}

// Retrieve the raw POST data from the body
$rawData = file_get_contents('php://input');
$inputData = json_decode($rawData, true);

// Check if data was received correctly
if (!$inputData) {
    echo json_encode(["status" => "failure", "message" => "Invalid JSON received."]);
    exit;
}

// Ensure necessary fields are present in the request
// Ensure necessary fields are present in the request
if (isset($inputData['resident_id'], $inputData['address'], $inputData['latitude'], $inputData['longitude'])) {
    // Sanitize input data to prevent SQL injection or malicious content
    $resident_id = (int)$inputData['resident_id'];  // Cast to integer
    $address = htmlspecialchars($inputData['address']);
    $latitude = (float)$inputData['latitude'];
    $longitude = (float)$inputData['longitude'];

    // Initialize the crudDao instance
    $resident = new crudDao();

    try {
        // Attempt to update the resident's location by resident_id
        $affected_rows = $resident->updateResidentLocation($resident_id, $address, $latitude, $longitude);

        // Check if the update was successful
        if ($affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Location updated successfully."]);
        } else {
            echo json_encode(["status" => "failure", "message" => "No matching record found or no changes made."]);
        }
    } catch (Exception $e) {
        // Return error if an exception occurs
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    // Return an error if required fields are missing
    echo json_encode(["status" => "failure", "message" => "Missing required data in the request."]);
}

?>
