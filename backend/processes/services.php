<?php
require_once '../dao/crudDao.php'; // Include your DAO that manages database operations

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}
// Get the search term from the request
$searchTerm = isset($_GET['query']) ? trim($_GET['query']) : '';
if (empty($searchTerm)) {
    echo json_encode([]); // Return an empty array if no search term is provided
    exit;
}

try {
    $crudDao = new crudDao();
    
    // Fetch service names from the database
    $services = $crudDao->getServicesByName($searchTerm); // Adapt this method as needed

    // Return the same format as expected by your frontend
    echo json_encode($services);
} catch (Exception $e) {
    // Handle any exceptions that occur
    echo json_encode(['success' => false, 'message' => 'Error fetching services: ' . $e->getMessage()]);
    http_response_code(500); // Internal server error
}
?>