const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  // Capture desired redirect target to return user to the same feature/page
  if (req.query.redirect) {
    req.session.oauthRedirect = req.query.redirect;
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login.html?error=google_auth_failed` : '/login' 
  }),
  (req, res) => {
    console.log('Google OAuth callback - User authenticated:', req.user);
    
    try {
      const redirectTarget = req.session.oauthRedirect;
      delete req.session.oauthRedirect;

      // Generate JWT Token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectParam = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : '';
      console.log('Redirecting to:', `${frontendUrl}/login.html?token=${token.substring(0, 20)}...${redirectParam ? ' with redirect' : ''}`);
      res.redirect(`${frontendUrl}/login.html?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}${redirectParam}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login.html?error=token_generation_failed`);
    }
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  });
});

// Get Current User
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

// Verify Token
router.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ valid: true, decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
