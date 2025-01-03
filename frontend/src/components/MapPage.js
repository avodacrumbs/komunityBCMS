import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet'; // Import Leaflet
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

const MapPage = () => {
    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        complete_name: '',
        address: '',
        latitude: null,
        longitude: null,
    });
    const [activeResident, setActiveResident] = useState(null); // Track the active resident
    const activeResidentRef = useRef(activeResident); // Ref to hold active resident (to avoid stale closure)
    const mapRef = useRef(null); // Ref to store map instance
    const markerRef = useRef(null); // Ref to store the selected marker

    // Fetch residents data
    const fetchResidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/residentlocationprocess.php?active=true`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setResidents(data.residents);
            setFilteredResidents(data.residents);
        } catch (error) {
            console.error('Error fetching residents:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

    // Handle search functionality
    const handleSearch = useCallback(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filteredList = residents.filter((resident) =>
            resident.complete_name.toLowerCase().includes(lowerCaseQuery) ||
            resident.address.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredResidents(filteredList);
    }, [searchQuery, residents]);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, handleSearch]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle form submission (for saving the location)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { resident_id, address, latitude, longitude } = formData;
    
        console.log({ resident_id, address, latitude, longitude }); // Log the data being sent
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/addresidentprocess.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resident_id, address, latitude, longitude }),  // Send the data here
            });
    
            const text = await response.text(); // Capture raw response
            console.log('Raw Response:', text); // Log raw response for debugging
    
            const result = JSON.parse(text); // Attempt to parse JSON
            if (result.message) {
                alert(result.message);
                fetchResidents();
            // Reset the active resident to null after saving
            setActiveResident(null);  
            } else {
                alert('Unexpected response from the server.');
            }
        } catch (error) {
            console.error('Error saving location:', error);
            alert('An error occurred while saving the location.');
        }
    };
    
    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle resident click
    const handleResidentClick = (residentId) => {
        const selectedResident = residents.find((resident) => resident.id === residentId);
        if (selectedResident) {
            // Set the form data with selected resident's info
            setFormData({
                complete_name: selectedResident.complete_name,
                address: selectedResident.address,
                latitude: selectedResident.latitude,
                longitude: selectedResident.longitude,
                resident_id: selectedResident.id, 
            });
            setActiveResident(selectedResident); // Set active resident to highlight the selected one
            activeResidentRef.current = selectedResident; // Update ref with active resident

            // Pan to resident's location if latitude and longitude are available
            if (selectedResident.latitude && selectedResident.longitude) {
                mapRef.current.setView([selectedResident.latitude, selectedResident.longitude], 15);
                
                // Remove the previous marker if it exists
                if (markerRef.current) {
                    mapRef.current.removeLayer(markerRef.current);
                }

                // Create and add the new marker
                const newMarker = L.marker([selectedResident.latitude, selectedResident.longitude], {
                    icon: L.icon({
                        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers/img/marker-icon-blue.png',
                        iconSize: [25, 41],
                        iconAnchor: [12.5, 41],
                        popupAnchor: [0, -41],
                    }),
                }).addTo(mapRef.current).bindPopup(`<b>${selectedResident.address}</b>`).openPopup();

                // Update the marker reference to the new marker
                markerRef.current = newMarker;
            }
        }
    };

    // Initialize the Leaflet map
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([10.278275,123.8695677], 14); // Set to a default location
    
            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
    
            // // Clear previous markers from the map and markerRef
            // if (markerRef.current) {
            //     Object.values(markerRef.current).forEach(marker => {
            //         mapRef.current.removeLayer(marker); // Remove each marker from the map
            //     });
            // }
    
            // // Clear the markers object
            // markerRef.current = {};
    
            // //Clear all markers from localStorage
            // localStorage.removeItem('selectedLocations'); // This deletes all saved markers
    
            // Retrieve saved locations from localStorage (which should now be empty)
            const savedLocations = JSON.parse(localStorage.getItem('selectedLocations')) || [];
    
            const markers = {};
    
            // Add saved markers to the map (empty in this case, since we've cleared localStorage)
            savedLocations.forEach(({ address, latitude, longitude, residentName }) => {
                const newMarker = L.marker([latitude, longitude], {
                    icon: L.icon({
                        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers/img/marker-icon-blue.png',
                        iconSize: [25, 41],
                        iconAnchor: [12.5, 41],
                        popupAnchor: [0, -41],
                    }),
                })
                    .addTo(mapRef.current)
                    .bindPopup(`<b>${residentName}</b><br><b>${address}</b>`)
                    .openPopup();
    
                markers[residentName] = newMarker;
            });
    
            // Update the marker reference
            markerRef.current = markers;
    
            // Add marker on map click
            mapRef.current.on('click', (e) => {
                if (!activeResidentRef.current) {
                    alert('Please select a resident first.');
                    return;
                }
    
                const { lat, lng } = e.latlng;
    
                // Fetch address using Nominatim (Reverse geocoding)
                fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                    .then((res) => res.json())
                    .then((data) => {
                        let locationName = data.display_name || 'Unknown Location';
    
                        // Remove "Minglanilla" from the address if it's present
                        locationName = locationName.replace('Minglanilla', '').trim();
    
                        setFormData((prev) => ({
                            ...prev,
                            address: locationName,
                            latitude: lat,
                            longitude: lng,
                        }));
    
                        // Retrieve saved locations and add the new location
                        const updatedLocations = [
                            ...savedLocations,
                            { address: locationName, latitude: lat, longitude: lng, residentName: activeResidentRef.current?.complete_name },
                        ];
    
                        // Save the updated locations back to localStorage
                        localStorage.setItem('selectedLocations', JSON.stringify(updatedLocations));
    
                        const existingMarker = markerRef.current[activeResidentRef.current?.complete_name];
                        if (existingMarker) {
                           
                            existingMarker.setLatLng([lat, lng]).bindPopup(`<b>${locationName}</b>`).openPopup();
                        } else {
                            // If no marker exists, create a new one
                            const newMarker = L.marker([lat, lng], {
                                icon: L.icon({
                                    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers/img/marker-icon-blue.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12.5, 41],
                                    popupAnchor: [0, -41],
                                }),
                            })
                                .addTo(mapRef.current)
                                .bindPopup(`<b>${locationName}</b>`)
                                .openPopup();
    
                            // Save the new marker in the markers object
                            markerRef.current[activeResidentRef.current?.complete_name] = newMarker;
                        }
    
                        // Update the selected resident with the new location
                        if (activeResidentRef.current) {
                            const updatedResident = {
                                ...activeResidentRef.current,
                                address: locationName,
                                latitude: lat,
                                longitude: lng,
                            };
    
                            setActiveResident(updatedResident); // Update active resident
                            setResidents((prevResidents) =>
                                prevResidents.map((resident) =>
                                    resident.id === updatedResident.id ? updatedResident : resident
                                )
                            ); // Update residents state
                        }
                    });
            });
        }
    }, [residents]);
    
    

    return (
        <div className="map-page">

            <div className="content">
            <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search by name or address"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{ padding: '9px', marginRight: '10px', width: '30%' }}
                    />
                    <button onClick={handleSearch} style={{ padding: '10px 16px' }}>
                        Search
                    </button>
                </div>
                {loading ? (
    <p>Loading residents...</p>
) : (
    <>
        {searchQuery.trim() !== '' && (
            <div className="resident-list" style={{ marginTop: '10px' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Complete Name</th>
                            <th>Address</th>
                            <th className="hidden-column">Latitude</th>
                            <th className="hidden-column">Longitude</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResidents.map((resident) => (
                            <tr
                                key={resident.id}
                                onClick={() => handleResidentClick(resident.id)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor:
                                        activeResident && activeResident.id === resident.id
                                            ? '#f0f8ff'
                                            : 'transparent', // Light color for selection
                                }}
                            >
                                <td>{resident.complete_name}</td>
                                <td>{resident.address}</td>
                                <td className="hidden-column">{resident.latitude}</td>
                                <td className="hidden-column">{resident.longitude}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        {/* Save Button */}
        <button
            onClick={handleFormSubmit}
            className='save-button'
        >
            Save Location
        </button>
    </>
)}

                 <div id="map" className='map'></div>
            </div>
        </div>
    );
};

export default MapPage;
