<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = " ";  // Change this to your MySQL root password
$dbname = "komunity";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
    $userId = intval($_GET['id']);  // Get the user ID from the query string
    $userName = isset($_POST['userName']) ? $conn->real_escape_string($_POST['userName']) : '';
    $locationName = isset($_POST['locationName']) ? $conn->real_escape_string($_POST['locationName']) : '';
    $latitude = isset($_POST['latitude']) ? floatval($_POST['latitude']) : 0;
    $longitude = isset($_POST['longitude']) ? floatval($_POST['longitude']) : 0;

    // Make sure all fields are filled
    if (!empty($userName) && !empty($locationName) && $latitude && $longitude) {
        // Prepare the SQL statement for updating the user and setting updated_at
        $sql = "UPDATE user_location SET 
                    user_name='$userName', 
                    location_name='$locationName', 
                    latitude='$latitude', 
                    longitude='$longitude', 
                    updated_at=NOW()  -- Set the updated_at column to the current time
                WHERE id='$userId'";

        if ($conn->query($sql) === TRUE) {
            header("Location: index.php");  // Redirect back to the main page after editing
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
