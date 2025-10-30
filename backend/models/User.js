const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Roles: can be 'user', 'admin', or 'backend'. Defaults to 'user'
  roles: {
    type: [String],
    enum: ['user', 'admin', 'backend'],
    default: ['user']
  }
});

module.exports = mongoose.model('User', UserSchema);