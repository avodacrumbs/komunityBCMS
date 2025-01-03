// import React from 'react';
// import { Route, Routes, Navigate } from 'react-router-dom';
// import Dashboard from './Dashboard';
// import AdminBar from './AdminBar';
// import Header from './Header';
// import LandingPage from './Landing';
// import RegisterPage from './RegisterPage';
// import NotFoundPage from './NotFoundPage';

// const LandingLayout = () => {
//   // Assuming user info is stored in localStorage
//   const user = JSON.parse(localStorage.getItem('user'));

//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   const allowedRoutes = {
//     admin: ['dashboard', 'users', 'register'],
//     encoder: ['dashboard','register']
//     // Add more roles as needed
//   };

//   const roleRoutes = allowedRoutes[user.role.toLowerCase()] || [];

//   return (
//     <div className="admin-landing-layout">
//       <AdminBar />
//       <Header />
//       <main className="content">
//         <Routes>
//           {roleRoutes.includes('dashboard') && <Route path="dashboard" element={<Dashboard />} />}
//           {roleRoutes.includes('users') && <Route path="users" element={<LandingPage />} />}
//           {roleRoutes.includes('register') && <Route path="register" element={<RegisterPage />} />}
//           <Route path="*" element={<NotFoundPage />} />
//         </Routes>
//       </main>
//     </div>
//   );
// };

// export default LandingLayout;

//---------------------------------
import React from 'react';
import AdminBar from './AdminBar';
import Header from './Header';
import AdminLandingLayout from './AdminLandingLayout';

import '../styles/Dashboard.css';

const LandingLayout= () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Debugging output
  console.log('User from localStorage:', user);

  // Handle cases where user might be null or not logged in
  if (!user || !user.role) {
    return <div>Please log in</div>;
  }

  // Debugging output for user role
  console.log('User role from localStorage:', user.role);

  // Determine the role-based content or sections to display
  const renderContent = () => {
    if (user.role) {
        return <AdminLandingLayout />;       
    }
  };

  return (
    <div className="dashboard-layout">
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
};

export default LandingLayout;

