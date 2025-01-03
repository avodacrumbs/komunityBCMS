import React from 'react';
import { Link } from 'react-router-dom';
//import '../styles/NotFoundPage.css'; // Adjust the path according to your folder structure

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="back-link">Go back to Home</Link>
    </div>
  );
};

export default NotFoundPage;
