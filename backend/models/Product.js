const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  
  description: String,
  
  price: {
    type: Number,
    required: true
  },
  
  category: String,
  
  stock: {
    type: Number,
    default: 0
  },
  
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  image: String,
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  reviews: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
