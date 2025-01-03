import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminBar from './AdminBar';
import EncoderBar from './EncoderBar';
import UserBar from './UserBar';
import Header from './Header';
import LandingPage from './Landing';
import RegisterPage from './RegisterPage';
import Residents from './Residents';
import ResidentsList from './ResidentsList';
import MapPage from './MapPage';
import Archive from './Archive';

import ResidentDetails from './ResidentDetail';
import { useNavigate } from 'react-router-dom';
import RegisterResidents from './RegisterResidents';
import ExportData from './ExportData';



// ProtectedRoute component to check roles and show an unauthorized prompt
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [unauthorized, setUnauthorized] = useState(false); // State to track if unauthorized
  const navigate = useNavigate();

  // If the user's role is not allowed, show the unauthorized prompt
  if (!user || !allowedRoles.includes(user.role)) {
    if (!unauthorized) setUnauthorized(true); // Show prompt once

    const goBack = () => {
      navigate(-1); // Go back to the previous page
    };

    return (
      <div>
        {unauthorized && (
          <div> 
              <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
              You are not authorized to access this page.
            </div>
            <button onClick={goBack} style={{marginLeft: '125px', marginTop: '10px', width: '70px', BackgroundColor: 'black'}}> Go back</button>
          </div>
          
          
        )}
      </div>
    );
  }

  // If the user is allowed, render the children
  return children;
};

const AdminLandingLayout = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Choose the correct bar based on the user role
  const renderBar = () => {
    switch (user.role) {
      case 'Admin':
        return <AdminBar />;
      case 'Encoder':
        return <EncoderBar />;
      case 'User':
        return <UserBar />;
      default:
        console.log('Role not recognized:', user.role); // Debugging line
        return <div>Unauthorized</div>;
    }
  };

  return (
    <div className="admin-landing-layout">
      {renderBar()} 
      <div className="contents">
        <Routes>
          
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <LandingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="register"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="map"
            element={
              <ProtectedRoute allowedRoles={['Admin','Encoder']}>
                <MapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="exportdata"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'User']}>
                <ExportData />
              </ProtectedRoute>
            }
          />

          <Route
            path="archive"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Archive />
              </ProtectedRoute>
            }
          />
          
          <Route path="residents" element={<Residents />} />
         
          <Route
            path="resident/:id"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Encoder','User']}>
                <ResidentDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default AdminLandingLayout;


