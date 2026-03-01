const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middleware/authenticateAdmin");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Middleware to require ADMIN_TOKEN
router.use(authenticateAdmin);

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = (await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]))[0]?.total || 0;
    const totalProducts = await Product.countDocuments();

    res.status(200).json({ totalUsers, totalOrders, totalRevenue, totalProducts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data", details: err.message });
  }
});

// GET /api/admin/orders
router.get("/orders", async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  try {
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

// PUT /api/admin/orders/:id/status
router.put("/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status", details: err.message });
  }
});

// GET /api/admin/products
router.get("/products", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

// POST /api/admin/products
router.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to add product", details: err.message });
  }
});

// PUT /api/admin/products/:id
router.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});

module.exports = router;