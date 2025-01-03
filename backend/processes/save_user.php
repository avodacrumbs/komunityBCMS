<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";  // Change this to your MySQL root password
$dbname = "komunity";

// Create connection to the MySQL database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;  // Resident ID to update
    $userName = isset($_POST['complete_name']) ? $conn->real_escape_string($_POST['complete_name']) : '';
    $locationName = isset($_POST['address']) ? $conn->real_escape_string($_POST['address']) : '';
    $latitude = isset($_POST['latitude']) ? floatval($_POST['latitude']) : 0;
    $longitude = isset($_POST['longitude']) ? floatval($_POST['longitude']) : 0;

    // Ensure all fields are filled
    if ($id > 0 && !empty($userName) && !empty($locationName) && $latitude && $longitude) {
        // Prepare the SQL statement for updating the resident's details
        $sql = "UPDATE residents SET address = '$locationName', latitude = '$latitude', longitude = '$longitude' WHERE id = $id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(['message' => 'Resident updated successfully.']);
        } else {
            echo json_encode(['error' => 'Error updating resident: ' . $conn->error]);
        }
    } else {
        echo json_encode(['error' => 'Error: Missing required fields or invalid ID.']);
    }
}

// Close connection
$conn->close();
?>
