import React, { useState, useEffect } from 'react';
import '../styles/RegisterPage.css'; // Ensure you have the CSS file linked correctly
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const RegisterPage = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    complete_name: '',
    username: '',
    contact_number: '',
    email: '',
    role: '',
    password: '',
    cpassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(''); // To show password format message
  const [isPasswordTyping, setIsPasswordTyping] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleCPasswordVisibility = () => {
    setShowCPassword(!showCPassword);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        complete_name: user.complete_name,
        username: user.username,
        contact_number: user.contact_number,
        email: user.email,
        role: user.role_name,
        password: '',
        cpassword: ''
      });
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setIsPasswordTyping(true); // Mark that the user is typing the password
      validatePasswordFormat(value); // Validate password format
    }
  };

  const validatePasswordFormat = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{6,20}$/;
    
    // Message matching your regex rules
    let message = 'Password must be 6-20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    if (password && !regex.test(password)) {
      setPasswordMessage(message); // Show the format message if password doesn't match
    } else {
      setPasswordMessage('');
    }
  };

  const roleMap = {
    'Admin': 'admin',
    'Encoder': 'encoder',
    'User': 'user'
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    const role = roleMap[formData.role] || ''; // Map the role, default to empty string if not found
  
    // Check if passwords match before submission
    if (formData.password !== formData.cpassword) {
      setError('Passwords do not match.');
      return;
    }
  
    try {
      const endpoint = user ? `${process.env.REACT_APP_API_URL}/processes/updateuserprocess.php` : `${process.env.REACT_APP_API_URL}/processes/registerprocess.php`;
      const method = user ? 'PUT' : 'POST';
  
      // Send the form data to the backend
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role,
          newPassword: formData.password, // Add newPassword if it's being updated
          userId: user?.id // Include user ID for updates
        }),
      });
  
      const text = await response.text(); // Get the raw response text
      console.log('Raw response:', text); // Log it to see what is being returned
  
      try {
        const result = JSON.parse(text); // Parse the JSON
        if (response.ok && result.success) {
          
          setSuccess(user ? "User updated successfully." : "Account created successfully.");
          setError(null);
          onClose(); // Close the modal
        } else {
          setError(result.message || 'An error occurred. Please try again.');
          setSuccess(null);
        }
      } catch (err) {
        setError('Failed to parse JSON response.');
        setSuccess(null);
      }
    } catch (err) {
      console.error('An unexpected error occurred:', err);
      setError('An unexpected error occurred. Please check the console for more details.');
      setSuccess(null);
    }
  };
  const handleCloseModal = () => {
    onClose();
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>{user ? 'Edit User' : 'Create Account'}</h2>
        <button className="close-btns" onClick={handleCloseModal}>&times;</button> 
        <div className='form-row'>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor='complete_name'>Complete Name:</label>
            <input
              type="text"
              id="complete_name" // Use id here
              name="complete_name"
              value={formData.complete_name}
              onChange={handleChange}
              required
              autoComplete='name'
            />
          </div>
          <div className="form-group">
            <label htmlFor='username'>Username:</label>
            <input
              type="text"
              id="username" // Use id here
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete='username'
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor='contact_number'>Contact Number:</label>
            <input
              type="text"
              id="contact_number" // Use id here
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              required
              autoComplete='tel'
            />
          </div>
          <div className="form-group">
            <label htmlFor='email'>Email:</label>
            <input
              type="email"
              id="email" // Use id here
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete='email'
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor='password'>Password:</label>
            <div className="password-container">
            <input style={{width: "87%"}}
              type={showPassword ? "text" : "password"}
              id="password" // Use id here
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete='new-password'
            />
            {formData.password && (
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className="eye-icon"
              onClick={togglePasswordVisibility}
            />
            )}
            </div>
            {isPasswordTyping && passwordMessage && (
              <small className="password-format-message">{passwordMessage}</small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor='cpassword'>Confirm Password:</label>
            <div className="password-container">
            <input style={{width: "87%"}}
              type={showCPassword ? "text" : "password"}
              id="cpassword" // Use id here
              name="cpassword"
              value={formData.cpassword}
              onChange={handleChange}
              required
              autoComplete='new-password'
            />
            {formData.cpassword && (
            <FontAwesomeIcon 
              icon={showCPassword ? faEyeSlash : faEye} 
              className="eye-icon"
              onClick={toggleCPasswordVisibility}
            />
            )}
            </div>
          </div>
        </div>
        <div className="form-row single-center">
          <div className="form-group">
            <label htmlFor='role'>Role:</label>
            <select
              id="role" // Use id here
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              autoComplete='off'
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Encoder">Encoder</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>
        <button type="submit" className="submit-btn">{user ? 'Update User' : 'Create Account'}</button>
      </form>
    </div>
  );
};

export default RegisterPage;
