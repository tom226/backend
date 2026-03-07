const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  slug: String,
  name: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now }
}, { _id: false });

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

  // Community & Gamification
  communityAvatar: { type: String, default: '🌱' },
  isExpert: { type: Boolean, default: false },
  expertTitle: { type: String, default: '' },
  points: { type: Number, default: 0 },
  level: { type: String, default: 'seedling', enum: ['seedling', 'sapling', 'tree', 'forest', 'expert'] },
  badges: { type: [badgeSchema], default: [] },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  },
  communityStats: {
    postsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    helpfulAnswers: { type: Number, default: 0 },
    scansShared: { type: Number, default: 0 }
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Membership
  isCommunityMember: { type: Boolean, default: false },
  membershipActive: { type: Boolean, default: false },
  membership: {
    plan: { type: String, default: 'monthly' },
    amount: { type: Number, default: 200 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['inactive', 'active'], default: 'inactive' },
    startedAt: { type: Date, default: null },
    paymentId: { type: String, default: '' },
    orderId: { type: String, default: '' }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);
