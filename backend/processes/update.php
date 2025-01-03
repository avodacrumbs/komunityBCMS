<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
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
    $crudDao = new crudDao();

    // Sanitize and validate resident data
    $residentData = [
        'id' => (int)($data['id'] ?? 0),
        'firstName' => validateName(sanitizeInput($data['firstName'] ?? '')),
        'middleName' => sanitizeInput($data['middleName'] ?? ''),
        'lastName' => validateName(sanitizeInput($data['lastName'] ?? '')),
        'address' => sanitizeInput($data['address'] ?? ''),
        'gender' => sanitizeInput($data['gender'] ?? ''),
        'birthdate' => sanitizeInput($data['birthdate'] ?? ''),
        'civilStatus' => sanitizeInput($data['civilStatus'] ?? ''),
        'contactNo' => validateContactNumber(sanitizeInput($data['contactNo'] ?? '')),
        'email' => is_valid_email(sanitizeInput($data['email'] ?? '')) ? sanitizeInput($data['email']) : null,
        'voterStatus' => isset($data['voterStatus']) ? sanitizeInput($data['voterStatus']) : null,        'PWDStatus' => isset($data['PWDStatus']) ? (int)$data['PWDStatus'] : 0,
        'youthOrganizationMembership' => isset($data['youthOrganizationMembership']) ? (int)$data['youthOrganizationMembership'] : 0,
        'SKCouncilMembership' => isset($data['SKCouncilMembership']) ? (int)$data['SKCouncilMembership'] : 0,
        'Womens' => $data['Womens'] ?? null,
        'Erpat' => $data['Erpat'] ?? null,
        'senior_citizen' => $data['senior_citizen'] ?? null,
        'is_alive' => $data['is_alive'] ?? null,
    ];

    // Validate required fields
    if (!$residentData['id'] || !$residentData['firstName'] || !$residentData['lastName']) {
        echo json_encode(['success' => false, 'message' => 'Resident ID, first name, and last name are required.']);
        exit;
    }

    // Check if the contact number and email are valid
    if ($residentData['contactNo'] === false && !empty($data['contactNo'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid contact number.']);
        exit;
    }

    // Ensure at least one of email or contact number is provided
    if (empty($residentData['email']) && empty($residentData['contactNo'])) {
        echo json_encode(['success' => false, 'message' => 'Please provide either an email or a contact number.']);
        exit;
    }

    // Check if email format is valid
    if (!empty($residentData['email']) && $residentData['email'] === null) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        exit;
    }
    
    // Update resident record
    $crudDao->updateResident($residentData); // Method to update resident details

    foreach ($data['familyRelationships'] ?? [] as $relationship) {
        $familyId = isset($relationship['id']) ? (int)$relationship['id'] : null; // Assuming family relationships can also have IDs
        $familyData = [
            'resident_id' => $residentData['id'],
            'related_resident_id' => sanitizeInput($relationship['related_resident_id']),
            'relationship' => sanitizeInput($relationship['relationship']),
        ];
        
        if ($familyId) {
            $familyData['id'] = $familyId; // Include ID for updates
            $crudDao->updateRelationship($familyData); // Use method to update existing relationships
        } else {
            $crudDao->createRelationship($familyData); // Create new relationship
        }
    }

    foreach ($data['services'] ?? [] as $service) {
        $serviceId = isset($service['id']) ? (int)$service['id'] : null; // Assuming services can also have IDs
        $serviceName = sanitizeInput($service['service_name']);
        $serviceDate = sanitizeInput($service['service_date']);
        $someNotes = sanitizeInput($service['notes'] ?? '');

        // Validate that service_name is provided
        if (empty($serviceName)) {
            echo json_encode(['success' => false, 'message' => 'Service name cannot be empty.']);
            exit;
        }

        // Validate that service_date is provided
        if (empty($serviceDate)) {
            echo json_encode(['success' => false, 'message' => 'Service date cannot be empty.']);
            exit;
        }

        if ($serviceId) {
            // Update existing service
            $serviceData = [
                'id' => $serviceId,
                'resident_id' => $residentData['id'],
                'service_name' => $serviceName,
                'service_date' => $serviceDate,
                'notes' => $someNotes,
            ];
            $crudDao->updateService($serviceData);
        } else {
            // Check if the service exists
            $existingServiceId = $crudDao->getServiceIdByName($serviceName);

            // If the service does not exist, create it
            if ($existingServiceId === false) {
                $existingServiceId = $crudDao->createServiceName($serviceName);
                if ($existingServiceId === false) {
                    echo json_encode(['success' => false, 'message' => 'Failed to save new service.']);
                    exit;
                }
            }

            // Prepare service data
            $serviceData = [
                'resident_id' => $residentData['id'],
                'service_name' => $serviceName,
                'service_date' => $serviceDate,
                'notes' => $someNotes,
            ];

            // Add the service to the resident
            $crudDao->createService($serviceData);
        }
    }

    echo json_encode(['success' => true, 'message' => 'Resident updated successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error occurred while updating resident: ' . $e->getMessage()]);
}
?>