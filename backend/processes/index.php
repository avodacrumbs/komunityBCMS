<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add/Edit User by Clicking on Map with Reverse Geocoding</title>
    <!-- Leaflet CSS for the map -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        #map {
            height: 400px;
            width: 100%;
            margin-bottom: 20px;
        }
        form {
            margin-bottom: 20px;
        }
        input[type="text"], input[type="submit"] {
            padding: 10px;
            margin: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 10px;
            text-align: left;
        }
        button {
            background: none;
            border: none;
            color: blue;
            cursor: pointer;
            text-decoration: underline;
        }
        .clickable-location {
            color: blue;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<body>

<h2>Add/Edit User by Clicking on Map</h2>

<!-- User Form -->
<form id="userForm" method="POST" action="save_user.php">
    <input type="text" id="userName" name="userName" placeholder="Enter user name" required>
    <input type="text" id="locationName" name="locationName" placeholder="Enter location name" required>
    <input type="hidden" id="latitude" name="latitude">
    <input type="hidden" id="longitude" name="longitude">
    <input type="submit" value="Add/Update User" id="addUserButton">
    <p id="locationInfo">Click on the map to select a location.</p>
</form>

<!-- Map -->
<div id="map"></div>

<!-- User Table -->
<h3>Saved Users</h3>
<table>
    <thead>
        <tr>
            <th>User</th>
            <th>Location</th>
            <th>Updated At</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="userTableBody">
        <?php
        // Database connection details
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "komunity";

        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Fetch all active users from the database (not soft-deleted)
        $sql = "SELECT id, user_name, location_name, latitude, longitude, updated_at FROM user_location WHERE deleted_at IS NULL";
        $result = $conn->query($sql);

        // Check if there are any results
        if ($result->num_rows > 0) {
            // Output data for each row
            while($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td data-label='User'>" . htmlspecialchars($row['user_name']) . "</td>";
                echo "<td data-label='Location'><span class='clickable-location' data-lat='" . $row['latitude'] . "' data-lng='" . $row['longitude'] . "'>" . htmlspecialchars($row['location_name']) . "</span></td>";
                
                // Format updated_at with full month name and AM/PM
                $updated_at = $row['updated_at'] ? date('F j, Y, g:i A', strtotime($row['updated_at'])) : 'N/A';
                echo "<td data-label='Updated At'>" . htmlspecialchars($updated_at) . "</td>";  // Display updated_at in full month format with AM/PM
                
                echo "<td data-label='Actions'>";
                echo "<button onclick=\"editUser(" . $row['id'] . ", '" . htmlspecialchars($row['user_name']) . "', '" . htmlspecialchars($row['location_name']) . "', '" . $row['latitude'] . "', '" . $row['longitude'] . "')\">Edit</button>";
                echo "<button onclick=\"deleteUser(" . $row['id'] . ")\">Delete</button>";
                echo "</td>";
                echo "</tr>";
            }
        } else {
            echo "<tr><td colspan='4'>No users found</td></tr>";
        }

        // Close connection
        $conn->close();
        ?>
    </tbody>
</table>


<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

<script>
    // Initialize the map
    var map = L.map('map').setView([10.2939, 123.8585], 15);  // Bulacao, Cebu City

    // Load and display OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    var marker;  // Placeholder for the map marker
    var selectedLatLng = null;  // Holds the clicked location coordinates

    // Add a click event listener to the map
    map.on('click', function(e) {
        var lat = e.latlng.lat;
        var lon = e.latlng.lng;
        selectedLatLng = [lat, lon];  // Save the clicked coordinates

        // If a marker exists, move it to the clicked location, otherwise add a new blue marker
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);  // Use default blue icon
        }

        // Perform reverse geocoding to get the location name or street name
        reverseGeocode(lat, lon);
    });

    // Function to reverse geocode the latitude and longitude to a street name or location name
    // Function to reverse geocode the latitude and longitude to a street name or location name
function reverseGeocode(lat, lon) {
    var url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.display_name) {
                var locationName = data.display_name;
                document.getElementById('locationName').value = locationName;
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lon;
                document.getElementById('locationInfo').textContent = "Selected Location: " + locationName;
            } else {
                document.getElementById('locationInfo').textContent = "Could not find a specific location. Coordinates: " + lat + ", " + lon;
            }
        })
        .catch(error => {
            console.error('Error during reverse geocoding:', error);
            document.getElementById('locationInfo').textContent = "Unable to get location name. Coordinates: " + lat + ", " + lon;
        });
}

    // Function to handle editing a user
    function editUser(userId, userName, locationName, lat, lng) {
        // Populate the form with the existing user data
        document.getElementById('userName').value = userName;
        document.getElementById('locationName').value = locationName;
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;

        // Update the form's action URL to include the user ID for editing
        document.getElementById('userForm').action = 'edit_user.php?id=' + userId;

        // If a marker exists, move it to the user's location, otherwise create a new marker
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng]).addTo(map);
        }
        map.setView([lat, lng], 13);
    }

    // Function to handle soft deleting a user
    function deleteUser(userId) {
        if (confirm("Are you sure you want to delete this user?")) {
            // Send request to delete_user.php to perform a soft delete
            window.location.href = 'delete_user.php?id=' + userId;
        }
    }

    // Function to handle clicks on location names in the table
    document.querySelectorAll('.clickable-location').forEach(function(element) {
        element.addEventListener('click', function() {
            var lat = parseFloat(this.getAttribute('data-lat'));
            var lng = parseFloat(this.getAttribute('data-lng'));
            var locationName = this.textContent;

            // Move the map to the clicked location and show a marker
            map.setView([lat, lng], 15);
            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                marker = L.marker([lat, lng]).addTo(map);
            }
            marker.bindPopup(locationName).openPopup();
        });
    });
</script>

</body>
</html>
