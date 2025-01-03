<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

require_once '../dao/crudDao.php';

$crudDao = new crudDao();
$residents = $crudDao->getSoftDeletedResidents();

if (isset($residents['error'])) {
    echo json_encode(['success' => false, 'message' => $residents['error']]);
} else {
    echo json_encode(['success' => true, 'residents' => $residents]);
}


?>
