const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const maskToken = (token) => (token ? `${token.slice(0, 6)}...${token.slice(-4)}` : undefined);
const safeUserSummary = (user) => (user ? {
  id: user._id,
  email: user.email,
  provider: user.provider,
} : undefined);
const logOAuthRoute = (provider, stage, meta = {}) => {
  console.log(`[AUTH_ROUTE][${provider}] ${stage}`, meta);
};

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  logOAuthRoute('GOOGLE', 'INIT', { sessionId: req.sessionID });
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  (req, res, next) => {
    logOAuthRoute('GOOGLE', 'CALLBACK_REQUEST', { query: req.query, sessionId: req.sessionID });
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login.html?error=google_auth_failed` : '/login' 
  }),
  (req, res) => {
    logOAuthRoute('GOOGLE', 'CALLBACK_SUCCESS', { user: safeUserSummary(req.user) });
    
    try {
      // Generate JWT Token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      logOAuthRoute('GOOGLE', 'TOKEN_ISSUED', { token: maskToken(token) });
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      logOAuthRoute('GOOGLE', 'REDIRECT', { url: `${frontendUrl}/dashboard.html` });
      res.redirect(`${frontendUrl}/dashboard.html?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      logOAuthRoute('GOOGLE', 'CALLBACK_ERROR', { message: error.message, stack: error.stack });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login.html?error=token_generation_failed`);
    }
  }
);

// Facebook OAuth Routes
router.get('/facebook', (req, res, next) => {
  logOAuthRoute('FACEBOOK', 'INIT', { sessionId: req.sessionID });
  next();
}, passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  (req, res, next) => {
    logOAuthRoute('FACEBOOK', 'CALLBACK_REQUEST', { query: req.query, sessionId: req.sessionID });
    next();
  },
  passport.authenticate('facebook', { 
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login.html?error=facebook_auth_failed` : '/login' 
  }),
  (req, res) => {
    logOAuthRoute('FACEBOOK', 'CALLBACK_SUCCESS', { user: safeUserSummary(req.user) });
    
    try {
      // Generate JWT Token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      logOAuthRoute('FACEBOOK', 'TOKEN_ISSUED', { token: maskToken(token) });
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      logOAuthRoute('FACEBOOK', 'REDIRECT', { url: `${frontendUrl}/dashboard.html` });
      res.redirect(`${frontendUrl}/dashboard.html?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      logOAuthRoute('FACEBOOK', 'CALLBACK_ERROR', { message: error.message, stack: error.stack });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login.html?error=token_generation_failed`);
    }
  }
);

// Logout
router.get('/logout', (req, res) => {
  logOAuthRoute('SESSION', 'LOGOUT_REQUEST', { user: safeUserSummary(req.user) });
  req.logout((err) => {
    if (err) {
      logOAuthRoute('SESSION', 'LOGOUT_ERROR', { message: err.message });
      return res.status(500).json({ error: 'Logout failed' });
    }
    logOAuthRoute('SESSION', 'LOGOUT_SUCCESS', { userId: req.user?._id });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  });
});

// Get Current User
router.get('/me', (req, res) => {
  if (!req.user) {
    logOAuthRoute('SESSION', 'ME_UNAUTHENTICATED');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  logOAuthRoute('SESSION', 'ME_SUCCESS', { user: safeUserSummary(req.user) });
  res.json({ user: req.user });
});

// Verify Token
router.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    logOAuthRoute('TOKEN', 'VERIFY_MISSING');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    logOAuthRoute('TOKEN', 'VERIFY_SUCCESS', { userId: decoded.userId });
    res.json({ valid: true, decoded });
  } catch (error) {
    logOAuthRoute('TOKEN', 'VERIFY_FAILURE', { message: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
