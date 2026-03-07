const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get User Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get community membership status
router.get('/community-membership', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isActive = Boolean(
      user.isCommunityMember ||
      user.membershipActive ||
      user.membership?.status === 'active'
    );

    res.json({
      membershipActive: isActive,
      membership: {
        plan: user.membership?.plan || 'monthly',
        amount: user.membership?.amount || 200,
        currency: user.membership?.currency || 'INR',
        status: isActive ? 'active' : 'inactive',
        startedAt: user.membership?.startedAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate community membership (Rs. 200/month)
router.post('/community-membership/activate', verifyToken, async (req, res) => {
  try {
    const { paymentId, orderId } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isCommunityMember = true;
    user.membershipActive = true;
    user.membership = {
      ...(user.membership || {}),
      plan: 'monthly',
      amount: 200,
      currency: 'INR',
      status: 'active',
      startedAt: user.membership?.startedAt || new Date(),
      paymentId: paymentId || user.membership?.paymentId || '',
      orderId: orderId || user.membership?.orderId || '',
    };
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Community membership activated',
      membershipActive: true,
      membership: user.membership,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, acceptsMarketing, acceptsNotifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        address: address || undefined,
        acceptsMarketing: acceptsMarketing !== undefined ? acceptsMarketing : undefined,
        acceptsNotifications: acceptsNotifications !== undefined ? acceptsNotifications : undefined,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User by ID (Admin)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Users (Admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
