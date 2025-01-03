<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

function sanitizeInput($data) {
    return htmlspecialchars(trim($data));
}

function validateName($name) {
    $regex = '/^[a-zA-Z\s]*$/'; // Only letters and spaces
    return (empty($name) || preg_match($regex, $name)) ? $name : false;
}

function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateContactNumber($contactNo) {
    $regex = '/^(09[0-9]{9}|[0-9]{7})$/'; // Adjust based on your format
    return preg_match($regex, $contactNo) ? $contactNo : false;
}

// Get the JSON data from the request body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

try {
    $crudDao = new CrudDao();

    // Sanitize and validate resident data
    $residentData = [
        'firstName' => validateName(sanitizeInput($data['firstName'] ?? '')),
        'middleName' => sanitizeInput($data['middleName'] ?? ''), // Optional, could validate as well
        'lastName' => validateName(sanitizeInput($data['lastName'] ?? '')),
        'address' => sanitizeInput($data['address'] ?? ''),
        'gender' => sanitizeInput($data['gender'] ?? ''),
        'birthdate' => sanitizeInput($data['birthdate'] ?? ''),
        'civilStatus' => sanitizeInput($data['civilStatus'] ?? ''),
        'contactNo' => $data['contactNo'] !== '' ? validateContactNumber(sanitizeInput($data['contactNo'] ?? '')) : false,
        'email' => is_valid_email(sanitizeInput($data['email'] ?? '')) ? sanitizeInput($data['email']) : false,
        'voterStatus' => isset($data['voterStatus']) ? sanitizeInput($data['voterStatus']) : null,
        'PWDStatus' => isset($data['PWDStatus']) ? (int)$data['PWDStatus'] : 0,
        'youthOrganizationMembership' => isset($data['youthOrganizationMembership']) ? (int)$data['youthOrganizationMembership'] : 0,
        'SKCouncilMembership' => isset($data['SKCouncilMembership']) ? (int)$data['SKCouncilMembership'] : 0,
        'Womens' => $data['Womens'] ?? null,
        'Erpat' => $data['Erpat'] ?? null,
        'senior_citizen' => $data['senior_citizen'] ?? null,
        'is_alive' => $data['is_alive'] ?? null,
        'latitude' => $data['latitude'] ?? null,  // Add latitude field
        'longitude' => $data['longitude'] ?? null, // Add longitude field
    ];

    // Validate required fields
    if (!$residentData['firstName'] || !$residentData['lastName']) {
        echo json_encode(['success' => false, 'message' => 'Name must consist with only letters. Please check input']);
        exit;
    }

    // Validate contact number and email
    if ($residentData['contactNo'] === false && !empty($data['contactNo'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid contact number.']);
        exit;
    }

    if (empty($residentData['email']) && empty($residentData['contactNo'])) {
        echo json_encode(['success' => false, 'message' => 'Please provide either an email or a contact number.']);
        exit;
    }

    if (!empty($residentData['email'] && $residentData['email'] === false )) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        exit;
    }

    if ($crudDao->checkResidentExists($residentData['firstName'], $residentData['middleName'], $residentData['lastName'], $residentData['birthdate'])) {
        echo json_encode(['success' => false, 'message' => 'Resident already exists.']);
        exit;
    }

    // Insert or Update Resident
    $residentId = $crudDao->createResident($residentData); // Add resident and get the ID

    // Process family relationships
    foreach ($data['familyRelationships'] as $relationship) {
        $familyData = [
            'resident_id' => $residentId,
            'related_resident_id' => sanitizeInput($relationship['related_resident_id']),
            'relationship' => sanitizeInput($relationship['relationship']),
        ];
        $crudDao->createRelationship($familyData);
    }

    foreach ($data['services'] ?? [] as $service) {
        $serviceName = isset($service['service_name']) ? sanitizeInput($service['service_name']) : '';
        $serviceDate = isset($service['service_date']) ? sanitizeInput($service['service_date']) : '';
        $someNotes = isset($service['notes']) ? sanitizeInput($service['notes']) : '';
    
        // Validate that service_name is provided
        if ($serviceName === '') {
            echo json_encode(['success' => false, 'message' => 'Service name cannot be empty.']);
            exit;
        }

        // Validate that service_date is provided
        if ($serviceDate === '') {
            echo json_encode(['success' => false, 'message' => 'Service date cannot be empty.']);
            exit;
        }

        // Check if the service exists
        $serviceId = $crudDao->getServiceIdByName($serviceName);
        
        // If the service does not exist, create it
        if ($serviceId === false) {
            $serviceId = $crudDao->createServiceName($serviceName);
            if ($serviceId === false) {
                echo json_encode(['success' => false, 'message' => 'Failed to save new service.']);
                exit;  
            }
        }
        
        // Prepare service data
        $serviceData = [
            'resident_id' => $residentId,
            'service_name' => $serviceName,
            'service_date' => $serviceDate,
            'notes' => $someNotes
        ];
        
        // Call the createService function
        $result = $crudDao->createService($serviceData);
    }
    
    echo json_encode([ 'success' => true, 'message' => 'Resident added successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false,'error' => 'Error occurred while adding resident: ' . $e->getMessage()]);
}
?>
