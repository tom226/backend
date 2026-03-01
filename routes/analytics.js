const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

// GET /api/analytics/sales
router.get("/sales", async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalSales: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sales data", details: err.message });
  }
});

// GET /api/analytics/top-products
router.get("/top-products", async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]).exec();

    res.status(200).json(topProducts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch top products", details: err.message });
  }
});

// GET /api/analytics/user-growth
router.get("/user-growth", async (req, res) => {
  try {
    const userGrowth = await User.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(userGrowth);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user growth data", details: err.message });
  }
});

// GET /api/analytics/revenue
router.get("/revenue", async (req, res) => {
  try {
    const revenueBreakdown = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.category", revenue: { $sum: "$items.totalPrice" } } },
    ]);

    res.status(200).json(revenueBreakdown);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch revenue breakdown", details: err.message });
  }
});

module.exports = router;