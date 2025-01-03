<?php
//namespace App\Dao;

class crudDao {
    private $conn;

    public function __construct() {
        $host = 'localhost';
        $username = 'root';
        $password = '';
        $database = 'komunity';

        // Create connection
        $this->conn = new mysqli($host, $username, $password, $database);

        // Check connection
        if ($this->conn->connect_error) {
            error_log("Connection failed: " . $this->conn->connect_error);
            die("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function login($email, $password) {
        if ($this->conn === null) {
            return null;
        }

        $stmt = $this->conn->prepare("SELECT u.*, r.role_name FROM users u
                                      JOIN roles r ON u.role_id = r.id
                                      WHERE u.email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($password, $user['password'])) {
            return $user;
        } else {
            return null;
        }
    }

    public function getPermissionsForRole($roleId) {
        $stmt = $this->conn->prepare("
            SELECT p.permission_name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        ");
        $stmt->bind_param('i', $roleId);
        $stmt->execute();
        $result = $stmt->get_result();
        $permissions = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $permissions;
    }
    
    public function getAllUsers() {
        $query = "SELECT u.complete_name, u.username, u.contact_number, u.email, r.role_name
                  FROM users u
                  JOIN roles r ON u.role_id = r.id";
        $result = $this->conn->query($query);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    public function getTotalUsers($search = '') {
        $searchQuery = $search ? "AND (u.complete_name LIKE '%$search%' OR u.username LIKE '%$search%' OR u.email LIKE '%$search%')" : '';
        $query = "SELECT COUNT(*) AS total 
                  FROM users u 
                  WHERE u.deleted_at IS NULL $searchQuery";
        $result = $this->conn->query($query);
        $row = $result->fetch_assoc();
        return $row['total'];
    }
    
    public function getUsersWithLimit($offset, $limit, $search = '') {
        $searchQuery = $search ? "AND (u.complete_name LIKE '%$search%' OR u.username LIKE '%$search%' OR u.email LIKE '%$search%')" : '';
        $query = "SELECT u.complete_name, u.username, u.contact_number, u.email, r.role_name
                  FROM users u
                  JOIN roles r ON u.role_id = r.id
                  WHERE u.deleted_at IS NULL $searchQuery
                  LIMIT $offset, $limit";
        $result = $this->conn->query($query);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
     
    public function getUserInfo($userId) {
        $sql = 'SELECT complete_name, role FROM users WHERE id = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $userInfo;
    }
    public function registerUser($userName, $password, $email, $contactNumber, $role, $completeName) {
        // Map role names to numeric values
        $roleMap = [
            'admin' => 1,
            'encoder' => 2,
            'user' => 3
        ];
    
        // Convert role to numeric value
        $roleValue = isset($roleMap[$role]) ? $roleMap[$role] : null;
    
        if ($roleValue === null) {
            error_log("Invalid role: " . $role);
            return false;
        }
    
        $query = "INSERT INTO users (username, password, email, contact_number, role_id, complete_name) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            error_log("Prepare failed: " . $this->conn->error);
            return false;
        }
    
        // Hash the password before storing it
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
        $stmt->bind_param("ssssis", $userName, $hashedPassword, $email, $contactNumber, $roleValue, $completeName);
    
        if ($stmt->execute()) {
            return true;
        } else {
            error_log("Execute failed: " . $stmt->error);
            return false;
        }
    }
    public function updateUser($username, $complete_name, $contact_number, $email, $role, $newPassword = null) {
        // Map role names to numeric values
        $roleMap = [
            'admin' => 1,
            'encoder' => 2,
            'user' => 3
        ];
        $roleValue = isset($roleMap[$role]) ? $roleMap[$role] : null;
    
        if ($roleValue === null) {
            error_log("Invalid role: " . $role);
            return false;
        }
    
        // Prepare SQL query
        $query = 'UPDATE users SET complete_name = ?, contact_number = ?, email = ?, role_id = ?' . ($newPassword ? ', password = ?' : '') . ' WHERE username = ?';
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            error_log("Prepare failed: " . $this->conn->error);
            return false;
        }
    
        // Bind parameters
        if ($newPassword) {
            // Hash the new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt->bind_param('sssiss', $complete_name, $contact_number, $email, $roleValue, $hashedPassword, $username);
        } else {
            $stmt->bind_param('sssis', $complete_name, $contact_number, $email, $roleValue, $username);
        }
    
        // Execute the query
        $result = $stmt->execute();
        $stmt->close();
    
        return $result;
    }
    public function softDeleteUser($username) {
        $stmt = $this->conn->prepare("UPDATE users SET deleted_at = NOW() WHERE username = ? AND deleted_at IS NULL");
        if ($stmt === false) {
            error_log("Prepare failed: " . $this->conn->error);
            return false;
        }
        
        $stmt->bind_param("s", $username);
        
        $result = $stmt->execute();
        $stmt->close();
        
        return $result;
    }  
    public function checkUsernameOrEmail($userName, $email) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        if ($stmt === false) {
            die("Prepare failed: " . $this->conn->error);
        }

        $stmt->bind_param("ss", $userName, $email);
        $stmt->execute();

        $result = $stmt->get_result();

        return $result->num_rows > 0;
    }
    public function findUserByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Insert a password reset token
    public function insertResetToken($email, $token, $expires) {
        
    
        $sql = "INSERT INTO password_resets (email, token, expires) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sss", $email, $token, $expires); // Note the changed parameter type to 'sss'
        
        return $stmt->execute();
    }

    // Find a token for verification
    public function findToken($token) {
        $sql = "SELECT * FROM password_resets WHERE token = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $token);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Update the password
    public function updatePassword($email, $hashedPassword) {
        $sql = "UPDATE users SET password = ? WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ss", $hashedPassword, $email);
        return $stmt->execute();
    }

    // Delete the reset token after password reset
    public function deleteToken($email) {
        $sql = "DELETE FROM password_resets WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        return $stmt->execute();
    }

    // public function checkEmailExists($email) {
    //     $stmt = $this->conn->prepare("SELECT * FROM residents WHERE email = ?");
    //     if ($stmt === false) {
    //         die("Prepare failed: " . $this->conn->error);
    //     }

    //     $stmt->bind_param("s", $email);
    //     $stmt->execute();

    //     $result = $stmt->get_result();

    //     return $result->num_rows > 0;
    // }
    public function addResident($firstName, $middleName, $lastName, $address, $gender, $birthdate, $civilStatus, $contactNo, $email, $voterStatus, $PWDStatus, $youthOrganizationMembership, $SKCouncilMembership) {
        $query = "INSERT INTO residents (firstName, middleName, lastName, address, gender, birthdate, civilStatus, contactNo, email, voterStatus, PWDStatus, youthOrganizationMembership, SKCouncilMembership) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        if ($stmt === false) {
            die("Prepare failed: " . $this->conn->error);
        }
    
        $stmt->bind_param("ssssssssssiii", $firstName, $middleName, $lastName, $address, $gender, $birthdate, $civilStatus, $contactNo, $email, $voterStatus, $PWDStatus, $youthOrganizationMembership, $SKCouncilMembership);
        
        if ($stmt->execute()) {
            return $stmt->insert_id; // Return the new resident's ID
        } else {
            die("Execute failed: " . $stmt->error);
        }
    }

