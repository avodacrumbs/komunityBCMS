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

// Get the search query from the request
$search = isset($_GET['search']) ? $_GET['search'] : '';

try {
    // Fetch residents matching the search query (no pagination)
    $residents = $crudDao->getAllResidents(0, 0, $search); // 0, 0 to ignore pagination

    // Return JSON response
    echo json_encode([
        'residents' => $residents,
    ]);
} catch (Exception $e) {
    // Return error message in JSON format
    echo json_encode([
        'error' => 'An error occurred: ' . $e->getMessage()
    ]);
}
?>
