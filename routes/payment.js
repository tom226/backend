const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { PaymentHistory } = require("../models/PaymentHistory");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // Convert to paisa
      currency: "INR",
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order", details: err.message });
  }
});

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (err) {
    res.status(500).json({ error: "Payment verification failed", details: err.message });
  }
});

// GET /api/payment/history
router.get("/history", async (req, res) => {
  const userId = req.user._id; // Assume user authentication middleware

  try {
    const history = await PaymentHistory.find({ userId });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment history", details: err.message });
  }
});

module.exports = router;