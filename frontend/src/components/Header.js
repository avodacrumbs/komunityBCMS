import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import '../styles/Header.css';

const Header = () => {
  const [userInfo, setUserInfo] = useState(null); // Set initial state to null
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Initialize the navigate hook

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/processes/getUserInfo.php`,
          {
            method: 'GET',
            credentials: 'include', // Ensure credentials are included
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
       

        if (data.error) {
          console.error(`Server error: ${data.error}`); // Logs error from the server
          setUserInfo(null); // Set to null if there's an error
        } else {
          setUserInfo(`${data.complete_name} | ${data.role}`);
        }
      } catch (error) {
        console.error('Error fetching user info:', error); // Logs any fetch or processing errors
        setUserInfo(null); // Set to null on fetch error
      } finally {
        setIsLoading(false); // Set loading to false once the fetch is complete
      }
    };

    fetchUserInfo();
  }, []);

  // Redirect to login page if userInfo is null (user is not authenticated) and loading is finished
  useEffect(() => {
    if (!isLoading && userInfo === null) {
      navigate('/'); // Redirect to login page if unauthorized
    }
  }, [userInfo, isLoading, navigate]); // Dependency array to watch for userInfo and isLoading changes

  // Show loading or actual content based on state
  if (isLoading) {
    return <div>Loading...</div>; // Show a loading state while fetching user info
  }

  // If authorized, display the header with user information
  return (
    <header className="headerdash">
      <div className="user-info">
        <span>{userInfo}</span>
      </div>
    </header>
  );
};

export default Header;
