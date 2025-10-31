import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from './config';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const newValidation = { username: '', password: '' };
    if (!username.trim()) { newValidation.username = 'Username is required.'; isValid = false; }
    if (!password.trim()) { newValidation.password = 'Password is required.'; isValid = false; }
    else if (password.length < 6) { newValidation.password = 'Password must be at least 6 characters.'; isValid = false; }
    setValidation(newValidation);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { username, password }, { timeout: 10000 });

      const userData = res.data || {};
      // store token and user
      localStorage.setItem('user', JSON.stringify(userData));
      window.dispatchEvent(new Event('loginStateChange'));

      const roles = (userData.roles || []).map((r) => (r || '').toString().toLowerCase());
      if (roles.includes('admin')) navigate('/admin-dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(serverMsg);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-toggle">
        <button className="toggle-btn active" onClick={() => navigate('/login')}>Login</button>
        <button className="toggle-btn" onClick={() => navigate('/signup')}>Signup</button>
      </div>

      <form onSubmit={handleLogin} noValidate>
        {error && <p className="message error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" className={`form-control ${validation.username ? 'is-invalid' : ''}`}
            value={username} onChange={(e) => { setUsername(e.target.value); setValidation({ ...validation, username: '' }); }} placeholder="Enter your username" />
          {validation.username && <span className="form-text-error">{validation.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className={`form-control ${validation.password ? 'is-invalid' : ''}`}
            value={password} onChange={(e) => { setPassword(e.target.value); setValidation({ ...validation, password: '' }); }} placeholder="Enter your password" />
          {validation.password && <span className="form-text-error">{validation.password}</span>}
        </div>

        <div className="auth-link"><Link to="#">Forgot password?</Link></div>
        <button type="submit" className="btn-primary">Login</button>
        <div className="auth-card-footer">Not a member? <Link to="/signup">Signup now</Link></div>
      </form>
    </div>
  );
};

export default Login;
