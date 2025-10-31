import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from "./config";

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

  const handleRoleChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedRoles(values);
    setValidation({ ...validation, roles: '' });
  };

  const validateForm = () => {
    let isValid = true;
    const newValidation = { username: '', password: '', confirmPassword: '', roles: '' };

    if (!username.trim()) { newValidation.username = 'Username is required.'; isValid = false; }
    else if (username.length < 3) { newValidation.username = 'Must be at least 3 chars.'; isValid = false; }

    if (!password.trim()) { newValidation.password = 'Password is required.'; isValid = false; }
    else if (password.length < 6) { newValidation.password = 'At least 6 characters.'; isValid = false; }

    if (!confirmPassword.trim()) { newValidation.confirmPassword = 'Confirm password required.'; isValid = false; }
    else if (password !== confirmPassword) { newValidation.confirmPassword = 'Passwords do not match.'; isValid = false; }

    if (selectedRoles.length === 0) { newValidation.roles = 'Select at least one role.'; isValid = false; }

    setValidation(newValidation);
    return isValid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!validateForm()) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/signup`, {
        username,
        password,
        roles: selectedRoles
      }, { timeout: 10000 });

      setMessage(res.data?.message || 'Signup successful');
      setIsError(false);
      console.log('Signup response:', res.data);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Signup error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Signup failed';
      setMessage(serverMsg);
      setIsError(true);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-toggle">
        <button className="toggle-btn" onClick={() => navigate('/login')}>Login</button>
        <button className="toggle-btn active" onClick={() => navigate('/signup')}>Signup</button>
      </div>

      <form onSubmit={handleSignup} noValidate>
        {message && (<p className={`message ${isError ? 'error-message' : 'success-message'}`}>{message}</p>)}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" className={`form-control ${validation.username ? 'is-invalid' : ''}`}
            value={username} onChange={(e) => { setUsername(e.target.value); setValidation({ ...validation, username: '' }); }} placeholder="Choose a username" />
          {validation.username && <span className="form-text-error">{validation.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className={`form-control ${validation.password ? 'is-invalid' : ''}`}
            value={password} onChange={(e) => { setPassword(e.target.value); setValidation({ ...validation, password: '' }); }} placeholder="Choose a strong password" />
          {validation.password && <span className="form-text-error">{validation.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" className={`form-control ${validation.confirmPassword ? 'is-invalid' : ''}`}
            value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setValidation({ ...validation, confirmPassword: '' }); }} placeholder="Confirm your password" />
          {validation.confirmPassword && <span className="form-text-error">{validation.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="roles">Select Role(s):</label>
          <select id="roles" multiple value={selectedRoles} onChange={handleRoleChange} className={`form-control form-control-select ${validation.roles ? 'is-invalid' : ''}`}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {validation.roles && <span className="form-text-error">{validation.roles}</span>}
        </div>

        <button type="submit" className="btn-primary">Sign Up</button>
        <div className="auth-card-footer">Already a member? <Link to="/login">Login</Link></div>
      </form>
    </div>
  );
};

export default Signup;
