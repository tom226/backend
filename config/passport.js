const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const hasGoogleCreds = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasFacebookCreds = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

// Google OAuth Strategy
if (hasGoogleCreds) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('Google Strategy - Processing profile:', profile.id, profile.emails?.[0]?.value);
    
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('Google Strategy - Existing user found:', user._id);
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      console.log('Google Strategy - Creating new user');
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
      console.log('Google Strategy - New user created:', user._id);
      return done(null, user);
    } catch (error) {
      console.error('Google Strategy Error:', error);
      return done(error);
    }
  }));
} else {
  console.warn('⚠️ Google OAuth disabled: GOOGLE_CLIENT_ID/SECRET not set');
}

// Facebook OAuth Strategy
if (hasFacebookCreds) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'emails', 'picture']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      
      if (user) {
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Create new user
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
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
} else {
  console.warn('⚠️ Facebook OAuth disabled: FACEBOOK_APP_ID/SECRET not set');
}

// Serialize User
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id);
  done(null, user._id);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', id);
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found for deserialization:', id);
    } else {
      console.log('User deserialized successfully:', user._id);
    }
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error);
  }
});
