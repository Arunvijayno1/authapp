require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/mern-auth'; // Replace with your URI if using Atlas
const JWT_SECRET = 'your_super_secret_key_123'; // In production, use a .env file

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MIDDLEWARE (Protect Routes) ---
// Verifies the JWT token sent by React
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRoles = decoded.roles;
    next();
  });
};

// Checks if user has a specific role
const checkRole = (requiredRole) => (req, res, next) => {
  if (!req.userRoles.includes(requiredRole)) {
    return res.status(403).json({ message: `Require ${requiredRole} Role!` });
  }
  next();
};

// --- ROUTES ---

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, roles } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      roles: roles || ['user'] // Use provided roles or default to 'user'
    });

    await user.save();
    res.json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

    // Generate Token with roles inside
    const token = jwt.sign({ id: user._id, roles: user.roles }, JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
      accessToken: token
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// 3. PROTECTED TEST ROUTES (Optional, to test roles)
app.get('/api/test/all', (req, res) => res.send("Public Content."));
app.get('/api/test/user', verifyToken, checkRole('user'), (req, res) => res.send("User Content."));
app.get('/api/test/admin', verifyToken, checkRole('admin'), (req, res) => res.send("Admin Content."));
app.get('/api/test/backend', verifyToken, checkRole('backend'), (req, res) => res.send("Backend Dev Content."));

// --- START SERVER ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));