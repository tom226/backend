require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const products = require('../data/productSeed');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nursery-green';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await Product.deleteMany({});
    console.log('Cleared existing products');
    const result = await Product.insertMany(products);
    console.log(`Seeded ${result.length} products`);
    const byCategory = {};
    result.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
    console.log('\nBy category:');
    Object.entries(byCategory).forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
    await mongoose.disconnect();
    console.log('\nDone!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}
seed();