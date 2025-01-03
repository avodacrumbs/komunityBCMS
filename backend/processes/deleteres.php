<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode the JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (isset($input['id']) && is_numeric($input['id'])) {
        $residentId = $input['id'];

        // Create an instance of ResidentDAO
        $crudDao = new crudDao();

        // Call the method to soft delete the resident
        $response = $crudDao->softDeleteResident($residentId);
        
    } else {
        $response['message'] = 'Invalid input.';
    }
} else {
    $response['message'] = 'Only POST requests are allowed.';
}

// Send JSON response
echo json_encode($response);
?>