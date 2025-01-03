<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


$crudDao = new crudDao();

// Fetch SK voters data
$skVotersData = $crudDao->getAllSkVoters();

// Return the data as JSON
echo json_encode($skVotersData);
?>