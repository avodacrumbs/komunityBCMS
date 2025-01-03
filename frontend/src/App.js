import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import LandingLayout from './components/LandingLayout';
//import AdminLandingLayout from './components/AdminLandingLayout';// Ensure the Dashboard component exists and is imported

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} /> {/* Single dashboard route */}
      </Routes>
    </Router>
  );
}

export default App;



// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './components/LoginPage';
// import AdminLandingLayout from './components/AdminLandingLayout'; // Adjust the import path as necessary
// // Adjust the import path as necessary

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/admin/dashboard" element={<AdminLandingLayout />} />

//         {/* Add other routes as needed */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;
