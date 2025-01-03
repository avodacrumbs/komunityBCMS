<?php
require_once '../dao/crudDao.php'; // Include your CRUD Data Access Object

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userName = isset($_POST['userName']) ? $conn->real_escape_string($_POST['userName']) : '';
    $locationName = isset($_POST['locationName']) ? $conn->real_escape_string($_POST['locationName']) : '';
    $latitude = isset($_POST['latitude']) ? floatval($_POST['latitude']) : 0;
    $longitude = isset($_POST['longitude']) ? floatval($_POST['longitude']) : 0;

    // Make sure all fields are filled
    if (!empty($userName) && !empty($locationName) && $latitude && $longitude) {
        // Prepare the SQL statement for inserting a new user
        $sql = "INSERT INTO users (user_name, location_name, latitude, longitude) VALUES ('$userName', '$locationName', '$latitude', '$longitude')";

        if ($conn->query($sql) === TRUE) {
            header("Location: index.php");  // Redirect back to the main page after successful insertion
            exit();
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    } else {
        echo "Error: Missing required fields.";
    }
}

// Close connection
$conn->close();
?>
