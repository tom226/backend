require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { ensureKnowledgeSeeded, startDailyKnowledgeRefresh } = require('./services/plantKnowledgeService');
const { ensureEnergySeeded, startDailyEnergyRefresh } = require('./services/plantEnergyService');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 7000; // Changed default port to 7000

const hasRazorpayConfig = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

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

  const energySeed = await ensureEnergySeeded();
  if (!energySeed.skipped) {
    console.log(`✓ Seeded plant energy entries: ${energySeed.seeded}`);
  }
  startDailyEnergyRefresh();
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
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');
const analyticsRoutes = require('./routes/analytics');
const mobileErrorsRoutes = require('./routes/mobileErrors');

// Register Routes
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/plant-knowledge', plantKnowledgeRoutes);
app.use('/api/plant-scanner', plantScannerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mobile-errors', mobileErrorsRoutes);

// Serve Expo web app at /app (path-based deployment on same domain)
const appWebDist = path.join(__dirname, 'NurseryGreenApp', 'dist');
const appWebIndex = path.join(appWebDist, 'index.html');
const appWebHasBuild = fs.existsSync(appWebIndex);

if (appWebHasBuild) {
  // Expo web export emits absolute '/_expo/*' asset paths.
  app.use('/_expo', express.static(path.join(appWebDist, '_expo')));
  app.use('/app', express.static(appWebDist));

  app.get('/app', (req, res) => {
    res.sendFile(appWebIndex);
  });

  app.get('/app/*', (req, res) => {
    res.sendFile(appWebIndex);
  });
} else {
  app.get('/app', (_req, res) => {
    res.status(503).json({
      error: 'App web build not found. Run npm -C NurseryGreenApp run export:web:node24 and redeploy.'
    });
  });
}

// Serve static frontend (root directory)
app.use(express.static(path.join(__dirname)));

// Default to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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
  if (hasRazorpayConfig) {
    console.log('✓ Payments: Razorpay configured');
  } else {
    console.warn('⚠ Payments: Razorpay not configured (set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)');
  }
});

module.exports = app;
