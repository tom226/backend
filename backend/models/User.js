const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // OAuth Info
  id: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  
  // User Details
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, sparse: true },
  profilePicture: String,
  
  // Contact Info
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // OAuth Provider
  provider: {
    type: String,
    enum: ['google', 'email'],
    default: 'email'
  },
  
  // Preferences
  acceptsMarketing: { type: Boolean, default: false },
  acceptsNotifications: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);
