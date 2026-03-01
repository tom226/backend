const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: String,
    rating: Number,
  }],
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;