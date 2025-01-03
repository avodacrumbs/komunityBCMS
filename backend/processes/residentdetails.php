<?php

session_start();
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
require_once '../dao/crudDao.php';
require_once '../dao/config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$crudDao = new crudDao();

// Get the resident ID from the request
$residentId = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$residentId) {
    echo json_encode(['error' => 'Resident ID is required']);
    exit(0);
}

try {
    // Fetch resident details by ID
    $resident = $crudDao->getResidentWithFamilyAndServices($residentId);

    if ($resident) {
        // Return the resident's details as a JSON response
        echo json_encode($resident);
    } else {
        // If no resident is found with the given ID
        echo json_encode(['error' => 'Resident not found']);
    }
} catch (Exception $e) {
    // Return error message in JSON format
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
}
?>
