import React from 'react';
import { Link ,useLocation } from 'react-router-dom';
import LogoutButton from './LogoutButton'; // Import the LogoutButton component
import '../styles/AdminBar.css';
import lg from '../styles/lg.png';

const UserBar = () => {
  const location = useLocation();
  return (   
    <div className="sidebar">
      <div className="logo">
        <img src={lg} alt=" " />
      </div>
      <Link 
        to="/dashboard" 
        className={location.pathname === '/dashboard' ? 'active' : ''}
      >
        Dashboard
      </Link>
      <Link 
        to="/dashboard/residents" 
        className={location.pathname === '/dashboard/residents' ? 'active' : ''}
      >
        Residents
      </Link>
      <Link 
        to="/dashboard/exportdata" 
        className={location.pathname === '/dashboard/exportdata' ? 'active' : ''}
      >
        Generate Report
      </Link>

      <LogoutButton />
    </div>
  );
};

export default UserBar;
