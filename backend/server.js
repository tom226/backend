require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const { ensureKnowledgeSeeded, startDailyKnowledgeRefresh } = require('./services/plantKnowledgeService');
const { processPendingInteractions } = require('./services/socialInstagramMvp');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nursery-green', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✓ MongoDB connected');
  const seedResult = await ensureKnowledgeSeeded();
  if (!seedResult.skipped) {
    console.log(`✓ Seeded plant knowledge entries: ${seedResult.seeded}`);
  }
  startDailyKnowledgeRefresh();
})
.catch(err => console.error('✗ MongoDB connection error:', err));

// Import Passport Strategies
require('./config/passport');

// Import Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const excelRoutes = require('./routes/excel');
const communityRoutes = require('./routes/community');
const plantKnowledgeRoutes = require('./routes/plantKnowledge');
const plantScannerRoutes = require('./routes/plantScanner');
const socialRoutes = require('./routes/social');

// Register Routes
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/plant-knowledge', plantKnowledgeRoutes);
app.use('/api/plant-scanner', plantScannerRoutes);
app.use('/webhooks', express.json({ type: '*/*' }), socialRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🌱 Nursery Green Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/nursery-green'}\n`);

  // Start Instagram MVP worker (Reels comments -> auto DM with scanner link)
  setInterval(() => {
    processPendingInteractions().catch((err) =>
      console.error('IG MVP worker error', err)
    );
  }, 60 * 1000);
});

module.exports = app;
