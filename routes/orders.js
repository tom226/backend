const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
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

// Create Order (from Chatbot or API)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCharge = subtotal >= 1999 ? 0 : 100;
    const totalAmount = subtotal + shippingCharge;
    
    // Create order
    const order = new Order({
      userId: req.userId,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      items,
      subtotal,
      shippingCharge,
      totalAmount,
      paymentMethod,
      shippingAddress: shippingAddress || user.address,
      notes,
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    });
    
    await order.save();
    
    res.status(201).json({
      message: 'Order created successfully',
      order,
      orderId: order.orderId
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get User Orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Order Details by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track Order Status (Public - no auth needed)
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      orderId: order.orderId,
      status: order.orderStatus,
      orderDate: order.orderDate,
      shippingDate: order.shippingDate,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      deliveryDate: order.deliveryDate,
      trackingNumber: order.trackingNumber,
      shippingCarrier: order.shippingCarrier,
      totalAmount: order.totalAmount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Status (Admin only)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status, shippingDate, deliveryDate, trackingNumber, shippingCarrier } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        orderStatus: status,
        shippingDate: shippingDate || undefined,
        deliveryDate: deliveryDate || undefined,
        trackingNumber: trackingNumber || order.trackingNumber,
        shippingCarrier: shippingCarrier || order.shippingCarrier,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Orders (Admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders, total: orders.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