    public function addResidents($data) {
        // Prepare the SQL statement with ? placeholders
        $stmt = $this->conn->prepare("INSERT INTO residents (firstName, middleName, lastName, address, gender, birthdate, civilStatus, 
                                      contactNo, email, voterStatus, PWDStatus, youthOrganizationMembership, SKCouncilMembership) 
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Check if prepare is successful
        if ($stmt === false) {
            die("Prepare failed: " . $this->conn->error);
        }
    
        // Bind the parameters
        $stmt->bind_param("ssssssssssiii", 
            $data['firstName'],
            $data['middleName'],
            $data['lastName'],
            $data['address'],
            $data['gender'],
            $data['birthdate'],
            $data['civilStatus'],
            $data['contactNo'],
            $data['email'],
            $data['voterStatus'],
            $data['PWDStatus'],
            $data['youthOrganizationMembership'],
            $data['SKCouncilMembership']
        );
    
        // Execute the statement
        if ($stmt->execute()) {
            // Return the ID of the newly inserted resident
            return $stmt->insert_id;
        } else {
            die("Execute failed: " . $stmt->error);
        }
    }

    public function addFamilyRelations($relation) {
        // Prepare the SQL statement with ? placeholders
        $stmt = $this->conn->prepare("INSERT INTO family_relations (related_resident_id, related_non_resident_id, relation_type)
                                       VALUES (?, ?, ?)");
        
        // Check if prepare is successful
        if ($stmt === false) {
            die("Prepare failed: " . $this->conn->error);
        }
    
        // Bind the parameters
        // Assuming related_resident_id and related_non_resident_id are integers and relation_type is a string
        $stmt->bind_param("iis", 
            $relation['related_resident_id'],
            $relation['related_non_resident_id'],
            $relation['relation_type']
        );
    
        // Execute the statement
        if ($stmt->execute()) {
            // Optionally return last inserted ID, or success message
            return $stmt->insert_id; // Return the ID of the newly inserted relation
        } else {
            die("Execute failed: " . $stmt->error);
        }
    }
    // Create a new resident
    public function createResident($resident) {
        $query = "INSERT INTO residents 
            (firstName, middleName, lastName, address, gender, birthdate, civilStatus, contactNo, email, voterStatus, PWDStatus, youthOrganizationMembership, SKCouncilMembership, Womens, Erpat, senior_citizen, is_alive,latitude,longitude) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ssssssssssiiiiiiidd', 
            $resident['firstName'], 
            $resident['middleName'], 
            $resident['lastName'], 
            $resident['address'], 
            $resident['gender'], 
            $resident['birthdate'], 
            $resident['civilStatus'], 
            $resident['contactNo'], 
            $resident['email'], 
            $resident['voterStatus'], 
            $resident['PWDStatus'], 
            $resident['youthOrganizationMembership'], 
            $resident['SKCouncilMembership'], 
            $resident['Womens'],
            $resident['Erpat'],
            $resident['senior_citizen'],
            $resident['is_alive'],
            $resident['latitude'],
            $resident['longitude']
        );
        if ($stmt->execute()) {
            return $stmt->insert_id; // Return the last inserted ID
        } else {
            return false;
        }
    }

