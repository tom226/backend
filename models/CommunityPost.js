const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  avatar: { type: String, default: '🌱' },
  text: { type: String, required: true },
  isExpert: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, required: true },
  avatar: { type: String, default: '🌱' },
  city: { type: String, default: 'India' },
  category: { type: String, default: 'show-tell' },
  content: { type: String, required: true },
  images: { type: [String], default: [] },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: [commentSchema], default: [] },

  // Tags & hashtags (extracted from content)
  tags: { type: [String], default: [] },

  // Scanner → Community bridge
  linkedScanId: { type: String, default: null },
  scanDiagnosis: { type: String, default: null },
  scanConfidence: { type: Number, default: null },

  // Smart product suggestions
  linkedProducts: { type: [String], default: [] },

  // Expert features
  isExpertPost: { type: Boolean, default: false },
  bestAnswerCommentId: { type: mongoose.Schema.Types.ObjectId, default: null },

  // Engagement metrics
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },

  // Moderation
  isPinned: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });

// Text index for search
communityPostSchema.index({ content: 'text', tags: 'text', authorName: 'text' });
communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ city: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
