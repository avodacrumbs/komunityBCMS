// AdminLandingLayout.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import UserBar from './UserBar';
import Header from './Header';


const ViewerLandingLayout = () => {
  return (
    <div className="admin-landing-layout">
      <UserBar />
      <Header />
      <main className="content">
        <Routes>
            <Route path="dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default ViewerLandingLayout;
