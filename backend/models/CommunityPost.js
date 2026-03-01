const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  avatar: { type: String, default: '🌱' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, required: true },
  avatar: { type: String, default: '🌱' },
  city: { type: String, default: 'India' },
  category: { type: String, default: 'show-tell' },
  content: { type: String, required: true },
  images: { type: [String], default: [] },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: [commentSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
