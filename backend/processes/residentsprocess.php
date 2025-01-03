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

// Get page and search query from the request
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$search = isset($_GET['search']) ? $_GET['search'] : '';


// Set the number of records per page
$recordsPerPage = 10;

// Calculate offset for the current page
$offset = ($page - 1) * $recordsPerPage;

try {
    // Fetch total number of users (with search filter if applicable)
    $totalResidents = $crudDao->getTotalResidents($search);

    // Fetch the users for the current page with search filter
    $residents= $crudDao->getResidentsWithLimit($offset, $recordsPerPage, $search);

    // Calculate the total number of pages
    $totalPages = ceil($totalResidents / $recordsPerPage);

    // Return JSON response
    echo json_encode([
        'residents' => $residents,
        'totalPages' => $totalPages,
    ]);
} catch (Exception $e) {
    // Return error message in JSON format
    echo json_encode([
        'error' => 'An error occurred: ' . $e->getMessage()
    ]);
}
?>
