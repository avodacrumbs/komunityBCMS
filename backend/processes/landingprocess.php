<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../dao/crudDao.php';

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
    $totalUsers = $crudDao->getTotalUsers($search);

    // Fetch the users for the current page with search filter
    $users = $crudDao->getUsersWithLimit($offset, $recordsPerPage, $search);

    // Calculate the total number of pages
    $totalPages = ceil($totalUsers / $recordsPerPage);

    // Return JSON response
    echo json_encode([
        'users' => $users,
        'totalPages' => $totalPages,
    ]);
} catch (Exception $e) {
    // Return error message in JSON format
    echo json_encode([
        'error' => 'An error occurred: ' . $e->getMessage()
    ]);
}
?>
