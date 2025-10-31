import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(['user']); // Default role
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [validation, setValidation] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '', 
    roles: '' 
  });
  const navigate = useNavigate();

  // Handle role selection in the <select> box
  const handleRoleChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedRoles(values);
    setValidation({ ...validation, roles: '' }); // Clear role validation on change
  };

  // Client-side validation
  const validateForm = () => {
    let isValid = true;
    const newValidation = { username: '', password: '', confirmPassword: '', roles: '' };

    if (!username.trim()) {
      newValidation.username = 'Username is required.';
      isValid = false;
    } else if (username.length < 3) {
      newValidation.username = 'Username must be at least 3 characters.';
      isValid = false;
    }

    if (!password.trim()) {
      newValidation.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      newValidation.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newValidation.confirmPassword = 'Confirm password is required.';
      isValid = false;
    } else if (password !== confirmPassword) {
      newValidation.confirmPassword = 'Passwords do not match.';
      isValid = false;
    }

    if (selectedRoles.length === 0) {
      newValidation.roles = 'At least one role must be selected.';
      isValid = false;
    }
    
    setValidation(newValidation);
    return isValid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setIsError(false);

    // Check form locally before sending to server
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      await axios.post('http://localhost:5000/api/auth/signup', {
        username,
        password,
        roles: selectedRoles,
      });
      setMessage('Signup successful! Redirecting to login...');
      setIsError(false);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after a delay
    } catch (err) {
      // Handle errors from the server (e.g., "Username already taken")
      setMessage(err.response?.data?.message || 'Signup failed. Please try again.');
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-toggle">
        <button
          className="toggle-btn"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className="toggle-btn active"
          onClick={() => navigate('/signup')}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleSignup} noValidate>
        {/* Display server/success messages here */}
        {message && (
          <p className={`message ${isError ? 'error-message' : 'success-message'}`}>
            {message}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className={`form-control ${validation.username ? 'is-invalid' : ''}`}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setValidation({ ...validation, username: '' }); }}
            placeholder="Choose a username"
            required
          />
          {/* Display client-side validation error */}
          {validation.username && <span className="form-text-error">{validation.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={`form-control ${validation.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setValidation({ ...validation, password: '' }); }}
            placeholder="Choose a strong password"
            required
          />
          {validation.password && <span className="form-text-error">{validation.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className={`form-control ${validation.confirmPassword ? 'is-invalid' : ''}`}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setValidation({ ...validation, confirmPassword: '' }); }}
            placeholder="Confirm your password"
            required
          />
          {validation.confirmPassword && <span className="form-text-error">{validation.confirmPassword}</span>}
        </div>
        
        <div className="form-group"> 
          <label htmlFor="roles">Select Role(s):</label>
          <select
            id="roles"
            multiple={true}
            value={selectedRoles}
            onChange={handleRoleChange}
            className={`form-control form-control-select ${validation.roles ? 'is-invalid' : ''}`}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            
          </select>
          {validation.roles && <span className="form-text-error">{validation.roles}</span>}
        </div>

        <button type="submit" className="btn-primary">
          Sign Up
        </button>

        <div className="auth-card-footer">
          Already a member? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;

