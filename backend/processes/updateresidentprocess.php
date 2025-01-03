<?php
require_once '../dao/crudDao.php'; 
require_once '../dao/config.php'; 

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

$response = [
    'success' => false,
    'message' => ''
];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $inputData = json_decode(file_get_contents('php://input'), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $response['message'] = 'Invalid JSON input.';
            http_response_code(400);
            echo json_encode($response);
            exit();
        }

        if (empty($inputData['id']) || empty($inputData['firstName']) || empty($inputData['lastName'])) {
            $response['message'] = 'Missing required fields.';
            http_response_code(400);
            echo json_encode($response);
            exit();
        }

        $id = filter_var($inputData['id'], FILTER_SANITIZE_NUMBER_INT);
        $firstName = htmlspecialchars($inputData['firstName'], ENT_QUOTES, 'UTF-8');
        $middleName = !empty($inputData['middleName']) ? htmlspecialchars($inputData['middleName'], ENT_QUOTES, 'UTF-8') : null;
        $lastName = htmlspecialchars($inputData['lastName'], ENT_QUOTES, 'UTF-8');
        $address = htmlspecialchars($inputData['address'], ENT_QUOTES, 'UTF-8');
        $gender = htmlspecialchars($inputData['gender'], ENT_QUOTES, 'UTF-8');
        $birthdate = htmlspecialchars($inputData['birthdate'], ENT_QUOTES, 'UTF-8');
        $contactNo = !empty($inputData['contactNo']) ? htmlspecialchars($inputData['contactNo'], ENT_QUOTES, 'UTF-8') : null;
        $email = !empty($inputData['email']) ? filter_var($inputData['email'], FILTER_SANITIZE_EMAIL) : null;
        $voterStatus = htmlspecialchars($inputData['voterStatus'], ENT_QUOTES, 'UTF-8');
        $civilStatus = htmlspecialchars($inputData['civilStatus'], ENT_QUOTES, 'UTF-8');
        $PWDStatus = !empty($inputData['PWDStatus']) ? 1 : 0;
        $youthOrganizationMembership = !empty($inputData['youthOrganizationMembership']) ? 1 : 0;
        $senior_citizen = !empty($inputData['senior_citizen']) ? 1 : 0;
        $Erpat = !empty($inputData['Erpat']) ? 1 : 0;
        $Womens = !empty($inputData['Womens']) ? 1 : 0;

        // Log the sanitized input data for debugging
        error_log("Input Data: " . print_r($inputData, true));

        $resident = new crudDao();
        if ($resident->updateResident($id, $firstName, $middleName, $lastName, $address, $gender, $birthdate, $contactNo, $email, $voterStatus, $civilStatus, $PWDStatus, $youthOrganizationMembership, $senior_citizen, $Erpat, $Womens)) {
            $response['success'] = true;
            $response['message'] = 'Resident updated successfully.';
        } else {
            $response['message'] = 'Failed to update resident.';
            http_response_code(500);
        }
    } else {
        $response['message'] = 'Invalid request method.';
        http_response_code(405);
    }
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage()); 
    $response['message'] = 'An unexpected error occurred. Please try again later.';
    http_response_code(500);
}

error_log("Response: " . print_r($response, true));

echo json_encode($response);
?>