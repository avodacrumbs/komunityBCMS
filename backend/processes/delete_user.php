<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = "";  // Change this to your MySQL root password
$dbname = "komunity";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if a valid user ID was provided
if (isset($_GET['id'])) {
    $userId = intval($_GET['id']);  // Get the user ID from the query string

    // Set a 'deleted_at' timestamp to soft-delete the user
    $sql = "UPDATE user_location SET deleted_at=NOW() WHERE id='$userId'";

    if ($conn->query($sql) === TRUE) {
        header("Location: index.php");  // Redirect back to the main page after deletion
        exit();
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

// Close connection
$conn->close();
?>
