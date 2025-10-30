import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  // Client-side validation
  const validateForm = () => {
    let isValid = true;
    const newValidation = { username: '', password: '' };

    if (!username.trim()) {
      newValidation.username = 'Username is required.';
      isValid = false;
    }
    if (!password.trim()) {
      newValidation.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      // Example rule: match your backend's minimum
      newValidation.password = 'Password must be at least 6 characters.';
      isValid = false;
    }
    
    setValidation(newValidation);
    return isValid;
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  if (!validateForm()) return;

  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username,
      password,
    });

    localStorage.setItem('user', JSON.stringify(res.data));
    window.dispatchEvent(new Event('loginStateChange'));

    // ✅ Redirect based on role
    if (res.data.roles.includes('admin')) {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
  }
};


  return (
    <div className="auth-card">
      <div className="auth-toggle">
        <button
          className="toggle-btn active"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className="toggle-btn"
          onClick={() => navigate('/signup')}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleLogin} noValidate> {/* noValidate to allow custom validation */}
        
        {/* Display server errors here */}
        {error && <p className="message error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            // Apply 'is-invalid' class if validation error exists
            className={`form-control ${validation.username ? 'is-invalid' : ''}`}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setValidation({ ...validation, username: '' }); }}
            placeholder="Enter your username"
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
            placeholder="Enter your password"
            required
          />
          {validation.password && <span className="form-text-error">{validation.password}</span>}
        </div>

        <div className="auth-link">
          <Link to="#">Forgot password?</Link>
        </div>

        <button type="submit" className="btn-primary">
          Login
        </button>

        <div className="auth-card-footer">
          Not a member? <Link to="/signup">Signup now</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;