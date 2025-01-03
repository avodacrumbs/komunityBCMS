<?php

require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if (isset($_GET['id'])) {
    $resident_id = $_GET['id'];

    // Fetch resident data using the CRUD function
    $resident = getResidentById($resident_id, $conn);
    
    if ($resident) {
        // Fetch family relationships using the CRUD function
        $family_relationships = getFamilyRelationshipsByResidentId($resident_id, $conn);
        
        // Combine resident data with family relationships
        $response = [
            'resident' => $resident,
            'familyRelationships' => $family_relationships
        ];

        // Return the combined data as JSON
        echo json_encode($response);
    } else {
        echo json_encode(['error' => 'Resident not found']);
    }
} else {
    echo json_encode(['error' => 'Invalid request']);
}

$conn->close();
?>
