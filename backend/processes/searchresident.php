<?php
session_start();

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

require_once '../dao/crudDao.php';
require_once '../dao/config.php';

if (isset($_GET['query'])) {
    $query = trim($_GET['query']);

    try {
        $crudDao = new CrudDao();
        $results = $crudDao->getResidents($query);

        if ($results) {
            echo json_encode(['residents' => $results]);
        } else {
            echo json_encode(['residents' => []]);
        }
    } catch (Exception $e) {
        echo json_encode(['error' => 'Error occurred while searching for residents.']);
    }
} else {
    echo json_encode(['error' => 'No query provided.']);
}
?>