    // Create a new family relationship
    public function createRelationship($relationship) {
        $query = "INSERT INTO family_relationships (resident_id, related_resident_id, relationship) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('iis', 
            $relationship['resident_id'], 
            $relationship['related_resident_id'], 
            $relationship['relationship']
        );
        return $stmt->execute();
    }
    public function updateRelationship($familyData) {
        // Prepare the SQL query
        $sql = "UPDATE family_relationships 
                SET related_resident_id = ?, 
                    relationship = ? 
                WHERE id = ?"; // Assuming 'id' is the unique identifier for the relationship

        // Prepare the statement
        $stmt = $this->conn->prepare($sql);
        
        if (!$stmt) {
            echo "Prepare failed: (" . $this->conn->errno . ") " . $this->conn->error;
            return false;
        }

        // Bind parameters (s - string, i - int, d - double, b - blob)
        $stmt->bind_param('ssi', $familyData['related_resident_id'], $familyData['relationship'], $familyData['id']);

        // Execute the statement
        if ($stmt->execute()) {
            return true;  // Indicate success
        } else {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
            return false; // Indicate failure
        }
        
        // Close statement
        $stmt->close();
    }


    // Get all residents
    public function getResidents() {
        $query = "SELECT * FROM residents WHERE deleted_at IS NULL";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // Get relationships for a resident
    public function getRelationships($resident_id) {
        $query = "SELECT * FROM family_relationships WHERE resident_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $resident_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // Update resident
    public function updateResidents($id, $resident) {
        $query = "UPDATE residents SET firstName = ?, middleName = ?, lastName = ?, address = ?, gender = ?, birthdate = ?, civilStatus = ?, contactNo = ?, email = ?, voterStatus = ?, PWDStatus = ?, youthOrganizationMembership = ?, SKCouncilMembership = ?, is_alive = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('ssssssssssiiiii', 
            $resident['firstName'], 
            $resident['middleName'], 
            $resident['lastName'], 
            $resident['address'], 
            $resident['gender'], 
            $resident['birthdate'], 
            $resident['civilStatus'], 
            $resident['contactNo'], 
            $resident['email'], 
            $resident['voterStatus'], 
            $resident['PWDStatus'], 
            $resident['youthOrganizationMembership'], 
            $resident['SKCouncilMembership'], 
            $resident['is_alive'], 
            $id
        );
        return $stmt->execute();
    }
    public function updateResident($data)
    {
        $sql = "UPDATE residents 
                SET firstName = ?, middleName = ?, lastName = ?, address = ?, gender = ?, birthdate = ?, civilStatus = ?, contactNo = ?, email = ?, voterStatus = ?, PWDStatus = ?, youthOrganizationMembership = ?, Womens = ?, Erpat = ?, senior_citizen = ?, updated_at = NOW() 
                WHERE id = ?";
    
        if ($stmt = $this->conn->prepare($sql)) {
            $stmt->bind_param(
                'ssssssssssiiiiii', // Adjust the bind for 16 parameters
                $data['firstName'],
                $data['middleName'],
                $data['lastName'],
                $data['address'],
                $data['gender'],
                $data['birthdate'],
                $data['civilStatus'],
                $data['contactNo'],
                $data['email'],
                $data['voterStatus'],
                $data['PWDStatus'],
                $data['youthOrganizationMembership'],
                $data['Womens'],
                $data['Erpat'],
                $data['senior_citizen'],
                $data['id'] // ID for the WHERE clause
            );
    
            if ($stmt->execute()) {
                $stmt->close();
                return true; // Update successful
            } else {
                $stmt->close();
                throw new Exception('Error executing statement: ' . $stmt->error);
            }
        } else {
            throw new Exception('Error preparing SQL statement.');
        }
    }


    // Soft delete a resident
    public function deleteResident($id) {
        $query = "UPDATE residents SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        return $stmt->execute();
    }

    public function softDeleteResident($residentId) {
        try {
            $stmt = $this->conn->prepare("UPDATE residents SET deleted_at = NOW(), is_alive = FALSE WHERE id = ?");
            if ($stmt === false) {
                throw new Exception('Database prepare failed: ' . $this->conn->error);
            }
    
            $stmt->bind_param('i', $residentId);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Resident soft deleted successfully.'];
            } else {
                return ['success' => false, 'message' => 'Failed to update resident status: ' . $stmt->error];
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error occurred: ' . $e->getMessage()];
        } finally {
            if (isset($stmt) && $stmt) {
                $stmt->close(); // Close the statement if it's defined
            }
        }
    }
    public function getSoftDeletedResidents() {
        try {
            $stmt = $this->conn->prepare("SELECT id, firstName, middleName, lastName, address,contactNo, email, deleted_at FROM residents WHERE is_alive = 0");
            if ($stmt === false) {
                throw new Exception('Database prepare failed: ' . $this->conn->error);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            $residents = $result->fetch_all(MYSQLI_ASSOC);
    
            // Add complete_name to each resident's data
            foreach ($residents as &$resident) {
                $resident['complete_name'] = $resident['firstName'] . ' ' . $resident['middleName'] . ' ' . $resident['lastName'];
            }
    
            return ['success' => true, 'residents' => $residents];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error occurred: ' . $e->getMessage()];
        } finally {
            if (isset($stmt) && $stmt) {
                $stmt->close();
            }
        }
    }
    
    public function restoreResident($residentId) {
        try {
            $stmt = $this->conn->prepare("UPDATE residents SET deleted_at = NULL, is_alive = TRUE WHERE id = ?");
            if ($stmt === false) {
                throw new Exception('Database prepare failed: ' . $this->conn->error);
            }
    
            $stmt->bind_param('i', $residentId);
    
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Resident restored successfully.'];
            } else {
                throw new Exception('Failed to execute restore query: ' . $stmt->error);  // More specific error handling
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error occurred: ' . $e->getMessage()];
        } finally {
            if (isset($stmt) && $stmt) {
                $stmt->close();
            }
        }
    }
    public function getSoftDeletedUsers() {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE deleted_at IS NOT NULL");
            if (!$stmt) {
                throw new Exception('Failed to prepare statement: ' . $this->conn->error);
            }
    
            $stmt->execute();
            $result = $stmt->get_result();
            $users = $result->fetch_all(MYSQLI_ASSOC);
    
            $stmt->close();
    
            return $users;
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    
    public function restoreUser($Id) {
        try {
            // Prepare the SQL statement
            $stmt = $this->conn->prepare("UPDATE users SET deleted_at = NULL WHERE id = ?");
            if ($stmt === false) {
                throw new Exception('Database prepare failed: ' . $this->conn->error);
            }
    
            // Log the query for debugging
            error_log("Query: UPDATE users SET deleted_at = NULL WHERE id = " . $Id);
    
            // Bind the correct parameter
            $stmt->bind_param('i', $Id); // Bind the correct variable here
    
            // Execute the statement
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'User restored successfully.'];
            } else {
                throw new Exception('Failed to execute restore query: ' . $stmt->error);  // More specific error handling
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error occurred: ' . $e->getMessage()];
        } finally {
            if (isset($stmt) && $stmt) {
                $stmt->close();
            }
        }
    }
    
    
    
        

    public function getServiceIdByName($serviceName) {
        // Prepare the statement
        $stmt = $this->conn->prepare("SELECT id FROM services WHERE service_name = ? LIMIT 1");
        
        // Bind parameters and execute
        $stmt->bind_param('s', $serviceName); // 's' denotes the type (string)
        $stmt->execute();
        
        // Get the result
        $result = $stmt->get_result();
        
        // Fetch the single value
        if ($row = $result->fetch_assoc()) {
            return $row['id']; // Return the service ID
        }
        
        return false; // Return false if no row was found
    }
    public function getServicesByName($searchTerm) {
        try {
            // Prepare a statement
            $stmt = $this->conn->prepare("SELECT service_name FROM services WHERE service_name LIKE ? LIMIT 10");
            $searchTerm = '%' . $searchTerm . '%'; // Prepare the search term
            $stmt->bind_param("s", $searchTerm); // Bind the parameter

            $stmt->execute(); // Execute the query
            $result = $stmt->get_result(); // Get the result

            // Fetch all services into an associative array
            $services = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close(); // Close the statement

            return $services; // Return the services
        } catch (Exception $e) {
            return json_encode(['success' => false, 'message' => 'Query error: ' . $e->getMessage()]);
        }
    }
    // In your CrudDao class
    public function createServiceName($serviceName) {
        $stmt = $this->conn->prepare("INSERT INTO services (service_name) VALUES (?)");
        $stmt->bind_param('s', $serviceName);
        
        if ($stmt->execute()) {
            return $this->conn->insert_id; // Get the ID of the newly created service
        }
        return false; // Return false if insertion fails
    }

    public function createService($serviceData) {
        // Check if service_name exists in the provided data
        if (!isset($serviceData['service_name'])) {
            error_log("Service name is not provided.");
            return false; // Handle the case where service_name is not provided
        }
    
        // Get the service ID by service name
        $serviceId = $this->getServiceIdByName($serviceData['service_name']);
        
        // Check if the service ID is valid
        if ($serviceId === false) {
            error_log("Service with name '{$serviceData['service_name']}' does not exist."); // Log the missing service name
            return false; // Handle the case where the service does not exist
        }
    
        // Preparing the SQL statement for inserting into resident_services
        $query = "INSERT INTO resident_services (resident_id, service_id, service_date, notes) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        if ($stmt === false) {
            error_log("Prepare failed: " . $this->conn->error);
            return false; // Handle SQL preparation error
        }
    
        // Bind parameters
        $stmt->bind_param("iiss", 
            $serviceData['resident_id'], 
            $serviceId, 
            $serviceData['service_date'], 
            $serviceData['notes']
        );
    
        // Execute the statement
        if ($stmt->execute()) {
            return $stmt->insert_id; // Return the ID of the newly inserted service record
        } else {
            error_log("Execute failed: " . $stmt->error); // Log SQL execution error
            return false; // Handle execution error
        }
    }
    public function updateService($serviceData) {
        // Check if service_id is provided in the data
        if (!isset($serviceData['id'])) {
            error_log("Service ID is not provided.");
            return false; // Handle the case where id is not provided
        }
        
        // Check if service_name exists in the provided data
        if (!isset($serviceData['service_name'])) {
            error_log("Service name is not provided.");
            return false; // Handle the case where service_name is not provided
        }
    
        // Get the service ID by service name
        $serviceId = $this->getServiceIdByName($serviceData['service_name']);
        
        // Check if the service ID is valid
        if ($serviceId === false) {
            error_log("Service with name '{$serviceData['service_name']}' does not exist."); // Log the missing service name
            return false; // Handle the case where the service does not exist
        }
        
        // Preparing the SQL statement for updating resident_services
        $query = "UPDATE resident_services 
                  SET resident_id = ?, 
                      service_id = ?, 
                      service_date = ?, 
                      notes = ? 
                  WHERE id = ?"; // Assuming 'id' is the unique identifier for the record to update
    
        $stmt = $this->conn->prepare($query);
        
        if ($stmt === false) {
            error_log("Prepare failed: " . $this->conn->error);
            return false; // Handle SQL preparation error
        }
    
        // Bind parameters; assuming resident_id is an integer, service_id is an integer,
        // service_date is a string (date), notes is a string, and id is an integer
        $stmt->bind_param("iissi", 
            $serviceData['resident_id'], 
            $serviceId, 
            $serviceData['service_date'], 
            $serviceData['notes'],
            $serviceData['id'] // Ensure the ID of the service record to update is included
        );
    
        // Execute the statement
        if ($stmt->execute()) {
            return true; // Indicate success
        } else {
            error_log("Execute failed: " . $stmt->error); // Log SQL execution error
            return false; // Handle execution error
        }
    }
    
    
    public function addResidentService($residentId, $serviceId) {
        $query = "INSERT INTO resident_services (resident_id, service_id) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        
        if ($stmt === false) {
            die("Prepare failed: " . $this->conn->error);
        }
    
        $stmt->bind_param("ii", $residentId, $serviceId);
        
        if (!$stmt->execute()) {
            die("Execute failed: " . $stmt->error);
        }
    }
    
    public function addFamilyRelation($residentId, $relatedResidentId, $relationType) {
        // Prepare the SQL statement
        $stmt = $this->conn->prepare("INSERT INTO family_relations (resident_id, related_resident_id, relation_type) VALUES (?, ?, ?)");
        
        if ($stmt) {
            // Bind parameters
            $stmt->bind_param("iis", $residentId, $relatedResidentId, $relationType); // 'i' for integer, 's' for string
            
            // Execute the statement
            if ($stmt->execute()) {
                // Successfully inserted
                return $stmt->insert_id; // Return the last inserted ID if needed
            } else {
                // Handle execution error
                die("Execution failed: " . $stmt->error);
            }
            
            // Close the statement
            $stmt->close();
        } else {
            // Handle preparation error
            die("Preparation failed: " . $this->conn->error);
        }
    }
    
    public function checkFamilyRelationExists($residentId, $relatedResidentId, $relationType) {
        $query = "SELECT COUNT(*) FROM family_relations WHERE resident_id = ? AND related_resident_id = ? AND relation_type = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iis", $residentId, $relatedResidentId, $relationType);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }
    
    public function checkResidentExists($firstName, $middleName, $lastName, $birthdate) {
        // Implement the logic to check if the resident exists based on the criteria
        // For example, use a SQL query to check for existing records
        $query = "SELECT COUNT(*) FROM residents WHERE firstName = ? AND middleName = ? AND lastName = ? AND birthdate = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssss", $firstName, $middleName, $lastName, $birthdate);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }
     /**
     * Get resident ID by name.
     *
     * @param string $name Resident name
     * @return int|false Resident ID or false if not found
     */
    public function getResidentIdByName($name) {
        // Sanitize the input to prevent SQL injection
        $name = $this->conn->real_escape_string(trim($name));

        $query = "SELECT id FROM residents WHERE CONCAT(firstName, ' ', middleName, ' ', lastName) = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $name);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        return $row ? (int)$row['id'] : false;
    }
    // public function getResidentById($id) {
    //     $sql = "SELECT firstName, middleName, lastName, address, gender, birthdate, civilStatus, contactNo, email, voterStatus, PWDStatus, youthOrganizationMembership, SKCouncilMembership 
    //             FROM residents 
    //             WHERE id = :id AND deleted_at IS NULL";
    //     $stmt = $this->conn->prepare($sql);
    //     $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    //     $stmt->execute();
    //     return $stmt->fetch(PDO::FETCH_ASSOC); // Fetch all details
    // }
    public function getResidentWithFamilyAndServices($id) {
        // SQL query to fetch resident with their family and services
        $query = "SELECT 
                      r.*, 
                      GROUP_CONCAT(DISTINCT CONCAT(fr.relationship, ': ', rr.firstName, ' ', rr.lastName) SEPARATOR ', ') AS familyMembers,
                      GROUP_CONCAT(DISTINCT CONCAT(s.service_name, ' on ', rs.service_date, IF(rs.notes IS NOT NULL, CONCAT(' (Notes: ', rs.notes, ')'), '')) SEPARATOR '; ') AS services
                  FROM
                      residents r
                  LEFT JOIN 
                      family_relationships fr ON r.id = fr.resident_id
                  LEFT JOIN 
                      residents rr ON fr.related_resident_id = rr.id
                  LEFT JOIN 
                      resident_services rs ON r.id = rs.resident_id
                  LEFT JOIN 
                      services s ON rs.service_id = s.id
                  WHERE 
                      r.id = ?
                  GROUP BY 
                      r.id";
    
        // Prepare the statement
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            throw new Exception("Prepare failed: " . $this->conn->error);
        }
    
        // Bind the parameters
        $stmt->bind_param("i", $id);
        
        // Execute the statement
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
    
        // Get the result
        $result = $stmt->get_result();
        
        // Check if any rows were returned
        if ($result->num_rows > 0) {
            return $result->fetch_assoc(); // Return the fetched record
        } else {
            return null; // Return null if no resident found
        }
    }
    
 
    
    // public function getAllResidents() {
    //     $search = $this->conn->real_escape_string($search);
    //     $query = "SELECT CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) AS complete_name, 
    //                      r.address, 
    //                      r.gender, 
    //                      r.birthdate, 
    //                      r.civilStatus, 
    //                      r.contactNo, 
    //                      r.email, 
    //                      r.voterStatus
    //               FROM residents r WHERE deleted_at IS NULL";
               
    //     $result = $this->conn->query($query);
    //     return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    // }

    public function getAllResidents($search = '', $sortBy = 'complete_name', $order = 'ASC') { 
        // Sanitize and validate sort parameters to prevent SQL injection
        $allowedSortFields = ['complete_name', 'address', 'gender', 'birthdate', 'civilStatus', 'contactNo', 'email', 'voterStatus', 'PWDStatus', 'youthOrganizationMembership',  'Womens', 'Erpat', 'senior_citizen'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'complete_name'; // default
        }
    
        $allowedOrder = ['ASC', 'DESC'];
        if (!in_array($order, $allowedOrder)) {
            $order = 'ASC'; // default
        }
    
        // Search query
        $searchQuery = $search ? "AND (CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) LIKE ? 
                                   OR r.address LIKE ? 
                                   OR r.gender LIKE ? 
                                   OR r.birthdate LIKE ? 
                                   OR r.civilStatus LIKE ? 
                                   OR r.contactNo LIKE ? 
                                   OR r.email LIKE ? 
                                   OR r.voterStatus LIKE ? 
                                   OR r.PWDStatus LIKE ? 
                                   OR r.youthOrganizationMembership LIKE ? 
                                  
                                   OR r.Womens LIKE ? 
                                   OR r.Erpat LIKE ? 
                                   OR r.senior_citizen LIKE ?)" : '';
    
        $query = "SELECT r.id, CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) AS complete_name, 
                         r.address, 
                         r.gender, 
                         r.birthdate, 
                         r.civilStatus, 
                         r.contactNo, 
                         r.email, 
                         r.voterStatus,
                         r.PWDStatus, 
                         r.youthOrganizationMembership, 
         
                         r.Womens, 
                         r.Erpat, 
                         r.senior_citizen
                  FROM residents r
                  WHERE r.deleted_at IS NULL $searchQuery
                  ORDER BY $sortBy $order"; // ORDER BY safely handled
    
        $stmt = $this->conn->prepare($query);
    
        if ($search) {
            // Prepare the search pattern with wildcards for LIKE
            $searchPattern = "%$search%";
            // Bind parameters correctly for all the LIKE queries
            $stmt->bind_param("sssssssssssss", $searchPattern, $searchPattern, $searchPattern, $searchPattern, 
                                               $searchPattern, $searchPattern, $searchPattern, $searchPattern,
                                               $searchPattern, $searchPattern, $searchPattern, $searchPattern, 
                                                $searchPattern);
        }
    
        $stmt->execute();
        $result = $stmt->get_result();
    
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    
    
    
    
    
    // public function getTotalResidents($search = '') {
    //     // Sanitize search input
    //     $search = $this->conn->real_escape_string($search);
        
    //     // Prepare the search query if needed
    //     $searchQuery = $search ? "AND (CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) LIKE '%$search%' 
    //                                OR r.address LIKE '%$search%' 
    //                                OR r.gender LIKE '%$search%' 
    //                                OR r.birthdate LIKE '%$search%' 
    //                                OR r.civilStatus LIKE '%$search%' 
    //                                OR r.contactNo LIKE '%$search%' 
    //                                OR r.email LIKE '%$search%' 
    //                                OR r.voterStatus LIKE '%$search%')" : '';
        
    //     // SQL query to get the total count of residents
    //     $query = "SELECT COUNT(*) AS total 
    //               FROM residents r 
    //               WHERE r.deleted_at IS NULL $searchQuery";
        
    //     // Execute the query
    //     $result = $this->conn->query($query);
        
    //     // Fetch the result
    //     if ($result) {
    //         $row = $result->fetch_assoc();
    //         return $row['total'];
    //     } else {
    //         // Handle the case where the query fails
    //         return 0;
    //     }
    // }

    //TOTAL RES
    public function getTotalResidents($search = '') {
        // Use a parameterized query to avoid SQL injection
        $searchQuery = $search ? "AND (CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) LIKE ? 
                                   OR r.address LIKE ? 
                                   OR r.gender LIKE ? 
                                   OR r.birthdate LIKE ? 
                                   OR r.civilStatus LIKE ? 
                                   OR r.contactNo LIKE ? 
                                   OR r.email LIKE ? 
                                   OR r.voterStatus LIKE ?)" : '';
        
        $query = "SELECT COUNT(*) AS total 
                  FROM residents r 
                  WHERE r.deleted_at IS NULL $searchQuery";
        
        $stmt = $this->conn->prepare($query);
        
        if ($search) {
            // Prepare the search pattern with wildcards for LIKE
            $searchPattern = "%$search%";
            $stmt->bind_param("ssssssss", $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['total'];
    }
    
    public function getDemographicData() {
      
    
        // SQL query to get aggregated demographic data
        $sql = "
            SELECT 
                COUNT(*) AS totalResidents,
                SUM(CASE WHEN voterStatus = 'Regular' THEN 1 ELSE 0 END) AS totalRegularVoters,
                SUM(CASE WHEN voterStatus = 'SK' THEN 1 ELSE 0 END) AS totalSkVoters,
                SUM(CASE WHEN voterStatus = 'Not yet registered' THEN 1 ELSE 0 END) AS totalNotRegisteredVoters,
                SUM(PWDStatus) AS totalPWDs,
                SUM(youthOrganizationMembership) AS totalYouthOrganization,
                SUM(senior_citizen) AS totalSeniorCitizens,
                SUM(Womens) AS totalWomens,
                SUM(Erpat) AS totalErpat,
                SUM(IF(gender = 'M', 1, 0)) AS totalMales,
                SUM(IF(gender = 'F', 1, 0)) AS totalFemales,
                SUM(IF(gender = 'LGBTQ+', 1, 0)) AS totalLGBTQPlus,
                SUM(CASE 
                WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 0 AND 14 THEN 1 
                ELSE 0 
                END) AS totalChildren,
                SUM(CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 15 AND 24 THEN 1 
                    ELSE 0 
                END) AS totalYouth,
                SUM(CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 25 AND 39 THEN 1 
                    ELSE 0 
                END) AS totalYoungAdults,
                SUM(CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 40 AND 59 THEN 1 
                    ELSE 0 
                END) AS totalAdults,
                SUM(CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) >= 60 THEN 1 
                    ELSE 0 
                END) AS totalSeniors
            FROM residents
            WHERE is_alive = TRUE
            AND deleted_at IS NULL;
        ";
    
        $result = $this->conn->query($sql);
    
    // Check for errors while executing the query
    if ($result === false) {
        return ['error' => 'SQL query failed: ' . $this->conn->error];
    }
    
    // Fetch data
    $data = $result->fetch_assoc();
    
    return $data;
    }

    // public function getResidentsWithLimit($offset, $limit, $search = '') {
    //     // Sanitize search input
    //     $search = $this->conn->real_escape_string($search);
    
    //     // Prepare the search query if needed
    //     $searchQuery = $search ? "AND (CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) LIKE '%$search%' 
    //                                OR r.address LIKE '%$search%' 
    //                                OR r.gender LIKE '%$search%' 
    //                                OR r.birthdate LIKE '%$search%' 
    //                                OR r.civilStatus LIKE '%$search%' 
    //                                OR r.contactNo LIKE '%$search%' 
    //                                OR r.email LIKE '%$search%' 
    //                                OR r.voterStatus LIKE '%$search%')" : '';
    
    //     // SQL query to get the residents with limit and search criteria
    //     $query = "SELECT r.id, CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) AS complete_name, 
    //                      r.address, 
    //                      r.gender, 
    //                      r.birthdate, 
    //                      r.civilStatus, 
    //                      r.contactNo, 
    //                      r.email, 
    //                      r.voterStatus
    //               FROM residents r
    //               WHERE r.deleted_at IS NULL $searchQuery
    //               LIMIT $offset, $limit";
    
    //     // Execute the query
    //     $result = $this->conn->query($query);
    
    //     // Fetch all results and return
    //     return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    // }
    
    public function getResidentsWithLimit($offset, $limit, $search = '') {
        // Use a parameterized query to avoid SQL injection
        $searchQuery = $search ? "AND (CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) LIKE ? 
                                   OR r.address LIKE ? 
                                   OR r.gender LIKE ? 
                                   OR r.birthdate LIKE ? 
                                   OR r.civilStatus LIKE ? 
                                   OR r.contactNo LIKE ? 
                                   OR r.email LIKE ? 
                                   OR r.voterStatus LIKE ?)" : '';
        
        $query = "SELECT r.id, CONCAT(r.firstName, ' ', IFNULL(r.middleName, ''), ' ', r.lastName) AS complete_name, 
                         r.address, 
                         r.gender, 
                         r.birthdate, 
                         r.civilStatus, 
                         r.contactNo, 
                         r.email, 
                         r.voterStatus
                  FROM residents r
                  WHERE r.deleted_at IS NULL $searchQuery
                  LIMIT ?, ?";
        
        $stmt = $this->conn->prepare($query);
        
        if ($search) {
            // Prepare the search pattern with wildcards for LIKE
            $searchPattern = "%$search%";
            $stmt->bind_param("ssssssssii", $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $searchPattern, $offset, $limit);
        } else {
            $stmt->bind_param("ii", $offset, $limit);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_all(MYSQLI_ASSOC);
    }
    public function searchResidentByName($query)
    {
    $stmt = $this->conn->prepare("SELECT id, CONCAT(firstName, ' ', lastName) as fullName FROM residents WHERE firstName LIKE ? OR lastName LIKE ? LIMIT 10");
    $searchQuery = '%' . $query . '%';
    $stmt->bind_param("ss", $searchQuery, $searchQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

// function getResidentById($resident_id, $conn) {
//     // Query to get resident data
//     $sql = "SELECT * FROM residents WHERE id = ?";
//     $stmt = $conn->prepare($sql);
//     $stmt->bind_param("i", $resident_id);
//     $stmt->execute();
//     $result = $stmt->get_result();

//     if ($result->num_rows > 0) {
//         return $result->fetch_assoc();
//     } else {
//         return null;
//     }
//}

function getFamilyRelationshipsByResidentId($resident_id, $conn) {
    // Query to get family relationships
    $family_sql = "SELECT fr.*, r.firstName, r.lastName 
                   FROM family_relationships fr
                   JOIN residents r ON fr.related_resident_id = r.id
                   WHERE fr.resident_id = ?";
    $family_stmt = $conn->prepare($family_sql);
    $family_stmt->bind_param("i", $resident_id);
    $family_stmt->execute();
    $family_result = $family_stmt->get_result();

    $family_relationships = [];
    while ($family = $family_result->fetch_assoc()) {
        $family_relationships[] = $family;
    }

    return $family_relationships;
}
public function updateResidentLocation($resident_id, $address, $latitude, $longitude) {
    // First, check if the current location is different from the new values
    $query = "SELECT address, latitude, longitude FROM residents WHERE id = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("i", $resident_id);  // Use 'i' for integer (id)
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $resident = $result->fetch_assoc();
        
        // If the location is the same, return 0 to indicate no update was made
        if ($resident['address'] === $address && $resident['latitude'] === $latitude && $resident['longitude'] === $longitude) {
            return 0;  // No changes made
        }
    } else {
        // No matching resident found, return 0
        return 0;
    }

    // Proceed with the update if data is different
    $query = "UPDATE residents SET address = ?, latitude = ?, longitude = ? WHERE id = ?";
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("sddi", $address, $latitude, $longitude, $resident_id);  // Use 'i' for resident_id (integer)
    $stmt->execute();
    
    return $stmt->affected_rows;
}

public function getAllSkVoters() {
    $query = "SELECT * FROM residents WHERE voterStatus = 'SK' AND deleted_at IS NULL";
    
    $result = $this->conn->query($query);
    $skVoters = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $skVoters[] = $row;
        }
        $result->free(); // Free the result set
    } else {
        throw new Exception("Error fetching SK voters: " . $this->conn->error);
    }

    return $skVoters;
}

    
}
?>
