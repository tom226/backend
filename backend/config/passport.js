const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const formatToken = (token) => (token ? `${token.slice(0, 6)}...${token.slice(-4)}` : undefined);
const logAuthEvent = (provider, stage, meta = {}) => {
  console.log(`[AUTH][${provider}] ${stage}`, meta);
};

const hasGoogleCreds = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasFacebookCreds = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

// Google OAuth Strategy
if (hasGoogleCreds) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    logAuthEvent('GOOGLE', 'PROFILE_RECEIVED', {
      profileId: profile.id,
      email: profile.emails?.[0]?.value,
      accessToken: formatToken(accessToken),
      refreshToken: formatToken(refreshToken),
    });
    
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        logAuthEvent('GOOGLE', 'USER_FOUND', { userId: user._id });
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      logAuthEvent('GOOGLE', 'USER_CREATE_START', { email: profile.emails?.[0]?.value });
      user = new User({
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0]?.value,
        provider: 'google',
        lastLogin: new Date()
      });
      
      await user.save();
      logAuthEvent('GOOGLE', 'USER_CREATE_SUCCESS', { userId: user._id });
      return done(null, user);
    } catch (error) {
      logAuthEvent('GOOGLE', 'ERROR', { message: error.message, stack: error.stack });
      return done(error);
    }
  }));
} else {
  logAuthEvent('GOOGLE', 'DISABLED', { reason: 'Missing GOOGLE_CLIENT_ID/SECRET' });
}

// Facebook OAuth Strategy
if (hasFacebookCreds) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'emails', 'picture']
  }, async (accessToken, refreshToken, profile, done) => {
    logAuthEvent('FACEBOOK', 'PROFILE_RECEIVED', {
      profileId: profile.id,
      email: profile.emails?.[0]?.value,
      accessToken: formatToken(accessToken),
      refreshToken: formatToken(refreshToken),
    });
    try {
      let user = await User.findOne({ facebookId: profile.id });
      
      if (user) {
        logAuthEvent('FACEBOOK', 'USER_FOUND', { userId: user._id });
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      logAuthEvent('FACEBOOK', 'USER_CREATE_START', { profileId: profile.id });
      user = new User({
        facebookId: profile.id,
        firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
        lastName: profile.name?.familyName || '',
        email: profile.emails?.[0]?.value,
        profilePicture: profile.photos?.[0]?.value,
        provider: 'facebook',
        lastLogin: new Date()
      });
      
      await user.save();
      logAuthEvent('FACEBOOK', 'USER_CREATE_SUCCESS', { userId: user._id });
      return done(null, user);
    } catch (error) {
      logAuthEvent('FACEBOOK', 'ERROR', { message: error.message, stack: error.stack });
      return done(error);
    }
  }));
} else {
  logAuthEvent('FACEBOOK', 'DISABLED', { reason: 'Missing FACEBOOK_APP_ID/SECRET' });
}

// Serialize User
passport.serializeUser((user, done) => {
  logAuthEvent('PASSPORT', 'SERIALIZE', { userId: user?._id });
  done(null, user._id);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
  try {
    logAuthEvent('PASSPORT', 'DESERIALIZE_REQUEST', { userId: id });
    const user = await User.findById(id);
    if (!user) {
      logAuthEvent('PASSPORT', 'DESERIALIZE_MISS', { userId: id });
    } else {
      logAuthEvent('PASSPORT', 'DESERIALIZE_SUCCESS', { userId: user._id });
    }
    done(null, user);
  } catch (error) {
    logAuthEvent('PASSPORT', 'DESERIALIZE_ERROR', { message: error.message, stack: error.stack });
    done(error);
  }
});
