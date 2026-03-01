# 🌱 Nursery Green Backend Setup Guide

## 📋 Overview

This guide will help you set up and run the Node.js backend server for Nursery Green with the following features:
- ✅ Gmail & Facebook OAuth Authentication
- ✅ Order Management System
- ✅ Order Tracking and Status Updates
- ✅ Excel Export Functionality
- ✅ Customer Dashboard with Order History

---

## 🔧 Prerequisites

Before starting, ensure you have:
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local: [Install MongoDB Community](https://docs.mongodb.com/manual/installation/)
   - Cloud: [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas)
3. **Git** (optional but recommended)

### Verify Installation:
```bash
node --version      # Should show v14+
npm --version       # Should show 6+
mongod --version    # Should show mongod version
```

---

## 📦 Installation Steps

### Step 1: Install Backend Dependencies

Navigate to the backend folder and install packages:

```bash
cd backend
npm install
```

Wait for installation to complete. This installs all required packages:
- Express.js (Web framework)
- Mongoose (MongoDB ODM)
- Passport (Authentication)
- ExcelJS (Excel generation)
- And more...

### Step 2: Configure MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB server (Windows)
mongod

# Or on Mac/Linux
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/nursery-green`

### Step 3: Set Up OAuth Credentials

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Nursery Green"
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5000`
6. Set Authorized Redirect URIs:
   - `http://localhost:5000/auth/google/callback`
7. Copy **Client ID** and **Client Secret**

#### Facebook App Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app → Choose "Consumer"
3. Add product "Facebook Login"
4. In Settings → Basic, copy **App ID** and **App Secret**
5. In Facebook Login → Settings, add Valid OAuth Redirect URIs:
   - `http://localhost:5000/auth/facebook/callback`

### Step 4: Create Environment File

Create `.env` file in the `backend` folder:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nursery-green
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nursery-green

NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Never commit `.env` file to git. It contains sensitive credentials!

---

## 🚀 Running the Backend

### Start the Server:

```bash
# From the backend folder
npm start
```

✅ You should see:
```
✓ MongoDB connected
🌱 Nursery Green Backend Server running on port 5000
Environment: development
```

### For Development (with auto-reload):

```bash
npm run dev
```

This uses Nodemon to automatically restart the server when you make changes.

---

## ✅ Testing the Backend

### 1. Check Server Health:
```
GET http://localhost:5000/health
```

Expected response:
```json
{"status": "Server is running"}
```

### 2. Test Google OAuth:
```
Visit: http://localhost:5000/auth/google
```
This will open Google login page (will fail if frontend not set up yet)

### 3. Test Order Creation:
```bash
# First, you need an auth token from login
# Then make a POST request to:
POST http://localhost:5000/api/orders/create
Headers: {
  "Authorization": "Bearer YOUR_AUTH_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "items": [
    {
      "productName": "Vermi Compost",
      "productId": "1",
      "quantity": 2,
      "price": 150,
      "subtotal": 300
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  },
  "paymentMethod": "razorpay"
}
```

---

## 📚 API Endpoints Reference

### Authentication
- `GET /auth/google` - Google login
- `GET /auth/google/callback` - Google callback
- `GET /auth/facebook` - Facebook login
- `GET /auth/facebook/callback` - Facebook callback
- `GET /auth/logout` - Logout
- `POST /auth/verify-token` - Verify JWT token

### Orders
- `POST /api/orders/create` - Create new order⏐
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get order by ID
- `GET /api/orders/track/:orderId` - Track order (public)
- `PUT /api/orders/:orderId/status` - Update order status (admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:userId` - Get user by ID

### Excel Export
- `POST /api/excel/export-orders` - Export all orders
- `POST /api/excel/export-user-orders/:userId` - Export user's orders

---

## 🌐 Frontend Configuration

Update frontend files to use the correct backend URL:

### In `login.html`, `dashboard.html`, and `chatbot.js`:

```javascript
// Change this line if your backend runs on different port/URL
const BACKEND_URL = 'http://localhost:5000';
```

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use HTTPS in production** - Install SSL certificate
3. **Rotate JWT_SECRET regularly**
4. **Use environment-specific configs**
5. **Validate all inputs on backend**
6. **Rate limit API endpoints**
7. **Keep dependencies updated**: `npm audit fix`

---

## 🐛 Troubleshooting

### Error: "MongoDB connection failed"
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas, whitelist your IP

### Error: "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and run `npm install`

### OAuth redirect URI mismatch
- Ensure URLs in Google/Facebook exactly match `.env`
- Check no trailing slashes

### Port 5000 already in use
```bash
# Kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | grep LISTEN
```

### CORS Error
- Ensure `FRONTEND_URL` in `.env` matches frontend URL
- Check `origins` in `server.js`

---

## 📊 Database Structure

The backend creates 3 main collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  googleId: String,
  facebookId: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  provider: String, // 'google' or 'facebook'
  address: Object,
  createdAt: Date,
  lastLogin: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderId: String, // ORD-20260218-1
  userId: ObjectId,
  items: Array,
  totalAmount: Number,
  orderStatus: String, // 'pending', 'confirmed', 'shipped', 'delivered'
  orderDate: Date,
  shippingDate: Date,
  deliveryDate: Date,
  estimatedDeliveryDate: Date,
  trackingNumber: String,
  shippingCarrier: String,
  createdAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  category: String,
  stock: Number,
  description: String,
  rating: Number
}
```

---

## 📝 Common Use Cases

### Creating an Order from Chatbot:
1. User clicks "Create Order" in chatbot
2. User must be logged in (redirects to login.html)
3. User selects products
4. Chatbot calls `POST /api/orders/create`
5. Order saved to MongoDB
6. Order ID sent to Razorpay for payment
7. Order updates after payment

### Tracking Order Status:
1. User logs in to dashboard.html
2. Fetches orders from `GET /api/orders/my-orders`
3. Can track status: pending → confirmed → shipped → delivered
4. Order status updated via admin panel: `PUT /api/orders/:orderId/status`

### Exporting Orders:
1. Admin clicks "Export Orders"
2. Backend generates Excel file
3. `POST /api/excel/export-orders`
4. Excel with all order data, summary sheet

---

## 🚀 Deployment

When ready for production:

1. **Update URLs**:
   - Change `FRONTEND_URL` to production domain
   - Update OAuth redirect URIs

2. **Move to HTTPS**:
   - Update all URLs to use `https://`
   - Get SSL certificate

3. **Use MongoDB Atlas** (recommended):
   - Backup local data to cloud
   - Update `MONGODB_URI`

4. **Deploy Backend**:
   - Use Heroku, Railway, or VPS
   - Set environment variables on host
   - Example Procfile: `web: node server.js`

---

## 📞 Support

For issues or questions:
- Check logs in terminal
- Review `.env` configuration
- Ensure all services (MongoDB, Node) are running
- Check network connectivity

---

**🎉 You're all set! The backend is now ready to power Nursery Green orders and tracking!**
