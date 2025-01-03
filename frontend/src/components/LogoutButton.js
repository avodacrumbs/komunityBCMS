import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminBar.css'

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Make a request to the logout endpoint to destroy the session
      const response = await fetch(`${process.env.REACT_APP_API_URL}/processes/logoutprocess.php`, {
        method: 'GET',
        credentials: 'include', // Include session data (cookies)
      });

      if (!response.ok) {
        // Throw an error if the response is not okay
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON response

      if (data.success) {
        // Optional: Display success message
        alert('Logged out successfully.');

        // Redirect to the login page after logout
        navigate('/'); // Adjust the path if your login page has a different route
      } else {
        console.error('Logout failed:', data.message || 'Unknown error');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      // Log the error message and show an alert
      console.error('An error occurred during logout:', error.message);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return <button onClick={handleLogout} className='logbtn'>Logout</button>;
};

export default LogoutButton;
