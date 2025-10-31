require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const os = require('os');
const User = require('./models/User'); // ✅ Make sure this file exists

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// --- Detect local & LAN IP ---
const networkInterfaces = os.networkInterfaces() || {};
const lanIP = Object.values(networkInterfaces)
  .flat()
  .find((iface) => iface && iface.family === 'IPv4' && !iface.internal)?.address;

// --- MongoDB Connection ---
let MONGO_URI = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/mern-auth';

if (process.env.DOCKER_ENV === 'true') {
  MONGO_URI = process.env.MONGO_URI_DOCKER || 'mongodb://host.docker.internal:27017/mern-auth';
}

console.log('🌍 Hostname:', os.hostname());
console.log('🌐 LAN IP:', lanIP);
console.log('🔗 Using MongoDB URI:', MONGO_URI);

// --- Connect to MongoDB (Compass) ---
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to:', MONGO_URI))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// --- TOKEN VALIDATION ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  const parts = token.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid token format' });

  jwt.verify(parts[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRoles = decoded.roles;
    next();
  });
};

const checkRole = (requiredRole) => (req, res, next) => {
  if (!req.userRoles || !req.userRoles.includes(requiredRole)) {
    return res.status(403).json({ message: `Require ${requiredRole} Role!` });
  }
  next();
};

// --- ROUTES ---
// Signup
app.post('/api/auth/signup', async (req, res) => {
  console.log('📥 Signup request:', req.body);
  try {
    const { username, password, roles } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      roles: Array.isArray(roles) && roles.length ? roles : ['user']
    });

    await user.save();
    console.log('✅ User created:', username);
    res.json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('💥 Signup error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  console.log('📥 Login attempt:', req.body);
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(404).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, roles: user.roles }, JWT_SECRET, { expiresIn: 86400 });
    console.log('✅ Login successful for:', username);

    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
      accessToken: token
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Test routes
app.get('/api/test/all', (req, res) => res.send('Public Content.'));
app.get('/api/test/user', verifyToken, checkRole('user'), (req, res) => res.send('User Content.'));
app.get('/api/test/admin', verifyToken, checkRole('admin'), (req, res) => res.send('Admin Content.'));

// --- START SERVER ---
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
