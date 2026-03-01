const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
}, { timestamps: true });

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);
module.exports = { PaymentHistory };
