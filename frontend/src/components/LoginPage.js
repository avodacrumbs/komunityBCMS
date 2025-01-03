import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import encryptData from '../utils/encryption'; 
import koi from '../styles/ko.png'
import '../styles/Modal.css'
import '../styles/Login.css';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [recoveryInput, setRecoveryInput] = useState(''); // Input for email/phone
  const [resetToken, setResetToken] = useState(''); // Input for token during reset
  const [newPassword, setNewPassword] = useState(''); // New password input
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isResetPassword, setIsResetPassword] = useState(false); // Switch between forgot/reset password
  const navigate = useNavigate();
  const secretKey = process.env.REACT_APP_SECRET_KEY;
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTyping, setIsPasswordTyping] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = JSON.stringify({ email, password });
    const encryptedData = encryptData(data, secretKey);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}processes/loginprocess.php`,
        new URLSearchParams({ data: encryptedData }).toString(),
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          },
          withCredentials: true,
        }
      );

      const result = response.data;

      if (result.success) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            completeName: result.complete_name,
            role: result.role_name,
            permissions: result.permissions,
          })
        );

        navigate(result.redirectUrl || '/dashboard');
      } else {
        setErrorMessage(result.message || 'Incorrect email or password!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  // Function to handle forgot password recovery (Step 1: Request password reset)
  const handleRecovery = async (e) => {
    e.preventDefault();
    const data = JSON.stringify({ recoveryInput }); // Send only the recovery input (email/phone)
    const encryptedData = encryptData(data, secretKey);
  
    console.log("Encrypted data:", encryptedData); // Log the encrypted data
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}processes/forgotpassword.php`,
        new URLSearchParams({ data: encryptedData }).toString(),
        {
        withCredentials: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        
      });
  
      console.log("Response from backend:", response.data); // Log the response from the backend
  
      const result = response.data;
  
      if (result.success) {
        alert(result.message || 'Recovery instructions sent to your email/phone.');
        setIsResetPassword(true); // Switch modal to show reset password
      } else {
        setModalErrorMessage(result.message || 'Email not found.');
      }
    } catch (error) {
      console.error('Recovery error:', error);
      setModalErrorMessage('An error occurred. Please try again.');
    }
  };
  

  // Function to handle the reset password process (Step 2: Reset password)
  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}processes/resetpassword.php`,
        new URLSearchParams({
          token: resetToken,
          newPassword
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        }
      );

      const result = response.data;

      if (result.success) {
        alert('Password reset successful. You can now login.');
        setIsModalOpen(false); // Close modal after success
        setIsResetPassword(false); // Reset state for future use
        setModalErrorMessage(''); 
      } else {
        setModalErrorMessage(result.message || 'Invalid code or password reset failed.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setModalErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container1">
      <div className="left-side1">
        <div className="branding1"></div>
      </div>
      <div className="right-side1">
        <img src={koi} alt=" " />
        <h2>Sign In</h2>
        <form className="login-form1" onSubmit={handleLogin}>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="input-group1">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Type your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group1 password-group">
            <input style={{width: "100%"}}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Type your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={() => setIsPasswordTyping(true)}
              required
              autoComplete="current-password"
            />
            {isPasswordTyping && (
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="eye-icon"
              onClick={togglePasswordVisibility}
              style={{ cursor: 'pointer', position: 'absolute', right: '1%', top: '50%' }}
            />
          )}
          </div>
          
          <button type="submit" style={{width: "108%", marginLeft:"0%"}}>Login</button>
        </form>
        <a style={{ cursor: "pointer" }}
          type="button"
          className="forgot-password"
          onClick={() => setIsModalOpen(true)} // Open the modal on click
        >
          Forgot your password?
        </a>

        {isModalOpen && (
          <div className="modal-overlay1" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
              <h2>{isResetPassword ? 'Reset Password' : 'Forgot Password'}</h2>
              {modalErrorMessage && <p className="errorss" style={{color: "red"}}>{modalErrorMessage}</p>}
              {!isResetPassword ? (
                <>
                  <p>Enter your email to recover your password:</p>
                  <form onSubmit={handleRecovery}>
                    <div className="input-group1">
                      <input style={{width: "95%"}}
                        type="text"
                        id="recoveryInput"
                        name="recoveryInput"
                        placeholder="Enter your email"
                        value={recoveryInput}
                        onChange={(e) => setRecoveryInput(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" style={{width: "100%", marginLeft:"0%"}}>Submit</button>
                  </form>
                </>
              ) : (
                <>
                  <p>Enter the code sent to your email and your new password:</p>
                  <form onSubmit={handleResetPassword}>
                    <div className="input-group1">
                      <input
                        type="text"
                        id="resetToken"
                        name="resetToken"
                        placeholder="Enter your reset code"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group1 password-group">
                      <input style={{width: "95%"}}
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onInput={() => setIsPasswordTyping(true)}
                        autoComplete="current-password"
                        required
                      />
                      {isPasswordTyping && (
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="eye-icon"
                        onClick={togglePasswordVisibility}
                        style={{ cursor: 'pointer', position: 'absolute', right: '1%', top: '50%' }}
                      />
                    )}
                    </div>
                    <button type="submit" style={{width: "100%", marginLeft:"0%"}}>Reset Password</button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;