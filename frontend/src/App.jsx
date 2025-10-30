import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import CreateElection from './CreateElection';
import ElectionsList from './ElectionsList';
import ElectionVote from './ElectionVote';



// ✅ Home Component - Updated with new content
const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user info is in local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('loginStateChange')); // Notify navbar to update
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="home-container">
      {user ? (
        // If logged in
        <div>
          {/* Updated Title */}
          <h1 className="home-title-premium">
            Welcome to the Blockchain Voting System
          </h1>
          {/* New Project Description */}
          <p className="home-description-premium">
            "A secure, transparent, and decentralized solution for modern democracy. 
            Every vote is immutable, every voice is heard."
          </p>
          <h3 className="home-user-greeting">
            Hello, {user.username}! Your roles: <strong>{user.roles.join(', ')}</strong>
          </h3>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      ) : (
        // If not logged in
        <div>
          <h1 className="home-title-premium">
            Welcome to the Blockchain Voting System
          </h1>
          <p className="home-description-premium">
            Please <Link to="/login">Login</Link> or <Link to="/signup">Signup</Link> to cast your vote.
          </p>
        </div>
      )}
    </div>
  );
};

// ✅ Main App Layout Component
// This component wraps every page
function AppLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // Check login status on load and when the URL changes
  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    // Listen for custom event to update login state immediately
    const handleLoginStateChange = () => {
      setIsLoggedIn(!!localStorage.getItem('user'));
    };
    window.addEventListener('loginStateChange', handleLoginStateChange);
    
    // Cleanup listener on component unmount
    return () => window.removeEventListener('loginStateChange', handleLoginStateChange);
  }, [location]); // Re-check when location changes


  return (
    // App-dark class wraps the entire application
    // This provides the consistent gradient background
    <div className="App-dark">
      
      {/* Navbar - Always present */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          AuthApp
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {!isLoggedIn && (
            // Show Login/Signup only if not logged in
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link">
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main content area - routes are rendered inside this wrapper for centering */}
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/create-election" element={<CreateElection />} />
          <Route path="/elections" element={<ElectionsList />} />
          <Route path="/election/:id" element={<ElectionVote />} />


          {/* Add more routes here as needed (e.g., /dashboard, /profile) */}
        </Routes>
      </div>

      {/* Footer - Always present */}
      <footer className="app-footer">
        <div>&copy; 2025 AuthApp. All rights reserved.</div>
        <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Support</a>
        </div>
      </footer>
    </div>
  );
}

// ✅ Root App Component
// This is the main entry point that sets up the Router
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

