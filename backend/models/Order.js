const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order ID (unique identifier)
  orderId: { type: String, unique: true, required: true },
  
  // Customer Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  
  // Order Items
  items: [
    {
      productName: String,
      productId: String,
      quantity: Number,
      price: Number,
      subtotal: Number
    }
  ],
  
  // Pricing
  subtotal: Number,
  shippingCharge: Number,
  tax: { type: Number, default: 0 },
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Shipping Details
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Tracking Information
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  orderDate: { type: Date, default: Date.now },
  shippingDate: Date,
  deliveryDate: Date,
  estimatedDeliveryDate: Date,
  
  trackingNumber: String,
  shippingCarrier: String,
  
  // Notes
  notes: String,
  adminNotes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to generate order ID
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    this.orderId = `ORD-${dateStr}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
